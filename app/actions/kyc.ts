'use server';

import { safeRevalidatePath } from '@/lib/utils';
import { getSession } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { saveOrSubmitVendorKyc, getStoreKyc } from '@/lib/kyc';
import { validateCnicNumber, validateBankDetails } from '@/lib/validation';

export async function submitVendorKycAction(formData: FormData) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'VENDOR') {
      return { success: false, error: 'Only registered Sellers/Merchants can submit KYC verification.' };
    }

    let storeId = session.storeId;
    let storeName = session.storeName;
    let city = 'Pakistan';

    // If storeId is missing from session cookie, fetch from Supabase
    if (!storeId) {
      const { data: store } = await supabaseAdmin
        .from('stores')
        .select('id, brand_name, city')
        .eq('user_id', session.userId)
        .maybeSingle();

      if (store) {
        storeId = store.id;
        storeName = store.brand_name;
        city = store.city || 'Pakistan';
      }
    }

    if (!storeId) {
      // Create a store record for this vendor if one does not exist yet
      const storeSlug = (session.name || 'store')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .slice(0, 30) + `-${Date.now().toString().slice(-4)}`;

      const { data: newStore, error: storeErr } = await supabaseAdmin
        .from('stores')
        .insert({
          user_id: session.userId,
          brand_name: session.name ? `${session.name}'s Store` : 'Merchant Store',
          slug: storeSlug,
          brand_address: 'Verified Digital Storefront',
          city: 'Lahore',
          status: 'UNDER_REVIEW',
        })
        .select('id, brand_name, city')
        .single();

      if (storeErr || !newStore) {
        return { success: false, error: 'Failed to initialize merchant storefront for KYC.' };
      }
      storeId = newStore.id;
      storeName = newStore.brand_name;
      city = newStore.city;
    }

    const rawCnic = formData.get('cnicNumber') as string;
    const cnicFrontUrl = formData.get('cnicFrontUrl') as string;
    const cnicBackUrl = formData.get('cnicBackUrl') as string;
    const bankName = formData.get('bankName') as string;
    const accountTitle = formData.get('accountTitle') as string;
    const ibanNumber = formData.get('ibanNumber') as string;

    // 1. CNIC Validation
    const cnicVal = validateCnicNumber(rawCnic);
    if (!cnicVal.isValid) {
      return { success: false, error: cnicVal.error || 'Invalid 13-digit Pakistani CNIC number' };
    }

    // 2. CNIC Front & Back Photos Check
    if (!cnicFrontUrl || cnicFrontUrl.trim().length < 20) {
      return { success: false, error: 'Please upload a clear photo of the FRONT side of your CNIC.' };
    }
    if (!cnicBackUrl || cnicBackUrl.trim().length < 20) {
      return { success: false, error: 'Please upload a clear photo of the BACK side of your CNIC.' };
    }

    if (cnicFrontUrl.trim() === cnicBackUrl.trim()) {
      return {
        success: false,
        error: '❌ Front aur Back photos mukhtalif honi chahiyay. Dono jagah aik hi tasweer upload nahi ki ja sakti.',
      };
    }

    // 3. Bank & IBAN Validation
    const bankVal = validateBankDetails(bankName, accountTitle, ibanNumber);
    if (!bankVal.isValid) {
      return { success: false, error: bankVal.error || 'Invalid bank account details' };
    }

    // Save KYC
    const res = await saveOrSubmitVendorKyc({
      storeId: storeId as string,
      storeName: storeName || 'Merchant Store',
      ownerName: session.name || 'Store Owner',
      email: session.email || '',
      whatsapp: '',
      city,
      cnicNumber: cnicVal.formatted || rawCnic,
      cnicFrontUrl,
      cnicBackUrl,
      bankName: bankName.trim(),
      accountTitle: accountTitle.trim(),
      ibanNumber: ibanNumber.trim().toUpperCase(),
    });

    if (!res.success) {
      return { success: false, error: res.error || 'Failed to submit KYC' };
    }

    safeRevalidatePath('/vendor/kyc');
    safeRevalidatePath('/vendor');
    safeRevalidatePath('/admin/kyc');
    return { success: true, kyc: res.kyc };
  } catch (error: any) {
    console.error('Submit KYC error:', error);
    return { success: false, error: error.message || 'Submission failed' };
  }
}

export async function fetchCurrentVendorKyc() {
  try {
    const session = await getSession();
    if (!session) return null;

    let storeId = session.storeId;
    if (!storeId) {
      const { data: store } = await supabaseAdmin
        .from('stores')
        .select('id')
        .eq('user_id', session.userId)
        .maybeSingle();
      storeId = store?.id;
    }

    if (!storeId) return null;
    return await getStoreKyc(storeId);
  } catch (err) {
    return null;
  }
}
