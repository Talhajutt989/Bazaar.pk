'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { Store, ShieldCheck, AlertCircle, CheckCircle2, Sliders, ExternalLink, Loader2 } from 'lucide-react';
import { updateStoreStatus, updateCommissionRate } from '@/app/actions/admin';
import { formatPKR, getKycStatusBadge, getStoreStatusBadge } from '@/lib/utils';
import { useToast } from '@/context/ToastContext';

export interface AdminStoreItem {
  id: string;
  brandName: string;
  slug: string;
  city: string;
  area: string | null;
  brandAddress: string;
  commissionRate: number;
  status: string;
  totalSales?: number;
  user: {
    name: string | null;
    email: string;
    whatsapp: string | null;
  };
  kycRecord: {
    id: string;
    status: string;
    cnicNumber: string;
    bankName: string;
    ibanNumber: string;
  } | null;
  _count: {
    products: number;
    subOrders: number;
  };
}

interface VendorsTableProps {
  stores: AdminStoreItem[];
}

export function VendorsTable({ stores }: VendorsTableProps) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const handleStatusChange = (storeId: string, newStatus: string) => {
    startTransition(async () => {
      const res = await updateStoreStatus(storeId, newStatus);
      if (res.success) {
        toast(`Store status updated to ${newStatus}`, 'success');
      } else {
        toast(res.error || 'Failed to update store status', 'error');
      }
    });
  };

  const handleCommissionChange = (storeId: string, newRateStr: string) => {
    const rate = parseFloat(newRateStr);
    if (isNaN(rate) || rate < 0 || rate > 100) return;

    startTransition(async () => {
      const res = await updateCommissionRate(storeId, rate);
      if (res.success) {
        toast(`Commission rate set to ${rate}%`, 'success');
      } else {
        toast(res.error || 'Failed to update commission rate', 'error');
      }
    });
  };

  return (
    <div className="bg-white rounded-2xl border-2 border-brand-800/20 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
            <tr>
              <th className="p-3.5">Store / Merchant</th>
              <th className="p-3.5">Owner Account</th>
              <th className="p-3.5">City & Area</th>
              <th className="p-3.5">Catalog & Orders</th>
              <th className="p-3.5">Commission Rate</th>
              <th className="p-3.5">KYC State</th>
              <th className="p-3.5">Store Status</th>
              <th className="p-3.5 text-right">Quick Explorer</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {stores.map((s) => {
              const storeBadge = getStoreStatusBadge(s.status);
              const kycBadge = getKycStatusBadge(s.kycRecord?.status || 'PENDING');

              return (
                <tr key={s.id} className="hover:bg-slate-50/80 transition">
                  <td className="p-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-brand-100 text-brand-800 flex items-center justify-center font-bold">
                        <Store className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 block">{s.brandName}</span>
                        <span className="text-[10px] text-slate-400 font-mono">slug: {s.slug}</span>
                      </div>
                    </div>
                  </td>

                  <td className="p-3.5">
                    <span className="font-semibold text-slate-900 block">{s.user.name || 'Vendor'}</span>
                    <span className="text-[11px] text-slate-500">{s.user.email}</span>
                    {s.user.whatsapp && (
                      <span className="text-[10px] text-brand-700 block font-medium">
                        WA: {s.user.whatsapp}
                      </span>
                    )}
                  </td>

                  <td className="p-3.5">
                    <span className="font-bold text-slate-900 block">📍 {s.city}</span>
                    <span className="text-[11px] text-slate-500 truncate max-w-xs block">
                      {s.area || s.brandAddress}
                    </span>
                  </td>

                  <td className="p-3.5">
                    <div className="space-y-1">
                      <Link
                        href={`/admin/products?storeId=${s.id}`}
                        className="font-bold text-brand-700 hover:text-brand-900 hover:underline flex items-center gap-1"
                      >
                        <span>{s._count.products} Products</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                      <Link
                        href={`/admin/customers?storeId=${s.id}`}
                        className="text-[11px] text-slate-600 hover:text-slate-900 block"
                      >
                        {s._count.subOrders} Sub-Orders {s.totalSales ? `• ${formatPKR(s.totalSales)}` : ''}
                      </Link>
                    </div>
                  </td>

                  <td className="p-3.5">
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        defaultValue={Math.round(s.commissionRate * 100)}
                        onBlur={(e) => handleCommissionChange(s.id, e.target.value)}
                        className="w-14 bg-slate-50 border border-slate-200 rounded-lg p-1 text-center font-bold text-slate-900 text-xs focus:outline-none focus:border-brand-600"
                      />
                      <span className="font-bold text-slate-600">%</span>
                    </div>
                  </td>

                  <td className="p-3.5">
                    <Link
                      href="/admin/kyc"
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${kycBadge.bg} hover:opacity-80`}
                    >
                      <span>{kycBadge.label}</span>
                    </Link>
                  </td>

                  <td className="p-3.5">
                    <select
                      value={s.status}
                      disabled={isPending}
                      onChange={(e) => handleStatusChange(s.id, e.target.value)}
                      className="bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-brand-600 cursor-pointer"
                    >
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="PENDING_KYC">PENDING_KYC</option>
                      <option value="UNDER_REVIEW">UNDER_REVIEW</option>
                      <option value="SUSPENDED">SUSPENDED</option>
                    </select>
                  </td>

                  <td className="p-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Link
                        href={`/admin/products?storeId=${s.id}`}
                        className="px-2 py-1 bg-brand-50 hover:bg-brand-100 text-brand-900 font-bold text-[10px] rounded-lg border border-brand-200 transition"
                      >
                        Products
                      </Link>
                      <Link
                        href={`/store/${s.slug}`}
                        target="_blank"
                        className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10px] rounded-lg transition inline-flex items-center gap-1"
                      >
                        <span>Storefront</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
