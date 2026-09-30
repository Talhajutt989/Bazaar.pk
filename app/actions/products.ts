'use server';

import { safeRevalidatePath } from '@/lib/utils';
import { supabaseAdmin } from '@/lib/supabase';
import { getSession } from '@/lib/auth';

export async function createProduct(formData: FormData) {
  try {
    const session = await getSession();
    if (!session || (session.role !== 'VENDOR' && session.role !== 'ADMIN')) {
      throw new Error('Unauthorized');
    }

    let storeId = session.storeId;
    if (session.role === 'ADMIN') {
      storeId = (formData.get('storeId') as string) || storeId;
    }

    if (!storeId) {
      const { data: store } = await supabaseAdmin
        .from('stores')
        .select('id')
        .eq('user_id', session.userId)
        .single();
      storeId = store?.id;
    }

    if (!storeId) {
      throw new Error('No active store associated with this vendor account');
    }

    const title = formData.get('title') as string;
    const brand = formData.get('brand') as string;
    const categoryId = formData.get('categoryId') as string;
    const description = formData.get('description') as string;
    const basePrice = parseFloat(formData.get('basePrice') as string);
    const imagesRaw = formData.get('images') as string; // JSON or comma separated URLs
    const variantsRaw = formData.get('variants') as string; // JSON string of variants

    if (!title || !categoryId || isNaN(basePrice)) {
      return { success: false, error: 'Title, category, and base price are required' };
    }

    const slug = `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now().toString().slice(-4)}`;

    let images: string[] = [];
    try {
      images = JSON.parse(imagesRaw);
    } catch {
      images = imagesRaw ? imagesRaw.split(',').map((s) => s.trim()).filter(Boolean) : [];
    }

    if (images.length === 0) {
      images = ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80'];
    }

    let resolvedCategoryId = categoryId;
    const { data: matchedCategory } = await supabaseAdmin
      .from('categories')
      .select('id')
      .or(`id.eq.${categoryId},slug.eq.${categoryId}`)
      .maybeSingle();

    if (matchedCategory) {
      resolvedCategoryId = matchedCategory.id;
    } else {
      // Fallback: pick the first category from DB
      const { data: firstCat } = await supabaseAdmin
        .from('categories')
        .select('id')
        .limit(1)
        .maybeSingle();
      if (firstCat) {
        resolvedCategoryId = firstCat.id;
      }
    }

    const { data: product, error: prodError } = await supabaseAdmin
      .from('products')
      .insert({
        store_id: storeId,
        category_id: resolvedCategoryId,
        title,
        brand: brand || null,
        slug,
        description: description || '',
        base_price: basePrice,
        images: JSON.stringify(images),
        is_active: true,
        is_approved: true,
      })
      .select()
      .single();

    if (prodError || !product) {
      throw new Error('Failed to create product: ' + (prodError?.message || ''));
    }

    // Create variants
    let variants: any[] = [];
    try {
      variants = JSON.parse(variantsRaw);
    } catch {
      variants = [];
    }

    if (variants.length > 0) {
      for (const v of variants) {
        await supabaseAdmin.from('product_variants').insert({
          product_id: product.id,
          sku: v.sku || `${product.id.slice(-6)}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
          variant_name: v.variantName || 'Standard',
          price: parseFloat(v.price) || basePrice,
          stock: parseInt(v.stock) || 0,
          attributes: JSON.stringify(v.attributes || {}),
        });
      }
    } else {
      // Default variant
      await supabaseAdmin.from('product_variants').insert({
        product_id: product.id,
        sku: `${product.id.slice(-6)}-STD`,
        variant_name: 'Standard Edition',
        price: basePrice,
        stock: 10,
        attributes: JSON.stringify({}),
      });
    }

    invalidateSupabaseCache('products_');
    invalidateSupabaseCache('product_slug_');
    invalidateSupabaseCache('store_slug_');
    invalidateSupabaseCache('categories_');

    safeRevalidatePath('/');
    safeRevalidatePath('/products');
    safeRevalidatePath('/vendor');
    safeRevalidatePath('/vendor/products');
    safeRevalidatePath('/admin');
    safeRevalidatePath('/admin/products');

    return { success: true, productId: product.id, slug: product.slug };
  } catch (error: any) {
    console.error('Create product error:', error);
    return { success: false, error: error.message };
  }
}

import { invalidateSupabaseCache } from '@/lib/supabase-service';

export async function toggleProductActive(productId: string) {
  try {
    const session = await getSession();
    if (!session) throw new Error('Unauthorized');

    const { data: product } = await supabaseAdmin
      .from('products')
      .select('id, store_id, is_active')
      .eq('id', productId)
      .single();

    if (!product) throw new Error('Product not found');

    if (session.role === 'VENDOR') {
      let vendorStoreId = session.storeId;
      if (!vendorStoreId) {
        const { data: store } = await supabaseAdmin
          .from('stores')
          .select('id')
          .eq('user_id', session.userId)
          .maybeSingle();
        vendorStoreId = store?.id;
      }
      if (product.store_id !== vendorStoreId) {
        throw new Error('Forbidden: You can only manage your own store products');
      }
    }

    await supabaseAdmin
      .from('products')
      .update({ is_active: !product.is_active })
      .eq('id', productId);

    invalidateSupabaseCache('products_');
    invalidateSupabaseCache('product_slug_');
    safeRevalidatePath('/vendor/products');
    safeRevalidatePath('/admin/products');
    safeRevalidatePath('/products');
    safeRevalidatePath('/');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteProduct(productId: string) {
  try {
    const session = await getSession();
    if (!session) throw new Error('Unauthorized');

    const { data: product } = await supabaseAdmin
      .from('products')
      .select('id, store_id')
      .eq('id', productId)
      .single();

    if (!product) throw new Error('Product not found');

    if (session.role === 'VENDOR') {
      let vendorStoreId = session.storeId;
      if (!vendorStoreId) {
        const { data: store } = await supabaseAdmin
          .from('stores')
          .select('id')
          .eq('user_id', session.userId)
          .maybeSingle();
        vendorStoreId = store?.id;
      }
      if (product.store_id !== vendorStoreId) {
        throw new Error('Forbidden: You can only delete your own store products');
      }
    }

    await supabaseAdmin
      .from('products')
      .delete()
      .eq('id', productId);

    invalidateSupabaseCache('products_');
    invalidateSupabaseCache('product_slug_');
    safeRevalidatePath('/vendor/products');
    safeRevalidatePath('/admin/products');
    safeRevalidatePath('/products');
    safeRevalidatePath('/');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
