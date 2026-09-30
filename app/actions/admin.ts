'use server';

import { safeRevalidatePath } from '@/lib/server-utils';
import { supabaseAdmin } from '@/lib/supabase';
import { getSession } from '@/lib/auth';

import { approveKycRecord, rejectKycRecord } from '@/lib/kyc';

export async function approveVendorKyc(kycId: string) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') throw new Error('Unauthorized');

    const res = await approveKycRecord(kycId);
    if (!res.success) throw new Error(res.error || 'Failed to approve KYC');

    safeRevalidatePath('/admin/kyc');
    safeRevalidatePath('/admin/vendors');
    safeRevalidatePath('/vendor');
    safeRevalidatePath('/vendor/kyc');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function rejectVendorKyc(kycId: string, rejectionReason: string) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') throw new Error('Unauthorized');

    const res = await rejectKycRecord(kycId, rejectionReason);
    if (!res.success) throw new Error(res.error || 'Failed to reject KYC');

    safeRevalidatePath('/admin/kyc');
    safeRevalidatePath('/admin/vendors');
    safeRevalidatePath('/vendor/kyc');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateStoreStatus(storeId: string, status: string) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') throw new Error('Unauthorized');

    await supabaseAdmin
      .from('stores')
      .update({ status })
      .eq('id', storeId);

    safeRevalidatePath('/admin/vendors');
    safeRevalidatePath('/');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateCommissionRate(storeId: string, commissionRate: number) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') throw new Error('Unauthorized');

    await supabaseAdmin
      .from('stores')
      .update({ commission_rate: commissionRate / 100 })
      .eq('id', storeId);

    safeRevalidatePath('/admin/vendors');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function createCategory(name: string, slug: string) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') throw new Error('Unauthorized');

    const formattedSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    const { data: category, error } = await supabaseAdmin
      .from('categories')
      .insert({
        name,
        slug: formattedSlug,
      })
      .select()
      .single();

    if (error || !category) {
      throw new Error(error?.message || 'Failed to create category');
    }

    safeRevalidatePath('/admin/categories');
    safeRevalidatePath('/');
    return { success: true, category };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
