'use client';

import React, { useState, useTransition } from 'react';
import { Star, X, MessageSquare, Loader2 } from 'lucide-react';
import { submitReview } from '@/app/actions/reviews';
import { useToast } from '@/context/ToastContext';

interface ReviewFormModalProps {
  productId: string;
  orderItemId: string;
  productTitle: string;
}

export function ReviewFormModal({ productId, orderItemId, productTitle }: ReviewFormModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [ratingStars, setRatingStars] = useState(5);
  const [comment, setComment] = useState('');
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const formData = new FormData();
      formData.set('productId', productId);
      formData.set('orderItemId', orderItemId);
      formData.set('ratingStars', ratingStars.toString());
      formData.set('comment', comment);

      const res = await submitReview(formData);
      if (res.success) {
        toast('Review submitted successfully! Thank you for rating.', 'success');
        setIsOpen(false);
      } else {
        toast(res.error || 'Failed to submit review', 'error');
      }
    });
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="px-3.5 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-slate-950 font-extrabold text-xs shadow-sm flex items-center gap-1.5 transition"
      >
        <Star className="w-3.5 h-3.5 fill-slate-950" />
        <span>Rate Product</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl border-2 border-brand-800 max-w-md w-full p-6 space-y-5 shadow-2xl animate-slide-up">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-accent-500 fill-accent-500" />
                <h3 className="font-extrabold text-base text-slate-900">Review Delivered Item</h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <span className="text-xs text-slate-500 block">Product:</span>
              <p className="text-sm font-bold text-slate-900">{productTitle}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Star Rating Picker */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">Select Rating (1 to 5 Stars):</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setRatingStars(star)}
                      className="p-1 text-2xl transition hover:scale-110"
                    >
                      <Star
                        className={`w-7 h-7 ${
                          star <= ratingStars
                            ? 'text-accent-500 fill-accent-500'
                            : 'text-slate-200 fill-slate-200'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-extrabold text-brand-700 ml-2">
                    {ratingStars} / 5 Stars
                  </span>
                </div>
              </div>

              {/* Review Comment */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">Your Review Comment:</label>
                <textarea
                  required
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share your experience regarding item authenticity, condition, and packaging..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-brand-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-slate-950 font-extrabold text-xs shadow-brand flex items-center gap-2 transition disabled:opacity-50"
                >
                  {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  <span>Submit Verified Review</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
