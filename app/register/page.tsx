'use client';

import React, { useState, useTransition, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Store, User, Mail, Lock, Phone, ArrowRight, Loader2, ShieldCheck, Eye, EyeOff, CheckCircle2, AlertCircle, AlertTriangle } from 'lucide-react';
import { registerUser, checkEmailAvailability } from '@/app/actions/auth';
import { useToast } from '@/context/ToastContext';
import { validateFullName, validateStoreName, validateEmail, validatePakistaniPhone, validatePassword } from '@/lib/validation';

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const [role, setRole] = useState<'CUSTOMER' | 'VENDOR'>('CUSTOMER');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [emailDuplicateError, setEmailDuplicateError] = useState('');
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [phoneDigits, setPhoneDigits] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  // Handle phone input formatting: strip leading 0, allow only digits, max 10 digits
  const handlePhoneChange = (val: string) => {
    let clean = val.replace(/\D/g, '');
    if (clean.startsWith('92') && clean.length > 10) {
      clean = clean.substring(2);
    }
    if (clean.startsWith('0')) {
      clean = clean.substring(1);
    }
    if (clean.length > 10) {
      clean = clean.substring(0, 10);
    }
    setPhoneDigits(clean);
  };

  // Live validation checks
  const nameValidation = role === 'VENDOR' ? validateStoreName(name) : validateFullName(name);
  const emailFormatValidation = validateEmail(email);
  const phoneValidation = validatePakistaniPhone(phoneDigits);
  const passwordValidation = validatePassword(password);

  // Debounced real-time email uniqueness check
  useEffect(() => {
    setEmailDuplicateError('');
    if (!email || !emailFormatValidation.isValid) return;

    const timer = setTimeout(async () => {
      setIsCheckingEmail(true);
      const res = await checkEmailAvailability(email);
      setIsCheckingEmail(false);
      if (!res.available) {
        setEmailDuplicateError(res.error || 'This email is already registered on Bazaar.pk');
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [email, emailFormatValidation.isValid]);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Pre-validate on client
    if (!nameValidation.isValid) {
      setError(nameValidation.error || 'Please enter a valid full name (e.g. Talha Tariq, Muhammad Ali)');
      return;
    }
    if (!emailFormatValidation.isValid) {
      setError(emailFormatValidation.error || 'Please enter a valid, authentic email (e.g. infodigitalsoft@gmail.com)');
      return;
    }
    if (emailDuplicateError) {
      setError(emailDuplicateError);
      return;
    }
    if (!phoneValidation.isValid) {
      setError(phoneValidation.error || 'Please enter a valid 10-digit Pakistani WhatsApp number starting with 3');
      return;
    }
    if (!passwordValidation.isValid) {
      setError(passwordValidation.error || 'Password must be at least 6 characters');
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.set('name', name.trim());
      formData.set('email', email.trim().toLowerCase());
      formData.set('whatsapp', phoneValidation.normalized || `+92${phoneDigits}`);
      formData.set('password', password);
      formData.set('role', role);

      const res = await registerUser(formData);
      if (res.success) {
        toast(`Account created! Welcome to Bazaar.pk.`, 'success');
        if (role === 'VENDOR') {
          router.push('/vendor');
        } else {
          router.push('/');
        }
      } else {
        setError(res.error || 'Registration failed');
      }
    });
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-brand-600 text-white flex items-center justify-center mx-auto shadow-brand">
          <Store className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 font-display">
          Create Bazaar.pk Account
        </h1>
        <p className="text-xs text-slate-500">
          Join Pakistan's trusted marketplace for local shops and buyers
        </p>
      </div>

      <div className="bg-white p-6 rounded-3xl border-2 border-brand-800/20 shadow-sm space-y-5">
        {/* Role Selector Tabs */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-2xl">
          <button
            type="button"
            onClick={() => {
              setRole('CUSTOMER');
              setError('');
            }}
            className={`py-2 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 ${
              role === 'CUSTOMER'
                ? 'bg-brand-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            <User className="w-3.5 h-3.5" /> Buyer Account
          </button>
          <button
            type="button"
            onClick={() => {
              setRole('VENDOR');
              setError('');
            }}
            className={`py-2 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 ${
              role === 'VENDOR'
                ? 'bg-brand-900 text-white shadow-brand'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            <Store className="w-3.5 h-3.5 text-amber-400" /> Seller / Merchant
          </button>
        </div>

        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span>{error}</span>
              {error.includes('already registered') && (
                <div className="pt-1">
                  <Link href="/login" className="font-extrabold text-rose-900 underline block">
                    👉 Click here to Sign In with this email
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4 text-xs">
          {/* Full Name / Store Name */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-700">
                {role === 'VENDOR' ? 'Store / Merchant Name *' : 'Full Name (First & Last) *'}
              </label>
              {name.length > 0 && (
                <span className={`text-[10px] font-bold ${nameValidation.isValid ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {nameValidation.isValid ? '✓ Valid Name' : 'Needs valid name'}
                </span>
              )}
            </div>
            <div className="relative">
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={role === 'VENDOR' ? 'e.g. Lahore Tech Hub Traders' : 'e.g. Talha Tariq, Muhammad Ali'}
                className={`w-full bg-slate-50 border rounded-xl pl-9 pr-8 py-2.5 text-xs text-slate-900 focus:outline-none transition ${
                  name.length === 0
                    ? 'border-slate-200 focus:border-brand-600'
                    : nameValidation.isValid
                    ? 'border-emerald-400 bg-emerald-50/20 focus:border-emerald-600'
                    : 'border-rose-300 bg-rose-50/20 focus:border-rose-500'
                }`}
              />
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              {name.length > 0 && nameValidation.isValid && (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 absolute right-3 top-3" />
              )}
            </div>
            {name.length > 0 && !nameValidation.isValid && (
              <p className="text-[11px] text-rose-600 font-medium">{nameValidation.error}</p>
            )}
          </div>

          {/* Email Address */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-700">Email Address *</label>
              {email.length > 0 && (
                <span className={`text-[10px] font-bold ${
                  emailDuplicateError
                    ? 'text-rose-600'
                    : emailFormatValidation.isValid
                    ? 'text-emerald-600'
                    : 'text-amber-600'
                }`}>
                  {isCheckingEmail
                    ? 'Checking...'
                    : emailDuplicateError
                    ? 'Already Registered'
                    : emailFormatValidation.isValid
                    ? '✓ Valid Email'
                    : 'Needs valid email'}
                </span>
              )}
            </div>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. infodigitalsoft@gmail.com"
                className={`w-full bg-slate-50 border rounded-xl pl-9 pr-8 py-2.5 text-xs text-slate-900 focus:outline-none transition ${
                  email.length === 0
                    ? 'border-slate-200 focus:border-brand-600'
                    : emailDuplicateError
                    ? 'border-rose-400 bg-rose-50 focus:border-rose-600'
                    : emailFormatValidation.isValid
                    ? 'border-emerald-400 bg-emerald-50/20 focus:border-emerald-600'
                    : 'border-rose-300 bg-rose-50/20 focus:border-rose-500'
                }`}
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              {email.length > 0 && emailFormatValidation.isValid && !emailDuplicateError && !isCheckingEmail && (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 absolute right-3 top-3" />
              )}
              {isCheckingEmail && (
                <Loader2 className="w-4 h-4 text-brand-600 animate-spin absolute right-3 top-3" />
              )}
            </div>
            {email.length > 0 && !emailFormatValidation.isValid && (
              <p className="text-[11px] text-rose-600 font-medium">{emailFormatValidation.error}</p>
            )}
            {emailDuplicateError && (
              <div className="p-2.5 bg-amber-50 border border-amber-300 rounded-xl text-amber-900 text-[11px] space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-amber-900">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                  <span>{emailDuplicateError}</span>
                </div>
                <Link href="/login" className="font-extrabold text-brand-800 hover:underline block pl-5">
                  Sign in to this account instead &rarr;
                </Link>
              </div>
            )}
          </div>

          {/* WhatsApp Phone with Country Code +92 */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-700">WhatsApp Phone (Pakistan) *</label>
              <span className={`text-[10px] font-bold ${phoneDigits.length === 10 && phoneValidation.isValid ? 'text-emerald-600' : 'text-slate-400'}`}>
                {phoneDigits.length}/10 digits
              </span>
            </div>
            <div className="relative flex items-center">
              {/* Locked Country Code Badge */}
              <div className="flex items-center gap-1 bg-slate-100 border border-r-0 border-slate-200 rounded-l-xl px-3 py-2.5 text-xs font-bold text-slate-700 select-none">
                <span>🇵🇰</span>
                <span className="text-brand-900 font-mono">+92</span>
              </div>
              <input
                type="tel"
                required
                maxLength={10}
                value={phoneDigits}
                onChange={(e) => handlePhoneChange(e.target.value)}
                placeholder="300 1234567"
                className={`w-full bg-slate-50 border rounded-r-xl px-3 py-2.5 text-xs font-mono font-medium text-slate-900 focus:outline-none transition ${
                  phoneDigits.length === 0
                    ? 'border-slate-200 focus:border-brand-600'
                    : phoneValidation.isValid
                    ? 'border-emerald-400 bg-emerald-50/20 focus:border-emerald-600'
                    : 'border-rose-300 bg-rose-50/20 focus:border-rose-500'
                }`}
              />
              {phoneValidation.isValid && (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 absolute right-3 top-3" />
              )}
            </div>
            {phoneDigits.length > 0 && !phoneValidation.isValid ? (
              <p className="text-[11px] text-rose-600 font-medium">{phoneValidation.error}</p>
            ) : (
              <p className="text-[10px] text-slate-400">
                Enter 10 digits starting with 3 (e.g. 300 1234567, 321 9876543)
              </p>
            )}
          </div>

          {/* Password with Eye Toggle */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-700">Password *</label>
              {password.length > 0 && (
                <span className={`text-[10px] font-bold ${passwordValidation.isValid ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {passwordValidation.isValid ? '✓ Strong' : 'Min 6 chars'}
                </span>
              )}
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-10 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-brand-600"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 p-0.5 text-slate-400 hover:text-slate-700 transition focus:outline-none"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isPending || Boolean(emailDuplicateError)}
            className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-brand flex items-center justify-center gap-2 transition disabled:opacity-50"
          >
            {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>{role === 'VENDOR' ? 'Register Store Profile' : 'Create Buyer Account'}</span>
          </button>
        </form>

        <div className="pt-2 text-center text-xs text-slate-500 border-t border-slate-100">
          Already have an account?{' '}
          <Link href="/login" className="font-bold text-brand-700 hover:underline">
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
}
