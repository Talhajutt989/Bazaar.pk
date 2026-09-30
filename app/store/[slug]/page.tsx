import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Store, MapPin, ShieldCheck, Star, Package, Phone, ArrowLeft, Building2 } from 'lucide-react';
import { getSession, getEffectiveUserIdReadOnly } from '@/lib/auth';
import { getSupabaseStoreBySlug } from '@/lib/supabase-service';
import { ProductCard } from '@/components/products/ProductCard';

interface StorePageProps {
  params: Promise<{ slug: string }>;
}

export const revalidate = 60;

export default async function StorePage({ params }: StorePageProps) {
  const { slug } = await params;

  // Concurrently fetch session, effective user, and store data in parallel
  const [session, effectiveUserId, store] = await Promise.all([
    getSession(),
    getEffectiveUserIdReadOnly(),
    getSupabaseStoreBySlug(slug),
  ]);

  if (!store) {
    notFound();
  }


  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F2F7F4] via-[#FAF7F2] to-[#F5F5F0] relative overflow-hidden py-8">
      {/* Ambient background glows */}
      <div className="absolute top-[20%] left-[-10%] w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-[50%] right-[-10%] w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 space-y-8 relative z-10">
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-700 hover:text-brand-800 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Marketplace
        </Link>

        {/* Store Header Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-emerald-950 to-slate-900 border border-emerald-500/30 p-6 sm:p-8 shadow-2xl shadow-emerald-950/30 text-white">
        {/* Subtle Ambient Glow Overlays */}
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white flex items-center justify-center font-bold shadow-xl border-2 border-emerald-400/40 shrink-0">
              <Store className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            </div>
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold font-display bg-gradient-to-r from-white via-slate-100 to-amber-200 bg-clip-text text-transparent">
                  {store.brandName}
                </h1>
                <span className="bg-emerald-500/20 text-emerald-300 text-xs font-bold px-3 py-0.5 rounded-full border border-emerald-400/40 flex items-center gap-1.5 backdrop-blur-md">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Verified Seller (CNIC Vetted)
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{store.brandAddress}, {store.city}</span>
              </p>
              {(store.whatsapp || store.user?.whatsapp) && (
                <p className="text-xs text-slate-400 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-amber-400" /> WhatsApp: {store.whatsapp || store.user?.whatsapp}
                </p>
              )}
            </div>
          </div>


          <div className="bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10 flex items-center gap-6 shrink-0 shadow-lg">
            <div className="text-center">
              <span className="text-xl font-extrabold text-white font-display block">
                {store.products.length}
              </span>
              <span className="text-[11px] text-slate-300 font-medium">Available Items</span>
            </div>
            <div className="border-l border-white/10 pl-6 text-center">
              <span className="text-xl font-extrabold text-emerald-400 font-display block">100%</span>
              <span className="text-[11px] text-slate-300 font-medium">Genuine Guarantee</span>
            </div>
          </div>
        </div>
      </div>

      {/* Store Catalog */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b-2 border-brand-800/20 pb-3">
          <h2 className="text-xl font-extrabold text-slate-900 font-display flex items-center gap-2">
            <Package className="w-5 h-5 text-brand-700" />
            <span>Available Products ({store.products.length})</span>
          </h2>
        </div>

        {store.products.length === 0 ? (
          <div className="bg-white rounded-2xl border-2 border-brand-800/20 p-12 text-center shadow-sm">
            <Package className="w-10 h-10 text-slate-400 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-800">No active products listed in this store yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {store.products.map((p: any) => {
              let parsedImages: string[] = [];
              try {
                parsedImages = JSON.parse(p.images);
              } catch {
                parsedImages = [p.images];
              }

              const totalReviews = p.reviews ? p.reviews.length : 0;
              const avgRating =
                totalReviews > 0
                  ? p.reviews.reduce((acc: number, r: any) => acc + r.ratingStars, 0) / totalReviews
                  : null;

              const userReview = effectiveUserId
                ? p.reviews.find((r: any) => r.userId === effectiveUserId)
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
                  store={{
                    id: store.id,
                    brandName: store.brandName,
                    city: store.city,
                    slug: store.slug,
                  }}
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
        )}
      </div>
    </div>
  </div>
);
}
