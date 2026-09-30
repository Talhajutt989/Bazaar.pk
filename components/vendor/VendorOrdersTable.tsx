'use client';

import React, { useState, useTransition } from 'react';
import Image from 'next/image';
import {
  ShoppingBag,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  User,
  X,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import { updateSubOrderStatus } from '@/app/actions/orders';
import { formatDate, formatPKR, getOrderStatusBadge, formatOrderId } from '@/lib/utils';
import { useToast } from '@/context/ToastContext';

export interface VendorSubOrder {
  id: string;
  orderId: string;
  status: string;
  subtotal: number;
  platformFee: number;
  vendorEarnings: number;
  riderName: string | null;
  riderPhone: string | null;
  trackingNumber: string | null;
  createdAt: Date | string;
  order: {
    paymentMethod: string;
    paymentStatus: string;
    customer: {
      name: string | null;
      email: string;
      whatsapp: string | null;
    };
    shippingAddress: {
      fullName: string;
      street: string;
      area: string;
      city: string;
      whatsapp: string;
    };
  };
  items: Array<{
    id: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    variant: {
      variantName: string;
      sku: string;
      product: {
        title: string;
        images: string;
      };
    };
  }>;
}

interface VendorOrdersTableProps {
  initialSubOrders: VendorSubOrder[];
}

export function VendorOrdersTable({ initialSubOrders }: VendorOrdersTableProps) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState<string>('ALL');

  // Rider Modal State
  const [isRiderModalOpen, setIsRiderModalOpen] = useState(false);
  const [selectedSubOrderId, setSelectedSubOrderId] = useState<string | null>(null);
  const [riderName, setRiderName] = useState('');
  const [riderPhone, setRiderPhone] = useState('');

  const filteredOrders = initialSubOrders.filter((sub) => {
    if (activeTab === 'ALL') return true;
    return sub.status === activeTab;
  });

  const handleStatusChange = (subOrderId: string, newStatus: string) => {
    startTransition(async () => {
      const res = await updateSubOrderStatus(subOrderId, newStatus);
      if (res.success) {
        toast(`Order updated to status: ${newStatus}`, 'success');
      } else {
        toast(res.error || 'Failed to update order status', 'error');
      }
    });
  };

  const handleOpenRiderModal = (subOrderId: string) => {
    setSelectedSubOrderId(subOrderId);
    setRiderName('Tariq Butt (Express Rider)');
    setRiderPhone('+92 321 9876543');
    setIsRiderModalOpen(true);
  };

  const handleAssignRiderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubOrderId || !riderName) return;

    startTransition(async () => {
      const res = await updateSubOrderStatus(selectedSubOrderId, 'OUT_FOR_DELIVERY', {
        riderName,
        riderPhone,
      });

      if (res.success) {
        toast('Rider assigned & dispatched! Sub-order is Out for Delivery.', 'success');
        setIsRiderModalOpen(false);
        setSelectedSubOrderId(null);
      } else {
        toast(res.error || 'Failed to assign rider', 'error');
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 text-xs font-bold">
        {[
          { id: 'ALL', label: 'All Orders', count: initialSubOrders.length },
          {
            id: 'PENDING',
            label: 'Pending Confirmation',
            count: initialSubOrders.filter((o) => o.status === 'PENDING').length,
          },
          {
            id: 'PROCESSING',
            label: 'Processing / Packed',
            count: initialSubOrders.filter((o) => o.status === 'PROCESSING').length,
          },
          {
            id: 'OUT_FOR_DELIVERY',
            label: 'Out for Delivery (Rider)',
            count: initialSubOrders.filter((o) => o.status === 'OUT_FOR_DELIVERY').length,
          },
          {
            id: 'DELIVERED',
            label: 'Delivered / Completed',
            count: initialSubOrders.filter((o) => o.status === 'DELIVERED').length,
          },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3.5 py-2 rounded-xl transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-brand-600 text-white shadow-brand'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                activeTab === tab.id ? 'bg-brand-800 text-white' : 'bg-slate-100 text-slate-700'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Sub-Orders Fulfillment Cards */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border-2 border-brand-800/20 text-center shadow-sm">
          <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-xs font-bold text-slate-700">No sub-orders found for status "{activeTab}"</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((sub) => {
            const badge = getOrderStatusBadge(sub.status);

            return (
              <div
                key={sub.id}
                className="bg-white rounded-2xl border-2 border-brand-800/20 p-5 shadow-sm space-y-4 transition hover:border-brand-600"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-extrabold text-sm text-brand-900">
                        {formatOrderId(sub.id)}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] border ${badge.bg}`}
                      >
                        {badge.label}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Placed on {formatDate(sub.createdAt)} • Parent Order {formatOrderId(sub.orderId)}
                    </p>
                  </div>

                  {/* Financial calculation */}
                  <div className="text-right">
                    <span className="text-xs text-slate-500 block">
                      Subtotal: {formatPKR(sub.subtotal)} (-10% Platform Fee: {formatPKR(sub.platformFee)})
                    </span>
                    <span className="text-sm font-extrabold text-brand-800 font-display">
                      Net Vendor Payout: {formatPKR(sub.vendorEarnings)}
                    </span>
                  </div>
                </div>

                {/* Customer & Address Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div>
                    <span className="font-bold text-slate-700 block mb-0.5">Customer Contact:</span>
                    <p className="text-slate-900 font-semibold">{sub.order.customer.name || 'Customer'}</p>
                    <p className="text-slate-500">{sub.order.customer.email}</p>
                    <p className="text-brand-700 font-medium">
                      WhatsApp: {sub.order.customer.whatsapp || sub.order.shippingAddress.whatsapp}
                    </p>
                  </div>
                  <div>
                    <span className="font-bold text-slate-700 block mb-0.5">Delivery Address:</span>
                    <p className="text-slate-900">{sub.order.shippingAddress.street}</p>
                    <p className="text-slate-500">{sub.order.shippingAddress.area}</p>
                    <p className="text-brand-900 font-bold">📍 {sub.order.shippingAddress.city}</p>
                  </div>
                </div>

                {/* Items List */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-700 block">Ordered Items:</span>
                  <div className="divide-y divide-slate-100">
                    {sub.items.map((item) => {
                      let images: string[] = [];
                      try {
                        images = JSON.parse(item.variant.product.images);
                      } catch {
                        images = [item.variant.product.images];
                      }

                      return (
                        <div key={item.id} className="pt-2 first:pt-0 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2.5">
                            <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 shrink-0">
                              <Image
                                src={images[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80'}
                                alt={item.variant.product.title}
                                fill
                                sizes="40px"
                                className="object-cover"
                              />
                            </div>
                            <div>
                              <span className="font-bold text-slate-900 block">{item.variant.product.title}</span>
                              <span className="text-slate-500 text-[11px]">{item.variant.variantName} (SKU: {item.variant.sku})</span>
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="font-bold text-slate-900">
                              {item.quantity} × {formatPKR(item.unitPrice)}
                            </span>
                            <span className="text-xs text-brand-700 block font-semibold">
                              = {formatPKR(item.totalPrice)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Rider details if assigned */}
                {sub.riderName && (
                  <div className="p-3 bg-brand-50/80 rounded-xl border border-brand-200 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-brand-900">
                      <Truck className="w-4 h-4 text-brand-600" />
                      <span>
                        Assigned Rider: <strong>{sub.riderName}</strong> ({sub.riderPhone})
                      </span>
                    </div>
                    {sub.riderPhone && (
                      <a
                        href={`tel:${sub.riderPhone}`}
                        className="font-bold text-brand-700 hover:underline flex items-center gap-1"
                      >
                        <Phone className="w-3 h-3" /> Call Rider
                      </a>
                    )}
                  </div>
                )}

                {/* Action Toolbar for Order Progression */}
                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-slate-500">Payment:</span>
                    <span className="font-bold text-slate-900">{sub.order.paymentMethod}</span>
                    <span
                      className={`text-[10px] font-extrabold px-2 py-0.5 rounded ${
                        sub.order.paymentStatus === 'PAID'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {sub.order.paymentStatus}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {sub.status === 'PENDING' && (
                      <button
                        onClick={() => handleStatusChange(sub.id, 'PROCESSING')}
                        disabled={isPending}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center gap-1.5"
                      >
                        <span>Accept & Start Packing</span>
                      </button>
                    )}

                    {sub.status === 'PROCESSING' && (
                      <button
                        onClick={() => handleOpenRiderModal(sub.id)}
                        disabled={isPending}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center gap-1.5"
                      >
                        <Truck className="w-3.5 h-3.5" />
                        <span>Assign Rider & Dispatch</span>
                      </button>
                    )}

                    {sub.status === 'OUT_FOR_DELIVERY' && (
                      <button
                        onClick={() => handleStatusChange(sub.id, 'DELIVERED')}
                        disabled={isPending}
                        className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-brand transition flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Confirm Delivery & Release Escrow</span>
                      </button>
                    )}

                    {sub.status === 'DELIVERED' && (
                      <span className="text-xs font-bold text-brand-700 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4 text-brand-600" />
                        <span>Escrow Released to Vendor</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Rider Assignment Modal */}
      {isRiderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl border-2 border-brand-800 max-w-md w-full p-6 space-y-5 shadow-2xl animate-slide-up">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-brand-700" />
                <h3 className="font-extrabold text-base text-slate-900">
                  Assign Hyper-Local Delivery Rider
                </h3>
              </div>
              <button
                onClick={() => setIsRiderModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAssignRiderSubmit} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Rider / Courier Name *</label>
                <input
                  type="text"
                  required
                  value={riderName}
                  onChange={(e) => setRiderName(e.target.value)}
                  placeholder="e.g. Tariq Butt (Bykea / Local Express)"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-brand-600"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Rider Contact Phone Number *</label>
                <input
                  type="tel"
                  required
                  value={riderPhone}
                  onChange={(e) => setRiderPhone(e.target.value)}
                  placeholder="+92 300 1234567"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-brand-600"
                />
              </div>

              <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 text-purple-900 text-[11px]">
                🚀 Customer will instantly receive the rider's name & phone number on their tracking screen.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsRiderModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold shadow-sm flex items-center gap-2 transition disabled:opacity-50"
                >
                  {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Dispatch Out for Delivery</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
