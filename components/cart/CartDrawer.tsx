'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { X, ShoppingBag, Trash2, Store, ArrowRight, Truck, Sparkles } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatPKR } from '@/lib/utils';

export function CartDrawer() {
  const { isOpen, setIsOpen, items, removeItem, totalAmount, itemsByStore, totalCount } =
    useCart();

  if (!isOpen) return null;

  const storeIds = Object.keys(itemsByStore);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#090D16]/60 backdrop-blur-sm transition-opacity"
        onClick={() => setIsOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl border-l border-slate-200 flex flex-col">
          {/* Header */}
          <div className="p-4 bg-[#090D16] text-white flex items-center justify-between border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-400 border border-emerald-500/20">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white">Your Shopping Basket</h2>
                <p className="text-xs text-slate-400">
                  {totalCount} {totalCount === 1 ? 'item' : 'items'} ready for checkout
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/60">
            {items.length === 0 ? (
              <div className="text-center py-16 px-4">
                <div className="w-16 h-16 mx-auto bg-emerald-50 text-emerald-700 rounded-2xl flex items-center justify-center mb-4 border border-emerald-200 shadow-sm">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-1">Your cart is empty</h3>
                <p className="text-xs text-slate-500 mb-6 max-w-xs mx-auto">
                  Explore thousands of authentic items from top hyper-local verified vendors!
                </p>
                <button
                  onClick={() => setIsOpen(false)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-700 to-teal-600 hover:from-emerald-800 hover:to-teal-700 text-white font-bold rounded-xl text-xs shadow-md shadow-emerald-700/20 transition active:scale-95"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Start Shopping</span>
                </button>
              </div>
            ) : (
              storeIds.map((storeId) => {
                const group = itemsByStore[storeId];
                return (
                  <div
                    key={storeId}
                    className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden"
                  >
                    {/* Store Header Badge */}
                    <div className="bg-slate-50 px-3.5 py-2.5 border-b border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Store className="w-3.5 h-3.5 text-emerald-700" />
                        <span className="text-xs font-bold text-slate-900">{group.storeName}</span>
                      </div>
                      <span className="text-[10px] font-semibold bg-amber-50 text-amber-900 px-2.5 py-0.5 rounded-full border border-amber-200">
                        📍 {group.storeCity}
                      </span>
                    </div>

                    {/* Items for this store */}
                    <div className="divide-y divide-slate-100 p-3 space-y-3">
                      {group.items.map((item) => (
                        <div key={item.variantId} className="flex gap-3 pt-2 first:pt-0">
                          <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-200 shrink-0 bg-slate-100">
                            <Image
                              src={item.image}
                              alt={item.title}
                              fill
                              sizes="64px"
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-bold text-slate-900 line-clamp-1">
                              {item.title}
                            </h4>
                            <p className="text-[11px] text-slate-500 mb-1">{item.variantName}</p>
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-extrabold text-emerald-700">
                                {formatPKR(item.price)}
                              </span>

                              {/* Clean Quantity Display & Remove Action */}
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-slate-800 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-lg shadow-2xs">
                                  Qty: {item.quantity}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => removeItem(item.variantId)}
                                  className="p-1 text-slate-400 hover:text-rose-600 transition"
                                  title="Remove item"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer & Checkout Action */}
          {items.length > 0 && (
            <div className="p-4 bg-white border-t border-slate-200 space-y-3">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-500">
                  <span>Items Subtotal:</span>
                  <span className="font-bold text-slate-900">{formatPKR(totalAmount)}</span>
                </div>
                <div className="flex justify-between text-slate-500 items-center">
                  <span className="flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5 text-emerald-700" /> Multi-Vendor Shipping:
                  </span>
                  <span className="font-semibold text-emerald-800">Calculated at Checkout</span>
                </div>
                <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-2 border-t border-slate-100">
                  <span>Estimated Total:</span>
                  <span className="text-emerald-700">{formatPKR(totalAmount)}</span>
                </div>
              </div>

              <Link
                href="/checkout"
                onClick={() => setIsOpen(false)}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-700 to-teal-600 hover:from-emerald-800 hover:to-teal-700 text-white font-extrabold rounded-xl text-center text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-700/20 transition group active:scale-95"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

