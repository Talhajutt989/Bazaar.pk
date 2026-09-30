import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Store,
  Sparkles,
  Truck,
  ShieldCheck,
  TrendingUp,
  ArrowRight,
  Zap,
  MapPin,
  CheckCircle2,
  Package,
  Clock,
  Smartphone,
  Laptop,
  Apple,
  Nut,
  Flame,
  Shirt,
  Sparkle,
  Footprints,
  Home as HomeIcon,
  HeartHandshake,
  BadgeCheck,
  Percent,
  Compass,
  PhoneCall,
  ShoppingBag,
  Star,
  Users,
  Building2,
} from 'lucide-react';
import {
  getSupabaseCategories,
  getSupabaseStores,
  getSupabaseProducts,
} from '@/lib/supabase-service';
import { getSession, getEffectiveUserIdReadOnly } from '@/lib/auth';
import { ProductCard } from '@/components/products/ProductCard';
import { formatPKR } from '@/lib/utils';

// Multi-color category theme definitions with badges
const CATEGORY_THEMES: Record<string, {
  bg: string;
  hoverBg: string;
  textColor: string;
  borderColor: string;
  iconBg: string;
  icon: any;
  badge?: string;
  badgeColor?: string;
}> = {
  'smartphones-gadgets': {
    bg: 'bg-cyan-50/90',
    hoverBg: 'hover:bg-gradient-to-tr hover:from-cyan-600 hover:to-blue-600',
    textColor: 'text-cyan-900 group-hover:text-white',
    borderColor: 'border-cyan-200/90 hover:border-cyan-400',
    iconBg: 'bg-cyan-100 text-cyan-600 group-hover:bg-white/20 group-hover:text-white',
    icon: Smartphone,
    badge: 'Popular',
    badgeColor: 'bg-cyan-600 text-white',
  },
  'laptops-computers': {
    bg: 'bg-violet-50/90',
    hoverBg: 'hover:bg-gradient-to-tr hover:from-violet-600 hover:to-purple-600',
    textColor: 'text-violet-900 group-hover:text-white',
    borderColor: 'border-violet-200/90 hover:border-violet-400',
    iconBg: 'bg-violet-100 text-violet-600 group-hover:bg-white/20 group-hover:text-white',
    icon: Laptop,
    badge: 'Tech',
    badgeColor: 'bg-violet-600 text-white',
  },
  'electronics-gadgets': {
    bg: 'bg-blue-50/90',
    hoverBg: 'hover:bg-gradient-to-tr hover:from-blue-600 hover:to-indigo-600',
    textColor: 'text-blue-900 group-hover:text-white',
    borderColor: 'border-blue-200/90 hover:border-blue-400',
    iconBg: 'bg-blue-100 text-blue-600 group-hover:bg-white/20 group-hover:text-white',
    icon: Zap,
  },
  'fresh-grocery': {
    bg: 'bg-emerald-50/90',
    hoverBg: 'hover:bg-gradient-to-tr hover:from-emerald-600 hover:to-teal-600',
    textColor: 'text-emerald-900 group-hover:text-white',
    borderColor: 'border-emerald-200/90 hover:border-emerald-400',
    iconBg: 'bg-emerald-100 text-emerald-600 group-hover:bg-white/20 group-hover:text-white',
    icon: Apple,
    badge: 'Organic',
    badgeColor: 'bg-emerald-600 text-white',
  },
  'gourmet-dry-fruits': {
    bg: 'bg-amber-50/90',
    hoverBg: 'hover:bg-gradient-to-tr hover:from-amber-500 hover:to-orange-500',
    textColor: 'text-amber-900 group-hover:text-white',
    borderColor: 'border-amber-200/90 hover:border-amber-400',
    iconBg: 'bg-amber-100 text-amber-600 group-hover:bg-white/20 group-hover:text-white',
    icon: Nut,
    badge: 'Peshawar',
    badgeColor: 'bg-amber-600 text-white',
  },
  'spices-herbs': {
    bg: 'bg-rose-50/90',
    hoverBg: 'hover:bg-gradient-to-tr hover:from-rose-500 hover:to-amber-500',
    textColor: 'text-rose-900 group-hover:text-white',
    borderColor: 'border-rose-200/90 hover:border-rose-400',
    iconBg: 'bg-rose-100 text-rose-600 group-hover:bg-white/20 group-hover:text-white',
    icon: Flame,
  },
  'mens-fashion': {
    bg: 'bg-indigo-50/90',
    hoverBg: 'hover:bg-gradient-to-tr hover:from-indigo-600 hover:to-blue-700',
    textColor: 'text-indigo-900 group-hover:text-white',
    borderColor: 'border-indigo-200/90 hover:border-indigo-400',
    iconBg: 'bg-indigo-100 text-indigo-600 group-hover:bg-white/20 group-hover:text-white',
    icon: Shirt,
  },
  'womens-fashion': {
    bg: 'bg-pink-50/90',
    hoverBg: 'hover:bg-gradient-to-tr hover:from-pink-600 hover:to-rose-600',
    textColor: 'text-pink-900 group-hover:text-white',
    borderColor: 'border-pink-200/90 hover:border-pink-400',
    iconBg: 'bg-pink-100 text-pink-600 group-hover:bg-white/20 group-hover:text-white',
    icon: Sparkle,
    badge: 'Trendy',
    badgeColor: 'bg-pink-600 text-white',
  },
  'shoes-footwear': {
    bg: 'bg-orange-50/90',
    hoverBg: 'hover:bg-gradient-to-tr hover:from-orange-500 hover:to-amber-600',
    textColor: 'text-orange-900 group-hover:text-white',
    borderColor: 'border-orange-200/90 hover:border-orange-400',
    iconBg: 'bg-orange-100 text-orange-600 group-hover:bg-white/20 group-hover:text-white',
    icon: Footprints,
  },
  'home-living': {
    bg: 'bg-teal-50/90',
    hoverBg: 'hover:bg-gradient-to-tr hover:from-teal-600 hover:to-cyan-600',
    textColor: 'text-teal-900 group-hover:text-white',
    borderColor: 'border-teal-200/90 hover:border-teal-400',
    iconBg: 'bg-teal-100 text-teal-600 group-hover:bg-white/20 group-hover:text-white',
    icon: HomeIcon,
  },
  'beauty-care': {
    bg: 'bg-fuchsia-50/90',
    hoverBg: 'hover:bg-gradient-to-tr hover:from-fuchsia-600 hover:to-pink-600',
    textColor: 'text-fuchsia-900 group-hover:text-white',
    borderColor: 'border-fuchsia-200/90 hover:border-fuchsia-400',
    iconBg: 'bg-fuchsia-100 text-fuchsia-600 group-hover:bg-white/20 group-hover:text-white',
    icon: Sparkles,
  },
};

// City Hub Highlights
const CITY_HUBS = [
  { name: 'Lahore', markets: 'Hafeez Centre • Liberty • Anarkali', count: '45+ Shops', badge: 'Tech & Fashion' },
  { name: 'Karachi', markets: 'Saddar • Clifton • Tariq Road', count: '60+ Shops', badge: 'Wholesale & Imports' },
  { name: 'Islamabad', markets: 'Blue Area • F-7 Markaz • Centaurus', count: '30+ Shops', badge: 'Premium & Organic' },
  { name: 'Peshawar', markets: 'Namak Mandi • Karkhano Market', count: '25+ Shops', badge: 'Dry Fruits & Spices' },
  { name: 'Faisalabad', markets: 'Clock Tower • D-Ground', count: '20+ Shops', badge: 'Textiles & Decor' },
];

const STORE_ACCENTS: Record<string, { gradient: string; tagBg: string; tagText: string; ringColor: string }> = {
  'Lahore': {
    gradient: 'from-emerald-600 via-teal-600 to-cyan-600',
    tagBg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    tagText: 'Lahore Hub',
    ringColor: 'group-hover:border-emerald-300',
  },
  'Karachi': {
    gradient: 'from-cyan-600 via-teal-600 to-emerald-600',
    tagBg: 'bg-cyan-50 text-cyan-800 border-cyan-200',
    tagText: 'Karachi Hub',
    ringColor: 'group-hover:border-cyan-300',
  },
  'Islamabad': {
    gradient: 'from-violet-600 via-purple-600 to-indigo-600',
    tagBg: 'bg-violet-50 text-violet-800 border-violet-200',
    tagText: 'Islamabad Hub',
    ringColor: 'group-hover:border-violet-300',
  },
  'Peshawar': {
    gradient: 'from-amber-600 via-orange-600 to-rose-600',
    tagBg: 'bg-amber-50 text-amber-800 border-amber-200',
    tagText: 'Peshawar Hub',
    ringColor: 'group-hover:border-amber-300',
  },
  'Faisalabad': {
    gradient: 'from-pink-600 via-rose-600 to-amber-600',
    tagBg: 'bg-pink-50 text-pink-800 border-pink-200',
    tagText: 'Faisalabad Hub',
    ringColor: 'group-hover:border-pink-300',
  },
};

export const revalidate = 60;

export default async function HomePage() {
  const [session, effectiveUserId, categories, rawStores, products] = await Promise.all([
    getSession(),
    getEffectiveUserIdReadOnly(),
    getSupabaseCategories(),
    getSupabaseStores(),
    getSupabaseProducts({ limit: 36 }),
  ]);

  const stores = rawStores.map((s) => ({
    id: s.id,
    brandName: s.brand_name,
    slug: s.slug,
    brandAddress: s.brand_address,
    city: s.city,
    area: s.area,
    _count: { products: 12 },
  }));

  return (
    <div className="pb-24 bg-[#F8FAFC] relative overflow-hidden">
      {/* Background ambient lighting spheres */}
      <div className="absolute top-[12%] left-[-8%] w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none transform-gpu" />
      <div className="absolute top-[35%] right-[-8%] w-[550px] h-[550px] bg-violet-500/5 rounded-full blur-[110px] pointer-events-none transform-gpu" />
      <div className="absolute top-[60%] left-[8%] w-[450px] h-[450px] bg-amber-500/5 rounded-full blur-[100px] pointer-events-none transform-gpu" />
      <div className="absolute top-[80%] right-[5%] w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none transform-gpu" />

      {/* ========================================================================= */}
      {/* HERO SECTION - Premium Pakistani Hyperlocal Marketplace Experience       */}
      {/* ========================================================================= */}
      <section className="relative bg-gradient-to-b from-slate-900 via-slate-900 to-brand-950 text-white overflow-hidden py-14 sm:py-20 border-b border-slate-800 shadow-xl">
        {/* Glow Gradients */}
        <div className="absolute top-[-15%] left-[20%] w-[450px] h-[450px] bg-emerald-500/20 rounded-full blur-[90px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[15%] w-[400px] h-[400px] bg-teal-500/20 rounded-full blur-[90px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            
            {/* Left Hero Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              
              {/* Trust Tag */}
              <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/10 border border-white/15 backdrop-blur-xl shadow-inner">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-80" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400" />
                </span>
                <span className="text-xs sm:text-sm font-bold tracking-wide text-emerald-300">
                  Direct From Verified Shops • 60–120 Mins Dispatch
                </span>
                <Sparkles className="w-4 h-4 text-amber-400" />
              </div>

              {/* Main Headline */}
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight font-display leading-[1.12] text-white">
                Shop Directly From{' '}
                <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent block mt-1">
                  Pakistan's Real Bazaars
                </span>
              </h1>

              {/* Sub-Headline description */}
              <p className="text-slate-300 text-sm sm:text-base max-w-xl leading-relaxed mx-auto lg:mx-0 font-normal">
                Authentic electronics, fashion, fresh grocery, and pure dry fruits delivered directly from vetted local shops in <strong className="text-white font-bold">Lahore</strong>,{' '}
                <strong className="text-white font-bold">Karachi</strong>,{' '}
                <strong className="text-white font-bold">Islamabad</strong>,{' '}
                <strong className="text-white font-bold">Peshawar</strong> &{' '}
                <strong className="text-white font-bold">Faisalabad</strong>.
              </p>

              {/* City Quick Filter Chips */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 pt-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mr-1">
                  Popular Hubs:
                </span>
                {['All Cities', 'Lahore', 'Karachi', 'Islamabad', 'Peshawar', 'Faisalabad'].map((city) => (
                  <Link
                    key={city}
                    href={city === 'All Cities' ? '/products' : `/products?city=${encodeURIComponent(city)}`}
                    prefetch={true}
                    className="px-3 py-1 bg-white/10 hover:bg-emerald-500 hover:text-slate-950 text-slate-200 text-xs font-bold rounded-lg border border-white/10 transition-all duration-200 backdrop-blur-md"
                  >
                    {city}
                  </Link>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-3">
                <Link
                  href="/products"
                  prefetch={true}
                  className="px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-sm shadow-[0_4px_25px_rgba(16,185,129,0.4)] flex items-center gap-2.5 transition-all transform active:scale-95 hover:-translate-y-0.5"
                >
                  <ShoppingBag className="w-5 h-5" />
                  <span>Start Exploring Deals</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href="/vendor"
                  prefetch={true}
                  className="px-6 py-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm border border-white/20 flex items-center gap-2 transition-all transform active:scale-95 backdrop-blur-md hover:-translate-y-0.5"
                >
                  <Store className="w-5 h-5 text-emerald-400" />
                  <span>Sell Your Products</span>
                </Link>
              </div>

              {/* Trust Indicators Bar */}
              <div className="pt-6 border-t border-slate-800/80 grid grid-cols-3 gap-4 max-w-lg mx-auto lg:mx-0 text-left">
                <div>
                  <span className="text-2xl sm:text-3xl font-black text-emerald-400 font-display">
                    100%
                  </span>
                  <span className="block text-[11px] text-slate-400 font-medium">Original Products</span>
                </div>
                <div>
                  <span className="text-2xl sm:text-3xl font-black text-teal-300 font-display">
                    5 Cities
                  </span>
                  <span className="block text-[11px] text-slate-400 font-medium">Vetted Local Markets</span>
                </div>
                <div>
                  <span className="text-2xl sm:text-3xl font-black text-cyan-400 font-display">
                    COD Safe
                  </span>
                  <span className="block text-[11px] text-slate-400 font-medium">Doorstep Check</span>
                </div>
              </div>
            </div>

            {/* Right Hero Interactive Storefront Showcase Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative bg-slate-800/80 backdrop-blur-2xl rounded-[32px] p-6 shadow-2xl space-y-4 border border-slate-700/80 overflow-hidden">
                <div className="flex items-center justify-between border-b border-slate-700/80 pb-3.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                    <span className="text-xs font-black text-slate-200 tracking-wider">
                      FEATURED CITY STOREFRONTS
                    </span>
                  </div>
                  <span className="text-[10px] font-mono bg-emerald-500/20 border border-emerald-400/30 px-2.5 py-0.5 rounded-full text-emerald-300 font-bold">
                    ● OPEN & DISPATCHING
                  </span>
                </div>

                <div className="space-y-3">
                  {stores.slice(0, 4).map((st) => {
                    const accent = STORE_ACCENTS[st.city] || STORE_ACCENTS['Lahore'];
                    return (
                      <div
                        key={st.id}
                        className="bg-slate-900/80 hover:bg-slate-900 p-3.5 rounded-2xl border border-slate-700/60 flex items-center justify-between gap-3 hover:border-emerald-500/50 transition-all duration-300 group shadow-xs"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${accent.gradient} text-white flex items-center justify-center font-black shrink-0 shadow-md group-hover:scale-105 transition-transform`}
                          >
                            <Store className="w-5 h-5 text-white" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <h4 className="text-xs font-bold text-white truncate">{st.brandName}</h4>
                              <span className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded-md border ${accent.tagBg}`}>
                                {accent.tagText}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-400 flex items-center gap-1 truncate mt-0.5 font-medium">
                              <MapPin className="w-3 h-3 text-amber-400 shrink-0" /> {st.area}, {st.city}
                            </p>
                          </div>
                        </div>
                        <Link
                          href={`/store/${st.slug}`}
                          prefetch={true}
                          className={`px-3 py-1.5 bg-gradient-to-r ${accent.gradient} text-white font-bold rounded-lg text-[11px] shrink-0 transition-transform active:scale-95 shadow-xs`}
                        >
                          Visit
                        </Link>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-2 text-center border-t border-slate-700/80">
                  <p className="text-[11px] text-slate-300 flex items-center justify-center gap-1.5 font-medium">
                    <BadgeCheck className="w-4 h-4 text-emerald-400" />
                    Verified with 13-Digit Pakistani CNIC & Bank IBAN
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* WHY SHOP WITH US - 4 Core Pillars of Trust                               */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 -mt-6 relative z-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-md flex items-center gap-4 hover:-translate-y-1 transition-transform duration-200">
            <div className="w-12 h-12 rounded-2xl bg-cyan-50 text-cyan-600 border border-cyan-200 flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">Fast City Dispatch</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">60–120 mins local doorstep delivery</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-md flex items-center gap-4 hover:-translate-y-1 transition-transform duration-200">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">100% Genuine Guarantee</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">Direct from physical marketplace shops</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-md flex items-center gap-4 hover:-translate-y-1 transition-transform duration-200">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center shrink-0">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">Cash on Delivery</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">Pay after inspecting your parcel</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-md flex items-center gap-4 hover:-translate-y-1 transition-transform duration-200">
            <div className="w-12 h-12 rounded-2xl bg-violet-50 text-violet-600 border border-violet-200 flex items-center justify-center shrink-0">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">Hassle-Free Returns</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">7-Day complete buyer protection</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Sections with standard spacing */}
      <div className="space-y-16 mt-16">
        
        {/* ========================================================================= */}
        {/* CATEGORIES TAXONOMY - Modern Glassmorphic Category Grid                  */}
        {/* ========================================================================= */}
        <section className="max-w-7xl mx-auto px-4 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-slate-200 pb-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold uppercase tracking-wider border border-emerald-200 mb-1">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Shop By Category</span>
              </div>
              <h2 className="text-xl sm:text-3xl font-black text-slate-900 font-display tracking-tight">
                Explore Popular Categories
              </h2>
            </div>
            <Link
              href="/products"
              prefetch={true}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 group bg-emerald-50 px-3.5 py-1.5 rounded-xl border border-emerald-200 transition shadow-xs"
            >
              <span>View All Categories</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {categories.map((cat) => {
              const theme = CATEGORY_THEMES[cat.slug] || {
                bg: 'bg-slate-50/90',
                hoverBg: 'hover:bg-gradient-to-tr hover:from-slate-700 hover:to-slate-900',
                textColor: 'text-slate-900 group-hover:text-white',
                borderColor: 'border-slate-200/90 hover:border-slate-400',
                iconBg: 'bg-slate-100 text-slate-600 group-hover:bg-white/20 group-hover:text-white',
                icon: Package,
              };
              const IconComponent = theme.icon;

              return (
                <Link
                  key={cat.id}
                  href={`/products?category=${cat.slug}`}
                  prefetch={true}
                  className={`p-4 rounded-2xl ${theme.bg} ${theme.borderColor} border shadow-xs hover:shadow-xl text-center flex flex-col items-center justify-center gap-3 group transition-all duration-300 hover:-translate-y-1.5 relative overflow-hidden ${theme.hoverBg}`}
                >
                  {theme.badge && (
                    <span className={`absolute top-2 right-2 text-[9px] font-black px-1.5 py-0.5 rounded-full ${theme.badgeColor} shadow-xs`}>
                      {theme.badge}
                    </span>
                  )}
                  <div
                    className={`w-12 h-12 rounded-2xl ${theme.iconBg} flex items-center justify-center transition-all duration-300 group-hover:scale-110 shadow-xs`}
                  >
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <span className={`text-xs font-black ${theme.textColor} line-clamp-2 leading-tight transition-colors`}>
                    {cat.name}
                  </span>
                </Link>
              );
            })}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* FEATURED PRODUCTS - Today's Featured Deals & Top Sellers                  */}
        {/* ========================================================================= */}
        <section className="max-w-7xl mx-auto px-4 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-slate-200 pb-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-900 text-xs font-bold uppercase tracking-wider mb-1 border border-amber-200">
                <Zap className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                <span>Trending Deals</span>
              </div>
              <h2 className="text-xl sm:text-3xl font-black text-slate-900 font-display tracking-tight">
                Top Deals From Local Sellers
              </h2>
            </div>
            <Link
              href="/products"
              prefetch={true}
              className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:via-teal-500 hover:to-cyan-500 text-white font-extrabold text-xs rounded-xl shadow-[0_4px_15px_rgba(16,185,129,0.3)] transition transform active:scale-95 flex items-center gap-1.5"
            >
              <span>Browse Full Collection</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((p: any) => {
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
        </section>

        {/* ========================================================================= */}
        {/* CITY HUBS SPOTLIGHT - Top Local Bazaars                                  */}
        {/* ========================================================================= */}
        <section className="max-w-7xl mx-auto px-4 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-slate-200 pb-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-50 text-violet-900 text-xs font-bold uppercase tracking-wider border border-violet-200 mb-1">
                <Building2 className="w-3.5 h-3.5 text-violet-600" />
                <span>City Hubs & Bazaars</span>
              </div>
              <h2 className="text-xl sm:text-3xl font-black text-slate-900 font-display tracking-tight">
                Shop By Your City's Famous Markets
              </h2>
            </div>
            <Link
              href="/products"
              prefetch={true}
              className="text-xs font-bold text-violet-700 hover:text-violet-800 flex items-center gap-1 group bg-violet-50 px-3.5 py-1.5 rounded-xl border border-violet-200 transition shadow-xs"
            >
              <span>Explore All Markets</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {CITY_HUBS.map((hub) => (
              <Link
                key={hub.name}
                href={`/products?city=${encodeURIComponent(hub.name)}`}
                prefetch={true}
                className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-xl hover:border-emerald-400 group transition-all duration-300 hover:-translate-y-1 relative overflow-hidden"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                    {hub.badge}
                  </span>
                  <span className="text-[11px] font-bold text-emerald-600">
                    {hub.count}
                  </span>
                </div>
                <h3 className="text-base font-black text-slate-900 group-hover:text-emerald-700 transition-colors flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{hub.name}</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-1 font-medium">
                  {hub.markets}
                </p>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-700">
                  <span>Browse Hub</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* VENDOR STOREFRONTS - Featured Local Shops                                */}
        {/* ========================================================================= */}
        <section className="max-w-7xl mx-auto px-4 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-slate-200 pb-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-50 text-cyan-900 text-xs font-bold uppercase tracking-wider border border-cyan-200 mb-1">
                <Store className="w-3.5 h-3.5 text-cyan-600" />
                <span>Verified City Markets</span>
              </div>
              <h2 className="text-xl sm:text-3xl font-black text-slate-900 font-display tracking-tight">
                Featured Verified Shops
              </h2>
            </div>
            <Link
              href="/products"
              prefetch={true}
              className="text-xs font-bold text-cyan-700 hover:text-cyan-800 flex items-center gap-1 group bg-cyan-50 px-3.5 py-1.5 rounded-xl border border-cyan-200 transition"
            >
              <span>Explore All Stores</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {stores.map((store) => {
              const accent = STORE_ACCENTS[store.city] || STORE_ACCENTS['Lahore'];
              return (
                <Link
                  key={store.id}
                  href={`/store/${store.slug}`}
                  prefetch={true}
                  className={`bg-white rounded-[26px] border border-slate-200/90 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.06)] hover:shadow-[0_20px_40px_-10px_rgba(16,185,129,0.18)] p-5 flex flex-col justify-between group hover:-translate-y-1.5 transition-all duration-300 relative overflow-hidden ${accent.ringColor}`}
                >
                  <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${accent.gradient}`} />

                  <div className="space-y-3.5 pt-1">
                    <div className="flex items-start justify-between">
                      <div
                        className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${accent.gradient} text-white flex items-center justify-center font-black text-lg shadow-md group-hover:scale-105 transition-transform`}
                      >
                        <Store className="w-6 h-6" />
                      </div>
                      <span className="text-[11px] font-black bg-emerald-50 text-emerald-900 px-2.5 py-1 rounded-full border border-emerald-300 flex items-center gap-1 shadow-xs">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Verified Seller
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-black text-slate-900 group-hover:text-emerald-700 transition-colors">
                        {store.brandName}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 flex items-center gap-1 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span>{store.brandAddress}</span>
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-500">
                      {store._count.products} Products Available
                    </span>
                    <span className="font-extrabold text-emerald-700 flex items-center gap-1 group-hover:text-emerald-600 transition">
                      <span>Visit Shop</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1.5 transition-transform" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* VENDOR CTA BANNER - Grow Your Business with Bazaar.pk                     */}
        {/* ========================================================================= */}
        <section className="max-w-7xl mx-auto px-4">
          <div className="bg-gradient-to-r from-slate-900 via-brand-950 to-slate-900 rounded-[32px] p-8 sm:p-12 text-white relative overflow-hidden border border-emerald-500/30 shadow-2xl">
            <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-teal-500/15 rounded-full blur-3xl pointer-events-none" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
              <div className="lg:col-span-8 space-y-4 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-400/30">
                  <Store className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Merchant Onboarding Open</span>
                </div>
                <h2 className="text-2xl sm:text-4xl font-black font-display tracking-tight">
                  Grow Your Local Shop Across Pakistan
                </h2>
                <p className="text-slate-300 text-sm max-w-xl leading-relaxed">
                  Join hundreds of verified merchants in Lahore, Karachi, Islamabad, Peshawar & Faisalabad. Receive direct online orders with automated dispatch and instant payments.
                </p>
              </div>

              <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3 justify-center">
                <Link
                  href="/register/vendor"
                  prefetch={true}
                  className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs sm:text-sm text-center shadow-lg transition transform active:scale-95 flex items-center justify-center gap-2"
                >
                  <Store className="w-4 h-4" />
                  <span>Register Your Store</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/vendor"
                  prefetch={true}
                  className="px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm text-center border border-white/20 transition backdrop-blur-md flex items-center justify-center gap-2"
                >
                  <span>Merchant Portal Login</span>
                </Link>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
