import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Store, MapPin, ShieldCheck, Star, ChevronRight, Package, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { getSession, getEffectiveUserIdReadOnly } from '@/lib/auth';
import { getSupabaseProductBySlug, getSupabaseProducts } from '@/lib/supabase-service';
import { ProductGallery } from '@/components/products/ProductGallery';
import { VariantSelector } from '@/components/products/VariantSelector';
import { ReviewSection } from '@/components/products/ReviewSection';
import { ReviewFormModal } from '@/components/products/ReviewFormModal';
import { ProductHeaderRating } from '@/components/products/ProductHeaderRating';
import { ProductCard } from '@/components/products/ProductCard';

interface ProductDetailPageProps {
  params: Promise<{ slug: string }>;
}

export const revalidate = 60;

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { slug } = await params;

  // Concurrently fetch session, effective user, product and catalog in parallel
  const [session, effectiveUserId, product, allProducts] = await Promise.all([
    getSession(),
    getEffectiveUserIdReadOnly(),
    getSupabaseProductBySlug(slug),
    getSupabaseProducts({ limit: 20 }),
  ]);

  if (!product) {
    notFound();
  }

  // Check if current logged in customer has a delivered and unreviewed order item for this product
  let eligibleDeliveredItem: { id: string } | null = null;

  let parsedImages: string[] = [];
  try {
    parsedImages = JSON.parse(product.images);
  } catch {
    parsedImages = [product.images];
  }

  // Check if current user has already rated this product
  const userExistingReview = effectiveUserId
    ? product.reviews.find((r: any) => r.userId === effectiveUserId)
    : null;

  // Calculate dynamic average rating and review count from DB
  const totalReviews = product.reviews.length;
  const averageRating =
    totalReviews > 0
      ? product.reviews.reduce((acc: number, r: any) => acc + r.ratingStars, 0) / totalReviews
      : null;

  // Fetch related products from category
  const relatedProducts = allProducts
    .filter((p: any) => p.category?.slug === product.category?.slug && p.id !== product.id)
    .slice(0, 4);


  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F8FAFC] via-[#F1F5F9] to-[#F8FAFC] relative overflow-hidden py-8">
      {/* Ambient background glows */}
      <div className="absolute top-[20%] left-[-10%] w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-[50%] right-[-10%] w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 space-y-8 relative z-10">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-slate-500 font-medium overflow-x-auto py-1">
          <Link href="/" className="hover:text-emerald-700 transition">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <Link href={`/products?category=${product.category.slug}`} className="hover:text-emerald-700 transition">
            {product.category.name}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="text-slate-800 font-bold truncate">{product.title}</span>
        </nav>

        {/* Main Product Showcase Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Gallery */}
          <div className="lg:col-span-6 sticky top-24">
            <ProductGallery images={parsedImages} title={product.title} />
          </div>

          {/* Right Info & Variant Configuration */}
          <div className="lg:col-span-6 space-y-6">
            {/* Store Info Banner */}
            <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-[0_4px_20px_-4px_rgba(4,120,87,0.06)] flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center justify-center font-bold">
                  <Store className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-900">{product.store.brandName}</span>
                    <span className="bg-emerald-100 text-emerald-900 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-emerald-300 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" /> KYC Verified
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-emerald-700" /> {product.store.area ? `${product.store.area}, ` : ''}{product.store.city}
                  </p>
                </div>
              </div>

              <Link
                href={`/store/${product.store.slug}`}
                className="px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-xs font-bold rounded-xl border border-emerald-300 transition"
              >
                Visit Store
              </Link>
            </div>

          {/* Title & Brand & Dynamic Rating */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-extrabold text-emerald-800 uppercase tracking-wider">
                {product.brand || product.category.name}
              </span>
              <ProductHeaderRating
                productId={product.id}
                productTitle={product.title}
                initialAverageRating={averageRating}
                initialReviewCount={totalReviews}
                userHasRated={!!userExistingReview}
                userRatingValue={userExistingReview ? userExistingReview.ratingStars : null}
              />
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 font-display leading-tight">
              {product.title}
            </h1>
          </div>

          {/* Description */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-[0_4px_20px_-4px_rgba(4,120,87,0.06)] text-slate-700 text-xs sm:text-sm leading-relaxed space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">Product Description</h3>
            <p className="text-slate-600">{product.description}</p>
          </div>

          {/* Interactive Variant Selector with Add to Basket / Instant Checkout */}
          <VariantSelector
            productId={product.id}
            productTitle={product.title}
            productSlug={product.slug}
            basePrice={product.basePrice}
            images={parsedImages}
            store={{
              id: product.store.id,
              brandName: product.store.brandName,
              city: product.store.city,
            }}
            variants={product.variants}
          />
        </div>
      </div>

      {/* Dynamic Technical Specifications & Product Details Grid */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-[0_4px_20px_-4px_rgba(4,120,87,0.06)] space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 font-display">
              Technical Specifications & Key Details
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Verified specifications directly provided by {product.store.brandName}
            </p>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-xs font-bold">
            <ShieldCheck className="w-3.5 h-3.5" /> 100% Authentic Item
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
            <span className="text-slate-400 font-medium block">Brand / Manufacturer</span>
            <span className="text-slate-900 font-bold text-sm">{product.brand || 'Original Local Brand'}</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
            <span className="text-slate-400 font-medium block">Category</span>
            <span className="text-slate-900 font-bold text-sm">{product.category.name}</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
            <span className="text-slate-400 font-medium block">Merchant Store</span>
            <span className="text-slate-900 font-bold text-sm">{product.store.brandName} ({product.store.city})</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
            <span className="text-slate-400 font-medium block">Delivery Service</span>
            <span className="text-slate-900 font-bold text-sm">Same-Day Express Dispatch</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
            <span className="text-slate-400 font-medium block">Payment Options</span>
            <span className="text-slate-900 font-bold text-sm">COD, JazzCash, EasyPaisa, SadaPay, Bank Transfer</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
            <span className="text-slate-400 font-medium block">Warranty & Guarantee</span>
            <span className="text-slate-900 font-bold text-sm">7-Day Return & Replacement Guarantee</span>
          </div>
        </div>
      </div>

      {/* Verified Purchase Review Prompt Banner (if user ordered and received this product) */}
      {eligibleDeliveredItem && (
        <div className="bg-emerald-50 border-2 border-emerald-600/40 p-5 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm animate-fadeIn">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-700 text-amber-300 flex items-center justify-center font-bold shadow-sm shrink-0">
              <CheckCircle2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-wider block">
                Verified Purchase Detected
              </span>
              <h4 className="text-sm font-extrabold text-emerald-950">You purchased and received this product!</h4>
              <p className="text-xs text-emerald-800 mt-0.5">
                Help other buyers across Pakistan by sharing your genuine experience and rating.
              </p>
            </div>
          </div>

          <div className="shrink-0">
            <ReviewFormModal
              productId={product.id}
              orderItemId={(eligibleDeliveredItem as any).id}
              productTitle={product.title}
            />
          </div>
        </div>
      )}

      {/* Customer Reviews Section */}
      <ReviewSection
        productId={product.id}
        productTitle={product.title}
        initialReviews={product.reviews as any}
        initialAverageRating={averageRating}
        userName={session?.name || ''}
      />

      {/* Related Products from Category */}
      {relatedProducts.length > 0 && (
        <div className="space-y-4 pt-6 border-t border-slate-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-extrabold text-slate-900 font-display">
              More in {product.category.name}
            </h3>
            <Link
              href={`/products?category=${product.category.slug}`}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800"
            >
              View Category
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {relatedProducts.map((p: any) => {
              let pImages: string[] = [];
              try {
                pImages = JSON.parse(p.images);
              } catch {
                pImages = [p.images];
              }

              const pTotalReviews = p.reviews ? p.reviews.length : 0;
              const pAvgRating =
                pTotalReviews > 0
                  ? p.reviews.reduce((acc: number, r: any) => acc + r.ratingStars, 0) / pTotalReviews
                  : null;

              const pUserReview = effectiveUserId
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
                  images={pImages}
                  store={p.store}
                  category={p.category}
                  variants={p.variants}
                  averageRating={pAvgRating}
                  reviewCount={pTotalReviews}
                  userHasRated={!!pUserReview}
                  userRatingValue={pUserReview ? pUserReview.ratingStars : null}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  </div>
);
}
