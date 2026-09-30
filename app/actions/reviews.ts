'use server';

import { safeRevalidatePath } from '@/lib/server-utils';
import { getSession, getEffectiveUserId } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

/**
 * Direct product review & rating submission action.
 * Allows customers or visitors to rate 1-5 stars and write optional comments from the product details page.
 */
export async function createDirectProductReview(formData: FormData) {
  try {
    const productId = formData.get('productId') as string;
    const ratingStarsRaw = formData.get('ratingStars') as string;
    const authorName = (formData.get('authorName') as string)?.trim() || 'Verified Customer';
    const comment = (formData.get('comment') as string)?.trim() || null;

    if (!productId) {
      throw new Error('Product ID is required');
    }

    const ratingStars = parseInt(ratingStarsRaw, 10);
    if (isNaN(ratingStars) || ratingStars < 1 || ratingStars > 5) {
      throw new Error('Please select a valid rating between 1 and 5 stars');
    }

    // Determine reviewer user ID (session user or unique persistent guest customer)
    const userId = await getEffectiveUserId();

    if (!userId) {
      throw new Error('Could not associate review with a user');
    }

    // Verify product exists in Supabase
    const { data: product, error: prodErr } = await supabaseAdmin
      .from('products')
      .select('id, slug, store_id, stores(slug)')
      .eq('id', productId)
      .single();

    if (prodErr || !product) {
      throw new Error('Product not found');
    }

    // Check how many times this specific customer has already rated this product in Supabase
    const { count: userReviewsCount, error: countErr } = await supabaseAdmin
      .from('reviews')
      .select('*', { count: 'exact', head: true })
      .eq('product_id', productId)
      .eq('user_id', userId);

    const existingCount = userReviewsCount || 0;
    const maxAllowedReviews = 1; // Customer can rate once per product

    if (existingCount >= maxAllowedReviews) {
      return {
        success: false,
        alreadyRated: true,
        error: 'Aap is product ko pehle hi rate kar chuke hain. Dubara rating sirf tabhi de sakte hain agar aap ise dubara purchase karein.',
      };
    }

    // Create the review in Supabase
    const { data: review, error: insertErr } = await supabaseAdmin
      .from('reviews')
      .insert({
        product_id: productId,
        user_id: userId,
        rating_stars: Math.min(5, Math.max(1, ratingStars)),
        comment: comment || null,
      })
      .select()
      .single();

    if (insertErr || !review) {
      throw new Error(insertErr?.message || 'Failed to insert review in Supabase');
    }

    // Revalidate paths for real-time dynamic card updates
    safeRevalidatePath('/');
    safeRevalidatePath('/products');
    safeRevalidatePath(`/products/${product.slug}`);
    const storeSlug = (product.stores as any)?.slug;
    if (storeSlug) {
      safeRevalidatePath(`/store/${storeSlug}`);
    }

    return {
      success: true,
      review: {
        id: review.id,
        ratingStars: review.rating_stars,
        comment: review.comment,
        createdAt: review.created_at,
        user: {
          name: authorName || 'Verified Customer',
        },
      },
    };
  } catch (error: any) {
    console.error('Error submitting direct product review:', error);
    return { success: false, error: error.message || 'Failed to submit review' };
  }
}

/**
 * Order item verified purchase review submission
 */
export async function submitReview(formData: FormData) {
  try {
    const session = await getSession();
    if (!session) throw new Error('You must be logged in to leave a review');

    const productId = formData.get('productId') as string;
    const orderItemId = formData.get('orderItemId') as string;
    const ratingStars = parseInt(formData.get('ratingStars') as string) || 5;
    const comment = formData.get('comment') as string;

    if (!productId || !orderItemId) {
      throw new Error('Invalid review parameters');
    }

    // Verify customer owns the order item and order is delivered
    const { data: orderItem } = await supabaseAdmin
      .from('order_items')
      .select(`
        id,
        sub_order_id,
        sub_orders (
          id,
          order_id,
          status,
          orders (
            customer_id
          )
        ),
        product_variants (
          product_id,
          products (
            slug,
            stores (
              slug
            )
          )
        ),
        reviews (
          id
        )
      `)
      .eq('id', orderItemId)
      .single();

    if (!orderItem) throw new Error('Order item not found');

    if (orderItem.reviews && (Array.isArray(orderItem.reviews) ? orderItem.reviews.length > 0 : true)) {
      throw new Error('You have already submitted a review for this item');
    }

    const subOrder = orderItem.sub_orders as any;
    const order = subOrder?.orders as any;

    if (order?.customer_id !== session.userId && session.role !== 'ADMIN') {
      throw new Error('You can only review items you purchased');
    }

    if (subOrder?.status !== 'DELIVERED' && session.role !== 'ADMIN') {
      throw new Error('You can only review items after they are delivered');
    }

    const { data: review, error: insertErr } = await supabaseAdmin
      .from('reviews')
      .insert({
        product_id: productId,
        order_item_id: orderItemId,
        user_id: session.userId,
        rating_stars: Math.min(5, Math.max(1, ratingStars)),
        comment: comment?.trim() || null,
      })
      .select()
      .single();

    if (insertErr || !review) {
      throw new Error('Failed to save review: ' + (insertErr?.message || ''));
    }

    // Revalidate all catalog & store pages in real time
    safeRevalidatePath('/');
    safeRevalidatePath('/products');
    const prodSlug = (orderItem.product_variants as any)?.products?.slug;
    if (prodSlug) {
      safeRevalidatePath(`/products/${prodSlug}`);
    }
    const storeSlug = (orderItem.product_variants as any)?.products?.stores?.slug;
    if (storeSlug) {
      safeRevalidatePath(`/store/${storeSlug}`);
    }
    if (subOrder?.order_id) {
      safeRevalidatePath(`/order/${subOrder.order_id}`);
    }

    return { success: true };
  } catch (error: any) {
    console.error('Submit review error:', error);
    return { success: false, error: error.message };
  }
}
