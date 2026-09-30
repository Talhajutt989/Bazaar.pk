'use client';

import React, { useState, useTransition, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Package,
  Store,
  Search,
  Filter,
  ToggleLeft,
  ToggleRight,
  Trash2,
  ExternalLink,
  Layers,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  SlidersHorizontal,
} from 'lucide-react';
import { toggleProductActive, deleteProduct } from '@/app/actions/products';
import { formatPKR, formatDate } from '@/lib/utils';
import { useToast } from '@/context/ToastContext';

export interface AdminProductItem {
  id: string;
  title: string;
  brand: string | null;
  slug: string;
  description: string;
  basePrice: number;
  images: string;
  isActive: boolean;
  isApproved: boolean;
  createdAt: string | Date;
  store: {
    id: string;
    brandName: string;
    city: string;
    slug: string;
  };
  category: {
    id?: string;
    name: string;
    slug?: string;
  };
  variants: Array<{
    id: string;
    sku: string;
    variantName: string;
    price: number;
    stock: number;
  }>;
}

interface AdminProductsManagerProps {
  products: AdminProductItem[];
  stores: Array<{ id: string; brandName: string; city: string }>;
  categories: Array<{ id: string; name: string }>;
  initialSelectedStoreId?: string;
}

export function AdminProductsManager({
  products: initialProducts,
  stores,
  categories,
  initialSelectedStoreId,
}: AdminProductsManagerProps) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStoreId, setSelectedStoreId] = useState(initialSelectedStoreId || 'ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [stockFilter, setStockFilter] = useState<'ALL' | 'IN_STOCK' | 'OUT_OF_STOCK'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'HIDDEN'>('ALL');

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return initialProducts.filter((p) => {
      // 1. Seller Store Filter
      if (selectedStoreId !== 'ALL' && p.store?.id !== selectedStoreId) {
        return false;
      }

      // 2. Category Filter
      if (selectedCategory !== 'ALL' && p.category?.name !== selectedCategory) {
        return false;
      }

      // 3. Status Filter
      if (statusFilter === 'ACTIVE' && !p.isActive) return false;
      if (statusFilter === 'HIDDEN' && p.isActive) return false;

      // 4. Stock Filter
      const totalStock = p.variants.reduce((sum, v) => sum + (v.stock || 0), 0);
      if (stockFilter === 'IN_STOCK' && totalStock <= 0) return false;
      if (stockFilter === 'OUT_OF_STOCK' && totalStock > 0) return false;

      // 5. Search Filter (Title, Brand, SKU, Store)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const titleMatch = p.title?.toLowerCase().includes(q);
        const brandMatch = p.brand?.toLowerCase().includes(q);
        const storeMatch = p.store?.brandName?.toLowerCase().includes(q);
        const skuMatch = p.variants.some((v) => v.sku?.toLowerCase().includes(q));
        if (!titleMatch && !brandMatch && !storeMatch && !skuMatch) {
          return false;
        }
      }

      return true;
    });
  }, [initialProducts, selectedStoreId, selectedCategory, statusFilter, stockFilter, searchQuery]);

  // Statistics
  const totalProducts = initialProducts.length;
  const totalActive = initialProducts.filter((p) => p.isActive).length;
  const outOfStockCount = initialProducts.filter((p) => {
    const totalStock = p.variants.reduce((sum, v) => sum + (v.stock || 0), 0);
    return totalStock <= 0;
  }).length;
  const totalStoresRepresented = new Set(initialProducts.map((p) => p.store?.id).filter(Boolean)).size;

  const handleToggle = (productId: string) => {
    startTransition(async () => {
      const res = await toggleProductActive(productId);
      if (res.success) {
        toast('Product visibility status updated', 'success');
      } else {
        toast(res.error || 'Failed to update status', 'error');
      }
    });
  };

  const handleDelete = (productId: string) => {
    if (!confirm('Are you sure you want to permanently delete this product from the platform?')) return;
    startTransition(async () => {
      const res = await deleteProduct(productId);
      if (res.success) {
        toast('Product listing removed from marketplace', 'success');
      } else {
        toast(res.error || 'Failed to delete product', 'error');
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border-2 border-brand-800/20 shadow-xs space-y-1">
          <span className="text-xs font-semibold text-slate-500">Total Products</span>
          <div className="text-2xl font-extrabold text-slate-900 font-display">
            {totalProducts}
          </div>
          <span className="text-[11px] text-brand-700 font-medium">Across all sellers</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border-2 border-brand-800/20 shadow-xs space-y-1">
          <span className="text-xs font-semibold text-slate-500">Active Live Listings</span>
          <div className="text-2xl font-extrabold text-emerald-600 font-display">
            {totalActive}
          </div>
          <span className="text-[11px] text-slate-500">Visible to customers</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border-2 border-brand-800/20 shadow-xs space-y-1">
          <span className="text-xs font-semibold text-slate-500">Out of Stock</span>
          <div className="text-2xl font-extrabold text-rose-600 font-display">
            {outOfStockCount}
          </div>
          <span className="text-[11px] text-slate-500">Inventory depleted</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border-2 border-brand-800/20 shadow-xs space-y-1">
          <span className="text-xs font-semibold text-slate-500">Sellers Represented</span>
          <div className="text-2xl font-extrabold text-brand-900 font-display">
            {totalStoresRepresented || stores.length} Stores
          </div>
          <span className="text-[11px] text-slate-500">Multi-vendor catalog</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-5 rounded-3xl border-2 border-brand-800/20 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search product title, brand, SKU code, or seller name..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-brand-600 font-medium"
            />
          </div>

          {/* Quick Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Seller Filter */}
            <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 text-xs">
              <Store className="w-3.5 h-3.5 text-brand-700 shrink-0" />
              <select
                value={selectedStoreId}
                onChange={(e) => setSelectedStoreId(e.target.value)}
                className="bg-transparent font-bold text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Sellers ({stores.length})</option>
                {stores.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.brandName} ({s.city})
                  </option>
                ))}
              </select>
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 text-xs">
              <Layers className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-transparent font-bold text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Stock Filter */}
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value as any)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Stock Levels</option>
              <option value="IN_STOCK">In Stock</option>
              <option value="OUT_OF_STOCK">Out of Stock</option>
            </select>

            {/* Visibility Status */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Status</option>
              <option value="ACTIVE">Active (Live)</option>
              <option value="HIDDEN">Hidden</option>
            </select>
          </div>
        </div>

        {/* Filter Summary & Result Count */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          <span>
            Showing <strong className="text-slate-900 font-extrabold">{filteredProducts.length}</strong> of{' '}
            {totalProducts} products
            {selectedStoreId !== 'ALL' && (
              <span className="text-brand-800 font-bold ml-1">
                (Filtered by: {stores.find((s) => s.id === selectedStoreId)?.brandName})
              </span>
            )}
          </span>

          {(searchQuery || selectedStoreId !== 'ALL' || selectedCategory !== 'ALL' || stockFilter !== 'ALL' || statusFilter !== 'ALL') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedStoreId('ALL');
                setSelectedCategory('ALL');
                setStockFilter('ALL');
                setStatusFilter('ALL');
              }}
              className="text-brand-700 font-bold hover:underline"
            >
              Reset All Filters
            </button>
          )}
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-3xl border-2 border-brand-800/20 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3.5">Product Details</th>
                <th className="p-3.5">Seller / Merchant</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">Base Price</th>
                <th className="p-3.5">Variants & Stock</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((p) => {
                  let images: string[] = [];
                  try {
                    images = JSON.parse(p.images);
                  } catch {
                    images = [p.images];
                  }

                  const totalStock = p.variants.reduce((sum, v) => sum + (v.stock || 0), 0);

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition">
                      {/* Product details */}
                      <td className="p-3.5">
                        <div className="flex items-center gap-3">
                          <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shrink-0">
                            <Image
                              src={images[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80'}
                              alt={p.title}
                              fill
                              sizes="48px"
                              className="object-cover"
                            />
                          </div>
                          <div className="min-w-0 max-w-xs">
                            <span className="font-bold text-slate-900 block truncate">{p.title}</span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {p.brand ? `Brand: ${p.brand}` : 'Generic'} • {formatDate(new Date(p.createdAt))}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Seller Store */}
                      <td className="p-3.5">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-brand-100 text-brand-800 flex items-center justify-center shrink-0">
                            <Store className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block">
                              {p.store?.brandName || 'Store'}
                            </span>
                            <span className="text-[10px] text-slate-500">📍 {p.store?.city || 'Pakistan'}</span>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="p-3.5">
                        <span className="bg-slate-100 text-slate-800 px-2.5 py-1 rounded-lg font-semibold text-[11px] border border-slate-200">
                          {p.category?.name || 'General'}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="p-3.5 font-bold text-slate-900">
                        {formatPKR(p.basePrice)}
                      </td>

                      {/* Variants & Stock */}
                      <td className="p-3.5">
                        <div className="space-y-1">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              totalStock > 0
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                : 'bg-rose-100 text-rose-800 border border-rose-200'
                            }`}
                          >
                            {totalStock} in stock ({p.variants.length} {p.variants.length === 1 ? 'variant' : 'variants'})
                          </span>
                          <div className="text-[10px] text-slate-500 max-w-xs truncate">
                            {p.variants.map((v) => `${v.variantName} (${v.stock})`).join(', ')}
                          </div>
                        </div>
                      </td>

                      {/* Status Toggle */}
                      <td className="p-3.5">
                        <button
                          onClick={() => handleToggle(p.id)}
                          disabled={isPending}
                          className="flex items-center gap-1.5 font-bold text-xs transition cursor-pointer"
                        >
                          {p.isActive ? (
                            <>
                              <ToggleRight className="w-6 h-6 text-brand-600" />
                              <span className="text-brand-700">Active</span>
                            </>
                          ) : (
                            <>
                              <ToggleLeft className="w-6 h-6 text-slate-400" />
                              <span className="text-slate-400">Hidden</span>
                            </>
                          )}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="p-3.5 text-right space-x-2">
                        <Link
                          href={`/products/${p.slug}`}
                          target="_blank"
                          className="p-1.5 text-slate-400 hover:text-brand-700 inline-block transition"
                          title="View live product"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(p.id)}
                          disabled={isPending}
                          className="p-1.5 text-rose-400 hover:text-rose-600 transition cursor-pointer"
                          title="Delete listing"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-400 text-xs">
                    <Package className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    <p className="font-bold text-slate-700">No products matching the selected filters.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
