import React from 'react';
import Link from 'next/link';
import { Package, Store, PlusCircle } from 'lucide-react';
import { supabaseAdmin } from '@/lib/supabase';
import { AdminProductsManager } from '@/components/admin/AdminProductsManager';

interface AdminProductsPageProps {
  searchParams: Promise<{
    storeId?: string;
  }>;
}

export default async function AdminProductsPage({ searchParams }: AdminProductsPageProps) {
  const [params, { data: productsRaw }, { data: storesRaw }, { data: categoriesRaw }] =
    await Promise.all([
      searchParams,
      supabaseAdmin
        .from('products')
        .select(`
          id,
          title,
          brand,
          slug,
          description,
          base_price,
          images,
          is_active,
          is_approved,
          created_at,
          stores (
            id,
            brand_name,
            city,
            slug
          ),
          categories (
            id,
            name,
            slug
          ),
          product_variants (
            id,
            sku,
            variant_name,
            price,
            stock
          )
        `)
        .order('created_at', { ascending: false }),
      supabaseAdmin
        .from('stores')
        .select('id, brand_name, city')
        .order('brand_name', { ascending: true }),
      supabaseAdmin
        .from('categories')
        .select('id, name')
        .order('name', { ascending: true }),
    ]);

  const products = (productsRaw || []).map((p: any) => ({
    id: p.id,
    title: p.title,
    brand: p.brand,
    slug: p.slug,
    description: p.description,
    basePrice: p.base_price,
    images: p.images,
    isActive: p.is_active,
    isApproved: p.is_approved,
    createdAt: p.created_at || new Date().toISOString(),
    store: {
      id: p.stores?.id || 'store-generic',
      brandName: p.stores?.brand_name || 'Merchant Store',
      city: p.stores?.city || 'Pakistan',
      slug: p.stores?.slug || '',
    },
    category: {
      id: p.categories?.id,
      name: p.categories?.name || 'General',
      slug: p.categories?.slug,
    },
    variants: (p.product_variants || []).map((v: any) => ({
      id: v.id,
      sku: v.sku,
      variantName: v.variant_name,
      price: v.price,
      stock: v.stock,
    })),
  }));

  const stores = (storesRaw || []).map((s: any) => ({
    id: s.id,
    brandName: s.brand_name,
    city: s.city,
  }));

  const categories = (categoriesRaw || []).map((c: any) => ({
    id: c.id,
    name: c.name,
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b-2 border-brand-800/20">
        <div>
          <span className="text-xs font-bold text-brand-700 uppercase tracking-wider flex items-center gap-1">
            <Package className="w-4 h-4" /> Global Catalog Control
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 font-display">
            All Products & Seller Inventory Explorer
          </h1>
        </div>

        <Link
          href="/vendor/products/new"
          target="_blank"
          className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-brand flex items-center gap-2 transition"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add New Product Listing</span>
        </Link>
      </div>

      <AdminProductsManager
        products={products}
        stores={stores}
        categories={categories}
        initialSelectedStoreId={params?.storeId}
      />
    </div>
  );
}
