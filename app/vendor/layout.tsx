import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import {
  Store,
  Package,
  ShoppingBag,
  ShieldCheck,
  TrendingUp,
  Sliders,
  AlertCircle,
  PlusCircle,
  Layers,
  ArrowUpRight,
} from 'lucide-react';
import { getSession } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { getKycStatusBadge, getStoreStatusBadge } from '@/lib/utils';
import { SignOutButton } from '@/components/auth/SignOutButton';
import { SupportTriggerButton } from '@/components/support/SupportTriggerButton';

export default async function VendorLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  if (!session) {
    redirect('/login?role=vendor');
  }

  // Allow admin or vendor
  if (session.role !== 'VENDOR' && session.role !== 'ADMIN') {
    redirect('/');
  }

  // Fetch store details from Supabase strictly for this vendor
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

  const kycBadge = getKycStatusBadge(store?.kycRecord?.status || 'APPROVED');
  const storeBadge = getStoreStatusBadge(store?.status || 'ACTIVE');


  return (
    <div className="min-h-[85vh] bg-[#F8FAFC]">
      {/* Vendor Top Banner */}
      <div className="bg-brand-950 text-white border-b-2 border-brand-800 py-4 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-700 text-accent-400 flex items-center justify-center font-bold border border-brand-600">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-extrabold font-display">
                  {store?.brandName || 'Vendor Merchant Portal'}
                </h1>
                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${storeBadge.bg}`}>
                  {storeBadge.label}
                </span>
              </div>
              <p className="text-xs text-amber-200/80">
                📍 {store?.area ? `${store.area}, ` : ''}{store?.city || 'Pakistan'} • Isolated Seller Workspace
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <SupportTriggerButton variant="vendor-header" label="Admin Helpline" />

            <Link
              href="/vendor/products/new"
              className="px-3 py-2 bg-accent-500 hover:bg-accent-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-accent flex items-center gap-1.5 transition transform active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>List New Product</span>
            </Link>

            {store && (
              <Link
                href={`/store/${store.slug}`}
                target="_blank"
                className="px-3 py-2 bg-brand-800 hover:bg-brand-700 text-white font-bold text-xs rounded-xl border border-brand-700 flex items-center gap-1 transition hidden md:flex"
              >
                <span>Storefront</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            )}

            <SignOutButton variant="header" />
          </div>
        </div>
      </div>

      {/* KYC Alert if not approved */}
      {store?.kycRecord?.status !== 'APPROVED' && (
        <div className="bg-amber-500/15 border-b border-amber-500/30 px-4 py-2 text-xs text-amber-900 flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>KYC Status: {store?.kycRecord?.status || 'PENDING'}</strong> — Submit your verified CNIC & Bank details for 1-click approval.
            </span>
          </div>
          <Link href="/vendor/kyc" className="font-bold underline text-amber-800 hover:text-amber-900">
            View KYC Portal
          </Link>
        </div>
      )}

      {/* Vendor Navigation Sub-bar */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-6 shadow-sm sticky top-7 z-30">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6 overflow-x-auto py-2.5 text-xs font-bold text-slate-600">
            <Link
              href="/vendor"
              className="hover:text-brand-700 py-1 transition flex items-center gap-1.5 border-b-2 border-transparent hover:border-brand-600 whitespace-nowrap"
            >
              <TrendingUp className="w-4 h-4 text-brand-600" />
              <span>Dashboard & Metrics</span>
            </Link>

            <Link
              href="/vendor/products"
              className="hover:text-brand-700 py-1 transition flex items-center gap-1.5 border-b-2 border-transparent hover:border-brand-600 whitespace-nowrap"
            >
              <Package className="w-4 h-4 text-brand-600" />
              <span>My Products</span>
            </Link>

            <Link
              href="/vendor/products/new"
              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition flex items-center gap-1.5 shadow-sm font-black whitespace-nowrap"
            >
              <PlusCircle className="w-3.5 h-3.5 text-amber-300" />
              <span>+ Add New Product</span>
            </Link>

            <Link
              href="/vendor/orders"
              className="hover:text-brand-700 py-1 transition flex items-center gap-1.5 border-b-2 border-transparent hover:border-brand-600 whitespace-nowrap"
            >
              <ShoppingBag className="w-4 h-4 text-brand-600" />
              <span>Order Fulfillment</span>
            </Link>

            <Link
              href="/vendor/kyc"
              className="hover:text-brand-700 py-1 transition flex items-center gap-1.5 border-b-2 border-transparent hover:border-brand-600 whitespace-nowrap"
            >
              <ShieldCheck className="w-4 h-4 text-brand-600" />
              <span>KYC Compliance ({kycBadge.label})</span>
            </Link>
          </div>

          <div className="hidden lg:flex items-center gap-2 text-xs">
            <SupportTriggerButton variant="vendor-header" label="24/7 Admin Helpline" />
          </div>
        </div>
      </div>

      {/* Main Vendor Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">{children}</div>
    </div>
  );
}
