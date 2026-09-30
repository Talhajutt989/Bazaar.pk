'use client';

import React, { useState } from 'react';
import { ShoppingBag, Check, ShieldCheck, Truck, RefreshCw, Zap, Minus, Plus } from 'lucide-react';
import { formatPKR } from '@/lib/utils';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';

export interface Variant {
  id: string;
  sku: string;
  variantName: string;
  price: number;
  stock: number;
  attributes: string; // JSON string
}

interface VariantSelectorProps {
  productId: string;
  productTitle: string;
  productSlug: string;
  basePrice: number;
  images: string[];
  store: {
    id: string;
    brandName: string;
    city: string;
  };
  variants: Variant[];
}

export function VariantSelector({
  productId,
  productTitle,
  productSlug,
  basePrice,
  images,
  store,
  variants,
}: VariantSelectorProps) {
  const { addItem, setIsOpen } = useCart();
  const { toast } = useToast();

  const [selectedVariantId, setSelectedVariantId] = useState<string>(
    variants[0]?.id || 'default'
  );
  const [quantity, setQuantity] = useState(1);

  const selectedVariant = variants.find((v) => v.id === selectedVariantId) || variants[0] || {
    id: 'default',
    sku: 'STD-1',
    variantName: 'Standard',
    price: basePrice,
    stock: 10,
    attributes: '{}',
  };

  let parsedAttributes: Record<string, string> = {};
  try {
    parsedAttributes = JSON.parse(selectedVariant.attributes);
  } catch {
    parsedAttributes = {};
  }

  const handleAddToCart = () => {
    if (selectedVariant.stock <= 0) return;

    addItem({
      variantId: selectedVariant.id,
      productId,
      productSlug,
      title: productTitle,
      variantName: selectedVariant.variantName,
      price: selectedVariant.price,
      image: images[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80',
      storeId: store.id,
      storeName: store.brandName,
      storeCity: store.city,
      maxStock: selectedVariant.stock,
      quantity,
    });

    toast(
      `Added ${quantity}x "${productTitle} (${selectedVariant.variantName})" to your basket!`,
      'success'
    );
  };

  const handleBuyNow = () => {
    handleAddToCart();
    setIsOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Price & Stock Display */}
      <div className="bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-cyan-500/10 border border-emerald-500/30 p-4 sm:p-5 rounded-3xl flex items-center justify-between shadow-xs relative overflow-hidden">
        <div className="relative z-10">
          <span className="text-[10px] text-emerald-800 font-extrabold uppercase tracking-wider block">Total Verified Price</span>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 font-display tracking-tight">
              {formatPKR(selectedVariant.price)}
            </span>
            <span className="text-xs text-emerald-700 font-bold">Inclusive of all taxes</span>
          </div>
        </div>
        <div className="text-right relative z-10">
          <span
            className={`inline-block px-3 py-1 rounded-full text-xs font-black shadow-2xs ${selectedVariant.stock > 0
              ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
              : 'bg-rose-100 text-rose-800 border border-rose-300'
              }`}
          >
            {selectedVariant.stock > 0 ? `⚡ In Stock (${selectedVariant.stock} units)` : 'Out of Stock'}
          </span>
          <span className="block text-[10px] text-slate-400 font-mono mt-1">
            SKU: {selectedVariant.sku}
          </span>
        </div>
      </div>

      {/* Variant Selector Buttons */}
      {variants.length > 1 && (
        <div className="space-y-2.5">
          <label className="text-xs font-black text-slate-900 block uppercase tracking-wider">
            Select Configuration / Variant:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {variants.map((v) => {
              const isSelected = v.id === selectedVariant.id;
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => {
                    setSelectedVariantId(v.id);
                    setQuantity(1);
                  }}
                  className={`p-3.5 rounded-2xl border-2 text-left transition-all flex items-center justify-between ${isSelected
                    ? 'border-emerald-600 bg-emerald-50/90 shadow-md ring-1 ring-emerald-500/30'
                    : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/50'
                    }`}
                >
                  <div>
                    <span className="text-xs font-black text-slate-900 block">{v.variantName}</span>
                    <span className="text-xs font-extrabold text-emerald-700">{formatPKR(v.price)}</span>
                  </div>
                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Selected Variant Attributes Badge Breakdown */}
      {Object.keys(parsedAttributes).length > 0 && (
        <div className="p-3.5 bg-slate-50/90 rounded-2xl border border-slate-200/90">
          <span className="text-[11px] font-black text-slate-700 block mb-2 uppercase tracking-wider">
            Active Variant Specifications:
          </span>
          <div className="flex flex-wrap gap-2">
            {Object.entries(parsedAttributes).map(([key, val]) => (
              <span
                key={key}
                className="bg-white border border-slate-200 px-3 py-1 rounded-xl text-xs text-slate-700 font-medium capitalize shadow-2xs"
              >
                <strong className="text-slate-900 font-bold">{key}:</strong> {val}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Clean Quantity Input Modifier */}
      <div className="flex items-center gap-4 pt-1">
        <label className="text-xs font-black text-slate-900 uppercase tracking-wider">Quantity:</label>
        <div className="flex items-center rounded-2xl border border-slate-300 bg-white overflow-hidden shadow-2xs">
          <button
            type="button"
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            disabled={quantity <= 1}
            aria-label="Decrease quantity"
            className="w-10 h-10 flex items-center justify-center text-slate-700 hover:bg-slate-100 transition disabled:opacity-40"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <input
            type="number"
            min={1}
            max={selectedVariant.stock}
            value={quantity}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10);
              if (!isNaN(val)) {
                setQuantity(Math.max(1, Math.min(selectedVariant.stock, val)));
              }
            }}
            className="w-12 h-10 text-center text-xs font-black text-slate-900 border-x border-slate-200 focus:outline-none"
          />
          <button
            type="button"
            onClick={() => setQuantity(Math.min(selectedVariant.stock, quantity + 1))}
            disabled={quantity >= selectedVariant.stock}
            aria-label="Increase quantity"
            className="w-10 h-10 flex items-center justify-center text-slate-700 hover:bg-slate-100 transition disabled:opacity-40"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
        <span className="text-xs text-slate-500 font-medium">
          Subtotal: <strong className="text-slate-900 font-black font-display text-sm">{formatPKR(selectedVariant.price * quantity)}</strong>
        </span>
      </div>

      {/* Primary Multi-Gradient CTA Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={selectedVariant.stock <= 0}
          className="py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:via-teal-500 hover:to-cyan-500 text-white font-black text-xs shadow-[0_0_20px_rgba(16,185,129,0.35)] flex items-center justify-center gap-2 transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Add to Basket</span>
        </button>

        <button
          type="button"
          onClick={handleBuyNow}
          disabled={selectedVariant.stock <= 0}
          className="py-3.5 px-6 rounded-2xl bg-[#070A14] hover:bg-slate-900 text-amber-300 font-black text-xs border border-white/15 shadow-[0_0_20px_rgba(245,158,11,0.2)] flex items-center justify-center gap-2 transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Zap className="w-4 h-4 text-amber-400" />
          <span>Instant Checkout</span>
        </button>
      </div>

      {/* Hyper-Local Assurance Checklist */}
      <div className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-600 font-medium">
        <div className="flex items-center gap-2">
          <Truck className="w-4 h-4 text-cyan-600 shrink-0" />
          <span>City Express Rider Delivery</span>
        </div>
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>100% Genuine Guaranteed</span>
        </div>
        <div className="flex items-center gap-2">
          <RefreshCw className="w-4 h-4 text-amber-600 shrink-0" />
          <span>7-Day Return Policy</span>
        </div>
      </div>
    </div>
  );
}
