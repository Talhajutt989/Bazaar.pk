'use client';

import React, { useState, useTransition, useEffect, useRef } from 'react';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import {
  ShoppingBag,
  Search,
  MapPin,
  Store,
  ShieldAlert,
  User,
  LogOut,
  ChevronDown,
  Menu,
  X,
  Layers,
  Sparkles,
  Home,
  ArrowRight,
  Tag,
  Zap,
  Headphones,
  Phone,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useSupport } from '@/context/SupportContext';
import { logoutUser } from '@/app/actions/auth';
import { CITIES_OF_PAKISTAN, formatPKR } from '@/lib/utils';
import { useToast } from '@/context/ToastContext';
import { VoiceSearchModal } from '@/components/search/VoiceSearchModal';

interface NavbarProps {
  session?: {
    userId: string;
    email: string;
    name: string | null;
    role: 'ADMIN' | 'VENDOR' | 'CUSTOMER';
    storeId?: string;
    storeName?: string;
  } | null;
  categories?: { id: string; name: string; slug: string }[];
}

export function Navbar({ session, categories = [] }: NavbarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const isHome = pathname === '/';
  const { totalCount, setIsOpen } = useCart();
  const { openSupport } = useSupport();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const [mounted, setMounted] = useState(false);
  const [selectedCity, setSelectedCity] = useState('All Cities');
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // Live Auto-Suggestions State
  const [suggestions, setSuggestions] = useState<{ products: any[]; categories: any[] } | null>(null);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const mobileSearchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    if (searchParams) {
      setSearchQuery(searchParams.get('search') || searchParams.get('q') || '');
      setSelectedCity(searchParams.get('city') || 'All Cities');
    }
  }, [searchParams]);

  // Handle outside click to close suggestions
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node) &&
        mobileSearchContainerRef.current &&
        !mobileSearchContainerRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch live suggestions on query change with debounce
  useEffect(() => {
    const query = searchQuery.trim();
    if (query.length < 2) {
      setSuggestions(null);
      setIsLoadingSuggestions(false);
      return;
    }

    setIsLoadingSuggestions(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          setSuggestions(data);
          setShowSuggestions(true);
        }
      } catch (err) {
        console.error('Error fetching search suggestions:', err);
      } finally {
        setIsLoadingSuggestions(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSuggestions(false);
    const query = searchQuery.trim();
    if (!query) {
      router.push('/products');
      return;
    }
    const params = new URLSearchParams();
    params.set('search', query);
    if (selectedCity && selectedCity !== 'All Cities') {
      params.set('city', selectedCity);
    }
    router.push(`/products?${params.toString()}`);
    setIsMobileMenuOpen(false);
  };

  const handleVoiceSearchResult = (spokenQuery: string) => {
    const query = spokenQuery.trim();
    if (!query) return;
    setSearchQuery(query);
    setShowSuggestions(false);
    const params = new URLSearchParams();
    params.set('search', query);
    if (selectedCity && selectedCity !== 'All Cities') {
      params.set('city', selectedCity);
    }
    router.push(`/products?${params.toString()}`);
    setIsMobileMenuOpen(false);
  };

  const handleCityChange = (city: string) => {
    setSelectedCity(city);
    if (city === 'All Cities') {
      router.push('/products');
    } else {
      router.push(`/products?city=${encodeURIComponent(city)}`);
    }
  };

  const handleLogout = () => {
    startTransition(async () => {
      try {
        await logoutUser();
        toast('Signed out successfully', 'info');
        setIsUserMenuOpen(false);
        setIsMobileMenuOpen(false);
        window.location.href = '/login';
      } catch (err) {
        console.error('Logout error:', err);
        window.location.href = '/login';
      }
    });
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-2xl border-b border-slate-200/90 text-slate-800 shadow-[0_4px_25px_-5px_rgba(0,0,0,0.06)]">
      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-3 md:gap-6">
        {/* Brand Logo */}
        <div className="flex items-center gap-3 shrink-0">
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 p-[2px] shadow-sm flex items-center justify-center group-hover:scale-105 transition-all duration-300">
              <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
                <Store className="w-5 h-5 text-emerald-600 group-hover:rotate-6 transition-transform" />
              </div>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-display font-black text-lg sm:text-xl tracking-tight text-slate-900 leading-none">
                  BAZAAR<span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">.PK</span>
                </span>
                <span className="bg-emerald-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded-md font-mono shadow-xs uppercase tracking-wider">
                  LOCAL
                </span>
              </div>
              <span className="text-[10px] font-semibold text-slate-500 tracking-wider uppercase hidden sm:block mt-0.5">
                Trusted Local Marketplace
              </span>
            </div>
          </Link>
        </div>

        {/* Unified Search Bar with Integrated City Selector */}
        <div ref={searchContainerRef} className="flex-1 max-w-2xl relative hidden sm:block">
          <form onSubmit={handleSearchSubmit} className="relative">
            <div className="relative flex items-center bg-slate-100/90 hover:bg-slate-100/95 focus-within:bg-white backdrop-blur-md rounded-2xl border border-slate-200 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 transition shadow-xs overflow-hidden">
              {/* Integrated City Selector */}
              <div className="hidden lg:flex items-center gap-1 px-3 py-2 bg-slate-200/60 border-r border-slate-200 shrink-0 text-slate-700 text-xs font-semibold hover:bg-slate-200/90 transition cursor-pointer">
                <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <select
                  value={selectedCity}
                  onChange={(e) => handleCityChange(e.target.value)}
                  className="bg-transparent text-slate-800 font-bold text-xs focus:outline-none cursor-pointer pr-1"
                >
                  {CITIES_OF_PAKISTAN.map((city) => (
                    <option key={city} value={city} className="bg-white text-slate-900 font-medium">
                      {city === 'All Cities' ? 'All Pakistan' : city}
                    </option>
                  ))}
                </select>
              </div>

              {/* Search Text Input */}
              <div className="relative flex-1 flex items-center">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onFocus={() => {
                    if (suggestions && (suggestions.products.length > 0 || suggestions.categories.length > 0)) {
                      setShowSuggestions(true);
                    }
                  }}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products, brands, stores..."
                  className="w-full bg-transparent text-slate-900 placeholder:text-slate-400 text-xs rounded-none pl-9 pr-24 py-2.5 focus:outline-none font-medium"
                />
              </div>

              {isLoadingSuggestions ? (
                <div className="mr-2 w-3.5 h-3.5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin pointer-events-none" />
              ) : null}

              {/* Voice & Search Buttons */}
              <div className="flex items-center gap-1 pr-1.5 shrink-0">
                <VoiceSearchModal
                  onSearch={handleVoiceSearchResult}
                  buttonSize="sm"
                  className="hover:bg-slate-200/70 rounded-xl p-1.5 text-slate-600 hover:text-emerald-700 transition"
                  iconClassName="text-slate-600"
                />
                <button
                  type="submit"
                  className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-extrabold text-xs rounded-xl transition-all shadow-xs active:scale-95"
                >
                  Search
                </button>
              </div>
            </div>
          </form>

          {/* Desktop Suggestions Popup */}
          {showSuggestions && suggestions && (suggestions.products.length > 0 || suggestions.categories.length > 0) && (
            <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50 animate-fadeIn text-slate-900">
              {/* Category Matches Header */}
              {suggestions.categories.length > 0 && (
                <div className="p-2.5 bg-slate-50 border-b border-slate-100 flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Matching Categories:</span>
                  {suggestions.categories.map((c) => (
                    <Link
                      key={c.id}
                      href={`/products?category=${c.slug}`}
                      onClick={() => setShowSuggestions(false)}
                      className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg text-xs font-semibold border border-emerald-200 transition"
                    >
                      {c.name}
                    </Link>
                  ))}
                </div>
              )}

              {/* Product Match Items */}
              {suggestions.products.length > 0 ? (
                <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                  {suggestions.products.map((p) => (
                    <Link
                      key={p.id}
                      href={`/products/${p.slug}`}
                      onClick={() => setShowSuggestions(false)}
                      className="flex items-center justify-between p-3 hover:bg-emerald-50/50 transition group"
                    >
                      <div className="flex items-center gap-3 min-w-0 pr-3">
                        {p.image ? (
                          <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                            <Image src={p.image} alt={p.title} fill className="object-cover" />
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 text-slate-400">
                            <Layers className="w-4 h-4" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 group-hover:text-emerald-700 transition truncate">
                            {p.title}
                          </p>
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-0.5">
                            <span className="font-semibold text-emerald-600">{p.brand || p.categoryName}</span>
                            <span>•</span>
                            <span className="truncate">{p.storeName} ({p.city})</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0 pl-3">
                        <span className="text-xs font-extrabold text-slate-900 block font-mono">
                          {formatPKR(p.basePrice)}
                        </span>
                        <span className="text-[10px] font-bold text-emerald-600 group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-0.5">
                          View <ArrowRight className="w-2.5 h-2.5" />
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-xs text-slate-500">
                  No direct products found for "{searchQuery}".
                </div>
              )}

              {/* View All Footer */}
              <div className="p-2 bg-slate-50 border-t border-slate-100 text-center">
                <button
                  type="button"
                  onClick={handleSearchSubmit}
                  className="text-xs font-bold text-emerald-700 hover:text-emerald-800 inline-flex items-center gap-1"
                >
                  <Search className="w-3 h-3" /> View all search results for &ldquo;{searchQuery}&rdquo;
                </button>
              </div>
            </div>
          )}
        </div>


        {/* Navigation Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Home Shortcut Button */}
          <Link
            href="/"
            title="Go to Home"
            className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-xs ${
              isHome
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200'
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span>Home</span>
          </Link>

          {/* Customer Support 24/7 Button */}
          <button
            type="button"
            onClick={openSupport}
            title="24/7 Customer Support Helpline: 0331-5242667"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200 transition shadow-xs active:scale-95"
          >
            <Headphones className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="hidden sm:inline font-bold">Support</span>
          </button>

          {/* Admin Dashboard Shortcut */}
          {session?.role === 'ADMIN' && (
            <Link
              href="/admin"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-violet-50 hover:bg-violet-100 text-violet-800 text-xs font-bold border border-violet-200 transition shadow-xs"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
              <span>Admin</span>
            </Link>
          )}

          {/* Vendor Dashboard Shortcut */}
          {session?.role === 'VENDOR' && (
            <Link
              href="/vendor"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white text-xs font-black shadow-sm transition-all transform active:scale-95 animate-pulse"
              title="Open your private seller portal (Only your added products & sales)"
            >
              <Store className="w-3.5 h-3.5 text-amber-300" />
              <span>Seller Portal</span>
            </Link>
          )}

          {/* Customer Orders Shortcut */}
          {session?.role === 'CUSTOMER' && (
            <Link
              href="/account/orders"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-50 hover:bg-cyan-100 text-cyan-800 text-xs font-bold border border-cyan-200 transition shadow-xs"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-cyan-600" />
              <span>Orders</span>
            </Link>
          )}

          {/* User Account Dropdown */}
          <div className="relative">
            {session ? (
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-800 text-xs font-bold border border-slate-200 transition shadow-xs"
              >
                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-amber-400 via-orange-400 to-amber-500 text-slate-950 font-black flex items-center justify-center text-xs shadow-xs ring-1 ring-amber-300">
                  {session.name ? session.name[0].toUpperCase() : 'U'}
                </div>
                <span className="hidden md:inline max-w-28 truncate font-semibold">{session.name || session.email}</span>
                <ChevronDown className="w-3 h-3 text-slate-500" />
              </button>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition transform active:scale-95"
              >
                <User className="w-3.5 h-3.5 text-white" />
                <span className="hidden sm:inline">Sign In</span>
              </Link>
            )}

            {/* Dropdown Menu */}
            {isUserMenuOpen && session && (
              <div className="absolute right-0 top-full mt-2 w-60 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 z-50 text-slate-900 text-xs animate-fadeIn">
                <div className="px-3.5 py-2 border-b border-slate-100">
                  <p className="font-extrabold text-slate-900 truncate">{session.name || 'User'}</p>
                  <p className="text-[11px] text-slate-500 truncate">{session.email}</p>
                  <span className="inline-block mt-1 bg-emerald-50 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-md border border-emerald-200">
                    Role: {session.role}
                  </span>
                </div>

                {session.role === 'ADMIN' && (
                  <Link
                    href="/admin"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center gap-2 px-3.5 py-2 hover:bg-slate-50 text-slate-700 font-semibold"
                  >
                    <ShieldAlert className="w-4 h-4 text-amber-500" /> Super Admin Portal
                  </Link>
                )}

                {session.role === 'VENDOR' && (
                  <>
                    <Link
                      href="/vendor"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2 px-3.5 py-2 hover:bg-slate-50 text-slate-700 font-semibold"
                    >
                      <Store className="w-4 h-4 text-emerald-600" /> Seller Dashboard
                    </Link>
                    <Link
                      href="/vendor/products/new"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold border-y border-emerald-100"
                    >
                      <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-black">+</span>
                      <span>Add New Product</span>
                    </Link>
                    <Link
                      href="/vendor/products"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2 px-3.5 py-2 hover:bg-slate-50 text-slate-700 font-semibold"
                    >
                      <Layers className="w-4 h-4 text-brand-700" /> Manage My Products
                    </Link>
                    <Link
                      href="/vendor/orders"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2 px-3.5 py-2 hover:bg-slate-50 text-slate-700 font-semibold"
                    >
                      <ShoppingBag className="w-4 h-4 text-teal-600" /> My Store Orders
                    </Link>
                  </>
                )}

                <Link
                  href="/account/orders"
                  onClick={() => setIsUserMenuOpen(false)}
                  className="flex items-center gap-2 px-3.5 py-2 hover:bg-slate-50 text-slate-700 font-medium"
                >
                  <ShoppingBag className="w-4 h-4 text-slate-400" /> My Orders & Reviews
                </Link>

                {/* 24/7 Helpline in Dropdown Menu */}
                <button
                  type="button"
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    openSupport();
                  }}
                  className="w-full text-left flex items-center justify-between px-3.5 py-2 hover:bg-emerald-50 text-emerald-800 font-bold border-t border-slate-100 transition"
                >
                  <div className="flex items-center gap-2">
                    <Headphones className="w-4 h-4 text-emerald-600" />
                    <span>Customer Support</span>
                  </div>
                  <span className="text-[10px] font-mono bg-emerald-100 text-emerald-900 px-1.5 py-0.5 rounded font-black">
                    0331-5242667
                  </span>
                </button>

                <button
                  onClick={handleLogout}
                  disabled={isPending}
                  className="w-full text-left flex items-center gap-2 px-3.5 py-2 hover:bg-rose-50 text-rose-600 border-t border-slate-100 mt-1 font-semibold"
                >
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </div>
            )}
          </div>

          {/* Cart Drawer Trigger Button */}
          <button
            onClick={() => setIsOpen(true)}
            className="relative p-2 sm:px-3.5 sm:py-2 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:via-teal-500 hover:to-cyan-500 text-white font-black transition-all flex items-center gap-1.5 shadow-[0_2px_12px_rgba(16,185,129,0.3)] group active:scale-95"
            aria-label="Shopping Cart"
          >
            <ShoppingBag className="w-4 h-4 group-hover:scale-110 transition-transform text-white" />
            <span className="text-xs hidden sm:inline font-black">Cart</span>
            {mounted && totalCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 font-black text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-md animate-pulse">
                {totalCount}
              </span>
            )}
          </button>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-1.5 text-slate-700 hover:text-slate-950 md:hidden"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Search & Navigation Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-slate-200 px-4 py-3 space-y-3 animate-fadeIn shadow-xl text-slate-800">
          <div ref={mobileSearchContainerRef} className="relative">
            <form onSubmit={handleSearchSubmit} className="relative flex items-center">
              <input
                type="text"
                value={searchQuery}
                onFocus={() => {
                  if (suggestions && (suggestions.products.length > 0 || suggestions.categories.length > 0)) {
                    setShowSuggestions(true);
                  }
                }}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search items, brands, stores..."
                className="w-full bg-slate-100 text-slate-900 text-xs rounded-xl pl-9 pr-10 py-2.5 border border-slate-200 focus:outline-none focus:border-emerald-500"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
              <div className="absolute right-1.5 flex items-center">
                <VoiceSearchModal
                  onSearch={handleVoiceSearchResult}
                  buttonSize="sm"
                  className="hover:bg-slate-200 rounded-lg p-1 text-slate-600"
                  iconClassName="text-slate-600"
                />
              </div>
            </form>

            {/* Mobile Suggestions Popup */}
            {showSuggestions && suggestions && (suggestions.products.length > 0 || suggestions.categories.length > 0) && (
              <div className="absolute left-0 right-0 top-full mt-1 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden z-50 text-slate-900 max-h-60 overflow-y-auto">
                {suggestions.products.map((p) => (
                  <Link
                    key={p.id}
                    href={`/products/${p.slug}`}
                    onClick={() => {
                      setShowSuggestions(false);
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center justify-between p-2 hover:bg-slate-50 border-b border-slate-100 last:border-none"
                  >
                    <div className="min-w-0 pr-2">
                      <p className="text-xs font-bold text-slate-900 truncate">{p.title}</p>
                      <span className="text-[10px] text-slate-500">{p.brand || p.categoryName}</span>
                    </div>
                    <span className="text-xs font-extrabold text-emerald-700 shrink-0 font-mono">
                      {formatPKR(p.basePrice)}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between text-xs text-slate-600 py-1 border-b border-slate-200">
            <span>Filter City:</span>
            <select
              value={selectedCity}
              onChange={(e) => handleCityChange(e.target.value)}
              className="bg-slate-100 text-slate-900 rounded-lg px-2 py-1 text-xs border border-slate-300"
            >
              {CITIES_OF_PAKISTAN.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-semibold pt-1">
            <Link
              href="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`p-2 rounded-xl text-center flex items-center justify-center gap-1.5 ${
                isHome
                  ? 'bg-emerald-600 text-white font-bold'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Home className="w-3.5 h-3.5" /> Home
            </Link>
            <Link
              href="/products"
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 bg-slate-100 rounded-xl text-slate-700 hover:bg-slate-200 text-center flex items-center justify-center gap-1.5"
            >
              <Layers className="w-3.5 h-3.5" /> All Products
            </Link>
            <Link
              href="/vendor"
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 bg-slate-100 rounded-xl text-slate-700 hover:bg-slate-200 text-center"
            >
              Vendor Dashboard
            </Link>
            <Link
              href="/admin"
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 bg-slate-100 rounded-xl text-slate-700 hover:bg-slate-200 text-center"
            >
              Admin Suite
            </Link>
            <Link
              href="/account/orders"
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 bg-slate-100 rounded-xl text-slate-700 hover:bg-slate-200 text-center"
            >
              My Orders
            </Link>

            {/* Customer Support Mobile Quick Action */}
            <button
              type="button"
              onClick={() => {
                setIsMobileMenuOpen(false);
                openSupport();
              }}
              className="col-span-2 p-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-extrabold rounded-xl text-center shadow-md flex items-center justify-center gap-2"
            >
              <Headphones className="w-4 h-4" />
              <span>Customer Support (0331-5242667)</span>
            </button>
            {session ? (
              <button
                onClick={handleLogout}
                className="p-2 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 hover:bg-rose-100 text-center flex items-center justify-center gap-1 font-bold"
              >
                <LogOut className="w-3.5 h-3.5" /> Sign Out
              </button>
            ) : (
              <Link
                href="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 bg-slate-900 text-white font-bold rounded-xl text-center shadow-xs"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Sleek Category Subheader Ribbon */}
      <div className="bg-slate-50/95 border-t border-slate-200/80 px-4 py-1.5 hidden md:block overflow-x-auto no-scrollbar">
        <div className="max-w-7xl mx-auto flex items-center gap-2 text-xs">
          {/* Home Link */}
          <Link
            href="/"
            className={`flex items-center gap-1.5 px-3 py-1 rounded-xl font-bold transition-all shrink-0 ${
              isHome
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white hover:bg-slate-100 text-slate-700 hover:text-emerald-800 border border-slate-200/80 shadow-xs'
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span>Home</span>
          </Link>

          {(() => {
            const currentCity = searchParams?.get('city');
            const cityQuery = currentCity && currentCity !== 'All Cities' ? `?city=${encodeURIComponent(currentCity)}` : '';
            return (
              <Link
                href={`/products${cityQuery}`}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-xl font-bold transition-all shrink-0 ${
                  pathname === '/products' && !searchParams?.get('category')
                    ? 'bg-emerald-100 text-emerald-900 border border-emerald-300 shadow-xs font-bold'
                    : 'bg-white hover:bg-slate-100 text-slate-700 hover:text-emerald-800 border border-slate-200/80 shadow-xs'
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-emerald-600" />
                <span>All Products</span>
              </Link>
            );
          })()}

          <div className="h-3.5 w-[1px] bg-slate-300 shrink-0 mx-1" />

          {categories.slice(0, 9).map((cat) => {
            const currentCat = searchParams?.get('category');
            const isActive = currentCat === cat.slug;
            const currentCity = searchParams?.get('city');
            const cityParam = currentCity && currentCity !== 'All Cities' ? `&city=${encodeURIComponent(currentCity)}` : '';
            return (
              <Link
                key={cat.id}
                href={`/products?category=${cat.slug}${cityParam}`}
                className={`px-3 py-1 rounded-xl transition-all shrink-0 whitespace-nowrap text-xs flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold shadow-xs'
                    : 'bg-white hover:bg-slate-100 text-slate-700 hover:text-emerald-800 border border-slate-200/80 shadow-xs'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                <span>{cat.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </header>
  );
}
