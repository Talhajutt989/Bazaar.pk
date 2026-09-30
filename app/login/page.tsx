'use client';

import React, { useState, useTransition, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Store,
  Mail,
  Lock,
  ArrowRight,
  Loader2,
  Eye,
  EyeOff,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';
import { loginUser } from '@/app/actions/auth';
import { useToast } from '@/context/ToastContext';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setError('Please enter your email address.');
      return;
    }
    if (!password) {
      setError('Please enter your account password.');
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.set('email', cleanEmail);
      formData.set('password', password);

      const res = await loginUser(formData);
      if (res.success) {
        toast('Logged in successfully!', 'success');
        if (res.role === 'ADMIN') {
          window.location.href = '/admin';
        } else if (res.role === 'VENDOR') {
          window.location.href = '/vendor';
        } else {
          window.location.href = '/';
        }
      } else {
        setError(res.error || 'Authentication rejected: Invalid email or password.');
      }
    });
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 space-y-6">
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-brand-900 text-amber-400 flex items-center justify-center mx-auto shadow-md border border-brand-700">
          <Store className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 font-display">
          Sign In to Bazaar.pk
        </h1>
        <p className="text-xs text-slate-500">
          Please enter your registered Gmail/Email and Password to authenticate
        </p>
      </div>

      {/* Main Login Card */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-brand-800/20 shadow-sm space-y-5">
        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span>{error}</span>
              {error.includes('No account found') && (
                <div className="pt-1 flex items-center gap-2">
                  <Link
                    href="/register"
                    className="font-extrabold text-brand-800 underline hover:text-brand-900"
                  >
                    👉 Register Buyer Account
                  </Link>
                  <span className="text-slate-400">•</span>
                  <Link
                    href="/register/vendor"
                    className="font-extrabold text-brand-800 underline hover:text-brand-900"
                  >
                    Register Seller Profile
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleLogin} className="space-y-4 text-xs">
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 block">
              Email / Gmail Address <span className="text-rose-500 font-extrabold">*</span>
            </label>
            <div className="relative">
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. admin@marketplace.pk, vendor.tech@marketplace.pk"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-brand-600 font-medium transition"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 block">
              Account Password <span className="text-rose-500 font-extrabold">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-10 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-brand-600 font-medium transition"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 p-0.5 text-slate-400 hover:text-slate-700 transition focus:outline-none"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full py-3 bg-brand-900 hover:bg-brand-950 text-white font-extrabold text-xs rounded-xl shadow-brand flex items-center justify-center gap-2 transition disabled:opacity-50"
          >
            {isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>Authenticate & Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Registration Links */}
        <div className="pt-4 text-center text-xs text-slate-500 border-t border-slate-100 space-y-1.5">
          <div>Don't have an account registered yet?</div>
          <div className="flex items-center justify-center gap-3 font-bold">
            <Link
              href="/register"
              className="text-brand-700 hover:text-brand-900 underline"
            >
              Create Buyer Account
            </Link>
            <span className="text-slate-300">•</span>
            <Link
              href="/register/vendor"
              className="text-amber-700 hover:text-amber-900 underline"
            >
              Register Seller Profile
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-slate-500">Loading sign in...</div>}>
      <LoginForm />
    </Suspense>
  );
}
