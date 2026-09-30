'use client';

import React from 'react';
import Link from 'next/link';
import { Store, ShieldCheck, Truck, Headphones, Sparkles, ArrowRight, CheckCircle2, Phone, MessageCircle } from 'lucide-react';
import { useSupport, ADMIN_SUPPORT_PHONE_FORMATTED } from '@/context/SupportContext';

export function Footer() {
  const { openSupport } = useSupport();

  return (
    <footer className="bg-white text-slate-600 border-t border-slate-200 mt-24 relative overflow-hidden">
      {/* Subtle background ambient glows */}
      <div className="absolute bottom-0 left-1/4 w-[500px] h-[300px] bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-0 right-1/4 w-[400px] h-[300px] bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Value Proposition Strip */}
      <div className="border-b border-slate-200/80 py-8 px-4 bg-slate-50/70 backdrop-blur-sm relative z-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 text-left">
          <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600 border border-emerald-200 shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Express City Delivery</h4>
              <p className="text-xs text-slate-500 mt-0.5">Fast local dispatch from shops in your city</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600 border border-emerald-200 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Verified Local Sellers</h4>
              <p className="text-xs text-slate-500 mt-0.5">CNIC & Pakistani bank account vetted</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <div className="p-3 bg-amber-50 rounded-xl text-amber-600 border border-amber-200 shrink-0">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Safe Buyer Protection</h4>
              <p className="text-xs text-slate-500 mt-0.5">Doorstep check & easy returns guarantee</p>
            </div>
          </div>

          {/* 24/7 Live Support Card */}
          <div
            onClick={openSupport}
            className="flex items-center gap-3.5 p-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 cursor-pointer transition-all group shadow-xs"
          >
            <div className="p-3 bg-emerald-100 rounded-xl text-emerald-700 border border-emerald-300 shrink-0 group-hover:scale-105 transition-transform">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h4 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">24/7 Helpline</h4>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <p className="text-xs text-emerald-700 font-mono font-bold mt-0.5">
                {ADMIN_SUPPORT_PHONE_FORMATTED} (Call / WhatsApp)
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 py-14 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-10 text-xs relative z-10">
        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white font-bold shadow-xs">
              <Store className="w-5 h-5 text-white" />
            </div>
            <span className="font-extrabold text-lg tracking-tight text-slate-900 font-display">
              BAZAAR<span className="text-emerald-600">.PK</span>
            </span>
          </div>
          <p className="text-slate-500 leading-relaxed max-w-sm text-xs">
            Pakistan's trusted marketplace connecting authentic neighborhood shops and bazaars directly with
            buyers across Lahore, Karachi, Islamabad, Rawalpindi, Peshawar, and Faisalabad.
          </p>
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <span className="bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-xl text-slate-700 font-medium">
              🇵🇰 Built for Pakistan
            </span>
            <span className="bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl text-emerald-800 font-bold">
              ⚡ Direct From Local Shops
            </span>
          </div>
        </div>

        <div>
          <h5 className="font-bold text-slate-900 uppercase tracking-wider mb-4 text-xs flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Top Categories
          </h5>
          <ul className="space-y-2.5 text-slate-600">
            <li>
              <Link href="/products?category=smartphones-gadgets" className="hover:text-emerald-600 transition-colors">
                Smartphones & Gadgets
              </Link>
            </li>
            <li>
              <Link href="/products?category=fresh-grocery" className="hover:text-emerald-600 transition-colors">
                Fresh Grocery & Organics
              </Link>
            </li>
            <li>
              <Link href="/products?category=gourmet-dry-fruits" className="hover:text-emerald-600 transition-colors">
                Dry Fruits & Spices
              </Link>
            </li>
            <li>
              <Link href="/products?category=mens-fashion" className="hover:text-emerald-600 transition-colors">
                Men's Fashion & Footwear
              </Link>
            </li>
            <li>
              <Link href="/products?category=home-living" className="hover:text-emerald-600 transition-colors">
                Home Decor & Handicrafts
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h5 className="font-bold text-slate-900 uppercase tracking-wider mb-4 text-xs flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Sell & Partner
          </h5>
          <ul className="space-y-2.5 text-slate-600">
            <li>
              <Link href="/vendor" className="hover:text-amber-700 transition-colors font-semibold text-emerald-700">
                Seller Dashboard
              </Link>
            </li>
            <li>
              <Link href="/vendor/products/new" className="hover:text-emerald-600 transition-colors">
                Add New Product
              </Link>
            </li>
            <li>
              <Link href="/vendor/kyc" className="hover:text-emerald-600 transition-colors">
                Seller Verification (CNIC)
              </Link>
            </li>
            <li>
              <Link href="/admin" className="hover:text-amber-700 transition-colors text-slate-600">
                Admin Portal
              </Link>
            </li>
            <li className="pt-1">
              <button
                type="button"
                onClick={openSupport}
                className="hover:text-emerald-800 transition-colors text-emerald-700 font-bold flex items-center gap-1.5 text-left"
              >
                <Headphones className="w-3.5 h-3.5 text-amber-500" />
                <span>Customer Helpline: {ADMIN_SUPPORT_PHONE_FORMATTED}</span>
              </button>
            </li>
          </ul>
        </div>

        <div>
          <h5 className="font-bold text-slate-900 uppercase tracking-wider mb-4 text-xs flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Payment Methods
          </h5>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <span className="bg-slate-100 border border-slate-200 p-2.5 rounded-xl text-center font-bold text-slate-800">
                Cash On Delivery
              </span>
              <span className="bg-amber-50 border border-amber-200 p-2.5 rounded-xl text-center font-bold text-amber-800">
                JazzCash
              </span>
              <span className="bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl text-center font-bold text-emerald-800">
                EasyPaisa
              </span>
              <span className="bg-teal-50 border border-teal-200 p-2.5 rounded-xl text-center font-bold text-teal-800">
                SadaPay
              </span>
            </div>
            <p className="text-[10px] text-slate-500 leading-normal">
              Direct bank transfers supported for HBL, Meezan, Bank Alfalah, and Standard Chartered.
            </p>
          </div>
        </div>
      </div>

      {/* Copyright Strip */}
      <div className="border-t border-slate-200 py-5 px-4 text-center text-xs text-slate-500 relative z-10 bg-slate-50">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>&copy; {new Date().getFullYear()} Bazaar.pk. Connecting Local Pakistani Markets With Shoppers Nationwide.</span>
          <span className="flex items-center gap-1.5 text-emerald-700 font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" /> 100% Genuine Products Guaranteed
          </span>
        </div>
      </div>
    </footer>
  );
}

