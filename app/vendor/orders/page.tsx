import React from 'react';
import { redirect } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabase';
import { getSession } from '@/lib/auth';
import { VendorOrdersTable } from '@/components/vendor/VendorOrdersTable';
import { ShoppingBag } from 'lucide-react';

export default async function VendorOrdersPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  let storeId = session.storeId;
  if (!storeId && session.userId) {
    const { data: store } = await supabaseAdmin
      .from('stores')
      .select('id')
      .eq('user_id', session.userId)
      .maybeSingle();
    storeId = store?.id;
  }

  if (!storeId) {
    return (
      <div className="bg-white p-12 rounded-3xl border-2 border-brand-800/20 text-center space-y-4 shadow-sm">
        <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto" />
        <h2 className="text-xl font-extrabold text-slate-900 font-display">No Storefront Active</h2>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Please complete your merchant verification to receive store orders.
        </p>
      </div>
    );
  }

  // Strict Data Isolation: Only query SubOrders for this vendor's store from Supabase
  const { data: subOrdersRaw, error } = await supabaseAdmin
    .from('sub_orders')
    .select(`
      id,
      subtotal,
      platform_fee,
      vendor_earnings,
      status,
      rider_name,
      rider_phone,
      tracking_number,
      created_at,
      orders (
        id,
        payment_method,
        payment_status,
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
        )
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
        )
      )
    `)
    .eq('store_id', storeId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching vendor orders:', error);
  }

  const subOrders = (subOrdersRaw || []).map((sub: any) => ({
    id: sub.id,
    subtotal: sub.subtotal || 0,
    platformFee: sub.platform_fee || 0,
    vendorEarnings: sub.vendor_earnings || 0,
    status: sub.status || 'PENDING',
    riderName: sub.rider_name,
    riderPhone: sub.rider_phone,
    trackingNumber: sub.tracking_number,
    createdAt: new Date(sub.created_at || Date.now()),
    order: {
      id: sub.orders?.id,
      paymentMethod: sub.orders?.payment_method,
      paymentStatus: sub.orders?.payment_status,
      customer: {
        name: sub.orders?.users?.name || 'Customer',
        email: sub.orders?.users?.email || '',
        whatsapp: sub.orders?.users?.whatsapp || '',
      },
      shippingAddress: {
        fullName: sub.orders?.addresses?.full_name || 'Customer',
        phone: sub.orders?.addresses?.whatsapp || sub.orders?.addresses?.phone || '',
        street: sub.orders?.addresses?.street || 'Main Street',
        area: sub.orders?.addresses?.area || 'Gulberg',
        city: sub.orders?.addresses?.city || 'Lahore',
      },
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
    })),
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b-2 border-brand-800/20">
        <div>
          <span className="text-xs font-bold text-brand-700 uppercase tracking-wider flex items-center gap-1">
            <ShoppingBag className="w-4 h-4" /> Live Store Pipeline
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 font-display">
            Sub-Order Processing & Rider Dispatch
          </h1>
        </div>
      </div>

      <VendorOrdersTable initialSubOrders={subOrders as any} />
    </div>
  );
}
