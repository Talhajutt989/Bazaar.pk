'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  Store,
  ShieldCheck,
  Truck,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatPKR } from '@/lib/utils';

export default function CartPage() {
  const { items, itemsByStore, updateQuantity, removeItem, clearCart, totalAmount, totalCount } =
    useCart();

  const storeCount = Object.keys(itemsByStore).length;
  const estimatedDelivery = storeCount * 150;
  const grandTotal = totalAmount + (totalAmount > 0 ? estimatedDelivery : 0);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b-2 border-brand-800/20">
        <div>
          <span className="text-xs font-bold text-brand-700 uppercase tracking-wider flex items-center gap-1.5">
            <ShoppingBag className="w-4 h-4" /> Multi-Vendor Shopping Cart
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display">
            Your Cart ({totalCount} {totalCount === 1 ? 'item' : 'items'})
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/products"
            className="text-xs font-bold text-slate-600 hover:text-brand-700 flex items-center gap-1 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Continue Shopping</span>
          </Link>
          {items.length > 0 && (
            <button
              onClick={clearCart}
              className="text-xs font-semibold text-rose-600 hover:text-rose-700 px-3 py-1.5 rounded-lg border border-rose-200 hover:bg-rose-50 transition"
            >
              Clear Cart
            </button>
          )}
        </div>
      </div>

      {items.length === 0 ? (
        <div className="bg-white rounded-3xl border-2 border-brand-800/15 p-12 text-center shadow-sm space-y-5 max-w-md mx-auto">
          <div className="w-16 h-16 rounded-3xl bg-brand-50 text-brand-700 flex items-center justify-center mx-auto shadow-inner">
            <ShoppingBag className="w-8 h-8 text-brand-600" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-lg font-bold text-slate-900">Your shopping cart is empty</h2>
            <p className="text-xs text-slate-500">
              Discover verified local artisans, organic goods, and tech gadgets across Pakistan.
            </p>
          </div>
          <Link
            href="/products"
            className="inline-flex items-center justify-center gap-2 w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-xs rounded-xl shadow-brand transition"
          >
            <span>Explore Products</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Cart Items Grouped by Store */}
          <div className="lg:col-span-8 space-y-6">
            {Object.entries(itemsByStore).map(([storeId, storeGroup]) => {
              const storeSubtotal = storeGroup.items.reduce(
                (sum, i) => sum + i.price * i.quantity,
                0
              );

              return (
                <div
                  key={storeId}
                  className="bg-white rounded-2xl border-2 border-brand-800/15 shadow-sm overflow-hidden"
                >
                  {/* Store Header */}
                  <div className="bg-brand-50/80 p-4 border-b border-brand-800/10 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-brand-700 text-accent-400 flex items-center justify-center font-bold">
                        <Store className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-xs font-bold text-brand-950">
                          {storeGroup.storeName}
                        </h3>
                        <p className="text-[10px] text-slate-500">📍 {storeGroup.storeCity}</p>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-extrabold text-brand-900">
                      {formatPKR(storeSubtotal)}
                    </span>
                  </div>

                  {/* Store Products */}
                  <div className="p-4 divide-y divide-slate-100">
                    {storeGroup.items.map((item) => (
                      <div
                        key={item.variantId}
                        className="py-3.5 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-3">
                          <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-200 bg-white shrink-0">
                            <Image
                              src={
                                item.image ||
                                'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80'
                              }
                              alt={item.title}
                              fill
                              sizes="64px"
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <Link
                              href={`/products/${item.productSlug}`}
                              className="text-xs font-bold text-slate-900 hover:text-brand-700 transition line-clamp-1"
                            >
                              {item.title}
                            </Link>
                            <p className="text-[11px] text-slate-500">{item.variantName}</p>
                            <span className="text-xs font-extrabold text-brand-700 block mt-0.5">
                              {formatPKR(item.price)}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-4">
                          {/* Quantity Controls */}
                          <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 overflow-hidden">
                            <button
                              onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                              className="p-1.5 hover:bg-slate-200 text-slate-600 transition"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="px-3 text-xs font-bold text-slate-800">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                              className="p-1.5 hover:bg-slate-200 text-slate-600 transition"
                              aria-label="Increase quantity"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <span className="text-xs font-extrabold text-slate-900 w-24 text-right">
                            {formatPKR(item.price * item.quantity)}
                          </span>

                          <button
                            onClick={() => removeItem(item.variantId)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 transition"
                            title="Remove item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Order Summary Card */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white rounded-2xl border-2 border-brand-800/20 p-6 shadow-sm space-y-4 sticky top-24">
              <h2 className="text-sm font-extrabold text-slate-900 pb-3 border-b border-slate-100 uppercase tracking-wider">
                Order Summary
              </h2>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Items Subtotal</span>
                  <span className="font-bold text-slate-900">{formatPKR(totalAmount)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Estimated Delivery ({storeCount} {storeCount === 1 ? 'store' : 'stores'})</span>
                  <span className="font-bold text-slate-900">{formatPKR(estimatedDelivery)}</span>
                </div>
                <div className="pt-3 border-t border-slate-100 flex justify-between text-sm font-extrabold text-brand-900">
                  <span>Estimated Grand Total</span>
                  <span className="text-base text-brand-700">{formatPKR(grandTotal)}</span>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href="/checkout"
                  className="w-full py-3.5 bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-xs rounded-xl shadow-brand flex items-center justify-center gap-2 transition text-center"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="pt-3 border-t border-slate-100 space-y-2 text-[11px] text-slate-500">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>100% Buyer Protection & Easy Returns</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-brand-600 shrink-0" />
                  <span>Express Delivery from verified local shops</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
