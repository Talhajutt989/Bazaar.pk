'use client';

import React, { useState, useTransition } from 'react';
import Image from 'next/image';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Eye,
  Building2,
  User,
  X,
  Loader2,
  FileText,
} from 'lucide-react';
import { approveVendorKyc, rejectVendorKyc } from '@/app/actions/admin';
import { formatDate, getKycStatusBadge } from '@/lib/utils';
import { useToast } from '@/context/ToastContext';

export interface AdminKycItem {
  id: string;
  storeId: string;
  cnicNumber: string;
  cnicFrontUrl: string;
  cnicBackUrl: string;
  bankName: string;
  ibanNumber: string;
  accountTitle: string;
  status: string;
  rejectionReason: string | null;
  submittedAt: Date | string;
  reviewedAt: Date | string | null;
  store: {
    brandName: string;
    city: string;
    brandAddress: string;
    user: {
      name: string | null;
      email: string;
      whatsapp: string | null;
    };
  };
}

interface KycVerificationQueueProps {
  kycRecords: AdminKycItem[];
}

export function KycVerificationQueue({ kycRecords }: KycVerificationQueueProps) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  // Document Inspection Modal
  const [selectedKyc, setSelectedKyc] = useState<AdminKycItem | null>(null);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [targetRejectKycId, setTargetRejectKycId] = useState<string | null>(null);

  const handleApprove = (kycId: string, storeName: string) => {
    startTransition(async () => {
      const res = await approveVendorKyc(kycId);
      if (res.success) {
        toast(`KYC Approved! ${storeName} is now active on marketplace.`, 'success');
        if (selectedKyc?.id === kycId) setSelectedKyc(null);
      } else {
        toast(res.error || 'Failed to approve KYC', 'error');
      }
    });
  };

  const handleOpenRejectModal = (kycId: string) => {
    setTargetRejectKycId(kycId);
    setRejectionReason('CNIC image blurry / IBAN title does not match store identity');
    setIsRejectModalOpen(true);
  };

  const handleRejectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetRejectKycId) return;

    startTransition(async () => {
      const res = await rejectVendorKyc(targetRejectKycId, rejectionReason);
      if (res.success) {
        toast('KYC Rejected with feedback provided to vendor.', 'info');
        setIsRejectModalOpen(false);
        setTargetRejectKycId(null);
        if (selectedKyc?.id === targetRejectKycId) setSelectedKyc(null);
      } else {
        toast(res.error || 'Failed to reject KYC', 'error');
      }
    });
  };

  return (
    <div className="space-y-6">
      {kycRecords.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border-2 border-brand-800/20 text-center shadow-sm">
          <CheckCircle2 className="w-12 h-12 text-brand-600 mx-auto mb-2" />
          <h3 className="text-base font-bold text-slate-800">KYC Verification Queue is Clear</h3>
          <p className="text-xs text-slate-500">All submitted merchant credentials have been verified.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {kycRecords.map((kyc) => {
            const badge = getKycStatusBadge(kyc.status);

            return (
              <div
                key={kyc.id}
                className="bg-white rounded-2xl border-2 border-brand-800/20 p-5 shadow-sm space-y-4 hover:border-brand-600 transition"
              >
                {/* Header */}
                <div className="flex items-start justify-between pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{kyc.store.brandName}</h3>
                    <p className="text-xs text-slate-500">
                      📍 {kyc.store.city} • Owner: {kyc.store.user.name || kyc.store.user.email}
                    </p>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] border ${badge.bg}`}>
                    {badge.label}
                  </span>
                </div>

                {/* Info preview */}
                <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div>
                    <span className="text-slate-500 block">CNIC Number:</span>
                    <span className="font-mono font-bold text-slate-900">{kyc.cnicNumber}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Bank & Title:</span>
                    <span className="font-bold text-slate-900 block truncate">{kyc.bankName}</span>
                    <span className="text-[11px] text-slate-600">{kyc.accountTitle}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-500 block">IBAN Number:</span>
                    <span className="font-mono font-bold text-brand-900 text-[11px] bg-white px-2 py-1 rounded border border-slate-200 block">
                      {kyc.ibanNumber}
                    </span>
                  </div>
                </div>

                {/* Document Thumbnails */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-700 block">Attached CNIC Documents:</span>
                  <div className="grid grid-cols-2 gap-2">
                    <div
                      onClick={() => setSelectedKyc(kyc)}
                      className="relative aspect-video rounded-lg overflow-hidden border border-slate-200 bg-slate-100 cursor-pointer group"
                    >
                      <Image
                        src={kyc.cnicFrontUrl}
                        alt="CNIC Front"
                        fill
                        sizes="160px"
                        className="object-cover group-hover:scale-105 transition"
                      />
                      <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[10px] font-bold transition">
                        <Eye className="w-4 h-4 mr-1" /> Inspect
                      </div>
                    </div>

                    <div
                      onClick={() => setSelectedKyc(kyc)}
                      className="relative aspect-video rounded-lg overflow-hidden border border-slate-200 bg-slate-100 cursor-pointer group"
                    >
                      <Image
                        src={kyc.cnicBackUrl}
                        alt="CNIC Back"
                        fill
                        sizes="160px"
                        className="object-cover group-hover:scale-105 transition"
                      />
                      <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[10px] font-bold transition">
                        <Eye className="w-4 h-4 mr-1" /> Inspect
                      </div>
                    </div>
                  </div>
                </div>

                {/* 1-Click Action Buttons */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedKyc(kyc)}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" /> Inspect Full Record
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenRejectModal(kyc.id)}
                      disabled={isPending}
                      className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold border border-rose-200 transition flex items-center gap-1"
                    >
                      <XCircle className="w-3.5 h-3.5" /> Reject
                    </button>

                    <button
                      type="button"
                      onClick={() => handleApprove(kyc.id, kyc.store.brandName)}
                      disabled={isPending}
                      className="px-3.5 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-brand transition flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> 1-Click Approve
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Full Document & Record Modal */}
      {selectedKyc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm">
          <div className="bg-white rounded-3xl border-2 border-brand-800 max-w-2xl w-full p-6 space-y-5 shadow-2xl animate-slide-up max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-brand-700" />
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">
                    KYC Verification Inspector
                  </h3>
                  <p className="text-xs text-slate-500">{selectedKyc.store.brandName}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedKyc(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* High Res CNIC Previews */}
            <div className="space-y-4">
              <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                1. Government CNIC Documents (Front & Back)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-slate-700">CNIC Front:</span>
                  <div className="relative aspect-video rounded-xl overflow-hidden border-2 border-slate-300 shadow-sm bg-slate-100">
                    <Image
                      src={selectedKyc.cnicFrontUrl}
                      alt="CNIC Front High-Res"
                      fill
                      sizes="400px"
                      className="object-cover"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-bold text-slate-700">CNIC Back:</span>
                  <div className="relative aspect-video rounded-xl overflow-hidden border-2 border-slate-300 shadow-sm bg-slate-100">
                    <Image
                      src={selectedKyc.cnicBackUrl}
                      alt="CNIC Back High-Res"
                      fill
                      sizes="400px"
                      className="object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Banking and Business Details */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 text-xs">
              <h4 className="font-extrabold text-slate-900">2. Business Bank & Settlement Details</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-slate-500 block">Bank Name:</span>
                  <span className="font-bold text-slate-900">{selectedKyc.bankName}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Account Title:</span>
                  <span className="font-bold text-slate-900">{selectedKyc.accountTitle}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-500 block">IBAN Number:</span>
                  <span className="font-mono font-bold text-brand-900 text-sm bg-white p-2 rounded-lg border border-slate-200 block">
                    {selectedKyc.ibanNumber}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedKyc(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50"
              >
                Close Inspector
              </button>

              <button
                type="button"
                onClick={() => handleOpenRejectModal(selectedKyc.id)}
                disabled={isPending}
                className="px-4 py-2.5 rounded-xl bg-rose-100 text-rose-800 font-bold text-xs hover:bg-rose-200"
              >
                Reject Documents
              </button>

              <button
                type="button"
                onClick={() => handleApprove(selectedKyc.id, selectedKyc.store.brandName)}
                disabled={isPending}
                className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-brand flex items-center gap-1.5"
              >
                {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>Approve & Activate Store</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Reason Modal */}
      {isRejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl border-2 border-rose-900 max-w-md w-full p-6 space-y-4 shadow-2xl animate-slide-up">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2 text-rose-700">
                <AlertCircle className="w-5 h-5" />
                <h3 className="font-extrabold text-base text-slate-900">Provide Rejection Reason</h3>
              </div>
              <button
                onClick={() => setIsRejectModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRejectSubmit} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Rejection Feedback for Vendor *</label>
                <textarea
                  required
                  rows={4}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Explain why documents were rejected so the seller can correct and re-upload..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsRejectModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-sm flex items-center gap-1.5"
                >
                  {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Confirm KYC Rejection</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
