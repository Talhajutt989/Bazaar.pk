'use client';

import React, { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { createDirectProductReview } from '@/app/actions/reviews';
import { useToast } from '@/context/ToastContext';

interface ProductHeaderRatingProps {
  productId: string;
  productTitle: string;
  initialAverageRating: number | null;
  initialReviewCount: number;
  userHasRated?: boolean;
  userRatingValue?: number | null;
}

export function ProductHeaderRating({
  productId,
  productTitle,
  initialAverageRating,
  initialReviewCount,
  userHasRated = false,
  userRatingValue = null,
}: ProductHeaderRatingProps) {
  const [rating, setRating] = useState<number | null>(initialAverageRating);
  const [count, setCount] = useState<number>(initialReviewCount);
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [hasRated, setHasRated] = useState<boolean>(userHasRated || false);
  const [userRatedStar, setUserRatedStar] = useState<number | null>(userRatingValue || null);
  const { toast } = useToast();

  useEffect(() => {
    if (userHasRated) {
      setHasRated(true);
      if (userRatingValue) setUserRatedStar(userRatingValue);
      return;
    }
    try {
      const saved = localStorage.getItem(`bazaar_rated_${productId}`);
      if (saved) {
        setHasRated(true);
        setUserRatedStar(parseInt(saved, 10));
      }
    } catch {}
  }, [productId, userHasRated, userRatingValue]);

  const handleRate = async (starValue: number) => {
    if (hasRated) {
      toast('Aap is product ko pehle hi rate kar chuke hain. Dubara rating sirf tabhi de sakte hain agar aap ise dubara purchase karein.', 'info');
      return;
    }

    if (isPending) return;
    setIsPending(true);

    const formData = new FormData();
    formData.set('productId', productId);
    formData.set('ratingStars', starValue.toString());
    formData.set('authorName', 'Verified Customer');

    const res = await createDirectProductReview(formData);
    setIsPending(false);

    if (res.success) {
      setHasRated(true);
      setUserRatedStar(starValue);
      try {
        localStorage.setItem(`bazaar_rated_${productId}`, starValue.toString());
      } catch {}

      // Optimistic calculation
      const prevCount = count;
      const prevAvg = rating || 0;
      const newCount = prevCount + 1;
      const newAvg = (prevAvg * prevCount + starValue) / newCount;

      setRating(newAvg);
      setCount(newCount);

      toast(`⭐ Rated ${starValue} stars for "${productTitle}"! Your rating is locked.`, 'success');
    } else {
      if (res.alreadyRated) {
        setHasRated(true);
        try {
          localStorage.setItem(`bazaar_rated_${productId}`, starValue.toString());
        } catch {}
      }
      toast(res.error || 'Failed to submit rating', 'error');
    }
  };

  return (
    <div
      className={`flex items-center gap-2 px-3 py-1 rounded-full border transition shadow-2xs ${
        hasRated
          ? 'bg-emerald-50 border-emerald-300 text-emerald-900 cursor-pointer'
          : 'bg-amber-50/80 hover:bg-amber-50 border-amber-200/80'
      }`}
      onClick={hasRated ? () => handleRate(userRatedStar || 5) : undefined}
      onMouseLeave={() => setHoveredStar(null)}
      title={hasRated ? `Aap ne is product ko rate kar diya hai (${userRatedStar || rating?.toFixed(1)}★). Dubara rating sirf new purchase par allow hai.` : "Click any star to rate this product"}
    >
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled =
            hoveredStar !== null && !hasRated
              ? star <= hoveredStar
              : hasRated && userRatedStar !== null
                ? star <= userRatedStar
                : rating !== null && count > 0 && star <= Math.round(rating);

          return (
            <button
              key={star}
              type="button"
              onClick={() => handleRate(star)}
              onMouseEnter={() => !hasRated && setHoveredStar(star)}
              disabled={isPending}
              aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
              className={`p-0.5 transition-transform focus:outline-none ${
                hasRated
                  ? 'cursor-pointer'
                  : 'hover:scale-125 disabled:cursor-not-allowed group/star'
              }`}
            >
              <Star
                className={`w-4 h-4 transition-colors ${
                  isFilled
                    ? 'fill-amber-400 text-amber-500'
                    : 'text-slate-300 fill-slate-100 group-hover/star:text-amber-400'
                }`}
              />
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-1 text-xs font-bold text-slate-800">
        {hasRated ? (
          <span className="text-emerald-800 font-extrabold flex items-center gap-1">
            ✓ Rated {userRatedStar || rating?.toFixed(1)}★ ({rating ? rating.toFixed(1) : userRatedStar})
          </span>
        ) : hoveredStar !== null ? (
          <span className="text-amber-600">Rate {hoveredStar}★</span>
        ) : count > 0 && rating !== null ? (
          <>
            <span className="text-slate-900">{rating.toFixed(1)}</span>
            <span className="text-slate-400 text-[11px] font-normal">({count} {count === 1 ? 'review' : 'reviews'})</span>
          </>
        ) : (
          <span className="text-slate-500 text-[11px] font-medium">New (0 reviews)</span>
        )}
      </div>
    </div>
  );
}
