import fs from 'fs';
import path from 'path';
import { supabaseAdmin } from '@/lib/supabase';

export interface KycRecord {
  id: string;
  storeId: string;
  storeName: string;
  ownerName: string;
  email: string;
  whatsapp: string;
  city: string;
  cnicNumber: string;
  cnicFrontUrl: string;
  cnicBackUrl: string;
  bankName: string;
  accountTitle: string;
  ibanNumber: string;
  status: 'PENDING_KYC' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED';
  rejectionReason: string | null;
  submittedAt: string;
  reviewedAt: string | null;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const KYC_FILE = path.join(DATA_DIR, 'vendor-kyc.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

let inMemoryKycRecords: KycRecord[] | null = null;
let lastKycSyncTime = 0;

function readKycRecords(): KycRecord[] {
  if (inMemoryKycRecords) {
    return inMemoryKycRecords;
  }
  try {
    ensureDataDir();
    if (!fs.existsSync(KYC_FILE)) {
      // Initialize with default demo store KYCs so demo stores are pre-verified
      const defaultRecords: KycRecord[] = [
        {
          id: 'kyc_store_lahore_mart',
          storeId: 'store_lahore_mart',
          storeName: 'Lahore Heritage Bazar',
          ownerName: 'Hamza Malik',
          email: 'vendor@marketplace.pk',
          whatsapp: '+923001234567',
          city: 'Lahore',
          cnicNumber: '35202-1234567-1',
          cnicFrontUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&q=80',
          cnicBackUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&q=80',
          bankName: 'Meezan Bank Limited',
          accountTitle: 'Lahore Heritage Bazar',
          ibanNumber: 'PK42MEZN0001234567890101',
          status: 'APPROVED',
          rejectionReason: null,
          submittedAt: '2026-09-18T10:00:00.000Z',
          reviewedAt: '2026-09-18T12:30:00.000Z',
        },
        {
          id: 'kyc_store_karachi_dryfruits',
          storeId: 'store_karachi_dryfruits',
          storeName: 'Karachi Royal Traders',
          ownerName: 'Bilal Farooq',
          email: 'bilal.farooq@gmail.com',
          whatsapp: '+923219876543',
          city: 'Karachi',
          cnicNumber: '42101-7654321-2',
          cnicFrontUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&q=80',
          cnicBackUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&q=80',
          bankName: 'Habib Bank Limited (HBL)',
          accountTitle: 'Karachi Royal Traders',
          ibanNumber: 'PK12HABB0009876543210102',
          status: 'APPROVED',
          rejectionReason: null,
          submittedAt: '2026-09-18T11:00:00.000Z',
          reviewedAt: '2026-09-18T13:45:00.000Z',
        },
      ];
      fs.writeFileSync(KYC_FILE, JSON.stringify(defaultRecords, null, 2), 'utf-8');
      inMemoryKycRecords = defaultRecords;
      return defaultRecords;
    }
    const content = fs.readFileSync(KYC_FILE, 'utf-8');
    const records: KycRecord[] = JSON.parse(content) || [];
    inMemoryKycRecords = records;
    return records;
  } catch (err) {
    console.error('Error reading KYC records:', err);
    return [];
  }
}

function writeKycRecords(records: KycRecord[]) {
  try {
    ensureDataDir();
    inMemoryKycRecords = records;
    fs.writeFileSync(KYC_FILE, JSON.stringify(records, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing KYC records:', err);
  }
}

export async function getStoreKyc(storeId: string): Promise<KycRecord | null> {
  const records = readKycRecords();
  const record = records.find((r) => r.storeId === storeId);
  return record || null;
}

export async function getAllKycRecords(): Promise<KycRecord[]> {
  const records = readKycRecords();
  const now = Date.now();

  // Throttled sync with Supabase (at most once every 30 seconds to prevent lag on every tab click)
  if (now - lastKycSyncTime > 30000) {
    lastKycSyncTime = now;
    try {
      const { data: stores } = await supabaseAdmin
        .from('stores')
        .select('*, users(name, email, whatsapp)');

      if (stores && Array.isArray(stores)) {
        let changed = false;
        for (const store of stores) {
          let existing = records.find((r) => r.storeId === store.id);
          if (!existing) {
            existing = {
              id: `kyc_${store.id}`,
              storeId: store.id,
              storeName: store.brand_name,
              ownerName: store.users?.name || 'Store Owner',
              email: store.users?.email || 'vendor@bazaar.pk',
              whatsapp: store.users?.whatsapp || '+923001234567',
              city: store.city || 'Pakistan',
              cnicNumber: '35201-1234567-1',
              cnicFrontUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&q=80',
              cnicBackUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&q=80',
              bankName: 'Meezan Bank Limited',
              accountTitle: store.brand_name,
              ibanNumber: 'PK42MEZN0001234567890101',
              status: store.status === 'ACTIVE' ? 'APPROVED' : 'UNDER_REVIEW',
              rejectionReason: null,
              submittedAt: store.created_at || new Date().toISOString(),
              reviewedAt: store.status === 'ACTIVE' ? store.created_at : null,
            };
            records.push(existing);
            changed = true;
          } else {
            // Keep store status in sync
            if (store.status === 'ACTIVE' && existing.status !== 'APPROVED') {
              existing.status = 'APPROVED';
              changed = true;
            }
          }
        }
        if (changed) {
          writeKycRecords(records);
        }
      }
    } catch (err) {
      console.error('Error syncing KYC with Supabase stores:', err);
    }
  }

  // Sort: UNDER_REVIEW / PENDING first, then recent
  return [...records].sort((a, b) => {
    if (a.status === 'UNDER_REVIEW' && b.status !== 'UNDER_REVIEW') return -1;
    if (b.status === 'UNDER_REVIEW' && a.status !== 'UNDER_REVIEW') return 1;
    return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
  });
}

export async function saveOrSubmitVendorKyc(data: {
  storeId: string;
  storeName?: string;
  ownerName?: string;
  email?: string;
  whatsapp?: string;
  city?: string;
  cnicNumber: string;
  cnicFrontUrl: string;
  cnicBackUrl: string;
  bankName: string;
  accountTitle: string;
  ibanNumber: string;
}): Promise<{ success: boolean; kyc?: KycRecord; error?: string }> {
  try {
    const records = readKycRecords();
    let existingIndex = records.findIndex((r) => r.storeId === data.storeId);

    const kycRecord: KycRecord = {
      id: existingIndex >= 0 ? records[existingIndex].id : `kyc_${data.storeId}_${Date.now()}`,
      storeId: data.storeId,
      storeName: data.storeName || (existingIndex >= 0 ? records[existingIndex].storeName : 'Vendor Store'),
      ownerName: data.ownerName || (existingIndex >= 0 ? records[existingIndex].ownerName : 'Store Owner'),
      email: data.email || (existingIndex >= 0 ? records[existingIndex].email : ''),
      whatsapp: data.whatsapp || (existingIndex >= 0 ? records[existingIndex].whatsapp : ''),
      city: data.city || (existingIndex >= 0 ? records[existingIndex].city : 'Pakistan'),
      cnicNumber: data.cnicNumber,
      cnicFrontUrl: data.cnicFrontUrl,
      cnicBackUrl: data.cnicBackUrl,
      bankName: data.bankName,
      accountTitle: data.accountTitle,
      ibanNumber: data.ibanNumber,
      status: 'UNDER_REVIEW', // Automatically enters review queue
      rejectionReason: null,
      submittedAt: new Date().toISOString(),
      reviewedAt: null,
    };

    if (existingIndex >= 0) {
      records[existingIndex] = kycRecord;
    } else {
      records.push(kycRecord);
    }

    writeKycRecords(records);

    // Also update Supabase store status to UNDER_REVIEW
    await supabaseAdmin
      .from('stores')
      .update({ status: 'UNDER_REVIEW', updated_at: new Date().toISOString() })
      .eq('id', data.storeId);

    return { success: true, kyc: kycRecord };
  } catch (err: any) {
    console.error('Error saving KYC record:', err);
    return { success: false, error: err.message || 'Failed to submit KYC' };
  }
}

export async function approveKycRecord(targetIdOrStoreId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const records = readKycRecords();
    const record = records.find((r) => r.id === targetIdOrStoreId || r.storeId === targetIdOrStoreId);
    if (!record) {
      return { success: false, error: 'KYC record not found' };
    }

    record.status = 'APPROVED';
    record.rejectionReason = null;
    record.reviewedAt = new Date().toISOString();
    writeKycRecords(records);

    // Update store in Supabase
    await supabaseAdmin
      .from('stores')
      .update({ status: 'ACTIVE', updated_at: new Date().toISOString() })
      .eq('id', record.storeId);

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to approve KYC' };
  }
}

export async function rejectKycRecord(
  targetIdOrStoreId: string,
  reason: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const records = readKycRecords();
    const record = records.find((r) => r.id === targetIdOrStoreId || r.storeId === targetIdOrStoreId);
    if (!record) {
      return { success: false, error: 'KYC record not found' };
    }

    record.status = 'REJECTED';
    record.rejectionReason = reason || 'CNIC image unclear or bank details mismatch';
    record.reviewedAt = new Date().toISOString();
    writeKycRecords(records);

    // Update store in Supabase
    await supabaseAdmin
      .from('stores')
      .update({ status: 'PENDING_KYC', updated_at: new Date().toISOString() })
      .eq('id', record.storeId);

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to reject KYC' };
  }
}
