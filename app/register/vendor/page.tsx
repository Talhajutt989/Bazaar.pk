'use client';

import React, { useState, useTransition, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Store,
  User,
  Mail,
  Lock,
  Phone,
  ArrowRight,
  ArrowLeft,
  Loader2,
  ShieldCheck,
  Building2,
  MapPin,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  CreditCard,
} from 'lucide-react';
import { registerUser, checkEmailAvailability } from '@/app/actions/auth';
import { submitVendorKycAction } from '@/app/actions/kyc';
import { useToast } from '@/context/ToastContext';
import {
  validateStoreName,
  validateEmail,
  validatePakistaniPhone,
  validatePassword,
  validateCnicNumber,
  validateBankDetails,
  formatCnicNumber,
  PAKISTANI_BANKS,
} from '@/lib/validation';
import { CITIES_OF_PAKISTAN } from '@/lib/utils';
import { CnicUploader } from '@/components/vendor/CnicUploader';

export default function VendorRegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  // Step Tracker (1: Store & Credentials, 2: CNIC Verification, 3: Bank Settlement)
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Step 1 Fields
  const [storeName, setStoreName] = useState('');
  const [city, setCity] = useState('Lahore');
  const [email, setEmail] = useState('');
  const [emailDuplicateError, setEmailDuplicateError] = useState('');
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [phoneDigits, setPhoneDigits] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Step 2 Fields (CNIC)
  const [cnicRaw, setCnicRaw] = useState('');
  const [cnicFrontUrl, setCnicFrontUrl] = useState('');
  const [cnicBackUrl, setCnicBackUrl] = useState('');

  // Step 3 Fields (Banking)
  const [bankName, setBankName] = useState('Meezan Bank Limited');
  const [accountTitle, setAccountTitle] = useState('');
  const [ibanNumber, setIbanNumber] = useState('');

  const [error, setError] = useState('');

  // Auto-sync account title from store name if empty
  useEffect(() => {
    if (storeName && !accountTitle) {
      setAccountTitle(storeName);
    }
  }, [storeName, accountTitle]);

  // Handle phone formatting
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

  // Handle CNIC formatting
  const handleCnicChange = (val: string) => {
    const formatted = formatCnicNumber(val);
    setCnicRaw(formatted);
  };

  // Validations
  const storeValidation = validateStoreName(storeName);
  const emailFormatValidation = validateEmail(email);
  const phoneValidation = validatePakistaniPhone(phoneDigits);
  const passwordValidation = validatePassword(password);
  const cnicValidation = validateCnicNumber(cnicRaw);
  const bankValidation = validateBankDetails(bankName, accountTitle, ibanNumber);

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

  const handleNextToCnic = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!storeValidation.isValid) {
      setError(storeValidation.error || 'Please enter a valid store/business name');
      return;
    }
    if (!emailFormatValidation.isValid) {
      setError(emailFormatValidation.error || 'Please enter a valid business email address');
      return;
    }
    if (emailDuplicateError) {
      setError(emailDuplicateError);
      return;
    }
    if (!phoneValidation.isValid) {
      setError(phoneValidation.error || 'Please enter a valid 10-digit Pakistani WhatsApp number');
      return;
    }
    if (!passwordValidation.isValid) {
      setError(passwordValidation.error || 'Password must be at least 6 characters');
      return;
    }

    setStep(2);
  };

  const handleNextToBank = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!cnicValidation.isValid) {
      setError(cnicValidation.error || 'Please enter a valid 13-digit Pakistani CNIC number');
      return;
    }
    if (!cnicFrontUrl) {
      setError('Please upload the FRONT side photo of your CNIC');
      return;
    }
    if (!cnicBackUrl) {
      setError('Please upload the BACK side photo of your CNIC');
      return;
    }

    setStep(3);
  };

  const handleCompleteRegistration = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!bankValidation.isValid) {
      setError(bankValidation.error || 'Please complete valid bank account details');
      return;
    }

    startTransition(async () => {
      // 1. Create Vendor Account in Supabase
      const formData = new FormData();
      formData.set('name', storeName.trim());
      formData.set('email', email.trim().toLowerCase());
      formData.set('whatsapp', phoneValidation.normalized || `+92${phoneDigits}`);
      formData.set('password', password);
      formData.set('role', 'VENDOR');

      const res = await registerUser(formData);
      if (!res.success) {
        setError(res.error || 'Account registration failed');
        return;
      }

      // 2. Submit KYC Document Data
      const kycData = new FormData();
      kycData.set('cnicNumber', cnicValidation.formatted || cnicRaw);
      kycData.set('cnicFrontUrl', cnicFrontUrl);
      kycData.set('cnicBackUrl', cnicBackUrl);
      kycData.set('bankName', bankName.trim());
      kycData.set('accountTitle', accountTitle.trim());
      kycData.set('ibanNumber', ibanNumber.trim().toUpperCase());

      const kycRes = await submitVendorKycAction(kycData);

      toast('🎉 KYC Submitted! Your vendor application is now under review.', 'success');
      router.push('/vendor/kyc');
    });
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 space-y-8">
      {/* Header Banner */}
      <div className="bg-brand-950 text-white p-6 sm:p-8 rounded-3xl border-2 border-brand-800 shadow-brand text-center space-y-3">
        <div className="w-14 h-14 rounded-2xl bg-accent-500 text-slate-950 flex items-center justify-center mx-auto shadow-md">
          <Store className="w-8 h-8" />
        </div>
        <span className="text-accent-400 text-xs font-bold uppercase tracking-wider block">
          Verified Merchant Onboarding
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-display">
          Sell to Millions Across Pakistan
        </h1>
        <p className="text-xs text-amber-200/80 max-w-md mx-auto">
          Complete your KYC verification in 3 simple steps. Get approved in 3 to 4 hours and start selling!
        </p>

        {/* Step Progress Bar */}
        <div className="pt-4 max-w-md mx-auto">
          <div className="grid grid-cols-3 gap-2 text-center text-[11px] font-bold">
            <div
              className={`p-2 rounded-xl border transition ${
                step >= 1
                  ? 'bg-accent-500 text-slate-950 border-accent-400 font-extrabold'
                  : 'bg-brand-900 text-amber-200/60 border-brand-800'
              }`}
            >
              1. Store Details
            </div>
            <div
              className={`p-2 rounded-xl border transition ${
                step >= 2
                  ? 'bg-accent-500 text-slate-950 border-accent-400 font-extrabold'
                  : 'bg-brand-900 text-amber-200/60 border-brand-800'
              }`}
            >
              2. CNIC Photos
            </div>
            <div
              className={`p-2 rounded-xl border transition ${
                step >= 3
                  ? 'bg-accent-500 text-slate-950 border-accent-400 font-extrabold'
                  : 'bg-brand-900 text-amber-200/60 border-brand-800'
              }`}
            >
              3. Bank Payout
            </div>
          </div>
        </div>
      </div>

      {/* Main Form Card */}
      <div className="bg-white rounded-3xl border-2 border-brand-800/20 p-6 sm:p-8 shadow-sm space-y-6">
        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span>{error}</span>
              {error.includes('already registered') && (
                <div className="pt-1">
                  <Link href="/login?role=vendor" className="font-extrabold text-rose-900 underline block">
                    👉 Click here to Log In with this email
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 1: STORE PROFILE & LOGIN CREDENTIALS */}
        {step === 1 && (
          <form onSubmit={handleNextToCnic} className="space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-brand-700" />
                <span>Step 1: Store & Owner Information</span>
              </span>
              <span className="text-[10px] text-brand-700 bg-brand-50 px-2 py-0.5 rounded-full font-bold">
                Step 1 of 3
              </span>
            </div>

            {/* Store Name */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Store / Brand Name <span className="text-rose-500 font-extrabold">*</span>
              </label>
              <div className="relative">
                <Store className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Lahore Tech Hub, Karachi Fresh Mart"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border ${
                    storeName && !storeValidation.isValid
                      ? 'border-rose-400 bg-rose-50/40'
                      : storeName && storeValidation.isValid
                      ? 'border-emerald-500 bg-emerald-50/20'
                      : 'border-slate-200 focus:border-brand-600'
                  } rounded-xl text-xs font-semibold focus:outline-none transition`}
                />
              </div>
              {storeName && !storeValidation.isValid && (
                <p className="text-[11px] text-rose-600 font-medium mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {storeValidation.error}
                </p>
              )}
            </div>

            {/* City Hub */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Store Base City <span className="text-rose-500 font-extrabold">*</span>
              </label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-brand-600 rounded-xl text-xs font-semibold focus:outline-none transition appearance-none"
                >
                  {CITIES_OF_PAKISTAN.filter((c) => c !== 'All Cities').map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Business Email */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Business Gmail / Email Address <span className="text-rose-500 font-extrabold">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="e.g. infodigitalsoft@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full pl-10 pr-10 py-2.5 bg-slate-50 border ${
                    emailDuplicateError || (email && !emailFormatValidation.isValid)
                      ? 'border-rose-400 bg-rose-50/40'
                      : email && emailFormatValidation.isValid && !isCheckingEmail
                      ? 'border-emerald-500 bg-emerald-50/20'
                      : 'border-slate-200 focus:border-brand-600'
                  } rounded-xl text-xs font-semibold focus:outline-none transition`}
                />
                {isCheckingEmail && (
                  <Loader2 className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-600 animate-spin" />
                )}
              </div>
              {emailDuplicateError && (
                <p className="text-[11px] text-rose-600 font-bold mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  {emailDuplicateError}
                </p>
              )}
            </div>

            {/* WhatsApp (11 Digits starting with 03) */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-bold text-slate-700">
                  WhatsApp Mobile Number (Pakistan) <span className="text-rose-500 font-extrabold">*</span>
                </label>
                <span className={`text-[10px] font-bold ${phoneDigits.length === 10 && phoneValidation.isValid ? 'text-emerald-600' : 'text-slate-400'}`}>
                  {phoneDigits.length}/10 digits
                </span>
              </div>
              <div className="flex items-center">
                {/* Locked Country Code Badge */}
                <div className="flex items-center gap-1 bg-slate-100 border border-r-0 border-slate-200 rounded-l-xl px-3 py-2.5 text-xs font-bold text-slate-700 select-none shrink-0">
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-brand-900 font-mono">+92</span>
                </div>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  placeholder="3001234567"
                  value={phoneDigits}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-r-xl text-xs font-mono font-bold tracking-wider text-slate-900 focus:outline-none transition ${
                    phoneDigits.length === 0
                      ? 'border-slate-200 focus:border-brand-600'
                      : phoneValidation.isValid
                      ? 'border-emerald-500 bg-emerald-50/20 focus:border-emerald-600'
                      : 'border-rose-400 bg-rose-50/40 focus:border-rose-600'
                  }`}
                />
              </div>
              {phoneDigits && !phoneValidation.isValid && (
                <p className="text-[11px] text-rose-600 font-medium mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {phoneValidation.error}
                </p>
              )}
            </div>

            {/* Password with Eye Toggle */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Create Account Password <span className="text-rose-500 font-extrabold">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 focus:border-brand-600 rounded-xl text-xs font-semibold focus:outline-none transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-4 py-3 bg-brand-600 hover:bg-brand-700 text-slate-950 font-extrabold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2"
            >
              <span>Next: CNIC Verification (Step 2)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* STEP 2: CNIC VERIFICATION & SMART PHOTO UPLOAD */}
        {step === 2 && (
          <form onSubmit={handleNextToBank} className="space-y-5 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-brand-700" />
                <span>Step 2: Government CNIC Verification</span>
              </span>
              <span className="text-[10px] text-brand-700 bg-brand-50 px-2 py-0.5 rounded-full font-bold">
                Step 2 of 3
              </span>
            </div>

            {/* CNIC Number */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Government CNIC Number (13 Digits) <span className="text-rose-500 font-extrabold">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="35201-1234567-1"
                  value={cnicRaw}
                  onChange={(e) => handleCnicChange(e.target.value)}
                  className={`w-full px-4 py-2.5 bg-slate-50 border ${
                    cnicRaw && !cnicValidation.isValid
                      ? 'border-rose-400 bg-rose-50/40'
                      : cnicRaw && cnicValidation.isValid
                      ? 'border-emerald-500 bg-emerald-50/20'
                      : 'border-slate-200 focus:border-brand-600'
                  } rounded-xl text-xs font-mono font-bold tracking-wider focus:outline-none transition`}
                />
              </div>
              {cnicRaw && !cnicValidation.isValid && (
                <p className="text-[11px] text-rose-600 font-medium mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {cnicValidation.error}
                </p>
              )}
            </div>

            {/* Smart CNIC Photos Uploader */}
            <CnicUploader
              cnicFrontUrl={cnicFrontUrl}
              cnicBackUrl={cnicBackUrl}
              onFrontChange={setCnicFrontUrl}
              onBackChange={setCnicBackUrl}
            />

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition flex items-center gap-1"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <button
                type="submit"
                disabled={!cnicFrontUrl || !cnicBackUrl || !cnicValidation.isValid}
                className="flex-1 py-3 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-slate-950 font-extrabold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2"
              >
                <span>Next: Bank Account Settlement (Step 3)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: BANK ACCOUNT SETTLEMENT */}
        {step === 3 && (
          <form onSubmit={handleCompleteRegistration} className="space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-brand-700" />
                <span>Step 3: Bank Settlement Details</span>
              </span>
              <span className="text-[10px] text-brand-700 bg-brand-50 px-2 py-0.5 rounded-full font-bold">
                Step 3 of 3
              </span>
            </div>

            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-[11px] flex items-start gap-2">
              <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong>24-Hour Payouts:</strong> Customer payments will be released directly to this Pakistani bank account after order delivery verification.
              </div>
            </div>

            {/* Bank Name */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Settlement Bank / Wallet Name <span className="text-rose-500 font-extrabold">*</span>
              </label>
              <div className="relative">
                <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <select
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-brand-600 rounded-xl text-xs font-semibold focus:outline-none transition appearance-none"
                >
                  {PAKISTANI_BANKS.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Account Title */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Account Title (Beneficiary Name) <span className="text-rose-500 font-extrabold">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Lahore Tech Hub or Muhammad Tariq"
                  value={accountTitle}
                  onChange={(e) => setAccountTitle(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-brand-600 rounded-xl text-xs font-semibold focus:outline-none transition"
                />
              </div>
            </div>

            {/* IBAN / Account Number */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Pakistani IBAN or Account Number <span className="text-rose-500 font-extrabold">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="PK42MEZN0001234567890101 or 0012345678901"
                  value={ibanNumber}
                  onChange={(e) => setIbanNumber(e.target.value)}
                  className={`w-full px-4 py-2.5 bg-slate-50 border ${
                    ibanNumber && !bankValidation.isValid
                      ? 'border-rose-400 bg-rose-50/40'
                      : ibanNumber && bankValidation.isValid
                      ? 'border-emerald-500 bg-emerald-50/20'
                      : 'border-slate-200 focus:border-brand-600'
                  } rounded-xl text-xs font-mono font-bold tracking-wider focus:outline-none transition uppercase`}
                />
              </div>
              {ibanNumber && !bankValidation.isValid && (
                <p className="text-[11px] text-rose-600 font-medium mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {bankValidation.error}
                </p>
              )}
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                disabled={isPending}
                className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition flex items-center gap-1"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <button
                type="submit"
                disabled={isPending || !bankValidation.isValid}
                className="flex-1 py-3 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-slate-950 font-extrabold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Submitting KYC Verification...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Complete KYC & Submit for Review</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Footer */}
        <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
          Already have a merchant account?{' '}
          <Link href="/login?role=vendor" className="font-extrabold text-brand-900 underline">
            Sign In Here
          </Link>
        </div>
      </div>
    </div>
  );
}
