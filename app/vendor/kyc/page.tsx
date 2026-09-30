import React from 'react';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { getStoreKyc } from '@/lib/kyc';
import { VendorKycView } from '@/components/vendor/VendorKycView';

export default async function VendorKycPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  let storeId = session.storeId;
  let storeName = session.storeName || session.name || 'Merchant Store';

  if (!storeId) {
    const { data: store } = await supabaseAdmin
      .from('stores')
      .select('id, brand_name')
      .eq('user_id', session.userId)
      .maybeSingle();

    if (store) {
      storeId = store.id;
      storeName = store.brand_name;
    }
  }

  // Fetch KYC Record
  let kyc = storeId ? await getStoreKyc(storeId) : null;

  return <VendorKycView kyc={kyc} storeName={storeName} />;
}
