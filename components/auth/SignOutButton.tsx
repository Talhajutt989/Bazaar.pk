'use client';

import React, { useTransition } from 'react';
import { LogOut, Loader2 } from 'lucide-react';
import { logoutUser } from '@/app/actions/auth';
import { useToast } from '@/context/ToastContext';

interface SignOutButtonProps {
  className?: string;
  variant?: 'nav' | 'header' | 'icon' | 'badge';
  redirectTo?: string;
}

export function SignOutButton({
  className = '',
  variant = 'nav',
  redirectTo = '/login',
}: SignOutButtonProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleSignOut = () => {
    startTransition(async () => {
      try {
        await logoutUser();
        toast('Signed out successfully', 'info');
        window.location.href = redirectTo;
      } catch (err: any) {
        console.error('Sign out error:', err);
        window.location.href = redirectTo;
      }
    });
  };

  if (variant === 'header') {
    return (
      <button
        onClick={handleSignOut}
        disabled={isPending}
        className={`px-3 py-1.5 bg-rose-900/80 hover:bg-rose-800 text-rose-100 border border-rose-700/80 text-xs font-bold rounded-xl flex items-center gap-1.5 transition disabled:opacity-50 ${className}`}
        title="Sign Out of Session"
      >
        {isPending ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <LogOut className="w-3.5 h-3.5" />
        )}
        <span>Sign Out</span>
      </button>
    );
  }

  if (variant === 'icon') {
    return (
      <button
        onClick={handleSignOut}
        disabled={isPending}
        className={`p-2 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition disabled:opacity-50 ${className}`}
        title="Sign Out"
      >
        {isPending ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <LogOut className="w-4 h-4" />
        )}
      </button>
    );
  }

  return (
    <button
      onClick={handleSignOut}
      disabled={isPending}
      className={`w-full text-left flex items-center gap-2 px-3 py-2 hover:bg-rose-50 text-rose-600 transition disabled:opacity-50 text-xs font-semibold ${className}`}
    >
      {isPending ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <LogOut className="w-4 h-4" />
      )}
      <span>Sign Out</span>
    </button>
  );
}
