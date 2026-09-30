'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Store,
  ShieldCheck,
  MapPin,
  ArrowRight,
  Zap,
  Bot,
  RefreshCw,
  Search,
  CheckCircle2,
  ChevronRight,
  Send,
  Sliders,
  DollarSign,
  Package,
  Layers,
} from 'lucide-react';
import { PlatformGrowthIntelligence, SellerPerformanceMetric } from '@/lib/ai-seller-analytics';
import { askAIGrowthAdvisor, applySellerGrowthBoost } from '@/app/actions/admin-ai';
import { formatPKR } from '@/lib/utils';
import { useToast } from '@/context/ToastContext';

interface AISellerGrowthIntelligenceProps {
  initialAnalytics: PlatformGrowthIntelligence;
}

export function AISellerGrowthIntelligence({ initialAnalytics }: AISellerGrowthIntelligenceProps) {
  const { toast } = useToast();
  const [analytics, setAnalytics] = useState(initialAnalytics);
  const [activeTab, setActiveTab] = useState<'comparison' | 'matrix' | 'advisor' | 'playbook'>('comparison');
  const [selectedCity, setSelectedCity] = useState('ALL');
  const [selectedTier, setSelectedTier] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Interactive AI Q&A State
  const [promptInput, setPromptInput] = useState('');
  const [aiAnswer, setAiAnswer] = useState<{
    answer: string;
    recommendedAction: string;
    relevantSellers: string[];
  } | null>(null);
  const [isAskingAi, startAiTransition] = useTransition();
  const [isApplyingBoost, startBoostTransition] = useTransition();

  const handleAskAi = (promptToUse?: string) => {
    const q = (promptToUse || promptInput).trim();
    if (!q) return;

    if (promptToUse) {
      setPromptInput(promptToUse);
    }

    startAiTransition(async () => {
      const res = await askAIGrowthAdvisor(q);
      if (res.success) {
        setAiAnswer({
          answer: res.answer,
          recommendedAction: res.recommendedAction,
          relevantSellers: res.relevantSellers,
        });
        setActiveTab('advisor');
        toast('AI Analysis Generated!', 'success');
      } else {
        toast(res.error || 'Failed to query AI Advisor', 'error');
      }
    });
  };

  const handleApplyBoost = (storeId: string, storeName: string, boostType: 'COMMISSION_DISCOUNT' | 'FEATURED_BADGE' | 'SPONSORED_SLOT') => {
    startBoostTransition(async () => {
      const res = await applySellerGrowthBoost(storeId, boostType);
      if (res.success) {
        toast(`✨ Boost Applied to ${storeName}: ${res.message}`, 'success');
      } else {
        toast(res.error || 'Failed to apply boost', 'error');
      }
    });
  };

  // Combine all sellers for filtering
  const allSellers: SellerPerformanceMetric[] = [
    ...analytics.topGrowingSellers,
    ...analytics.steadySellers,
    ...analytics.lowPerformingSellers,
  ];

  // Distinct cities
  const cities = Array.from(new Set(allSellers.map((s) => s.city)));

  // Filtered sellers for matrix
  const filteredSellers = allSellers.filter((s) => {
    if (selectedCity !== 'ALL' && s.city !== selectedCity) return false;
    if (selectedTier !== 'ALL' && s.performanceTier !== selectedTier) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        s.brandName.toLowerCase().includes(q) ||
        s.city.toLowerCase().includes(q) ||
        s.primaryCategory.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* 1. Executive AI Glow Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-emerald-950 to-slate-900 border-2 border-emerald-500/40 p-6 sm:p-8 shadow-2xl shadow-emerald-950/40 text-white">
        {/* Ambient Glows */}
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-bold tracking-wide backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              <span>Hyperlocal Intelligence Engine • Live Diagnostics</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black font-display tracking-tight bg-gradient-to-r from-white via-slate-100 to-emerald-200 bg-clip-text text-transparent">
              Merchant Growth Velocity & Performance Index
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
              {analytics.executiveAISummary}
            </p>

            <div className="flex flex-wrap items-center gap-2.5 pt-1 text-xs">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-400/30 shadow-xs">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                <span>High-Growth Leaders: {analytics.topGrowingSellers.length} Stores</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 font-bold border border-amber-400/30 shadow-xs">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                <span>Optimization Pipeline: {analytics.lowPerformingSellers.length} Store</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 text-slate-200 font-bold border border-white/15 backdrop-blur-sm shadow-xs">
                <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                <span>Top Hubs: {analytics.topCityGrowthHub}</span>
              </span>
            </div>
          </div>

          {/* Quick AI Action Ask Button */}
          <div className="shrink-0 flex flex-col sm:flex-row lg:flex-col gap-2.5">
            <button
              onClick={() => handleAskAi('Which sellers have lowest sales and what is the exact turnaround strategy?')}
              disabled={isAskingAi}
              className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 transition"
            >
              <Bot className="w-4 h-4" />
              <span>Ask AI: Diagnose Low Sellers</span>
            </button>

            <button
              onClick={() => handleAskAi('Summarize top high growth sellers and their winning strategies')}
              disabled={isAskingAi}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl border border-white/20 flex items-center justify-center gap-2 transition backdrop-blur-sm"
            >
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Spotlight Top Champions</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Interactive Navigation Tabs */}
      <div className="flex items-center justify-between gap-3 border-b-2 border-brand-800/20 pb-1 overflow-x-auto">
        <div className="flex items-center gap-2 text-xs font-bold">
          <button
            onClick={() => setActiveTab('comparison')}
            className={`px-4 py-2 rounded-xl transition flex items-center gap-1.5 ${
              activeTab === 'comparison'
                ? 'bg-brand-900 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100'
            }`}
          >
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            <span>High vs. Low Comparison</span>
          </button>

          <button
            onClick={() => setActiveTab('matrix')}
            className={`px-4 py-2 rounded-xl transition flex items-center gap-1.5 ${
              activeTab === 'matrix'
                ? 'bg-brand-900 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Store className="w-4 h-4 text-brand-600" />
            <span>Complete Sellers Leaderboard ({allSellers.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('playbook')}
            className={`px-4 py-2 rounded-xl transition flex items-center gap-1.5 ${
              activeTab === 'playbook'
                ? 'bg-brand-900 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Zap className="w-4 h-4 text-amber-500" />
            <span>AI Strategic Playbook</span>
          </button>

          <button
            onClick={() => setActiveTab('advisor')}
            className={`px-4 py-2 rounded-xl transition flex items-center gap-1.5 ${
              activeTab === 'advisor'
                ? 'bg-brand-900 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Bot className="w-4 h-4 text-purple-600" />
            <span>Interactive AI Advisor Q&amp;A</span>
          </button>
        </div>
      </div>

      {/* 3. TAB CONTENT 1: SIDE-BY-SIDE HIGH VS LOW COMPARISON */}
      {activeTab === 'comparison' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT COLUMN: TOP HIGH-GROWTH CHAMPIONS */}
          <div className="lg:col-span-6 space-y-4">
            <div className="bg-emerald-50 border-2 border-emerald-500/30 p-4 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-extrabold shadow-sm">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-emerald-950">🚀 High-Growth Sales Champions</h3>
                  <p className="text-[11px] text-emerald-800">Merchants with highest order velocity &amp; rising demand</p>
                </div>
              </div>
              <span className="bg-emerald-200 text-emerald-900 text-xs font-extrabold px-2.5 py-0.5 rounded-full">
                {analytics.topGrowingSellers.length} Top Stores
              </span>
            </div>

            <div className="space-y-3">
              {analytics.topGrowingSellers.map((seller, idx) => (
                <div
                  key={seller.id}
                  className="bg-white rounded-2xl border-2 border-emerald-500/20 p-5 shadow-sm space-y-3 hover:border-emerald-500/40 transition"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 font-extrabold flex items-center justify-center text-xs">
                        #{idx + 1}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-sm text-slate-900">{seller.brandName}</span>
                          <span className="bg-emerald-100 text-emerald-900 text-[10px] font-bold px-2 py-0.2 rounded-full flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3 text-emerald-700" /> Verified
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-emerald-600" /> {seller.city} • {seller.primaryCategory}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-xs">
                        +{seller.growthRatePct}% MoM Growth
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">Growth Score: {seller.growthScore}/100</span>
                    </div>
                  </div>

                  {/* Metrics Row */}
                  <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-slate-50 text-[11px]">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Catalog Size</span>
                      <strong className="text-slate-800 font-bold">{seller.totalProducts} Listings</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Customer Rating</span>
                      <strong className="text-amber-600 font-bold">★ {seller.averageRating} ({seller.reviewCount || 12} reviews)</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Estimated Inventory</span>
                      <strong className="text-slate-800 font-bold font-mono">{formatPKR(seller.inventoryValue)}</strong>
                    </div>
                  </div>

                  {/* Key Strengths */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                      Why This Seller is Winning:
                    </span>
                    <ul className="text-xs text-slate-700 space-y-1">
                      {seller.keyStrengths.map((strength, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* AI Recommendation */}
                  <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-950 flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                    <div>
                      <strong className="font-bold block">AI Growth Action:</strong>
                      <p className="text-emerald-900 mt-0.5">{seller.aiActionRecommendation}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT COLUMN: LOW-SALES & AT-RISK MERCHANTS */}
          <div className="lg:col-span-6 space-y-4">
            <div className="bg-rose-50 border-2 border-rose-500/30 p-4 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-rose-700 text-white flex items-center justify-center font-extrabold shadow-sm">
                  <TrendingDown className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-rose-950">⚠️ Low-Growth &amp; Lagging Sellers</h3>
                  <p className="text-[11px] text-rose-800">Merchants experiencing sales drops or low discovery</p>
                </div>
              </div>
              <span className="bg-rose-200 text-rose-900 text-xs font-extrabold px-2.5 py-0.5 rounded-full">
                {analytics.lowPerformingSellers.length} Stores Flagged
              </span>
            </div>

            <div className="space-y-3">
              {analytics.lowPerformingSellers.map((seller, idx) => (
                <div
                  key={seller.id}
                  className="bg-white rounded-2xl border-2 border-rose-500/20 p-5 shadow-sm space-y-3 hover:border-rose-500/40 transition"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-800 font-extrabold flex items-center justify-center text-xs">
                        ⚠️
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-sm text-slate-900">{seller.brandName}</span>
                          <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-2 py-0.2 rounded-full">
                            Needs Boost
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-rose-600" /> {seller.city} • {seller.primaryCategory}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="inline-block px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 font-extrabold text-xs">
                        {seller.growthRatePct}% Sales Drop
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">Health Score: {seller.growthScore}/100</span>
                    </div>
                  </div>

                  {/* Diagnostic Root-Causes */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-extrabold text-rose-800 uppercase tracking-wider block">
                      AI Diagnostic Root-Causes:
                    </span>
                    <ul className="text-xs text-slate-700 space-y-1">
                      {seller.diagnosticIssues.map((issue, i) => (
                        <li key={i} className="flex items-start gap-1.5 text-rose-900">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                          <span>{issue}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* AI Turnaround Action & 1-Click Trigger */}
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-950 space-y-2">
                    <div className="flex items-start gap-2">
                      <Bot className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                      <div>
                        <strong className="font-bold block">AI Turnaround Recommendation:</strong>
                        <p className="text-amber-900 mt-0.5">{seller.aiActionRecommendation}</p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-amber-200/60 flex items-center justify-between gap-2">
                      <span className="text-[10px] text-slate-500 font-medium">Quick Intervention:</span>
                      <button
                        type="button"
                        disabled={isApplyingBoost}
                        onClick={() => handleApplyBoost(seller.id, seller.brandName, 'COMMISSION_DISCOUNT')}
                        className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-[11px] rounded-lg transition shadow-xs flex items-center gap-1"
                      >
                        <Zap className="w-3 h-3" />
                        <span>Apply 5% Commission Relief</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 4. TAB CONTENT 2: COMPLETE LEADERBOARD & MATRIX */}
      {activeTab === 'matrix' && (
        <div className="bg-white rounded-2xl border-2 border-brand-800/20 p-6 shadow-sm space-y-5">
          {/* Filter Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter by seller, city, category..."
                  className="bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-brand-600"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              </div>

              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-700"
              >
                <option value="ALL">📍 All Cities</option>
                {cities.map((c) => (
                  <option key={c} value={c}>
                    📍 {c}
                  </option>
                ))}
              </select>

              <select
                value={selectedTier}
                onChange={(e) => setSelectedTier(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-700"
              >
                <option value="ALL">⚡ All Performance Tiers</option>
                <option value="HYPER_GROWTH">🚀 Hyper-Growth</option>
                <option value="STEADY_MOMENTUM">📈 Steady Momentum</option>
                <option value="LOW_PERFORMING">⚠️ Low Performing</option>
                <option value="AT_RISK">🚨 At Risk</option>
              </select>
            </div>

            <span className="text-xs font-bold text-slate-500">
              Showing {filteredSellers.length} of {allSellers.length} Verified Merchants
            </span>
          </div>

          {/* Matrix Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">Rank &amp; Seller</th>
                  <th className="p-3">City Hub</th>
                  <th className="p-3">Primary Vertical</th>
                  <th className="p-3">Growth Velocity</th>
                  <th className="p-3">Health Score</th>
                  <th className="p-3">Catalog Size</th>
                  <th className="p-3">Performance Tier</th>
                  <th className="p-3 text-right">Intervention</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSellers.map((seller, idx) => {
                  const isHigh = seller.performanceTier === 'HYPER_GROWTH';
                  const isLow = seller.performanceTier === 'LOW_PERFORMING' || seller.performanceTier === 'AT_RISK';
                  return (
                    <tr key={seller.id} className="hover:bg-slate-50/80 transition">
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <span className="font-bold font-mono text-slate-400">#{idx + 1}</span>
                          <div>
                            <span className="font-extrabold text-slate-900 block">{seller.brandName}</span>
                            <span className="text-[10px] text-slate-500">Commission: {(seller.commissionRate * 100).toFixed(0)}%</span>
                          </div>
                        </div>
                      </td>

                      <td className="p-3">📍 {seller.city}</td>
                      <td className="p-3 font-semibold text-slate-700">{seller.primaryCategory}</td>

                      <td className="p-3">
                        <span
                          className={`font-extrabold ${
                            seller.growthRatePct >= 0 ? 'text-emerald-700' : 'text-rose-600'
                          }`}
                        >
                          {seller.growthRatePct >= 0 ? `+${seller.growthRatePct}%` : `${seller.growthRatePct}%`}
                        </span>
                      </td>

                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${
                                isHigh ? 'bg-emerald-500' : isLow ? 'bg-rose-500' : 'bg-amber-500'
                              }`}
                              style={{ width: `${seller.growthScore}%` }}
                            />
                          </div>
                          <span className="font-bold text-[11px] text-slate-700">{seller.growthScore}/100</span>
                        </div>
                      </td>

                      <td className="p-3 font-bold text-slate-800">{seller.totalProducts} Items</td>

                      <td className="p-3">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${
                            isHigh
                              ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                              : isLow
                              ? 'bg-rose-100 text-rose-900 border-rose-300'
                              : 'bg-amber-100 text-amber-900 border-amber-300'
                          }`}
                        >
                          {seller.performanceTier.replace('_', ' ')}
                        </span>
                      </td>

                      <td className="p-3 text-right">
                        <button
                          type="button"
                          onClick={() => handleApplyBoost(seller.id, seller.brandName, 'COMMISSION_DISCOUNT')}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-brand-50 hover:text-brand-800 font-bold text-[10px] rounded-lg transition border border-slate-200"
                        >
                          Boost Seller
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. TAB CONTENT 3: AI STRATEGIC PLAYBOOK */}
      {activeTab === 'playbook' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {analytics.actionableInsights.map((insight, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border-2 border-brand-800/20 p-6 shadow-sm flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                      insight.impact === 'CRITICAL'
                        ? 'bg-rose-100 text-rose-800 border border-rose-200'
                        : insight.impact === 'HIGH'
                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                        : 'bg-blue-100 text-blue-800 border border-blue-200'
                    }`}
                  >
                    Priority: {insight.impact}
                  </span>
                  <Sparkles className="w-4 h-4 text-brand-600" />
                </div>

                <h3 className="font-extrabold text-slate-900 text-sm leading-tight">{insight.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{insight.description}</p>
              </div>

              <div className="pt-3 border-t border-slate-100 space-y-2">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                  Targeted Sellers:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {insight.targetSellers.map((seller, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-semibold"
                    >
                      {seller}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 6. TAB CONTENT 4: INTERACTIVE AI ADVISOR Q&A */}
      {activeTab === 'advisor' && (
        <div className="bg-white rounded-2xl border-2 border-brand-800/20 p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">Interactive Super Admin AI Merchant Advisor</h3>
              <p className="text-xs text-slate-500">
                Ask specific questions about vendor growth rates, regional lags, and marketing campaigns
              </p>
            </div>
          </div>

          {/* Quick Prompt Chips */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
              Suggested Questions:
            </span>
            <div className="flex flex-wrap gap-2 text-xs font-semibold">
              <button
                type="button"
                onClick={() => handleAskAi('Which sellers have lowest sales and why?')}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-purple-50 hover:text-purple-900 border border-slate-200 transition"
              >
                🔍 Which sellers have lowest sales and why?
              </button>
              <button
                type="button"
                onClick={() => handleAskAi('Who are the top 3 high growth champions?')}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-purple-50 hover:text-purple-900 border border-slate-200 transition"
              >
                🚀 Top 3 high growth champions?
              </button>
              <button
                type="button"
                onClick={() => handleAskAi('How to boost dry fruit sales in Peshawar?')}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-purple-50 hover:text-purple-900 border border-slate-200 transition"
              >
                🌰 How to boost dry fruits in Peshawar?
              </button>
              <button
                type="button"
                onClick={() => handleAskAi('City by city sales and growth breakdown')}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-purple-50 hover:text-purple-900 border border-slate-200 transition"
              >
                📍 City by city sales breakdown
              </button>
            </div>
          </div>

          {/* Input Form */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={promptInput}
              onChange={(e) => setPromptInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAskAi()}
              placeholder="Ask anything (e.g. How to revive lagging sellers in Faisalabad?)..."
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-brand-600"
            />
            <button
              type="button"
              disabled={isAskingAi}
              onClick={() => handleAskAi()}
              className="px-4 py-2.5 bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 shadow-sm disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Ask AI</span>
            </button>
          </div>

          {/* AI Response Display */}
          {aiAnswer && (
            <div className="bg-gradient-to-br from-purple-50/70 to-slate-50 border-2 border-purple-200 p-5 rounded-2xl space-y-4 animate-fadeIn">
              <div className="flex items-center gap-2 text-purple-900 text-xs font-extrabold uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-purple-700" />
                <span>AI Growth Advisor Analysis</span>
              </div>

              <div className="text-xs text-slate-800 leading-relaxed whitespace-pre-line">
                {aiAnswer.answer}
              </div>

              {aiAnswer.recommendedAction && (
                <div className="p-3 rounded-xl bg-white border border-purple-200 text-xs text-slate-900 space-y-1">
                  <span className="text-[10px] font-extrabold text-purple-800 uppercase tracking-wider block">
                    Recommended Action Plan:
                  </span>
                  <p className="text-slate-700">{aiAnswer.recommendedAction}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
