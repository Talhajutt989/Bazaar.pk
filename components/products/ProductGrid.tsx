'use client';

import React from 'react';
import Link from 'next/link';
import { ProductCard } from './ProductCard';
import { PackageX, SearchX, Truck, MapPin, Sparkles, ArrowRight } from 'lucide-react';

interface ProductGridProps {
  products: Array<{
    id: string;
    title: string;
    slug: string;
    brand: string | null;
    basePrice: number;
    images: string;
    store: {
      id: string;
      brandName: string;
      city: string;
      slug: string;
    };
    category: {
      name: string;
      slug: string;
    };
    variants: Array<{
      id: string;
      sku: string;
      variantName: string;
      price: number;
      stock: number;
      attributes?: any;
    }>;
    reviews?: Array<{
      ratingStars: number;
      userId?: string;
    }>;
  }>;
  searchQuery?: string;
  currentUserId?: string | null;
  activeCity?: string;
  activeCategoryName?: string;
  isUsingNationwideFallback?: boolean;
}

export function ProductGrid({
  products,
  searchQuery,
  currentUserId,
  activeCity,
  activeCategoryName,
  isUsingNationwideFallback = false,
}: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="bg-white rounded-[32px] border border-slate-200/90 p-8 sm:p-12 text-center shadow-[0_4px_25px_-4px_rgba(15,23,42,0.06)] relative overflow-hidden">
        {/* Ambient glow in empty card */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="w-16 h-16 bg-gradient-to-tr from-emerald-500/20 via-teal-500/20 to-cyan-500/20 text-emerald-800 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-emerald-300/40 shadow-xs relative z-10">
          {searchQuery ? <SearchX className="w-8 h-8 text-emerald-700" /> : <PackageX className="w-8 h-8 text-emerald-700" />}
        </div>
        <h3 className="text-lg sm:text-xl font-black text-slate-900 mb-1.5 font-display relative z-10">
          {searchQuery ? `No products found for "${searchQuery}"` : 'No items match your active filters'}
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed relative z-10 font-medium">
          {searchQuery
            ? `We couldn't find any direct items matching "${searchQuery}". Please check your spelling or try searching for popular terms like "s24", "dry fruits", "honey", "shoes", or "lawn".`
            : 'Try selecting "All Categories", switching to "All Pakistan", or clearing your price bounds to see all available products.'}
        </p>

        {/* Action tags */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-6 relative z-10">
          <Link
            href="/products"
            className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:via-teal-500 hover:to-cyan-500 text-white text-xs font-black rounded-xl shadow-md transition active:scale-95 flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Explore All 100+ Catalog Products</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Smart Hyper-Local Nationwide Delivery Fallback Banner */}
      {isUsingNationwideFallback && activeCity && activeCity !== 'All Cities' && (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-50 via-sky-50 to-emerald-50 border border-amber-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fadeIn">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-orange-500/20 text-amber-800 flex items-center justify-center shrink-0 border border-amber-300 shadow-2xs">
              <Truck className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-xs sm:text-sm font-black text-slate-900 font-display">
                  Nationwide Express Delivery to {activeCity}
                </h4>
                <span className="bg-amber-100/90 text-amber-900 text-[10px] font-black px-2 py-0.5 rounded-md border border-amber-300 uppercase tracking-wider">
                  All Pakistan Verified Stock
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-600 mt-0.5 leading-relaxed font-medium">
                No local vendor inside <strong>{activeCity}</strong> stocks {activeCategoryName ? `"${activeCategoryName}"` : 'this category'} right now. Showing <strong>{products.length}</strong> top-rated items with doorstep courier delivery across Pakistan.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/products"
              className="text-xs font-bold text-slate-700 hover:text-emerald-800 bg-white hover:bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-300 shadow-2xs transition flex items-center gap-1.5 active:scale-95"
            >
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              <span>All Cities</span>
            </Link>
          </div>
        </div>
      )}

      {/* Grid of Product Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((p) => {
          let parsedImages: string[] = [];
          try {
            parsedImages = JSON.parse(p.images);
          } catch {
            parsedImages = [p.images];
          }

          const totalReviews = p.reviews ? p.reviews.length : 0;
          const avgRating =
            totalReviews > 0 && p.reviews
              ? p.reviews.reduce((acc, r) => acc + r.ratingStars, 0) / totalReviews
              : null;

          const userReview = currentUserId && p.reviews
            ? p.reviews.find((r) => r.userId === currentUserId)
            : null;

          return (
            <ProductCard
              key={p.id}
              id={p.id}
              title={p.title}
              slug={p.slug}
              brand={p.brand}
              basePrice={p.basePrice}
              images={parsedImages}
              store={p.store}
              category={p.category}
              variants={p.variants}
              averageRating={avgRating}
              reviewCount={totalReviews}
              userHasRated={!!userReview}
              userRatingValue={userReview ? userReview.ratingStars : null}
            />
          );
        })}
      </div>
    </div>
  );
}

