import React from 'react';
import Link from 'next/link';
import { ShoppingBag, Truck, Store, ExternalLink } from 'lucide-react';
import { supabaseAdmin } from '@/lib/supabase';
import { formatDate, formatPKR, getOrderStatusBadge, formatOrderId } from '@/lib/utils';

export default async function AdminOrdersPage() {
  const { data: subOrdersRaw } = await supabaseAdmin
    .from('sub_orders')
    .select('id, subtotal, platform_fee, vendor_earnings, status, rider_name, rider_phone, order_id, created_at, stores(brand_name, city), orders(id, shipping_address_id, users(name, email, whatsapp), addresses(street, city))')
    .order('created_at', { ascending: false });

  const subOrders = (subOrdersRaw || []).map((sub: any) => ({
    id: sub.id,
    orderId: sub.order_id || sub.orders?.id || sub.id,
    subtotal: sub.subtotal || 0,
    platformFee: sub.platform_fee || 0,
    vendorEarnings: sub.vendor_earnings || 0,
    status: sub.status || 'PENDING',
    riderName: sub.rider_name,
    riderPhone: sub.rider_phone,
    createdAt: new Date(sub.created_at || Date.now()),
    store: {
      brandName: sub.stores?.brand_name || 'Vendor Store',
      city: sub.stores?.city || 'Pakistan',
    },
    order: {
      customer: {
        name: sub.orders?.users?.name || 'Customer',
        email: sub.orders?.users?.email || 'customer@marketplace.pk',
        whatsapp: sub.orders?.users?.whatsapp || '+923001234567',
      },
      shippingAddress: {
        street: sub.orders?.addresses?.street || 'Main Boulevard',
        city: sub.orders?.addresses?.city || sub.stores?.city || 'Lahore',
      },
    },
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b-2 border-brand-800/20">
        <div>
          <span className="text-xs font-bold text-brand-700 uppercase tracking-wider flex items-center gap-1">
            <ShoppingBag className="w-4 h-4" /> Global Pipeline
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 font-display">
            Platform-Wide Order & Rider Tracker
          </h1>
        </div>
        <span className="text-xs font-bold text-slate-600 bg-white px-3 py-1.5 rounded-xl border border-slate-200">
          {subOrders.length} Total Sub-Orders Monitored
        </span>
      </div>

      <div className="bg-white rounded-2xl border-2 border-brand-800/20 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3.5">SubOrder ID</th>
                <th className="p-3.5">Vendor Store</th>
                <th className="p-3.5">Customer & Destination</th>
                <th className="p-3.5">Financials (10% Split)</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Assigned Rider Details</th>
                <th className="p-3.5 text-right">View</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {subOrders.length > 0 ? (
                subOrders.map((sub: any) => {
                  const badge = getOrderStatusBadge(sub.status);
                  return (
                    <tr key={sub.id} className="hover:bg-slate-50/80 transition">
                      <td className="p-3.5">
                        <span className="font-mono font-extrabold text-brand-900 block">
                          {formatOrderId(sub.id)}
                        </span>
                        <span className="text-[10px] text-slate-400">{formatDate(sub.createdAt)}</span>
                      </td>

                      <td className="p-3.5">
                        <div className="flex items-center gap-2">
                          <Store className="w-4 h-4 text-brand-700" />
                          <div>
                            <span className="font-bold text-slate-900 block">{sub.store.brandName}</span>
                            <span className="text-[10px] text-slate-500">📍 {sub.store.city}</span>
                          </div>
                        </div>
                      </td>

                      <td className="p-3.5">
                        <span className="font-bold text-slate-900 block">
                          {sub.order.customer.name || sub.order.customer.email}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          {sub.order.shippingAddress.street}, {sub.order.shippingAddress.city}
                        </span>
                      </td>

                      <td className="p-3.5">
                        <span className="font-bold text-slate-900 block">Total: {formatPKR(sub.subtotal)}</span>
                        <span className="text-[10px] text-brand-800 block">
                          Vendor (90%): {formatPKR(sub.vendorEarnings)}
                        </span>
                        <span className="text-[10px] text-amber-700 block">
                          Fee (10%): {formatPKR(sub.platformFee)}
                        </span>
                      </td>

                      <td className="p-3.5">
                        <span
                          className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] border ${badge.bg}`}
                        >
                          {badge.label}
                        </span>
                      </td>

                      <td className="p-3.5">
                        {sub.riderName ? (
                          <div className="space-y-0.5">
                            <span className="font-bold text-purple-900 text-xs flex items-center gap-1">
                              <Truck className="w-3.5 h-3.5 text-purple-600" /> {sub.riderName}
                            </span>
                            {sub.riderPhone && (
                              <span className="text-[10px] text-slate-500 block font-mono">
                                {sub.riderPhone}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">Unassigned</span>
                        )}
                      </td>

                      <td className="p-3.5 text-right">
                        <Link
                          href={`/order/${sub.orderId}`}
                          target="_blank"
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] rounded-lg transition inline-flex items-center gap-1"
                        >
                          <span>Details</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400 text-xs">
                    No active orders found in the system.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
