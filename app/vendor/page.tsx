import React from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  DollarSign,
  Package,
  ShoppingBag,
  Clock,
  Truck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Store,
} from 'lucide-react';
import { getSession } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { formatDate, formatPKR, getOrderStatusBadge, formatOrderId } from '@/lib/utils';
import { redirect } from 'next/navigation';
import { SupportTriggerButton } from '@/components/support/SupportTriggerButton';

export default async function VendorDashboardPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  let store: any = null;
  if (session.storeId) {
    const { data } = await supabaseAdmin
      .from('stores')
      .select('*')
      .eq('id', session.storeId)
      .maybeSingle();
    store = data;
  }

  if (!store && session.userId) {
    const { data } = await supabaseAdmin
      .from('stores')
      .select('*')
      .eq('user_id', session.userId)
      .maybeSingle();
    store = data;
  }

  if (!store) {
    return (
      <div className="bg-white p-12 rounded-3xl border-2 border-brand-800/20 text-center space-y-4 shadow-sm">
        <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
          <Store className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-extrabold text-slate-900 font-display">No Storefront Activated</h2>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          You are logged in as a seller, but you have not completed your store profile registration yet.
        </p>
        <Link
          href="/vendor/kyc"
          className="inline-flex items-center gap-2 px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-brand transition"
        >
          <span>Complete Store KYC & Profile</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  // Strict Data Isolation: Fetch sub-orders and product count concurrently in parallel
  const [{ data: subOrdersRaw }, { count: productsCountRaw }] = await Promise.all([
    supabaseAdmin
      .from('sub_orders')
      .select('id, order_id, subtotal, platform_fee, vendor_earnings, status, rider_name, rider_phone, created_at, orders(id, shipping_address_id, users(name, email, whatsapp), addresses(street, city))')
      .eq('store_id', store.id)
      .order('created_at', { ascending: false }),
    supabaseAdmin
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('store_id', store.id),
  ]);

  const subOrders = (subOrdersRaw || []).map((o: any) => ({
    id: o.id,
    orderId: o.order_id || o.id,
    subtotal: o.subtotal || 0,
    platformFee: o.platform_fee || 0,
    vendorEarnings: o.vendor_earnings || 0,
    status: o.status || 'PENDING',
    riderName: o.rider_name,
    riderPhone: o.rider_phone,
    createdAt: new Date(o.created_at || Date.now()),
    order: {
      customer: {
        name: o.orders?.users?.name || 'Customer',
        email: o.orders?.users?.email || 'customer@marketplace.pk',
        whatsapp: o.orders?.users?.whatsapp || '+923001234567',
      },
      shippingAddress: {
        street: o.orders?.addresses?.street || 'Main Road',
        city: o.orders?.addresses?.city || store.city,
      },
    },
    items: [],
  }));

  const productsCount = productsCountRaw !== null && productsCountRaw !== undefined ? productsCountRaw : 0;


  // Calculate Metrics
  const grossSales = subOrders.reduce((sum, o) => sum + o.subtotal, 0);
  const netEarnings = subOrders.reduce((sum, o) => sum + o.vendorEarnings, 0);
  const platformFees = subOrders.reduce((sum, o) => sum + o.platformFee, 0);

  // Escrow balance = Net earnings of non-delivered orders
  const escrowBalance = subOrders
    .filter((o) => ['PENDING', 'PROCESSING', 'OUT_FOR_DELIVERY'].includes(o.status))
    .reduce((sum, o) => sum + o.vendorEarnings, 0);

  const pendingCount = subOrders.filter((o) => o.status === 'PENDING').length;
  const processingCount = subOrders.filter((o) => o.status === 'PROCESSING').length;
  const outForDeliveryCount = subOrders.filter((o) => o.status === 'OUT_FOR_DELIVERY').length;
  const deliveredCount = subOrders.filter((o) => o.status === 'DELIVERED').length;

  return (
    <div className="space-y-8">
      {/* Quick Product Action Hero Banner */}
      <div className="bg-gradient-to-r from-brand-950 via-slate-900 to-brand-900 text-white p-6 rounded-3xl border-2 border-brand-800 shadow-brand flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-emerald-400 text-xs font-bold uppercase tracking-wider">
              {store.brandName} • Store Inventory Manager
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold font-display text-white">
            Expand Your Store Inventory
          </h2>
          <p className="text-xs text-amber-200/80 max-w-xl">
            Add new products with multi-variants (storage, colors, sizes, stock) directly to your private catalog.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/vendor/products"
            className="px-4 py-3 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl border border-white/20 transition flex items-center gap-1.5"
          >
            <Package className="w-4 h-4" />
            <span>My Catalog ({productsCount})</span>
          </Link>
          <Link
            href="/vendor/products/new"
            className="px-5 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs rounded-xl shadow-accent transition flex items-center gap-2 transform active:scale-95"
          >
            <span className="text-base font-black leading-none">+</span>
            <span>Add New Product</span>
          </Link>
        </div>
      </div>

      {/* 24/7 Admin Helpline Card for Sellers */}
      <SupportTriggerButton
        variant="card"
        label="Merchant Settlement & Admin Support Helpline"
      />

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Net Earnings */}
        <div className="bg-white p-5 rounded-2xl border-2 border-brand-800/20 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>Net Vendor Earnings (90%)</span>
            <div className="p-2 bg-brand-100 text-brand-800 rounded-xl">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-brand-900 font-display">
            {formatPKR(netEarnings)}
          </div>
          <span className="text-[11px] text-brand-700 font-medium block">
            After 10% platform fee deduction
          </span>
        </div>

        {/* Escrow Balance */}
        <div className="bg-white p-5 rounded-2xl border-2 border-brand-800/20 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>In Escrow (Pending Delivery)</span>
            <div className="p-2 bg-amber-100 text-amber-800 rounded-xl">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-amber-600 font-display">
            {formatPKR(escrowBalance)}
          </div>
          <span className="text-[11px] text-slate-500 block">
            Released to bank upon rider delivery confirmation
          </span>
        </div>

        {/* Gross Sales */}
        <div className="bg-white p-5 rounded-2xl border-2 border-brand-800/20 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>Gross Store Sales</span>
            <div className="p-2 bg-blue-100 text-blue-800 rounded-xl">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 font-display">
            {formatPKR(grossSales)}
          </div>
          <span className="text-[11px] text-slate-500 block">
            Fee paid to platform: {formatPKR(platformFees)}
          </span>
        </div>

        {/* Active Catalog */}
        <div className="bg-white p-5 rounded-2xl border-2 border-brand-800/20 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>Product Catalog</span>
            <div className="p-2 bg-purple-100 text-purple-800 rounded-xl">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 font-display">
            {productsCount} Items
          </div>
          <Link
            href="/vendor/products/new"
            className="text-[11px] text-brand-700 font-bold hover:underline flex items-center gap-1"
          >
            <span>+ Add New Product Variant</span>
          </Link>
        </div>
      </div>

      {/* Pipeline Status Summary Tabs */}
      <div className="bg-white p-6 rounded-2xl border-2 border-brand-800/20 shadow-sm space-y-4">
        <h3 className="text-sm font-extrabold text-slate-900 pb-2 border-b border-slate-100">
          Order Pipeline Status Breakdown
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
            <span className="text-xs font-bold text-amber-800 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" /> Pending Confirmation
            </span>
            <span className="text-2xl font-extrabold text-amber-900 block mt-1 font-display">
              {pendingCount}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
            <span className="text-xs font-bold text-blue-800 flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5" /> Processing & Packed
            </span>
            <span className="text-2xl font-extrabold text-blue-900 block mt-1 font-display">
              {processingCount}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-purple-50 border border-purple-200">
            <span className="text-xs font-bold text-purple-800 flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5" /> Out for Delivery (Rider)
            </span>
            <span className="text-2xl font-extrabold text-purple-900 block mt-1 font-display">
              {outForDeliveryCount}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-brand-50 border border-brand-200">
            <span className="text-xs font-bold text-brand-900 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-brand-600" /> Completed & Delivered
            </span>
            <span className="text-2xl font-extrabold text-brand-950 block mt-1 font-display">
              {deliveredCount}
            </span>
          </div>
        </div>
      </div>

      {/* Recent Sub-Orders Table */}
      <div className="bg-white rounded-2xl border-2 border-brand-800/20 shadow-sm overflow-hidden space-y-4 p-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900">Recent Store Orders</h3>
            <p className="text-xs text-slate-500">Only orders containing products from your store</p>
          </div>
          <Link
            href="/vendor/orders"
            className="text-xs font-bold text-brand-700 hover:text-brand-800 flex items-center gap-1"
          >
            <span>Open Order Fulfillment Pipeline</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {subOrders.length === 0 ? (
          <div className="text-center py-8">
            <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-700">No sub-orders received yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">Order ID</th>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Items</th>
                  <th className="p-3">Subtotal</th>
                  <th className="p-3">Net Earning (90%)</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {subOrders.slice(0, 5).map((sub) => {
                  const badge = getOrderStatusBadge(sub.status);
                  return (
                    <tr key={sub.id} className="hover:bg-slate-50/80 transition">
                      <td className="p-3 font-mono font-bold text-brand-900">
                        {formatOrderId(sub.orderId)}
                      </td>
                      <td className="p-3">
                        <span className="font-bold text-slate-900 block">
                          {sub.order.customer.name || 'Customer'}
                        </span>
                        <span className="text-[11px] text-slate-500">{sub.order.shippingAddress.city}</span>
                      </td>
                      <td className="p-3 font-medium text-slate-600">
                        {sub.items.length} {sub.items.length === 1 ? 'item' : 'items'}
                      </td>
                      <td className="p-3 font-semibold text-slate-900">{formatPKR(sub.subtotal)}</td>
                      <td className="p-3 font-extrabold text-brand-800">
                        {formatPKR(sub.vendorEarnings)}
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] border ${badge.bg}`}
                        >
                          {badge.label}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <Link
                          href="/vendor/orders"
                          className="px-2.5 py-1 bg-brand-600 hover:bg-brand-700 text-white font-bold text-[11px] rounded-lg transition shadow-sm"
                        >
                          Process
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
