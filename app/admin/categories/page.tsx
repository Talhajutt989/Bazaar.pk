import React from 'react';
import { supabaseAdmin } from '@/lib/supabase';
import { CategoryManager } from '@/components/admin/CategoryManager';
import { Layers } from 'lucide-react';

export default async function AdminCategoriesPage() {
  const { data: categoriesRaw } = await supabaseAdmin
    .from('categories')
    .select('*, products(id)')
    .order('name', { ascending: true });

  const categories = (categoriesRaw || []).map((c: any) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    _count: {
      products: Array.isArray(c.products) ? c.products.length : 0,
    },
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b-2 border-brand-800/20">
        <div>
          <span className="text-xs font-bold text-brand-700 uppercase tracking-wider flex items-center gap-1">
            <Layers className="w-4 h-4" /> Taxonomy Governance
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 font-display">
            Marketplace Categories & Catalog Structure
          </h1>
        </div>
      </div>

      <CategoryManager categories={categories as any} />
    </div>
  );
}
