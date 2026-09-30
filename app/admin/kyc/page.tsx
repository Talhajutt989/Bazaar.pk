import React from 'react';
import { getAllKycRecords } from '@/lib/kyc';
import { KycVerificationQueue } from '@/components/admin/KycVerificationQueue';
import { ShieldCheck, Clock } from 'lucide-react';

export default async function AdminKycPage() {
  const records = await getAllKycRecords();

  const formattedRecords = records.map((record) => ({
    id: record.id,
    storeId: record.storeId,
    cnicNumber: record.cnicNumber,
    cnicFrontUrl: record.cnicFrontUrl,
    cnicBackUrl: record.cnicBackUrl,
    bankName: record.bankName,
    ibanNumber: record.ibanNumber,
    accountTitle: record.accountTitle,
    status: record.status,
    rejectionReason: record.rejectionReason,
    submittedAt: record.submittedAt,
    reviewedAt: record.reviewedAt,
    store: {
      brandName: record.storeName,
      city: record.city,
      brandAddress: `${record.city}, Pakistan`,
      user: {
        name: record.ownerName,
        email: record.email,
        whatsapp: record.whatsapp,
      },
    },
  }));

  const pendingCount = formattedRecords.filter((r) => r.status === 'UNDER_REVIEW').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b-2 border-brand-800/20">
        <div>
          <span className="text-xs font-bold text-brand-700 uppercase tracking-wider flex items-center gap-1">
            <ShieldCheck className="w-4 h-4" /> Compliance & Verification Engine
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 font-display">
            Merchant CNIC & Bank Approval Queue
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Inspect submitted Pakistani NADRA CNIC documents (Front & Back) and settlement bank accounts.
          </p>
        </div>

        {pendingCount > 0 && (
          <div className="flex items-center gap-2 bg-amber-100 text-amber-950 px-3.5 py-1.5 rounded-full border border-amber-300 text-xs font-bold shadow-sm">
            <Clock className="w-4 h-4 text-amber-700 animate-pulse" />
            <span>{pendingCount} Merchant {pendingCount === 1 ? 'Application' : 'Applications'} Pending Review</span>
          </div>
        )}
      </div>

      <KycVerificationQueue kycRecords={formattedRecords as any} />
    </div>
  );
}
