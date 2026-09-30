'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Star, ShoppingBag, Store, MapPin, Minus, Plus, ArrowRight, Check } from 'lucide-react';
import { formatPKR } from '@/lib/utils';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import { createDirectProductReview } from '@/app/actions/reviews';

export interface ProductCardVariant {
  id: string;
  sku: string;
  variantName: string;
  price: number;
  stock: number;
  attributes?: any;
}

export interface ProductCardProps {
  id: string;
  title: string;
  slug: string;
  brand: string | null;
  basePrice: number;
  images: string[];
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
  variants: ProductCardVariant[];
  averageRating?: number | null;
  reviewCount?: number;
  userHasRated?: boolean;
  userRatingValue?: number | null;
}

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80';

// Utility to cleanly parse product title and highlight subtitles (Apple/Nike clean aesthetic)
function parseTitleData(rawTitle: string, rawBrand: string | null, categoryName: string) {
  const bracketMatch = rawTitle.match(/^([^(]+?)\s*\(([^)]+)\)$/);

  let mainTitle = rawTitle;
  let subtitle = '';

  if (bracketMatch) {
    mainTitle = bracketMatch[1].trim();
    subtitle = bracketMatch[2].trim();
  } else if (rawTitle.includes(' - ')) {
    const parts = rawTitle.split(' - ');
    mainTitle = parts[0].trim();
    subtitle = parts.slice(1).join(' • ').trim();
  }

  const brandTag = (rawBrand || categoryName || 'AUTHENTIC SELECT').toUpperCase();

  return { mainTitle, subtitle, brandTag };
}

export function ProductCard({
  id,
  title,
  slug,
  brand,
  basePrice,
  images = [],
  store,
  category,
  variants = [],
  averageRating = null,
  reviewCount = 0,
  userHasRated = false,
  userRatingValue = null,
}: ProductCardProps) {
  const { items, addItem, updateQuantity, removeItem } = useCart();
  const { toast } = useToast();

  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [cardQty, setCardQty] = useState(1);
  const [isHovered, setIsHovered] = useState(false);

  // Dynamic interactive 5-star rating state
  const [currentRating, setCurrentRating] = useState<number | null>(averageRating);
  const [currentReviewCount, setCurrentReviewCount] = useState<number>(reviewCount);
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);
  const [isRatingPending, setIsRatingPending] = useState(false);
  const [hasRated, setHasRated] = useState<boolean>(userHasRated || false);
  const [userRatedStar, setUserRatedStar] = useState<number | null>(userRatingValue || null);

  // Check initial props and localStorage if this customer has already rated this product
  useEffect(() => {
    if (userHasRated) {
      setHasRated(true);
      if (userRatingValue) setUserRatedStar(userRatingValue);
      return;
    }
    try {
      const saved = localStorage.getItem(`bazaar_rated_${id}`);
      if (saved) {
        setHasRated(true);
        setUserRatedStar(parseInt(saved, 10));
      }
    } catch {
      // Ignore in SSR
    }
  }, [id, userHasRated, userRatingValue]);

  // Quick rating handler (1 to 5 stars directly from product card)
  const handleQuickRate = async (starValue: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (hasRated) {
      toast('Aap is product ko pehle hi rate kar chuke hain. Dubara rating sirf tabhi de sakte hain agar aap ise dubara purchase karein.', 'info');
      return;
    }

    if (isRatingPending) return;
    setIsRatingPending(true);

    const formData = new FormData();
    formData.set('productId', id);
    formData.set('ratingStars', starValue.toString());
    formData.set('authorName', 'Verified Customer');

    const res = await createDirectProductReview(formData);
    setIsRatingPending(false);

    if (res.success) {
      // Lock rating immediately for this product
      setHasRated(true);
      setUserRatedStar(starValue);
      try {
        localStorage.setItem(`bazaar_rated_${id}`, starValue.toString());
      } catch {}

      // Calculate optimistic new average rating
      const previousCount = currentReviewCount;
      const previousAvg = currentRating || 0;
      const newCount = previousCount + 1;
      const newAvg = (previousAvg * previousCount + starValue) / newCount;

      setCurrentRating(newAvg);
      setCurrentReviewCount(newCount);

      toast(`⭐ Rated ${starValue} stars for "${mainTitle}"! Your rating is recorded.`, 'success');
    } else {
      if (res.alreadyRated) {
        setHasRated(true);
        try {
          localStorage.setItem(`bazaar_rated_${id}`, starValue.toString());
        } catch {}
      }
      toast(res.error || 'Failed to submit rating', 'error');
    }
  };

  // Fallback image state handling
  const initialMainImage = images[0] || FALLBACK_IMAGE;
  const initialSecondaryImage = images[1] || initialMainImage;
  const [imgSrc, setImgSrc] = useState<string>(initialMainImage);

  const activeVariant = variants[selectedVariantIndex] || {
    id,
    sku: 'STD-1',
    variantName: 'Standard',
    price: basePrice,
    stock: 10,
  };

  // Parsed clean typography titles
  const { mainTitle, subtitle, brandTag } = useMemo(
    () => parseTitleData(title, brand, category.name),
    [title, brand, category.name]
  );

  // Simulated compare-at original price (~12% higher) for clean discount contrast
  const originalPrice = useMemo(
    () => Math.round((activeVariant.price * 1.12) / 100) * 100,
    [activeVariant.price]
  );

  // Find if this active variant is currently in user's cart
  const cartItem = items.find((i) => i.variantId === activeVariant.id);

  // Deduplicate variant options for sleeker pill presentation
  const uniqueDisplayVariants = useMemo(() => {
    if (!variants || variants.length === 0) return [];

    const seenLabels = new Set<string>();
    const uniqueList: Array<{ id: string; label: string; index: number; price: number; stock: number }> = [];

    variants.forEach((v, idx) => {
      const cleanLabel = v.variantName.includes(' / ')
        ? v.variantName.split(' / ')[0].trim()
        : v.variantName.trim();

      if (!seenLabels.has(cleanLabel)) {
        seenLabels.add(cleanLabel);
        uniqueList.push({
          id: v.id,
          label: cleanLabel,
          index: idx,
          price: v.price,
          stock: v.stock,
        });
      }
    });

    return uniqueList;
  }, [variants]);

  // Handle Minus action
  const handleMinus = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (cartItem) {
      if (cartItem.quantity > 1) {
        updateQuantity(activeVariant.id, cartItem.quantity - 1);
      } else {
        removeItem(activeVariant.id);
        setCardQty(1);
      }
    } else {
      setCardQty((prev) => Math.max(1, prev - 1));
    }
  };

  // Handle Plus action
  const handlePlus = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (activeVariant.stock <= 0) return;

    if (cartItem) {
      if (cartItem.quantity < activeVariant.stock) {
        updateQuantity(activeVariant.id, cartItem.quantity + 1);
      } else {
        toast(`Maximum available stock reached (${activeVariant.stock})`, 'error');
      }
    } else {
      if (cardQty < activeVariant.stock) {
        setCardQty((prev) => prev + 1);
      } else {
        toast(`Maximum available stock reached (${activeVariant.stock})`, 'error');
      }
    }
  };

  // Handle Add to Cart action
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (activeVariant.stock <= 0) return;

    const quantityToAdd = cartItem ? 1 : cardQty;

    addItem({
      variantId: activeVariant.id,
      productId: id,
      productSlug: slug,
      title,
      variantName: activeVariant.variantName,
      price: activeVariant.price,
      image: imgSrc,
      storeId: store.id,
      storeName: store.brandName,
      storeCity: store.city,
      maxStock: activeVariant.stock,
      quantity: quantityToAdd,
    });

    toast(
      `Added ${quantityToAdd}x "${title} (${activeVariant.variantName})" to basket`,
      'success'
    );
  };

  const currentDisplayImage =
    isHovered && initialSecondaryImage && initialSecondaryImage !== initialMainImage
      ? initialSecondaryImage
      : imgSrc;

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="bg-white rounded-[28px] border border-slate-200/90 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.06)] hover:shadow-[0_22px_45px_-10px_rgba(16,185,129,0.22)] hover:border-emerald-400/50 hover:-translate-y-1.5 transition-all duration-300 p-4 flex flex-col justify-between group h-full relative overflow-hidden"
    >
      {/* Top subtle iridescent glow shimmer on hover */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 via-cyan-400 via-violet-400 to-amber-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      <div>
        {/* Product Image Header with Rounded Container */}
        <Link
          href={`/products/${slug}`}
          className="block relative aspect-square w-full rounded-2xl overflow-hidden bg-slate-50 border border-slate-100/80 mb-3.5"
        >
          <Image
            src={currentDisplayImage}
            alt={title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            onError={() => setImgSrc(FALLBACK_IMAGE)}
          />

          {/* Minimalist Store Tag */}
          <div className="absolute top-2.5 left-2.5 z-10">
            <span className="bg-[#070A14]/85 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full border border-white/15 flex items-center gap-1 shadow-sm">
              <Store className="w-3 h-3 text-amber-300" />
              <span className="truncate max-w-[100px]">{store.brandName}</span>
            </span>
          </div>

          {/* Minimalist City Badge */}
          <div className="absolute top-2.5 right-2.5 z-10">
            <span className="bg-white/95 backdrop-blur-md text-slate-900 text-[10px] font-black px-2.5 py-0.5 rounded-full border border-slate-200/90 shadow-sm flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {store.city}
            </span>
          </div>

          {/* Low Stock Pill Warning */}
          {activeVariant.stock < 5 && activeVariant.stock > 0 && (
            <div className="absolute bottom-2.5 left-2.5 z-10">
              <span className="bg-amber-500 text-slate-950 font-black text-[9px] px-2 py-0.5 rounded-full shadow-xs">
                ⚡ Only {activeVariant.stock} left
              </span>
            </div>
          )}
        </Link>

        {/* Product Card Details */}
        <div className="space-y-2">
          {/* 1. Brand Tag & 5 Interactive Clickable Stars */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-black text-emerald-800 uppercase tracking-widest truncate max-w-[100px]">
              {brandTag}
            </span>

            {/* 5 Interactive Clickable Rating Stars */}
            <div
              className={`flex items-center gap-1.5 shrink-0 px-2.5 py-0.5 rounded-full border transition-colors ${
                hasRated
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900 shadow-2xs cursor-pointer'
                  : 'bg-amber-50/80 hover:bg-amber-100/80 border-amber-200/80'
              }`}
              onClick={hasRated ? (e) => handleQuickRate(userRatedStar || 5, e) : undefined}
              onMouseLeave={() => setHoveredStar(null)}
              title={hasRated ? `Aap ne is product ko rate kar diya hai (${userRatedStar || currentRating?.toFixed(1)}★).` : "Click any star to rate this product"}
            >
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => {
                  const isFilled =
                    hoveredStar !== null && !hasRated
                      ? star <= hoveredStar
                      : hasRated && userRatedStar !== null
                        ? star <= userRatedStar
                        : currentRating !== null && currentReviewCount > 0 && star <= Math.round(currentRating);

                  return (
                    <button
                      key={star}
                      type="button"
                      onClick={(e) => handleQuickRate(star, e)}
                      onMouseEnter={() => !hasRated && setHoveredStar(star)}
                      disabled={isRatingPending}
                      aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                      className={`p-0.2 transition-transform focus:outline-none ${
                        hasRated
                          ? 'cursor-pointer'
                          : 'hover:scale-125 disabled:cursor-not-allowed group/star'
                      }`}
                    >
                      <Star
                        className={`w-3.5 h-3.5 transition-colors ${
                          isFilled
                            ? 'fill-amber-400 text-amber-500'
                            : 'text-slate-300 fill-slate-100 group-hover/star:text-amber-400'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>

              <span className="text-[10px] font-black text-slate-800 min-w-[32px] text-right font-mono">
                {hasRated ? (
                  <span className="text-emerald-800 font-extrabold flex items-center gap-0.5">
                    ✓ {userRatedStar || (currentRating ? currentRating.toFixed(1) : '5')}★
                  </span>
                ) : hoveredStar !== null ? (
                  `${hoveredStar}★`
                ) : currentReviewCount > 0 && currentRating !== null ? (
                  `${currentRating.toFixed(1)} (${currentReviewCount})`
                ) : (
                  `New`
                )}
              </span>
            </div>
          </div>

          {/* 2. Bold Clean Main Title */}
          <Link href={`/products/${slug}`} className="block group-hover:text-emerald-700 transition">
            <h3 className="text-sm font-black text-slate-900 line-clamp-1 leading-snug tracking-tight font-display">
              {mainTitle}
            </h3>
          </Link>

          {/* 3. Subtle Muted Subtitle / Highlights Line */}
          <p className="text-[11px] text-slate-500 line-clamp-1 font-medium">
            {subtitle || activeVariant.variantName || 'Verified Premium Quality'}
          </p>

          {/* 4. Variant Selector Pills */}
          {uniqueDisplayVariants.length > 1 && (
            <div className="pt-1">
              <div className="flex flex-wrap gap-1.5">
                {uniqueDisplayVariants.slice(0, 3).map((v) => {
                  const isSelected = selectedVariantIndex === v.index;
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setSelectedVariantIndex(v.index);
                      }}
                      className={`text-xs font-semibold px-2.5 py-0.5 rounded-full transition ${
                        isSelected
                          ? 'bg-slate-950 text-white shadow-xs font-bold ring-1 ring-slate-800'
                          : 'border border-slate-200 text-slate-600 hover:border-emerald-500 hover:text-emerald-800 bg-white'
                      }`}
                    >
                      {v.label}
                    </button>
                  );
                })}
                {uniqueDisplayVariants.length > 3 && (
                  <span className="text-[10px] text-slate-400 self-center font-medium pl-0.5">
                    +{uniqueDisplayVariants.length - 3}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Card Footer: Pricing & Action Controls */}
      <div className="pt-3.5 space-y-2.5 mt-auto">
        {/* 1. Standout Price & Refined Stock Badge */}
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-black text-slate-900 font-display tracking-tight">
              {formatPKR(activeVariant.price)}
            </span>
            <span className="text-xs text-slate-400 line-through font-medium font-mono">
              {formatPKR(originalPrice)}
            </span>
          </div>

          <span className="bg-emerald-50 text-emerald-900 text-[11px] px-2 py-0.5 rounded-lg font-extrabold border border-emerald-200">
            {activeVariant.stock > 0 ? `${activeVariant.stock} left` : 'Out of stock'}
          </span>
        </div>

        {/* 2. Combined Quantity Selector & Luminous Multi-Gradient Add to Cart Button */}
        <div className="flex items-center w-full rounded-2xl overflow-hidden shadow-xs hover:shadow-[0_0_20px_rgba(16,185,129,0.35)] transition-all duration-200 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600">
          {/* Left Minus Button */}
          <button
            type="button"
            onClick={handleMinus}
            disabled={activeVariant.stock <= 0 || (!cartItem && cardQty <= 1)}
            aria-label="Decrease quantity"
            className="w-9 h-9 hover:bg-black/20 text-white flex items-center justify-center transition active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
          >
            <Minus className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>

          {/* Center Add to Cart CTA */}
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={activeVariant.stock <= 0}
            className="flex-1 h-9 hover:bg-black/10 text-white font-black text-xs px-2 flex items-center justify-center gap-1.5 transition active:scale-98 disabled:opacity-40 disabled:cursor-not-allowed border-x border-white/20"
          >
            <ShoppingBag className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">
              {cartItem
                ? `In Cart (${cartItem.quantity})`
                : cardQty > 1
                ? `Add (${cardQty}) to Cart`
                : 'Add to Cart'}
            </span>
          </button>

          {/* Right Plus Button */}
          <button
            type="button"
            onClick={handlePlus}
            disabled={
              activeVariant.stock <= 0 ||
              (cartItem
                ? cartItem.quantity >= activeVariant.stock
                : cardQty >= activeVariant.stock)
            }
            aria-label="Increase quantity"
            className="w-9 h-9 hover:bg-black/20 text-white flex items-center justify-center transition active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>
        </div>

        {/* 3. Subtle View Details Action */}
        <div className="text-center pt-0.5">
          <Link
            href={`/products/${slug}`}
            className="text-xs font-bold text-slate-600 hover:text-emerald-700 inline-flex items-center justify-center gap-1 py-0.5 transition group/link"
          >
            <span>View Details</span>
            <ArrowRight className="w-3 h-3 group-hover/link:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
}
