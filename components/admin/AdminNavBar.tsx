'use client';

import React, { useTransition } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  TrendingUp,
  Store,
  ShieldCheck,
  ShoppingBag,
  Layers,
  Sparkles,
  Users,
  Package,
  Loader2,
} from 'lucide-react';

interface AdminNavBarProps {
  pendingKycCount: number;
}

export function AdminNavBar({ pendingKycCount }: AdminNavBarProps) {
  const pathname = usePathname();

  const NAV_ITEMS = [
    {
      href: '/admin',
      label: 'GMV & Analytics',
      icon: TrendingUp,
      exact: true,
    },
    {
      href: '/admin/customers',
      label: 'Customers & Purchases',
      icon: Users,
    },
    {
      href: '/admin/products',
      label: 'All Products (By Seller)',
      icon: Package,
    },
    {
      href: '/admin/vendors',
      label: 'Sellers Directory',
      icon: Store,
    },
    {
      href: '/admin/kyc',
      label: 'KYC Queue',
      icon: ShieldCheck,
      badge: pendingKycCount > 0 ? `${pendingKycCount} Pending` : undefined,
    },
    {
      href: '/admin/orders',
      label: 'Global Order Tracker',
      icon: ShoppingBag,
    },
    {
      href: '/admin/categories',
      label: 'Categories',
      icon: Layers,
    },
  ];

  return (
    <nav className="bg-white border-b border-slate-200 px-4 sm:px-6 shadow-xs relative z-30">
      <div className="max-w-7xl mx-auto flex items-center gap-2 sm:gap-3 overflow-x-auto py-2.5 text-xs font-bold text-slate-600 no-scrollbar">
        {/* AI Growth Advisor Anchor Link */}
        <Link
          href="/admin#ai-growth-intelligence"
          className="text-amber-800 bg-amber-50 hover:bg-amber-100/90 px-3 py-1.5 rounded-xl border border-amber-300 transition flex items-center gap-1.5 shadow-2xs font-extrabold shrink-0 active:scale-95"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-600 animate-pulse shrink-0" />
          <span>✨ AI Growth Advisor</span>
        </Link>

        <div className="h-4 w-[1px] bg-slate-200 shrink-0" />

        {NAV_ITEMS.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch={true}
              className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-2 shrink-0 font-bold active:scale-95 cursor-pointer select-none ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-xs font-extrabold ring-2 ring-emerald-600/20'
                  : 'text-slate-700 hover:text-emerald-900 hover:bg-slate-100 border border-slate-200/80 bg-slate-50/60'
              }`}
            >
              <Icon
                className={`w-4 h-4 shrink-0 ${
                  isActive ? 'text-white' : 'text-slate-500'
                }`}
              />
              <span>{item.label}</span>
              {item.badge && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-black shadow-xs ${
                    isActive
                      ? 'bg-white text-emerald-900'
                      : 'bg-amber-500 text-slate-950'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

