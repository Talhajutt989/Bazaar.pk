import React from 'react';
import { supabaseAdmin } from '@/lib/supabase';
import { VendorsTable } from '@/components/admin/VendorsTable';
import { Store } from 'lucide-react';

export default async function AdminVendorsPage() {
  const { data: storesRaw } = await supabaseAdmin
    .from('stores')
    .select('*, users(name, email, whatsapp), products(id), sub_orders(id, subtotal, platform_fee)')
    .order('created_at', { ascending: false });

  const stores = (storesRaw || []).map((s: any) => {
    const productsCount = Array.isArray(s.products) ? s.products.length : 0;
    const subOrdersList = Array.isArray(s.sub_orders) ? s.sub_orders : [];
    const totalSales = subOrdersList.reduce((sum: number, o: any) => sum + (o.subtotal || 0), 0);

    return {
      id: s.id,
      brandName: s.brand_name,
      slug: s.slug,
      brandAddress: s.brand_address,
      city: s.city,
      area: s.area,
      status: s.status,
      commissionRate: s.commission_rate || 0.10,
      totalSales,
      createdAt: new Date(s.created_at || Date.now()),
      user: {
        name: s.users?.name || 'Store Owner',
        email: s.users?.email || 'vendor@marketplace.pk',
        whatsapp: s.users?.whatsapp || '+923001234567',
      },
      kycRecord: {
        status: s.status === 'PENDING_KYC' ? 'PENDING' : 'APPROVED',
        bankName: 'Verified Bank',
        ibanNumber: 'PK00XXXX0000000000000000',
      },
      _count: {
        products: productsCount,
        subOrders: subOrdersList.length,
      },
    };
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b-2 border-brand-800/20">
        <div>
          <span className="text-xs font-bold text-brand-700 uppercase tracking-wider flex items-center gap-1">
            <Store className="w-4 h-4" /> Platform Merchants Directory
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 font-display">
            Sellers Governance & Commission Rates
          </h1>
        </div>
      </div>

      <VendorsTable stores={stores as any} />
    </div>
  );
}
