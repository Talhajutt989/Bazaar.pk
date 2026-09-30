'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { RotateCcw, MapPin, Tag, Check, SlidersHorizontal, Sparkles, DollarSign } from 'lucide-react';
import { CITIES_OF_PAKISTAN } from '@/lib/utils';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface ProductFiltersProps {
  categories: Category[];
  totalProductsCount: number;
}

const CATEGORY_DOT_COLORS: Record<string, string> = {
  'smartphones-gadgets': 'bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.6)]',
  'laptops-computers': 'bg-violet-500 shadow-[0_0_8px_rgba(139,92,246,0.6)]',
  'electronics-gadgets': 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]',
  'fresh-grocery': 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]',
  'gourmet-dry-fruits': 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]',
  'spices-herbs': 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]',
  'apparel-clothing': 'bg-pink-500 shadow-[0_0_8px_rgba(236,72,153,0.6)]',
  'mens-fashion': 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]',
  'womens-fashion': 'bg-fuchsia-500 shadow-[0_0_8px_rgba(217,70,239,0.6)]',
  'shoes-footwear': 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.6)]',
  'home-living': 'bg-teal-500 shadow-[0_0_8px_rgba(20,184,166,0.6)]',
  'beauty-care': 'bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.6)]',
};

const PRICE_PRESETS = [
  { label: 'Under 2.5k', min: '', max: '2500' },
  { label: '2.5k – 10k', min: '2500', max: '10000' },
  { label: '10k – 50k', min: '10000', max: '50000' },
  { label: '50k+', min: '50000', max: '' },
];

export function ProductFilters({ categories, totalProductsCount }: ProductFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentCategory = searchParams.get('category') || '';
  const currentCity = searchParams.get('city') || '';
  const currentSort = searchParams.get('sort') || 'featured';
  const currentMinPrice = searchParams.get('minPrice') || '';
  const currentMaxPrice = searchParams.get('maxPrice') || '';

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/products?${params.toString()}`);
  };

  const applyPricePreset = (min: string, max: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (min) params.set('minPrice', min);
    else params.delete('minPrice');

    if (max) params.set('maxPrice', max);
    else params.delete('maxPrice');

    router.push(`/products?${params.toString()}`);
  };

  const resetFilters = () => {
    router.push('/products');
  };

  const hasActiveFilters = !!(currentCategory || currentCity || currentMinPrice || currentMaxPrice);

  return (
    <div className="bg-white rounded-[28px] border border-slate-200/90 p-5 space-y-6 shadow-[0_4px_25px_-4px_rgba(15,23,42,0.06)] relative overflow-hidden">
      {/* Top Multi-Color Decorative Bar */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-400 via-cyan-400 via-violet-400 to-amber-400" />

      {/* Header */}
      <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 pt-1">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200 shadow-2xs">
            <SlidersHorizontal className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="font-black text-sm text-slate-900 font-display">Filter Catalog</h3>
            <span className="text-[10px] text-slate-400 block -mt-0.5">{totalProductsCount} items available</span>
          </div>
        </div>
        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="flex items-center gap-1 text-[11px] font-extrabold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-2.5 py-1 rounded-lg border border-rose-200 transition active:scale-95"
          >
            <RotateCcw className="w-3 h-3" /> Reset
          </button>
        )}
      </div>

      {/* City / Hyper-Local Location Filter */}
      <div className="space-y-2">
        <label className="text-xs font-black text-slate-900 flex items-center gap-1.5 uppercase tracking-wider">
          <MapPin className="w-3.5 h-3.5 text-emerald-600" /> Hyper-Local City Hub
        </label>
        <div className="relative">
          <select
            value={currentCity}
            onChange={(e) => updateParam('city', e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-400/20 transition cursor-pointer appearance-none pr-8"
          >
            <option value="">📍 All Pakistan Cities</option>
            {CITIES_OF_PAKISTAN.filter((c) => c !== 'All Cities').map((city) => (
              <option key={city} value={city}>
                🏙️ {city}
              </option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">
            ▼
          </div>
        </div>
      </div>

      {/* Categories Filter */}
      <div className="space-y-2.5">
        <label className="text-xs font-black text-slate-900 flex items-center gap-1.5 uppercase tracking-wider">
          <Tag className="w-3.5 h-3.5 text-cyan-600" /> Explore Categories
        </label>
        <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
          <button
            onClick={() => updateParam('category', '')}
            className={`w-full text-left text-xs px-3 py-2 rounded-xl font-bold transition flex items-center justify-between ${
              !currentCategory
                ? 'bg-gradient-to-r from-emerald-500/15 via-teal-500/15 to-cyan-500/15 text-emerald-900 border border-emerald-400/40 shadow-2xs font-extrabold'
                : 'hover:bg-slate-50 text-slate-600 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400" />
              <span>All Categories</span>
            </div>
            {!currentCategory && <Check className="w-3.5 h-3.5 text-emerald-700" />}
          </button>
          {categories.map((cat) => {
            const isSelected = currentCategory === cat.slug;
            const dotColor = CATEGORY_DOT_COLORS[cat.slug] || 'bg-slate-400';
            return (
              <button
                key={cat.id}
                onClick={() => updateParam('category', cat.slug)}
                className={`w-full text-left text-xs px-3 py-2 rounded-xl font-semibold transition flex items-center justify-between ${
                  isSelected
                    ? 'bg-gradient-to-r from-cyan-500/15 via-emerald-500/15 to-amber-500/15 text-cyan-950 font-extrabold border border-cyan-400/40 shadow-2xs'
                    : 'hover:bg-slate-50 text-slate-600 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0 pr-2">
                  <span className={`w-2 h-2 rounded-full ${dotColor} shrink-0`} />
                  <span className="truncate">{cat.name}</span>
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 text-cyan-700 shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Price Range Filter & Quick Presets */}
      <div className="space-y-2.5 pt-2 border-t border-slate-100">
        <label className="text-xs font-black text-slate-900 flex items-center gap-1.5 uppercase tracking-wider">
          <DollarSign className="w-3.5 h-3.5 text-amber-600" /> Price Range (PKR)
        </label>

        {/* Quick presets */}
        <div className="grid grid-cols-2 gap-1.5">
          {PRICE_PRESETS.map((preset) => {
            const isActive = currentMinPrice === preset.min && currentMaxPrice === preset.max;
            return (
              <button
                key={preset.label}
                type="button"
                onClick={() => applyPricePreset(preset.min, preset.max)}
                className={`text-[11px] font-bold py-1 px-2 rounded-lg border transition ${
                  isActive
                    ? 'bg-amber-50 text-amber-900 border-amber-300 shadow-2xs font-extrabold'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-200'
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <div className="relative">
            <input
              type="number"
              placeholder="Min Rs."
              defaultValue={currentMinPrice}
              onBlur={(e) => updateParam('minPrice', e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-500 transition placeholder:font-normal"
            />
          </div>
          <div className="relative">
            <input
              type="number"
              placeholder="Max Rs."
              defaultValue={currentMaxPrice}
              onBlur={(e) => updateParam('maxPrice', e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-500 transition placeholder:font-normal"
            />
          </div>
        </div>
      </div>

      {/* Sort Options */}
      <div className="space-y-2 pt-2 border-t border-slate-100">
        <label className="text-xs font-black text-slate-900 uppercase tracking-wider">Sort Catalog</label>
        <div className="relative">
          <select
            value={currentSort}
            onChange={(e) => updateParam('sort', e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-400/20 transition cursor-pointer appearance-none pr-8"
          >
            <option value="featured">✨ Featured / Best Matches</option>
            <option value="price_asc">📉 Price: Low to High</option>
            <option value="price_desc">📈 Price: High to Low</option>
            <option value="newest">⚡ Newest Arrivals</option>
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">
            ▼
          </div>
        </div>
      </div>
    </div>
  );
}
