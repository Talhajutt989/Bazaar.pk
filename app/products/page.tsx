import React from 'react';
import { getSupabaseCategories, getSupabaseProducts } from '@/lib/supabase-service';
import { getSession, getEffectiveUserIdReadOnly } from '@/lib/auth';
import { ProductFilters } from '@/components/products/ProductFilters';
import { ProductGrid } from '@/components/products/ProductGrid';
import { Layers, Search, Sparkles, ShieldCheck, Truck } from 'lucide-react';
import { isStrictMatch, calculateRelevanceScore } from '@/lib/search';

interface ProductsPageProps {
  searchParams: Promise<{
    search?: string;
    q?: string;
    category?: string;
    city?: string;
    store?: string;
    minPrice?: string;
    maxPrice?: string;
    sort?: string;
  }>;
}

interface CategoryTheme {
  gradient: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  orb1: string;
  orb2: string;
  orb3: string;
  titleGradient: string;
  subtitle: string;
}

const CATEGORY_BANNER_THEMES: Record<string, CategoryTheme> = {
  'apparel-clothing': {
    gradient: 'from-[#1A0A2A] via-[#2D1248] to-[#0D152F]',
    badgeBg: 'bg-rose-500/15',
    badgeBorder: 'border-rose-400/40',
    badgeText: 'text-rose-300',
    orb1: 'bg-rose-500/25',
    orb2: 'bg-violet-500/25',
    orb3: 'bg-amber-400/20',
    titleGradient: 'from-white via-rose-100 to-amber-200',
    subtitle: 'Curated Pakistani Heritage, Stitched Lawn, Contemporary Pret & Premium Footwear',
  },
  'mens-fashion': {
    gradient: 'from-[#0B1528] via-[#16274E] to-[#0A1D36]',
    badgeBg: 'bg-indigo-500/15',
    badgeBorder: 'border-indigo-400/40',
    badgeText: 'text-indigo-300',
    orb1: 'bg-indigo-500/25',
    orb2: 'bg-blue-500/25',
    orb3: 'bg-cyan-400/20',
    titleGradient: 'from-white via-indigo-100 to-cyan-200',
    subtitle: 'Classic Kurtas, Waistcoats, Formal Suits & Everyday Essentials',
  },
  'womens-fashion': {
    gradient: 'from-[#240B22] via-[#3D1438] to-[#16122C]',
    badgeBg: 'bg-pink-500/15',
    badgeBorder: 'border-pink-400/40',
    badgeText: 'text-pink-300',
    orb1: 'bg-pink-500/25',
    orb2: 'bg-fuchsia-500/25',
    orb3: 'bg-amber-300/20',
    titleGradient: 'from-white via-pink-100 to-amber-200',
    subtitle: 'Designer Lawn, Luxury Pret, Bridal Formals & Unstitched Collections',
  },
  'smartphones-gadgets': {
    gradient: 'from-[#05172C] via-[#0B2A4A] to-[#081B2B]',
    badgeBg: 'bg-cyan-500/15',
    badgeBorder: 'border-cyan-400/40',
    badgeText: 'text-cyan-300',
    orb1: 'bg-cyan-400/25',
    orb2: 'bg-blue-500/25',
    orb3: 'bg-teal-400/20',
    titleGradient: 'from-white via-cyan-100 to-blue-200',
    subtitle: 'PTA Approved Flagships, Smart Accessories & Wearables with Official Warranty',
  },
  'laptops-computers': {
    gradient: 'from-[#120D2C] via-[#1E174D] to-[#09152E]',
    badgeBg: 'bg-violet-500/15',
    badgeBorder: 'border-violet-400/40',
    badgeText: 'text-violet-300',
    orb1: 'bg-violet-500/25',
    orb2: 'bg-indigo-500/25',
    orb3: 'bg-cyan-400/20',
    titleGradient: 'from-white via-violet-100 to-cyan-200',
    subtitle: 'High-Performance Workstations, Gaming Rigs & Computing Accessories',
  },
  'electronics-gadgets': {
    gradient: 'from-[#06182E] via-[#0E284F] to-[#091F2D]',
    badgeBg: 'bg-blue-500/15',
    badgeBorder: 'border-blue-400/40',
    badgeText: 'text-blue-300',
    orb1: 'bg-blue-500/25',
    orb2: 'bg-cyan-400/25',
    orb3: 'bg-emerald-400/20',
    titleGradient: 'from-white via-blue-100 to-emerald-200',
    subtitle: 'Smart Home Automation, Audio Tech, Cameras & Power Gadgets',
  },
  'fresh-grocery': {
    gradient: 'from-[#052014] via-[#0A3824] to-[#0E2C14]',
    badgeBg: 'bg-emerald-500/15',
    badgeBorder: 'border-emerald-400/40',
    badgeText: 'text-emerald-300',
    orb1: 'bg-emerald-400/25',
    orb2: 'bg-teal-500/25',
    orb3: 'bg-lime-400/20',
    titleGradient: 'from-white via-emerald-100 to-amber-200',
    subtitle: 'Farm-Fresh Organics, Pure Oils, Daily Kitchen Staples & Fresh Produce',
  },
  'gourmet-dry-fruits': {
    gradient: 'from-[#231505] via-[#3E240A] to-[#1C1A08]',
    badgeBg: 'bg-amber-500/15',
    badgeBorder: 'border-amber-400/40',
    badgeText: 'text-amber-300',
    orb1: 'bg-amber-400/25',
    orb2: 'bg-orange-500/25',
    orb3: 'bg-yellow-300/20',
    titleGradient: 'from-white via-amber-100 to-yellow-200',
    subtitle: 'Premium Hand-Selected Almonds, Walnuts, Pistachios, Figs & Pine Nuts from Northern Valleys',
  },
  'spices-herbs': {
    gradient: 'from-[#260C0C] via-[#431515] to-[#201007]',
    badgeBg: 'bg-rose-500/15',
    badgeBorder: 'border-rose-400/40',
    badgeText: 'text-rose-300',
    orb1: 'bg-rose-500/25',
    orb2: 'bg-amber-500/25',
    orb3: 'bg-red-400/20',
    titleGradient: 'from-white via-rose-100 to-amber-200',
    subtitle: 'Stone-Ground Traditional Masalas, Himalayan Pink Salt & Therapeutic Organic Herbs',
  },
  'home-living': {
    gradient: 'from-[#071C20] via-[#0E353B] to-[#0D2128]',
    badgeBg: 'bg-teal-500/15',
    badgeBorder: 'border-teal-400/40',
    badgeText: 'text-teal-300',
    orb1: 'bg-teal-400/25',
    orb2: 'bg-cyan-500/25',
    orb3: 'bg-emerald-400/20',
    titleGradient: 'from-white via-teal-100 to-cyan-200',
    subtitle: 'Luxury Bedding, Artisanal Ceramic Tableware & Contemporary Pakistani Home Decor',
  },
  'beauty-care': {
    gradient: 'from-[#260B23] via-[#42123D] to-[#180E28]',
    badgeBg: 'bg-fuchsia-500/15',
    badgeBorder: 'border-fuchsia-400/40',
    badgeText: 'text-fuchsia-300',
    orb1: 'bg-fuchsia-400/25',
    orb2: 'bg-pink-500/25',
    orb3: 'bg-rose-300/20',
    titleGradient: 'from-white via-fuchsia-100 to-rose-200',
    subtitle: 'Halal Certified Skincare, Pure Botanical Serums & Luxury Organic Cosmetics',
  },
};

const DEFAULT_BANNER_THEME: CategoryTheme = {
  gradient: 'from-[#060A16] via-[#0E1A33] via-[#0B2428] to-[#12142E]',
  badgeBg: 'bg-gradient-to-r from-emerald-500/20 via-cyan-500/20 to-violet-500/20',
  badgeBorder: 'border-white/20',
  badgeText: 'bg-gradient-to-r from-emerald-300 via-cyan-200 to-amber-300 bg-clip-text text-transparent',
  orb1: 'bg-emerald-400/25',
  orb2: 'bg-violet-500/25',
  orb3: 'bg-cyan-400/20',
  titleGradient: 'from-amber-200 via-emerald-200 via-cyan-200 to-violet-200',
  subtitle: 'Original products directly from verified shops and bazaars across Pakistan',
};

function matchesCategorySlug(productSlug?: string, targetSlug?: string): boolean {
  if (!targetSlug) return true;
  if (!productSlug) return false;
  if (productSlug === targetSlug) return true;

  // Strict Smartphones / Mobile Phones (No drones, headphones or watches)
  if (targetSlug === 'smartphones-gadgets') {
    return productSlug === 'smartphones-gadgets';
  }

  // Strict Laptops & Computers
  if (targetSlug === 'laptops-computers') {
    return productSlug === 'laptops-computers';
  }

  // Electronics & Gadgets (Audio, Smartwatches, Drones, Accessories)
  if (targetSlug === 'electronics-gadgets') {
    return productSlug === 'electronics-gadgets';
  }

  // Fashion & Apparel umbrella
  if (targetSlug === 'apparel-clothing') {
    return (
      productSlug === 'apparel-clothing' ||
      productSlug === 'mens-fashion' ||
      productSlug === 'womens-fashion' ||
      productSlug === 'shoes-footwear'
    );
  }
  if (targetSlug === 'mens-fashion') {
    return productSlug === 'mens-fashion';
  }
  if (targetSlug === 'womens-fashion') {
    return productSlug === 'womens-fashion';
  }
  if (targetSlug === 'shoes-footwear') {
    return productSlug === 'shoes-footwear';
  }

  // Grocery & Organics
  if (targetSlug === 'fresh-grocery') {
    return productSlug === 'fresh-grocery';
  }
  if (targetSlug === 'gourmet-dry-fruits') {
    return productSlug === 'gourmet-dry-fruits';
  }
  if (targetSlug === 'spices-herbs') {
    return productSlug === 'spices-herbs';
  }

  // Home & Living
  if (targetSlug === 'home-living') {
    return productSlug === 'home-living';
  }

  // Beauty & Personal Care
  if (targetSlug === 'beauty-care') {
    return productSlug === 'beauty-care';
  }

  // Sports & Fitness
  if (targetSlug === 'sports-fitness') {
    return productSlug === 'sports-fitness';
  }

  return false;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  // Concurrently resolve parameters and fetch data in parallel
  const [session, effectiveUserId, params, categories, allProducts] = await Promise.all([
    getSession(),
    getEffectiveUserIdReadOnly(),
    searchParams,
    getSupabaseCategories(),
    getSupabaseProducts(),
  ]);

  const rawQ = (params.search || params.q || '').trim();
  const categorySlug = params.category || '';
  const city = params.city || '';
  const storeSlug = params.store || '';
  const minPrice = params.minPrice ? parseFloat(params.minPrice) : undefined;
  const maxPrice = params.maxPrice ? parseFloat(params.maxPrice) : undefined;
  const sort = params.sort || (rawQ ? 'relevance' : 'featured');

  // Step 1: Apply Category, Store & Price Filters
  const nationwideFiltered = allProducts.filter((p) => {
    if (categorySlug && !matchesCategorySlug(p.category?.slug, categorySlug)) return false;
    if (storeSlug && p.store?.slug !== storeSlug) return false;
    if (minPrice !== undefined && !isNaN(minPrice) && p.basePrice < minPrice) return false;
    if (maxPrice !== undefined && !isNaN(maxPrice) && p.basePrice > maxPrice) return false;
    return true;
  });

  // Step 2: Strict Relevance Filtering
  const candidateProducts = rawQ
    ? nationwideFiltered.filter((product) => isStrictMatch(product as any, rawQ))
    : nationwideFiltered;

  // Step 3: Smart Hyper-Local City Filter with Nationwide Fallback
  const hasCityFilter = !!(city && city !== 'All Cities');
  let products = candidateProducts;
  let isUsingNationwideFallback = false;

  if (hasCityFilter) {
    const localMatches = candidateProducts.filter(
      (p) => p.store?.city?.toLowerCase() === city.toLowerCase()
    );

    if (localMatches.length > 0) {
      products = localMatches;
    } else {
      // No local stores in this city have items for this filter
      // Fall back to showing nationwide items with courier delivery so user gets results
      isUsingNationwideFallback = true;
      products = candidateProducts;
    }
  }

  // Step 4: Sorting & Relevance Ranking
  if (rawQ) {
    products.sort((a, b) => {
      const scoreA = calculateRelevanceScore(a as any, rawQ);
      const scoreB = calculateRelevanceScore(b as any, rawQ);

      if (sort === 'price_asc') return a.basePrice - b.basePrice;
      if (sort === 'price_desc') return b.basePrice - a.basePrice;
      if (sort === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();

      // Default: Highest relevance score first
      return scoreB - scoreA;
    });
  } else {
    if (sort === 'price_asc') products.sort((a, b) => a.basePrice - b.basePrice);
    else if (sort === 'price_desc') products.sort((a, b) => b.basePrice - a.basePrice);
    else if (sort === 'newest') products.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  // Active theme based on current category or search
  const currentCategoryData = categories.find((c) => c.slug === categorySlug);
  const theme = categorySlug ? CATEGORY_BANNER_THEMES[categorySlug] || DEFAULT_BANNER_THEME : DEFAULT_BANNER_THEME;

  return (
    <div className="min-h-screen bg-[#F8FAFC] relative overflow-hidden py-6 sm:py-8">
      {/* Ambient background glows across page */}
      <div className="absolute top-[15%] left-[-10%] w-[500px] h-[500px] bg-emerald-500/6 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-[45%] right-[-10%] w-[600px] h-[600px] bg-cyan-500/6 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute top-[75%] left-[5%] w-[550px] h-[550px] bg-amber-500/6 rounded-full blur-[110px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 space-y-6 relative z-10">
        {/* ========================================================================= */}
        {/* LUXURY DYNAMIC CATEGORY HERO BANNER WITH MULTI-SHADE AURORA              */}
        {/* ========================================================================= */}
        <div className={`relative overflow-hidden rounded-[32px] bg-gradient-to-r ${theme.gradient} border border-white/15 p-6 sm:p-10 shadow-[0_20px_60px_rgba(0,0,0,0.45)] text-white`}>
          {/* Animated Multi-Color Light Orbs inside Banner */}
          <div className={`absolute -top-16 -left-16 w-64 h-64 ${theme.orb1} rounded-full blur-[80px] pointer-events-none animate-float-slow`} />
          <div className={`absolute -bottom-16 -right-16 w-72 h-72 ${theme.orb2} rounded-full blur-[90px] pointer-events-none animate-float-reverse`} />
          <div className={`absolute top-1/2 left-1/3 -translate-y-1/2 w-56 h-56 ${theme.orb3} rounded-full blur-[85px] pointer-events-none animate-pulse-glow`} />
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.04] pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              {/* Category Pill with glowing live status */}
              <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full ${theme.badgeBg} border ${theme.badgeBorder} backdrop-blur-xl shadow-xs`}>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-80"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
                </span>
                {rawQ ? (
                  <Search className="w-3.5 h-3.5 text-cyan-300" />
                ) : (
                  <Layers className="w-3.5 h-3.5 text-amber-300" />
                )}
                <span className={`text-xs font-black tracking-wide ${theme.badgeText}`}>
                  {rawQ
                    ? `Search Query: "${rawQ}"`
                    : categorySlug && currentCategoryData
                    ? `Category: ${currentCategoryData.name}`
                    : 'All Verified Pakistani Marketplaces'}
                </span>
              </div>

              {/* Dynamic Headline */}
              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black font-display tracking-tight leading-tight">
                <span className={`bg-gradient-to-r ${theme.titleGradient} bg-clip-text text-transparent drop-shadow-md`}>
                  {categorySlug
                    ? currentCategoryData?.name || 'Products'
                    : rawQ
                    ? `Results for "${rawQ}"`
                    : 'All Products & Local Deals'}
                </span>
              </h1>

              {/* Subtitle Description */}
              <p className="text-xs sm:text-sm text-slate-200/90 leading-relaxed font-normal max-w-xl">
                {rawQ
                  ? `Showing original products matching "${rawQ}" from verified local shops in Pakistan.`
                  : theme.subtitle}
              </p>

              {/* Live Count & Location Badge */}
              <div className="flex flex-wrap items-center gap-2.5 pt-1">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 text-emerald-300 text-xs font-semibold">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Showing <strong className="text-white font-black">{products.length}</strong> verified {products.length === 1 ? 'item' : 'items'}
                  {hasCityFilter && !isUsingNationwideFallback ? ` in ${city}` : ' across Pakistan'}
                </span>

                {categorySlug && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 text-slate-300 text-xs">
                    ⚡ 100% Guaranteed Stock
                  </span>
                )}
              </div>
            </div>

            {/* Value Badges on the Right (Glassmorphic Luxury Cards) */}
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0">
              <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/5 border border-white/15 backdrop-blur-xl hover:bg-white/10 hover:border-white/30 transition shadow-lg group">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500/30 to-emerald-500/30 text-cyan-300 flex items-center justify-center border border-cyan-400/30 group-hover:scale-105 transition-transform">
                  <Truck className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <p className="text-[10px] text-cyan-300 uppercase tracking-wider font-extrabold">Express Rider</p>
                  <p className="text-xs font-black text-white">60-120 Min Delivery</p>
                </div>
              </div>

              <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/5 border border-white/15 backdrop-blur-xl hover:bg-white/10 hover:border-white/30 transition shadow-lg group">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500/30 to-rose-500/30 text-amber-300 flex items-center justify-center border border-amber-400/30 group-hover:scale-105 transition-transform">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <p className="text-[10px] text-amber-300 uppercase tracking-wider font-extrabold">Store Quality</p>
                  <p className="text-xs font-black text-white">CNIC & IBAN Verified</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Sidebar + Product Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Filter Sidebar */}
          <aside className="lg:col-span-3 sticky top-24">
            <React.Suspense fallback={<div className="p-6 bg-white rounded-3xl border border-slate-200 text-xs text-slate-400">Loading filters...</div>}>
              <ProductFilters categories={categories} totalProductsCount={products.length} />
            </React.Suspense>
          </aside>

          {/* Product Grid */}
          <div className="lg:col-span-9">
            <ProductGrid
              products={products as any}
              searchQuery={rawQ}
              currentUserId={effectiveUserId}
              activeCity={hasCityFilter ? city : undefined}
              activeCategoryName={currentCategoryData?.name}
              isUsingNationwideFallback={isUsingNationwideFallback}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
