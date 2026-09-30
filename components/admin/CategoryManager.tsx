'use client';

import React, { useState, useTransition } from 'react';
import { Layers, Plus, Loader2 } from 'lucide-react';
import { createCategory } from '@/app/actions/admin';
import { useToast } from '@/context/ToastContext';

export interface AdminCategoryItem {
  id: string;
  name: string;
  slug: string;
  _count: {
    products: number;
  };
}

interface CategoryManagerProps {
  categories: AdminCategoryItem[];
}

export function CategoryManager({ categories }: CategoryManagerProps) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    startTransition(async () => {
      const res = await createCategory(name.trim(), slug.trim());
      if (res.success) {
        toast(`Category "${name}" created successfully!`, 'success');
        setName('');
        setSlug('');
      } else {
        toast(res.error || 'Failed to create category', 'error');
      }
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Category Creation Form */}
      <div className="lg:col-span-5 bg-white p-6 rounded-2xl border-2 border-brand-800/20 shadow-sm space-y-4 text-xs">
        <h3 className="text-sm font-extrabold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
          <Plus className="w-4 h-4 text-brand-700" />
          <span>Add New Taxonomy Category</span>
        </h3>

        <form onSubmit={handleCreate} className="space-y-4">
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700">Category Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (!slug || slug === name.toLowerCase().replace(/[^a-z0-9]+/g, '-')) {
                  setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
                }
              }}
              placeholder="e.g. Sports & Fitness Equipment"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:border-brand-600"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-slate-700">URL Slug</label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="sports-fitness"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-mono text-slate-900 focus:outline-none focus:border-brand-600"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-brand flex items-center justify-center gap-2 transition disabled:opacity-50"
          >
            {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>Create Category</span>
          </button>
        </form>
      </div>

      {/* Category List */}
      <div className="lg:col-span-7 bg-white rounded-2xl border-2 border-brand-800/20 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-extrabold text-slate-900">Active Marketplace Categories</h3>
          <span className="text-xs font-bold text-slate-500">{categories.length} Categories</span>
        </div>

        <div className="divide-y divide-slate-100 text-xs">
          {categories.map((c) => (
            <div key={c.id} className="p-3.5 flex items-center justify-between hover:bg-slate-50 transition">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-brand-100 text-brand-800 flex items-center justify-center font-bold">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-slate-900 block">{c.name}</span>
                  <span className="text-[10px] text-slate-400 font-mono">slug: {c.slug}</span>
                </div>
              </div>

              <span className="bg-slate-100 text-slate-700 font-bold px-2.5 py-1 rounded-full text-[11px] border border-slate-200">
                {c._count?.products ?? 0} Products
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
