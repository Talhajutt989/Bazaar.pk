'use client';

import React from 'react';
import { Headphones, Phone, MessageCircle } from 'lucide-react';
import { useSupport, ADMIN_SUPPORT_PHONE_FORMATTED, ADMIN_SUPPORT_PHONE } from '@/context/SupportContext';

interface SupportTriggerButtonProps {
  variant?: 'navbar' | 'vendor-header' | 'admin-header' | 'pill' | 'card' | 'menu-item' | 'footer';
  className?: string;
  label?: string;
  showPhone?: boolean;
}

export function SupportTriggerButton({
  variant = 'navbar',
  className = '',
  label,
  showPhone = false,
}: SupportTriggerButtonProps) {
  const { openSupport } = useSupport();

  if (variant === 'menu-item') {
    return (
      <button
        type="button"
        onClick={openSupport}
        className={`w-full text-left flex items-center justify-between px-3.5 py-2 hover:bg-emerald-50 text-emerald-800 font-bold transition rounded-lg ${className}`}
      >
        <div className="flex items-center gap-2">
          <Headphones className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{label || '24/7 Support Helpline'}</span>
        </div>
        <span className="text-[10px] font-mono bg-emerald-100 text-emerald-900 px-1.5 py-0.5 rounded font-bold">
          {ADMIN_SUPPORT_PHONE_FORMATTED}
        </span>
      </button>
    );
  }

  if (variant === 'vendor-header') {
    return (
      <button
        type="button"
        onClick={openSupport}
        className={`px-3 py-2 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-200 hover:text-white font-bold text-xs rounded-xl border border-emerald-400/30 flex items-center gap-1.5 transition shadow-sm ${className}`}
      >
        <Headphones className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
        <span>{label || 'Help & Support'}</span>
        <span className="bg-emerald-400/20 text-emerald-300 font-mono text-[10px] px-1.5 py-0.2 rounded font-black hidden sm:inline">
          {ADMIN_SUPPORT_PHONE_FORMATTED}
        </span>
      </button>
    );
  }

  if (variant === 'admin-header') {
    return (
      <button
        type="button"
        onClick={openSupport}
        className={`px-3 py-2 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-200 hover:text-white font-bold text-xs rounded-xl border border-emerald-400/30 flex items-center gap-1.5 transition shadow-sm ${className}`}
      >
        <Headphones className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
        <span>{label || 'Support Desk'}</span>
        <span className="bg-emerald-400/20 text-emerald-300 font-mono text-[10px] px-1.5 py-0.2 rounded font-black">
          {ADMIN_SUPPORT_PHONE_FORMATTED}
        </span>
      </button>
    );
  }

  if (variant === 'card') {
    return (
      <div className={`p-4 bg-gradient-to-r from-slate-900 via-brand-950 to-slate-900 text-white rounded-2xl border-2 border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md ${className}`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
            <Headphones className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-extrabold text-white">
              {label || 'Need Assistance with an Order or Store?'}
            </h4>
            <p className="text-[11px] text-slate-300">
              Customer Support Helpline: <span className="font-mono font-bold text-emerald-400">{ADMIN_SUPPORT_PHONE_FORMATTED}</span> (Available Daily)
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={openSupport}
          className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs rounded-xl transition shadow-md flex items-center justify-center gap-1.5 shrink-0"
        >
          <Phone className="w-3.5 h-3.5" />
          <span>Contact Customer Care</span>
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={openSupport}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 text-xs font-bold border border-emerald-400/30 transition shadow-[0_0_15px_rgba(16,185,129,0.2)] ${className}`}
    >
      <Headphones className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
      <span>{label || 'Customer Support'}</span>
      {showPhone && (
        <span className="font-mono text-[10px] text-emerald-200 bg-emerald-500/20 px-1 py-0.5 rounded font-black hidden md:inline">
          {ADMIN_SUPPORT_PHONE_FORMATTED}
        </span>
      )}
    </button>
  );
}
