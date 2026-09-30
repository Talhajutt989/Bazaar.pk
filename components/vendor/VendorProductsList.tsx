'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Package, ToggleLeft, ToggleRight, Trash2, ExternalLink, Plus, Loader2 } from 'lucide-react';
import { toggleProductActive, deleteProduct } from '@/app/actions/products';
import { formatPKR } from '@/lib/utils';
import { useToast } from '@/context/ToastContext';

export interface VendorProductItem {
  id: string;
  title: string;
  slug: string;
  brand: string | null;
  basePrice: number;
  images: string;
  isActive: boolean;
  category: {
    name: string;
  };
  variants: Array<{
    id: string;
    sku: string;
    variantName: string;
    price: number;
    stock: number;
  }>;
}

interface VendorProductsListProps {
  products: VendorProductItem[];
}

export function VendorProductsList({ products }: VendorProductsListProps) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const handleToggle = (productId: string) => {
    startTransition(async () => {
      const res = await toggleProductActive(productId);
      if (res.success) {
        toast('Product status updated', 'success');
      } else {
        toast(res.error || 'Failed to update status', 'error');
      }
    });
  };

  const handleDelete = (productId: string) => {
    if (!confirm('Are you sure you want to delete this product listing?')) return;
    startTransition(async () => {
      const res = await deleteProduct(productId);
      if (res.success) {
        toast('Product removed from catalog', 'success');
      } else {
        toast(res.error || 'Failed to delete product', 'error');
      }
    });
  };

  if (products.length === 0) {
    return (
      <div className="bg-white p-12 rounded-2xl border-2 border-brand-800/20 text-center shadow-sm space-y-4">
        <Package className="w-12 h-12 text-slate-300 mx-auto" />
        <h3 className="text-base font-bold text-slate-800">No products in your catalog yet</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Add your first product with multiple variants (storage, size, color) to start receiving hyper-local orders.
        </p>
        <Link
          href="/vendor/products/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-brand transition"
        >
          <Plus className="w-4 h-4" /> Create First Product
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border-2 border-brand-800/20 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
            <tr>
              <th className="p-3.5">Product</th>
              <th className="p-3.5">Category</th>
              <th className="p-3.5">Base Price</th>
              <th className="p-3.5">Variants & Stock</th>
              <th className="p-3.5">Active Status</th>
              <th className="p-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {products.map((p) => {
              let images: string[] = [];
              try {
                images = JSON.parse(p.images);
              } catch {
                images = [p.images];
              }

              const totalStock = p.variants.reduce((sum, v) => sum + v.stock, 0);

              return (
                <tr key={p.id} className="hover:bg-slate-50/80 transition">
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
                        <span className="text-[11px] text-slate-400 font-mono">
                          {p.brand ? `Brand: ${p.brand}` : 'Generic'}
                        </span>
                      </div>
                    </div>
                  </td>

                  <td className="p-3.5">
                    <span className="bg-brand-50 text-brand-900 px-2 py-0.5 rounded-md font-semibold text-[11px] border border-brand-200">
                      {p.category.name}
                    </span>
                  </td>

                  <td className="p-3.5 font-bold text-slate-900">{formatPKR(p.basePrice)}</td>

                  <td className="p-3.5">
                    <div className="space-y-1">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          totalStock > 0
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {totalStock} in stock ({p.variants.length} {p.variants.length === 1 ? 'variant' : 'variants'})
                      </span>
                      <div className="text-[10px] text-slate-500 line-clamp-1">
                        {p.variants.map((v) => `${v.variantName} (${v.stock})`).join(', ')}
                      </div>
                    </div>
                  </td>

                  <td className="p-3.5">
                    <button
                      onClick={() => handleToggle(p.id)}
                      disabled={isPending}
                      className="flex items-center gap-1.5 font-bold text-xs transition"
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
                      className="p-1.5 text-rose-400 hover:text-rose-600 transition"
                      title="Delete listing"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
