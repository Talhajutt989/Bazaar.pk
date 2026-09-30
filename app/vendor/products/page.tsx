import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { PlusCircle, Package, Lock, ShieldCheck } from 'lucide-react';
import { supabaseAdmin } from '@/lib/supabase';
import { getSession } from '@/lib/auth';
import { VendorProductsList } from '@/components/vendor/VendorProductsList';

export default async function VendorProductsPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  let storeId = session.storeId;
  let storeName = session.storeName;

  if (!storeId && session.userId) {
    const { data: store } = await supabaseAdmin
      .from('stores')
      .select('id, brand_name')
      .eq('user_id', session.userId)
      .maybeSingle();
    storeId = store?.id;
    storeName = store?.brand_name;
  }

  if (!storeId) {
    return (
      <div className="bg-white p-12 rounded-3xl border-2 border-brand-800/20 text-center space-y-4 shadow-sm">
        <Package className="w-12 h-12 text-slate-300 mx-auto" />
        <h2 className="text-xl font-extrabold text-slate-900 font-display">No Storefront Active</h2>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Please complete your merchant KYC registration to start adding and managing your products.
        </p>
        <Link
          href="/vendor/kyc"
          className="inline-flex items-center gap-2 px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-brand transition"
        >
          <span>Complete KYC Registration</span>
        </Link>
      </div>
    );
  }

  // Strict Data Isolation: Fetch ONLY this vendor's products from Supabase
  const { data: productsRaw, error } = await supabaseAdmin
    .from('products')
    .select(`
      id,
      title,
      slug,
      brand,
      description,
      base_price,
      images,
      is_active,
      created_at,
      categories (
        name
      ),
      product_variants (
        id,
        sku,
        variant_name,
        price,
        stock
      )
    `)
    .eq('store_id', storeId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching vendor products:', error);
  }

  const products = (productsRaw || []).map((p: any) => ({
    id: p.id,
    title: p.title,
    brand: p.brand,
    slug: p.slug,
    description: p.description,
    basePrice: p.base_price,
    images: p.images,
    isActive: p.is_active,
    createdAt: new Date(p.created_at || Date.now()),
    category: {
      name: p.categories?.name || 'General',
    },
    variants: (p.product_variants || []).map((v: any) => ({
      id: v.id,
      sku: v.sku,
      variantName: v.variant_name,
      price: v.price,
      stock: v.stock,
    })),
  }));

  return (
    <div className="space-y-6">
      {/* Strict Isolation Notice */}
      <div className="bg-brand-950 text-white p-4 rounded-2xl border border-brand-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-accent-500/20 text-accent-400 flex items-center justify-center shrink-0">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold text-white">Private Seller Workspace</span>
              <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.2 rounded-full">
                Strictly Isolated
              </span>
            </div>
            <p className="text-[11px] text-amber-200/80">
              Only products added by {storeName || 'your store'} are shown in this catalog. Other sellers cannot view or access your inventory.
            </p>
          </div>
        </div>

        <div className="text-right shrink-0">
          <span className="text-xs font-mono font-bold text-accent-400">
            {products.length} {products.length === 1 ? 'Product Listing' : 'Product Listings'}
          </span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b-2 border-brand-800/20">
        <div>
          <span className="text-xs font-bold text-brand-700 uppercase tracking-wider flex items-center gap-1">
            <Package className="w-4 h-4" /> Store Inventory
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 font-display">
            Manage Products & Multi-Variants
          </h1>
        </div>

        <Link
          href="/vendor/products/new"
          className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-brand flex items-center gap-2 transition"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add New Product</span>
        </Link>
      </div>

      <VendorProductsList products={products as any} />
    </div>
  );
}
