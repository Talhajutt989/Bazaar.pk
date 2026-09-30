import React from 'react';

export default function RootLoading() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24 animate-pulse">
      {/* Hero Skeleton */}
      <div className="bg-gradient-to-b from-slate-100 to-white py-16 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7 space-y-5">
            <div className="h-6 w-56 bg-slate-200 rounded-full" />
            <div className="h-12 w-full max-w-lg bg-slate-200 rounded-2xl" />
            <div className="h-4 w-3/4 bg-slate-200 rounded-xl" />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-14 bg-slate-200 rounded-xl" />
              ))}
            </div>
            <div className="flex gap-4 pt-2">
              <div className="h-12 w-40 bg-emerald-200/60 rounded-2xl" />
              <div className="h-12 w-36 bg-slate-200 rounded-2xl" />
            </div>
          </div>
          <div className="lg:col-span-5">
            <div className="h-72 bg-slate-200 rounded-[32px]" />
          </div>
        </div>
      </div>

      {/* Categories Grid Skeleton */}
      <div className="max-w-7xl mx-auto px-4 mt-12 space-y-6">
        <div className="flex justify-between items-center border-b border-slate-200 pb-4">
          <div className="h-8 w-60 bg-slate-200 rounded-xl" />
          <div className="h-8 w-32 bg-slate-200 rounded-xl" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3.5">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-28 bg-slate-200/80 rounded-2xl" />
          ))}
        </div>
      </div>

      {/* Products Grid Skeleton */}
      <div className="max-w-7xl mx-auto px-4 mt-16 space-y-6">
        <div className="flex justify-between items-center border-b border-slate-200 pb-4">
          <div className="h-8 w-60 bg-slate-200 rounded-xl" />
          <div className="h-8 w-32 bg-slate-200 rounded-xl" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-96 bg-white rounded-3xl border border-slate-200/80 p-4 space-y-4">
              <div className="h-48 bg-slate-100 rounded-2xl" />
              <div className="h-5 w-3/4 bg-slate-200 rounded-lg" />
              <div className="h-4 w-1/2 bg-slate-100 rounded-lg" />
              <div className="h-10 w-full bg-slate-100 rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
