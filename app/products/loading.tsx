import React from 'react';

export default function ProductsLoading() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] py-10 max-w-7xl mx-auto px-4 animate-pulse space-y-8">
      <div className="h-10 w-64 bg-slate-200 rounded-xl" />
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-10 w-32 bg-slate-200 rounded-full shrink-0" />
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="h-96 bg-white rounded-3xl border border-slate-200 p-4 space-y-4">
            <div className="h-48 bg-slate-100 rounded-2xl" />
            <div className="h-5 w-3/4 bg-slate-200 rounded-lg" />
            <div className="h-4 w-1/2 bg-slate-100 rounded-lg" />
            <div className="h-10 w-full bg-slate-100 rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  );
}
