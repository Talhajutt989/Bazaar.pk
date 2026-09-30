import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag, Package, Store, Clock, ArrowRight, ShieldCheck, Star, CheckCircle2 } from 'lucide-react';
import { supabaseAdmin } from '@/lib/supabase';
import { getSession } from '@/lib/auth';
import { formatDate, formatPKR, getOrderStatusBadge, formatOrderId } from '@/lib/utils';
import { redirect } from 'next/navigation';
import { ReviewFormModal } from '@/components/products/ReviewFormModal';
import { SupportTriggerButton } from '@/components/support/SupportTriggerButton';

export default async function CustomerOrdersPage() {
  const session = await getSession();
  if (!session) {
    redirect('/login');
  }

  // Fetch orders for customer from Supabase
  const { data: ordersRaw, error } = await supabaseAdmin
    .from('orders')
    .select(`
      id,
      total_amount,
      payment_method,
      payment_status,
      created_at,
      sub_orders (
        id,
        subtotal,
        platform_fee,
        vendor_earnings,
        status,
        created_at,
        stores (
          id,
          brand_name,
          city
        ),
        order_items (
          id,
          variant_id,
          quantity,
          unit_price,
          total_price,
          product_variants (
            id,
            variant_name,
            price,
            product_id,
            products (
              id,
              title,
              slug,
              images
            )
          ),
          reviews (
            id,
            rating_stars,
            comment
          )
        )
      )
    `)
    .eq('customer_id', session.userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching customer orders:', error);
  }

  const orders = (ordersRaw || []).map((order: any) => ({
    id: order.id,
    totalAmount: order.total_amount || 0,
    paymentMethod: order.payment_method,
    paymentStatus: order.payment_status,
    createdAt: new Date(order.created_at || Date.now()),
    subOrders: (order.sub_orders || []).map((sub: any) => ({
      id: sub.id,
      subtotal: sub.subtotal || 0,
      platformFee: sub.platform_fee || 0,
      vendorEarnings: sub.vendor_earnings || 0,
      status: sub.status || 'PENDING',
      createdAt: new Date(sub.created_at || Date.now()),
      store: {
        id: sub.stores?.id,
        brandName: sub.stores?.brand_name || 'Vendor Store',
        city: sub.stores?.city || 'Pakistan',
      },
      items: (sub.order_items || []).map((item: any) => ({
        id: item.id,
        quantity: item.quantity,
        unitPrice: item.unit_price,
        subtotal: item.total_price || item.quantity * item.unit_price,
        variant: {
          id: item.product_variants?.id,
          variantName: item.product_variants?.variant_name || 'Standard',
          productId: item.product_variants?.product_id,
          product: {
            id: item.product_variants?.products?.id,
            title: item.product_variants?.products?.title || 'Product',
            slug: item.product_variants?.products?.slug || '',
            images: item.product_variants?.products?.images || '[]',
          },
        },
        review: Array.isArray(item.reviews) && item.reviews.length > 0 ? {
          id: item.reviews[0].id,
          ratingStars: item.reviews[0].rating_stars,
          comment: item.reviews[0].comment,
        } : (item.reviews ? {
          id: item.reviews.id,
          ratingStars: item.reviews.rating_stars,
          comment: item.reviews.comment,
        } : null),
      })),
    })),
  }));

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      <div className="bg-brand-950 text-white p-6 rounded-3xl border-2 border-brand-800 shadow-brand flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-accent-400 text-xs font-bold uppercase tracking-wider block">
            Customer Dashboard
          </span>
          <h1 className="text-2xl font-extrabold font-display">My Orders & Purchases</h1>
        </div>
        <div className="text-xs text-amber-200/80">
          Logged in as: <strong className="text-white">{session.email}</strong>
        </div>
      </div>

      {/* Customer 24/7 Support Helpline Banner */}
      <SupportTriggerButton
        variant="card"
        label="Need Help With Your Order or Delivery?"
      />

      {orders.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border-2 border-brand-800/20 text-center shadow-sm space-y-4">
          <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No orders found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            You haven't placed any orders yet. Discover great deals from verified local shops!
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-brand transition"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-2xl border-2 border-brand-800/20 p-5 shadow-sm space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div>
                  <span className="text-xs font-extrabold text-brand-900 font-mono tracking-wide">
                    {formatOrderId(order.id)}
                  </span>
                  <span className="text-xs text-slate-400 block">{formatDate(order.createdAt)}</span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-extrabold text-slate-900">
                    Total: {formatPKR(order.totalAmount)}
                  </span>
                  <Link
                    href={`/order/${order.id}`}
                    className="px-3.5 py-1.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-1 transition"
                  >
                    <span>View & Track</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Sub-Orders list */}
              <div className="space-y-4">
                {order.subOrders.map((sub: any) => {
                  const badge = getOrderStatusBadge(sub.status);
                  return (
                    <div
                      key={sub.id}
                      className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs pb-2 border-b border-slate-200">
                        <div className="flex items-center gap-2">
                          <Store className="w-4 h-4 text-brand-700 shrink-0" />
                          <span className="font-bold text-slate-900">{sub.store.brandName}</span>
                          <span className="text-slate-400">({sub.items.length} {sub.items.length === 1 ? 'item' : 'items'})</span>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="font-semibold text-slate-700">
                            {formatPKR(sub.subtotal)}
                          </span>
                          <span
                            className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] border ${badge.bg}`}
                          >
                            {badge.label}
                          </span>
                        </div>
                      </div>

                      {/* Items in SubOrder */}
                      <div className="divide-y divide-slate-200 space-y-2.5">
                        {sub.items.map((item: any) => {
                          let images: string[] = [];
                          try {
                            images = JSON.parse(item.variant.product.images);
                          } catch {
                            images = [item.variant.product.images];
                          }

                          return (
                            <div
                              key={item.id}
                              className="pt-2.5 first:pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                            >
                              <div className="flex items-center gap-3">
                                <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-slate-200 bg-white shrink-0">
                                  <Image
                                    src={images[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80'}
                                    alt={item.variant.product.title}
                                    fill
                                    sizes="48px"
                                    className="object-cover"
                                  />
                                </div>
                                <div>
                                  <Link
                                    href={`/products/${item.variant.product.slug}`}
                                    className="font-bold text-slate-900 hover:text-brand-700 transition line-clamp-1"
                                  >
                                    {item.variant.product.title}
                                  </Link>
                                  <p className="text-[11px] text-slate-500">{item.variant.variantName}</p>
                                  <span className="text-slate-700 font-semibold">
                                    Qty: {item.quantity} × {formatPKR(item.unitPrice)}
                                  </span>
                                </div>
                              </div>

                              {/* Review Status or Action */}
                              {sub.status === 'DELIVERED' && (
                                <div className="shrink-0 self-end sm:self-center">
                                  {item.review ? (
                                    <div className="flex items-center gap-1.5 bg-amber-50 text-amber-900 border border-amber-300 px-3 py-1 rounded-xl text-xs font-bold">
                                      <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                                      <span>{item.review.ratingStars} / 5 Rated</span>
                                    </div>
                                  ) : (
                                    <ReviewFormModal
                                      productId={item.variant.productId}
                                      orderItemId={item.id}
                                      productTitle={item.variant.product.title}
                                    />
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
