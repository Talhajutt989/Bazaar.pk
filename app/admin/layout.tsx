import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import {
  ShieldAlert,
  TrendingUp,
  Store,
  ShieldCheck,
  ShoppingBag,
  Layers,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';
import { getSession } from '@/lib/auth';
import { SignOutButton } from '@/components/auth/SignOutButton';
import { SupportTriggerButton } from '@/components/support/SupportTriggerButton';

import { getAllKycRecords } from '@/lib/kyc';

import { AdminNavBar } from '@/components/admin/AdminNavBar';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  if (!session || session.role !== 'ADMIN') {
    redirect('/login?role=admin');
  }

  const allKyc = await getAllKycRecords();
  const pendingKycCount = allKyc.filter((k) => k.status === 'UNDER_REVIEW').length;

  return (
    <div className="min-h-[85vh] bg-[#F8FAFC]">
      {/* Admin Top Header Banner */}
      <div className="bg-brand-950 text-white border-b-2 border-brand-800 py-4 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent-500 text-slate-950 flex items-center justify-center font-extrabold shadow-md">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-extrabold font-display text-white">
                  Platform Super Admin Control Center
                </h1>
                <span className="bg-accent-500 text-slate-950 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase">
                  Owner Suite
                </span>
              </div>
              <p className="text-xs text-amber-200/80">
                Real-Time Platform GMV, 10% Commission Ledger & Multi-Vendor Governance
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <SupportTriggerButton variant="admin-header" label="Helpline" />

            <Link
              href="/"
              target="_blank"
              className="px-3.5 py-2 bg-brand-800 hover:bg-brand-700 text-white font-bold text-xs rounded-xl border border-brand-700 flex items-center gap-1.5 transition"
            >
              <span>Live Marketplace</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>

            <SignOutButton variant="header" />
          </div>
        </div>
      </div>

      {/* Interactive Admin Sub-navigation Bar */}
      <AdminNavBar pendingKycCount={pendingKycCount} />

      {/* Main Admin Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">{children}</div>
    </div>
  );
}
