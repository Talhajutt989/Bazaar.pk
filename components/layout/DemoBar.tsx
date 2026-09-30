'use client';

import React, { useTransition } from 'react';
import { ShieldCheck, Store, User, Sparkles, Check, Loader2 } from 'lucide-react';
import { switchDemoAccount } from '@/app/actions/auth';
import { useToast } from '@/context/ToastContext';

interface DemoBarProps {
  currentRole?: string | null;
  currentEmail?: string | null;
  storeName?: string | null;
}

export function DemoBar({ currentRole, currentEmail, storeName }: DemoBarProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleSwitch = (email: string, roleName: string) => {
    startTransition(async () => {
      const res = await switchDemoAccount(email);
      if (res.success) {
        toast(`Switched active persona to ${roleName}`, 'success');
      } else {
        toast(res.error || 'Failed to switch demo account', 'error');
      }
    });
  };

  const accounts = [
    {
      name: 'Super Admin',
      email: 'admin@marketplace.pk',
      role: 'ADMIN',
      icon: ShieldCheck,
      color: 'bg-brand-900 text-amber-100 hover:bg-brand-800',
    },
    {
      name: 'Lahore Tech Hub (Vendor)',
      email: 'vendor.tech@marketplace.pk',
      role: 'VENDOR',
      icon: Store,
      color: 'bg-stone-900 text-amber-200 hover:bg-stone-800',
    },
    {
      name: 'Karachi Fresh Mart (Vendor)',
      email: 'vendor.fresh@marketplace.pk',
      role: 'VENDOR',
      icon: Store,
      color: 'bg-stone-900 text-amber-200 hover:bg-stone-800',
    },
    {
      name: 'Zainab Fatima (Customer)',
      email: 'customer@marketplace.pk',
      role: 'CUSTOMER',
      icon: User,
      color: 'bg-stone-900 text-slate-200 hover:bg-stone-800',
    },
  ];

  return (
    <div className="bg-black text-white border-b border-brand-800/60 text-xs py-1.5 px-4 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 font-medium">
          <span className="flex items-center gap-1.5 text-accent-400 font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 animate-spin text-accent-400" style={{ animationDuration: '6s' }} />
            Demo Sandbox:
          </span>
          <span className="text-amber-200/70 hidden sm:inline">Active Persona:</span>
          <span className="bg-brand-600 text-slate-950 px-2 py-0.5 rounded-full font-bold uppercase tracking-wide border border-accent-400 flex items-center gap-1">
            {currentRole || 'GUEST BROWSING'}
          </span>
          {storeName && (
            <span className="text-amber-300 hidden md:inline font-medium">({storeName})</span>
          )}
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
          <span className="text-amber-200/60 text-[11px] mr-1 hidden lg:inline">Quick Switch:</span>
          {accounts.map((acc) => {
            const isActive = currentEmail === acc.email;
            const Icon = acc.icon;
            return (
              <button
                key={acc.email}
                disabled={isPending}
                onClick={() => handleSwitch(acc.email, acc.name)}
                className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1.5 text-[11px] font-medium border ${
                  isActive
                    ? 'bg-accent-500 text-slate-950 border-amber-300 font-bold shadow-sm ring-1 ring-amber-400'
                    : `${acc.color} border-brand-800/80`
                } disabled:opacity-50`}
              >
                {isPending ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : isActive ? (
                  <Check className="w-3 h-3 text-slate-950 stroke-[3]" />
                ) : (
                  <Icon className="w-3 h-3 shrink-0 text-accent-400" />
                )}
                <span>{acc.name.split(' (')[0]}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
