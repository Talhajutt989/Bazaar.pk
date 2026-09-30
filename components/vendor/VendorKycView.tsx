'use client';

import React, { useState, useTransition } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Building2,
  CreditCard,
  User,
  Clock,
  RefreshCw,
  ArrowRight,
  Sparkles,
  FileText,
  Loader2,
  Store,
  Phone,
  Mail,
  MapPin,
} from 'lucide-react';
import { submitVendorKycAction } from '@/app/actions/kyc';
import { useToast } from '@/context/ToastContext';
import { formatDate, getKycStatusBadge } from '@/lib/utils';
import {
  validateCnicNumber,
  validateBankDetails,
  formatCnicNumber,
  PAKISTANI_BANKS,
} from '@/lib/validation';
import { CnicUploader } from '@/components/vendor/CnicUploader';
import { KycRecord } from '@/lib/kyc';

interface VendorKycViewProps {
  kyc: KycRecord | null;
  storeName: string;
}

export function VendorKycView({ kyc: initialKyc, storeName }: VendorKycViewProps) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [kyc, setKyc] = useState<KycRecord | null>(initialKyc);

  // Re-submission / initial form state
  const [isEditing, setIsEditing] = useState(!initialKyc || initialKyc.status === 'REJECTED');
  const [cnicRaw, setCnicRaw] = useState(initialKyc?.cnicNumber || '');
  const [cnicFrontUrl, setCnicFrontUrl] = useState(initialKyc?.cnicFrontUrl || '');
  const [cnicBackUrl, setCnicBackUrl] = useState(initialKyc?.cnicBackUrl || '');
  const [bankName, setBankName] = useState(initialKyc?.bankName || 'Meezan Bank Limited');
  const [accountTitle, setAccountTitle] = useState(initialKyc?.accountTitle || storeName);
  const [ibanNumber, setIbanNumber] = useState(initialKyc?.ibanNumber || '');
  const [error, setError] = useState('');

  const cnicVal = validateCnicNumber(cnicRaw);
  const bankVal = validateBankDetails(bankName, accountTitle, ibanNumber);

  const handleCnicChange = (val: string) => {
    setCnicRaw(formatCnicNumber(val));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!cnicVal.isValid) {
      setError(cnicVal.error || 'Please enter a valid 13-digit Pakistani CNIC number');
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
    if (!bankVal.isValid) {
      setError(bankVal.error || 'Please complete valid bank details');
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.set('cnicNumber', cnicVal.formatted || cnicRaw);
      formData.set('cnicFrontUrl', cnicFrontUrl);
      formData.set('cnicBackUrl', cnicBackUrl);
      formData.set('bankName', bankName.trim());
      formData.set('accountTitle', accountTitle.trim());
      formData.set('ibanNumber', ibanNumber.trim().toUpperCase());

      const res = await submitVendorKycAction(formData);
      if (res.success && res.kyc) {
        setKyc(res.kyc);
        setIsEditing(false);
        toast('🎉 KYC Submitted! Verification takes approximately 3 to 4 hours.', 'success');
      } else {
        setError(res.error || 'Failed to submit KYC');
      }
    });
  };

  const badge = getKycStatusBadge(kyc?.status || 'PENDING');

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-brand-950 text-white p-6 sm:p-8 rounded-3xl border-2 border-brand-800 shadow-brand flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-accent-400 text-xs font-bold uppercase tracking-wider block">
            Vendor Compliance & Trust
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display">
            KYC & Bank Verification
          </h1>
          <p className="text-xs text-amber-200/80 mt-1">
            Official NADRA CNIC and Pakistani Settlement Bank Verification
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className={`px-3.5 py-1.5 rounded-full text-xs font-bold border shadow-sm ${badge.bg}`}>
            {badge.label}
          </span>
        </div>
      </div>

      {/* STATE 1: KYC IS UNDER REVIEW (3 to 4 Hours Notice) */}
      {kyc && kyc.status === 'UNDER_REVIEW' && !isEditing && (
        <div className="bg-white rounded-3xl border-2 border-brand-800/20 p-6 sm:p-8 shadow-sm space-y-6">
          {/* Main Notice Banner */}
          <div className="p-5 bg-gradient-to-r from-amber-50 to-amber-100/60 border-2 border-amber-400/60 rounded-2xl flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 shadow-md">
              <Clock className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-amber-950">
                ⏳ KYC Submitted & Store Under Review
              </h3>
              <p className="text-xs text-amber-900 font-medium leading-relaxed">
                Aap ki KYC verification darj ho chuki hai. Hamari compliance team aap ke CNIC aur Bank
                details ki tasdeeq kar rahi hai.{' '}
                <strong className="text-amber-950 font-extrabold">
                  Store approve honay mein 3 se 4 ghantay (3 to 4 hours) lagen gy.
                </strong>
              </p>
            </div>
          </div>

          {/* Verification Progress Timeline */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <span className="text-xs font-bold text-slate-700 block">Verification Status Pipeline:</span>
            <div className="grid grid-cols-3 gap-2 text-center text-[11px] font-bold">
              <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-200 flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>1. Form & CNIC Submitted</span>
              </div>
              <div className="p-2.5 rounded-xl bg-amber-100 text-amber-950 border border-amber-300 flex items-center justify-center gap-1.5 animate-pulse">
                <Clock className="w-4 h-4 text-amber-700" />
                <span>2. Admin Review (3-4 Hours)</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-100 text-slate-400 border border-slate-200 flex items-center justify-center gap-1.5">
                <Store className="w-4 h-4" />
                <span>3. Live Sales Activated</span>
              </div>
            </div>
          </div>

          {/* Submitted Data Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Identity Card Details */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 text-xs">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-200 font-bold text-slate-900">
                <User className="w-4 h-4 text-brand-700" />
                <span>Verified Identity (CNIC)</span>
              </div>

              <div className="space-y-2">
                <div>
                  <span className="text-slate-500 block">CNIC Number:</span>
                  <span className="font-mono font-extrabold text-brand-900 text-sm">{kyc.cnicNumber}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Submitted On:</span>
                  <span className="font-semibold text-slate-800">{formatDate(kyc.submittedAt)}</span>
                </div>
              </div>

              {/* Photos */}
              <div className="space-y-2 pt-2">
                <span className="font-bold text-slate-700 block">Submitted CNIC Photos:</span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[10px] text-slate-400 block mb-1">Front Side:</span>
                    <div className="relative aspect-[1.58/1] rounded-xl overflow-hidden border border-slate-300 bg-slate-900">
                      <Image
                        src={kyc.cnicFrontUrl}
                        alt="CNIC Front"
                        fill
                        sizes="200px"
                        className="object-cover"
                      />
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block mb-1">Back Side:</span>
                    <div className="relative aspect-[1.58/1] rounded-xl overflow-hidden border border-slate-300 bg-slate-900">
                      <Image
                        src={kyc.cnicBackUrl}
                        alt="CNIC Back"
                        fill
                        sizes="200px"
                        className="object-cover"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bank Details */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 text-xs">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-200 font-bold text-slate-900">
                <Building2 className="w-4 h-4 text-brand-700" />
                <span>Settlement Bank Account</span>
              </div>

              <div className="space-y-3">
                <div>
                  <span className="text-slate-500 block">Bank Name:</span>
                  <span className="font-bold text-slate-900">{kyc.bankName}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Account Title:</span>
                  <span className="font-bold text-slate-900">{kyc.accountTitle}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">IBAN / Account Number:</span>
                  <span className="font-mono font-bold text-brand-900 bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 block text-xs tracking-wider">
                    {kyc.ibanNumber}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="text-xs font-bold text-slate-600 hover:text-slate-900 underline"
            >
              Need to correct details? Click to edit submission
            </button>

            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-slate-950 font-extrabold text-xs rounded-xl shadow-sm transition flex items-center gap-1.5 self-start sm:self-auto"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh Status</span>
            </button>
          </div>
        </div>
      )}

      {/* STATE 2: KYC APPROVED */}
      {kyc && kyc.status === 'APPROVED' && !isEditing && (
        <div className="bg-white rounded-3xl border-2 border-emerald-500/40 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="p-5 bg-emerald-50 border-2 border-emerald-400 rounded-2xl flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-emerald-950">
                🎉 KYC Verified & Store Activated!
              </h3>
              <p className="text-xs text-emerald-800 mt-0.5">
                Aap ka merchant account Super Admin ki janib se tasdeeq shuda hai. Aap ab marketplace par
                products upload kar saktay hain aur customer orders receive kar saktay hain.
              </p>
            </div>
          </div>

          {/* Verified Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div>
              <span className="text-slate-500 block">Verified CNIC:</span>
              <span className="font-mono font-bold text-slate-900">{kyc.cnicNumber}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Settlement Bank:</span>
              <span className="font-bold text-slate-900">{kyc.bankName}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Account Title:</span>
              <span className="font-bold text-slate-900">{kyc.accountTitle}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Settlement IBAN:</span>
              <span className="font-mono font-bold text-brand-900">{kyc.ibanNumber}</span>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <Link
              href="/vendor"
              className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-slate-950 font-extrabold text-xs rounded-xl shadow-md transition flex items-center gap-2"
            >
              <span>Go to Vendor Dashboard & Add Products</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}

      {/* STATE 3: KYC REJECTED OR EDITING / INITIAL SUBMISSION */}
      {(!kyc || isEditing || kyc.status === 'REJECTED') && (
        <div className="bg-white rounded-3xl border-2 border-brand-800/20 p-6 sm:p-8 shadow-sm space-y-6">
          {kyc && kyc.status === 'REJECTED' && (
            <div className="p-4 bg-rose-50 border-2 border-rose-300 rounded-2xl flex items-start gap-3 text-rose-900 text-xs">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <strong>KYC Application Rejected by Admin:</strong>
                <p>{kyc.rejectionReason || 'Please upload clear photos of your CNIC and re-verify your bank account.'}</p>
                <p className="text-slate-600 pt-1">
                  Neechay diye gaye form mein sahi details aur wazeh photos upload kar ke dobara submit karein.
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-brand-700" />
                <span>Submit CNIC & Bank Verification Details</span>
              </span>
            </div>

            {/* CNIC Number */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Government CNIC Number (13 Digits) <span className="text-rose-500 font-extrabold">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="35201-1234567-1"
                value={cnicRaw}
                onChange={(e) => handleCnicChange(e.target.value)}
                className={`w-full px-4 py-2.5 bg-slate-50 border ${
                  cnicRaw && !cnicVal.isValid
                    ? 'border-rose-400 bg-rose-50/40'
                    : cnicRaw && cnicVal.isValid
                    ? 'border-emerald-500 bg-emerald-50/20'
                    : 'border-slate-200 focus:border-brand-600'
                } rounded-xl text-xs font-mono font-bold tracking-wider focus:outline-none transition`}
              />
              {cnicRaw && !cnicVal.isValid && (
                <p className="text-[11px] text-rose-600 font-medium mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {cnicVal.error}
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

            {/* Bank Details */}
            <div className="pt-4 border-t border-slate-100 space-y-4">
              <div className="flex items-center gap-2 font-bold text-slate-900 text-xs">
                <Building2 className="w-4 h-4 text-brand-700" />
                <span>Settlement Bank Account Details</span>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Bank / Wallet Name <span className="text-rose-500 font-extrabold">*</span>
                </label>
                <select
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-brand-600 rounded-xl text-xs font-semibold focus:outline-none transition appearance-none"
                >
                  {PAKISTANI_BANKS.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Account Title (Beneficiary Name) <span className="text-rose-500 font-extrabold">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lahore Tech Hub"
                  value={accountTitle}
                  onChange={(e) => setAccountTitle(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-brand-600 rounded-xl text-xs font-semibold focus:outline-none transition"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Pakistani IBAN or Account Number <span className="text-rose-500 font-extrabold">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="PK42MEZN0001234567890101"
                  value={ibanNumber}
                  onChange={(e) => setIbanNumber(e.target.value)}
                  className={`w-full px-4 py-2.5 bg-slate-50 border ${
                    ibanNumber && !bankVal.isValid
                      ? 'border-rose-400 bg-rose-50/40'
                      : ibanNumber && bankVal.isValid
                      ? 'border-emerald-500 bg-emerald-50/20'
                      : 'border-slate-200 focus:border-brand-600'
                  } rounded-xl text-xs font-mono font-bold tracking-wider focus:outline-none transition uppercase`}
                />
                {ibanNumber && !bankVal.isValid && (
                  <p className="text-[11px] text-rose-600 font-medium mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {bankVal.error}
                  </p>
                )}
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between gap-3">
              {kyc && (
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition"
                >
                  Cancel
                </button>
              )}

              <button
                type="submit"
                disabled={isPending || !cnicFrontUrl || !cnicBackUrl || !cnicVal.isValid || !bankVal.isValid}
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
                    <span>Submit KYC for Verification (3 to 4 Hours Approval)</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
