import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  CheckCircle2,
  Package,
  Truck,
  MapPin,
  Clock,
  Store,
  Phone,
  ArrowLeft,
  CreditCard,
  User,
  ShieldCheck,
} from 'lucide-react';
import { supabaseAdmin } from '@/lib/supabase';
import { formatDate, formatPKR, getOrderStatusBadge, formatOrderId } from '@/lib/utils';
import { ReviewFormModal } from '@/components/products/ReviewFormModal';
import { SupportTriggerButton } from '@/components/support/SupportTriggerButton';

interface OrderPageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderPage({ params }: OrderPageProps) {
  const { id } = await params;

  // Fetch Order from Supabase
  const { data: orderRaw, error } = await supabaseAdmin
    .from('orders')
    .select(`
      id,
      total_amount,
      payment_method,
      payment_status,
      created_at,
      users:customer_id (
        name,
        email,
        whatsapp
      ),
      addresses:shipping_address_id (
        full_name,
        whatsapp,
        street,
        area,
        city
      ),
      sub_orders (
        id,
        subtotal,
        platform_fee,
        vendor_earnings,
        status,
        rider_name,
        rider_phone,
        tracking_number,
        created_at,
        stores (
          id,
          brand_name,
          area,
          city
        ),
        order_items (
          id,
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
    .eq('id', id)
    .single();

  if (error || !orderRaw) {
    notFound();
  }

  const order = {
    id: orderRaw.id,
    totalAmount: orderRaw.total_amount || 0,
    paymentMethod: orderRaw.payment_method || 'COD',
    paymentStatus: orderRaw.payment_status || 'PENDING',
    createdAt: new Date(orderRaw.created_at || Date.now()),
    customer: {
      name: (orderRaw.users as any)?.name || 'Customer',
      email: (orderRaw.users as any)?.email || '',
      whatsapp: (orderRaw.users as any)?.whatsapp || '',
    },
    shippingAddress: {
      fullName: (orderRaw.addresses as any)?.full_name || 'Customer',
      phone: (orderRaw.addresses as any)?.whatsapp || (orderRaw.addresses as any)?.phone || '',
      street: (orderRaw.addresses as any)?.street || 'Main Street',
      area: (orderRaw.addresses as any)?.area || 'Gulberg',
      city: (orderRaw.addresses as any)?.city || 'Lahore',
    },
    subOrders: (orderRaw.sub_orders || []).map((sub: any) => ({
      id: sub.id,
      subtotal: sub.subtotal || 0,
      platformFee: sub.platform_fee || 0,
      vendorEarnings: sub.vendor_earnings || 0,
      status: sub.status || 'PENDING',
      riderName: sub.rider_name,
      riderPhone: sub.rider_phone,
      trackingNumber: sub.tracking_number,
      createdAt: new Date(sub.created_at || Date.now()),
      store: {
        id: sub.stores?.id,
        brandName: sub.stores?.brand_name || 'Vendor Store',
        area: sub.stores?.area || 'Local Market',
        city: sub.stores?.city || 'Pakistan',
      },
      items: (sub.order_items || []).map((item: any) => ({
        id: item.id,
        quantity: item.quantity,
        unitPrice: item.unit_price,
        totalPrice: item.subtotal || item.quantity * item.unit_price,
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
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Top Banner */}
      <div className="bg-brand-950 text-white rounded-3xl p-6 sm:p-8 border-2 border-brand-800 shadow-brand space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-brand-600 text-slate-950 flex items-center justify-center font-bold shadow-md">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div>
              <span className="text-xs text-accent-400 font-bold uppercase tracking-wider block">
                Order Received & Verified
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold font-mono text-white tracking-wider">
                {formatOrderId(order.id)}
              </h1>
            </div>
          </div>

          <Link
            href="/"
            className="self-start sm:self-auto px-4 py-2 bg-brand-800 hover:bg-brand-700 text-white font-bold text-xs rounded-xl border border-brand-600 transition"
          >
            Continue Shopping
          </Link>
        </div>

        <div className="pt-4 border-t border-brand-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-amber-200/80 block">Date Placed</span>
            <span className="font-bold text-white">{formatDate(order.createdAt)}</span>
          </div>
          <div>
            <span className="text-amber-200/80 block">Payment Method</span>
            <span className="font-bold text-white">{order.paymentMethod}</span>
          </div>
          <div>
            <span className="text-amber-200/80 block">Payment Status</span>
            <span
              className={`font-bold inline-block px-2 py-0.5 rounded text-[10px] ${
                order.paymentStatus === 'PAID'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/40'
              }`}
            >
              {order.paymentStatus}
            </span>
          </div>
          <div>
            <span className="text-amber-200/80 block">Grand Total</span>
            <span className="font-extrabold text-accent-400 font-display text-sm">
              {formatPKR(order.totalAmount)}
            </span>
          </div>
        </div>
      </div>

      {/* Customer 24/7 Support Helpline Banner */}
      <SupportTriggerButton
        variant="card"
        label="Questions About This Order or Delivery?"
      />

      {/* Customer & Address Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-2xl border-2 border-brand-800/15 shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-brand-700 font-bold text-xs pb-2 border-b border-slate-100">
            <User className="w-4 h-4" /> Customer Contact
          </div>
          <p className="text-xs font-bold text-slate-900">{order.customer.name || 'Customer'}</p>
          <p className="text-xs text-slate-500">{order.customer.email}</p>
          <p className="text-xs text-slate-500">WhatsApp: {order.customer.whatsapp || 'N/A'}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border-2 border-brand-800/15 shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-brand-700 font-bold text-xs pb-2 border-b border-slate-100">
            <MapPin className="w-4 h-4" /> Delivery Destination
          </div>
          <p className="text-xs font-bold text-slate-900">{order.shippingAddress.fullName}</p>
          <p className="text-xs text-slate-500">
            {order.shippingAddress.street}, {order.shippingAddress.area}
          </p>
          <p className="text-xs text-slate-500 font-semibold">📍 {order.shippingAddress.city}</p>
        </div>
      </div>

      {/* Sub-Orders Multi-Vendor Pipeline */}
      <div className="space-y-6">
        <div className="border-b-2 border-brand-800/20 pb-3 flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-slate-900 font-display flex items-center gap-2">
            <Package className="w-5 h-5 text-brand-700" />
            <span>Multi-Vendor Sub-Orders ({order.subOrders.length} Local Stores)</span>
          </h2>
        </div>

        <div className="space-y-6">
          {order.subOrders.map((sub) => {
            const badge = getOrderStatusBadge(sub.status);

            return (
              <div
                key={sub.id}
                className="bg-white rounded-2xl border-2 border-brand-800/20 shadow-sm overflow-hidden"
              >
                {/* Store Header */}
                <div className="bg-brand-50/80 p-4 border-b border-brand-800/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-brand-700 text-accent-400 flex items-center justify-center font-bold">
                      <Store className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-brand-950">{sub.store.brandName}</h3>
                      <p className="text-xs text-slate-500">
                        📍 {sub.store.area}, {sub.store.city} • Tracking: {sub.trackingNumber || 'Pending'}
                      </p>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${badge.bg}`}
                    >
                      <span className={`w-2 h-2 rounded-full ${badge.dot}`} />
                      <span>{badge.label}</span>
                    </span>
                  </div>
                </div>

                {/* SubOrder Timeline Tracker */}
                <div className="p-4 bg-slate-50/70 border-b border-slate-100">
                  <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-bold">
                    {['PENDING', 'PROCESSING', 'OUT_FOR_DELIVERY', 'DELIVERED'].map((step, idx) => {
                      const stepOrder = ['PENDING', 'PROCESSING', 'OUT_FOR_DELIVERY', 'DELIVERED'];
                      const currentIdx = stepOrder.indexOf(sub.status);
                      const isComplete = currentIdx >= idx;
                      const isCurrent = currentIdx === idx;

                      return (
                        <div key={step} className="space-y-1">
                          <div
                            className={`h-1.5 rounded-full ${
                              isComplete ? 'bg-brand-600' : 'bg-slate-200'
                            }`}
                          />
                          <span
                            className={`${
                              isCurrent
                                ? 'text-brand-800 font-extrabold'
                                : isComplete
                                ? 'text-brand-700'
                                : 'text-slate-400'
                            }`}
                          >
                            {step.replace(/_/g, ' ')}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Rider details if assigned */}
                {sub.riderName && (
                  <div className="p-3.5 bg-amber-50/60 border-b border-brand-800/10 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-brand-900 font-bold">
                      <Truck className="w-4 h-4 text-brand-600" />
                      <span>Assigned Rider: {sub.riderName}</span>
                    </div>
                    {sub.riderPhone && (
                      <a
                        href={`tel:${sub.riderPhone}`}
                        className="flex items-center gap-1 px-3 py-1 rounded-lg bg-brand-600 text-white font-bold hover:bg-brand-700 transition"
                      >
                        <Phone className="w-3 h-3" /> Call {sub.riderPhone}
                      </a>
                    )}
                  </div>
                )}

                {/* Items in SubOrder */}
                <div className="p-4 divide-y divide-slate-100 space-y-3">
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
                        className="pt-3 first:pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-3">
                          <div className="relative w-14 h-14 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shrink-0">
                            <Image
                              src={images[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80'}
                              alt={item.variant.product.title}
                              fill
                              sizes="56px"
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-slate-900">
                              {item.variant.product.title}
                            </h4>
                            <p className="text-[11px] text-slate-500">{item.variant.variantName}</p>
                            <span className="text-xs font-semibold text-brand-700">
                              {item.quantity} × {formatPKR(item.unitPrice)} = {formatPKR(item.totalPrice)}
                            </span>
                          </div>
                        </div>

                        {/* Customer Review Button for delivered item */}
                        {sub.status === 'DELIVERED' && (
                          <div className="shrink-0">
                            {item.review ? (
                              <div className="flex items-center gap-1 text-xs text-amber-700 font-bold bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-300">
                                <span>★ {item.review.ratingStars} / 5 Reviewed</span>
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

                {/* SubOrder Subtotal */}
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Store Subtotal:</span>
                  <span className="font-extrabold text-slate-900 text-sm">{formatPKR(sub.subtotal)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
