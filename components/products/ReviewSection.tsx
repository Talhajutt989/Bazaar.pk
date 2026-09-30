'use client';

import React, { useState, useTransition } from 'react';
import { Star, CheckCircle, MessageSquare, PlusCircle, X, Loader2, Sparkles } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { createDirectProductReview } from '@/app/actions/reviews';
import { useToast } from '@/context/ToastContext';

export interface ReviewItem {
  id: string;
  ratingStars: number;
  comment: string | null;
  createdAt: Date | string;
  user: {
    name: string | null;
  };
}

interface ReviewSectionProps {
  productId: string;
  productTitle: string;
  initialReviews: ReviewItem[];
  initialAverageRating: number | null;
  userName?: string | null;
}

export function ReviewSection({
  productId,
  productTitle,
  initialReviews = [],
  initialAverageRating = null,
  userName = '',
}: ReviewSectionProps) {
  const [reviews, setReviews] = useState<ReviewItem[]>(initialReviews);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStars, setSelectedStars] = useState(5);
  const [hoveredStars, setHoveredStars] = useState<number | null>(null);
  const [authorName, setAuthorName] = useState(userName || '');
  const [comment, setComment] = useState('');
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  // Dynamic calculated average rating
  const totalCount = reviews.length;
  const currentAverageRating =
    totalCount > 0
      ? reviews.reduce((sum, r) => sum + r.ratingStars, 0) / totalCount
      : null;

  const starDescriptions: Record<number, string> = {
    1: '1 Star - Poor quality / Not as described',
    2: '2 Stars - Fair / Average experience',
    3: '3 Stars - Good / Met expectations',
    4: '4 Stars - Very Good / Highly satisfied',
    5: '5 Stars - Excellent! / Exceptional quality',
  };

  const handleRatingSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    startTransition(async () => {
      const formData = new FormData();
      formData.set('productId', productId);
      formData.set('ratingStars', selectedStars.toString());
      formData.set('authorName', authorName || 'Verified Customer');
      formData.set('comment', comment);

      const res = await createDirectProductReview(formData);
      if (res.success && res.review) {
        // Prepend new review to list
        const newReview: ReviewItem = {
          id: res.review.id,
          ratingStars: res.review.ratingStars,
          comment: res.review.comment,
          createdAt: res.review.createdAt,
          user: {
            name: res.review.user.name,
          },
        };

        setReviews((prev) => [newReview, ...prev]);
        toast('Your rating & review have been submitted successfully!', 'success');
        setIsModalOpen(false);
        setComment('');
      } else {
        toast(res.error || 'Failed to submit review. Please try again.', 'error');
      }
    });
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs">
      {/* Header & Overall Rating Overview */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 font-display">
              Customer Ratings & Reviews
            </h3>
            <span className="bg-amber-100 text-amber-900 text-xs font-bold px-2.5 py-0.5 rounded-full border border-amber-300">
              {totalCount} {totalCount === 1 ? 'Review' : 'Reviews'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Verified ratings directly computed from authentic customer experiences
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {totalCount > 0 && currentAverageRating !== null ? (
            <div className="flex items-center gap-3 bg-amber-50 border border-amber-300/80 px-4 py-2 rounded-2xl shadow-2xs">
              <div className="text-center">
                <span className="text-2xl font-black text-slate-900 leading-none">
                  {currentAverageRating.toFixed(1)}
                </span>
                <span className="text-[10px] text-slate-500 block font-medium">out of 5</span>
              </div>
              <div className="border-l border-amber-300/80 pl-3">
                <div className="flex items-center gap-0.5 text-amber-500">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`w-4 h-4 ${
                        s <= Math.round(currentAverageRating)
                          ? 'fill-amber-400 text-amber-500'
                          : 'text-slate-200 fill-slate-200'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-[11px] font-semibold text-slate-700 block mt-0.5">
                  {totalCount} customer {totalCount === 1 ? 'rating' : 'ratings'}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-2xl text-xs text-slate-600 font-medium">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span>No customer ratings yet. Be the first to rate!</span>
            </div>
          )}

          {/* Interactive Modal Trigger */}
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 rounded-2xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs shadow-xs hover:shadow-md transition active:scale-95 flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4 text-amber-300" />
            <span>Write a Review & Rate</span>
          </button>
        </div>
      </div>

      {/* Review List */}
      {reviews.length === 0 ? (
        <div className="text-center py-10 bg-slate-50/70 rounded-2xl border border-dashed border-slate-200 space-y-3">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-800 flex items-center justify-center mx-auto border border-emerald-200">
            <MessageSquare className="w-6 h-6 text-emerald-700" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800">No written reviews yet</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-0.5">
              Have you tried this product? Share your experience with buyers across Pakistan!
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition shadow-xs"
          >
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>Be the first to rate this product</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4 divide-y divide-slate-100">
          {reviews.map((r) => (
            <div key={r.id} className="pt-4 first:pt-0 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-800 text-amber-300 font-bold text-xs flex items-center justify-center shadow-xs">
                    {(r.user?.name || 'C')[0].toUpperCase()}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">
                      {r.user?.name || 'Verified Customer'}
                    </span>
                    <span className="text-[10px] text-emerald-800 flex items-center gap-1 font-semibold">
                      <CheckCircle className="w-3 h-3 text-emerald-700" /> Verified Rating
                    </span>
                  </div>
                </div>

                <span className="text-[11px] text-slate-400 font-medium">{formatDate(r.createdAt)}</span>
              </div>

              {/* Star Rating Display */}
              <div className="flex items-center gap-0.5 text-amber-500">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`w-3.5 h-3.5 ${
                      s <= r.ratingStars ? 'fill-amber-400 text-amber-500' : 'text-slate-200 fill-slate-200'
                    }`}
                  />
                ))}
                <span className="text-xs font-bold text-slate-700 ml-1.5">
                  {r.ratingStars}.0
                </span>
              </div>

              {/* Written Review Comment */}
              {r.comment && (
                <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
                  "{r.comment}"
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Interactive Write a Review & Rate Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-6 sm:p-7 space-y-5 shadow-2xl animate-scaleUp">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                  <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">Write a Review & Rate</h3>
                  <p className="text-[11px] text-slate-500 truncate max-w-[240px]">{productTitle}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRatingSubmit} className="space-y-4">
              {/* 1. Interactive 1-5 Star Picker */}
              <div className="space-y-2 bg-amber-50/60 p-4 rounded-2xl border border-amber-200/70">
                <label className="text-xs font-bold text-slate-900 block">
                  Select Your Rating (1 to 5 Stars) <span className="text-amber-600">*</span>:
                </label>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const activeRating = hoveredStars !== null ? hoveredStars : selectedStars;
                    const isFilled = star <= activeRating;
                    return (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setSelectedStars(star)}
                        onMouseEnter={() => setHoveredStars(star)}
                        onMouseLeave={() => setHoveredStars(null)}
                        className="p-1 transition-transform hover:scale-125 focus:outline-none"
                      >
                        <Star
                          className={`w-8 h-8 transition-colors ${
                            isFilled
                              ? 'text-amber-500 fill-amber-400 drop-shadow-xs'
                              : 'text-slate-300 fill-slate-200'
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs font-semibold text-emerald-900 pt-0.5">
                  {starDescriptions[hoveredStars !== null ? hoveredStars : selectedStars]}
                </p>
              </div>

              {/* 2. Reviewer Name (Optional / Default) */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 block">Your Name (Optional):</label>
                <input
                  type="text"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="e.g. Zainab Fatima or Hamza"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-700 focus:bg-white transition"
                />
              </div>

              {/* 3. Text Review Comment */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 block">Your Review & Feedback (Optional):</label>
                <textarea
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Tell us about the item quality, delivery time, packaging, and if you recommend it..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-700 focus:bg-white transition"
                />
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs shadow-xs flex items-center gap-2 transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPending ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <Sparkles className="w-4 h-4 text-amber-300" />}
                  <span>Submit Rating & Review</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
