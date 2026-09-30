'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  Package,
  Plus,
  Trash2,
  Image as ImageIcon,
  ArrowLeft,
  Loader2,
  Sparkles,
  Layers,
  CheckCircle2,
  DollarSign,
  Tag,
  Eye,
  Store,
  Zap,
} from 'lucide-react';
import { createProduct } from '@/app/actions/products';
import { useToast } from '@/context/ToastContext';
import { formatPKR } from '@/lib/utils';

// Quick Pakistani Marketplace Presets
const SAMPLE_PRESETS = [
  {
    categoryName: 'Smartphones & Gadgets',
    categoryId: 'smartphones-gadgets',
    title: 'Samsung Galaxy A55 5G (Official PTA Approved)',
    brand: 'Samsung',
    basePrice: '124999',
    description: '6.6-inch Super AMOLED 120Hz display, 50MP OIS Camera, Exynos 1480 processor, 5000mAh battery with 25W fast charging. Official 1-Year Brand Warranty.',
    images: [
      'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&q=80',
      'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=800&q=80',
    ],
    variants: [
      { sku: 'A55-8-128-NV', variantName: '8GB + 128GB / Awesome Navy', price: '124999', stock: '15', color: 'Navy', size: '128GB' },
      { sku: 'A55-8-256-IC', variantName: '8GB + 256GB / Awesome Iceblue', price: '139999', stock: '10', color: 'Iceblue', size: '256GB' },
    ],
  },
  {
    categoryName: 'Apparel & Clothing',
    categoryId: 'apparel-clothing',
    title: 'Premium Stitched Digital Print Lawn 3-Piece Suit',
    brand: 'Artisan Pret',
    basePrice: '6850',
    description: 'Pure premium lawn shirt with intricate neckline embroidery, printed chiffon dupatta, and dyed cotton trousers. Pre-shrunk colorfast fabric.',
    images: [
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&q=80',
      'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=800&q=80',
    ],
    variants: [
      { sku: 'LWN-S-BLU', variantName: 'Small / Royal Blue', price: '6850', stock: '20', color: 'Royal Blue', size: 'Small' },
      { sku: 'LWN-M-BLU', variantName: 'Medium / Royal Blue', price: '6850', stock: '25', color: 'Royal Blue', size: 'Medium' },
      { sku: 'LWN-L-BLU', variantName: 'Large / Royal Blue', price: '6850', stock: '18', color: 'Royal Blue', size: 'Large' },
    ],
  },
  {
    categoryName: 'Gourmet Dry Fruits & Spices',
    categoryId: 'gourmet-dry-fruits',
    title: 'Supreme Jumbo Roasted Salted Pistachios (Pista)',
    brand: 'Khyber Organics',
    basePrice: '3200',
    description: 'Hand-picked, freshly roasted in Himalayan pink salt. 100% natural, vacuum-sealed for crunch and freshness. Direct from Gilgit & Quetta orchards.',
    images: [
      'https://images.unsplash.com/photo-1509358271058-acd22cc93898?w=800&q=80',
    ],
    variants: [
      { sku: 'PST-500G', variantName: '500 Grams Pack', price: '3200', stock: '40', color: 'Natural', size: '500g' },
      { sku: 'PST-1000G', variantName: '1 KG Family Pack', price: '6100', stock: '25', color: 'Natural', size: '1kg' },
    ],
  },
  {
    categoryName: 'Shoes & Footwear',
    categoryId: 'shoes-footwear',
    title: 'Handmade Pure Cow Leather Peshawari Norozi Chappal',
    brand: 'Heritage Footwear',
    basePrice: '5499',
    description: 'Genuine cowhide full-grain leather upper, tyre sole for extreme durability, cushioned memory foam insole. Handcrafted by master artisans.',
    images: [
      'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&q=80',
    ],
    variants: [
      { sku: 'PSH-BLK-41', variantName: 'Size 41 (7) / Black Leather', price: '5499', stock: '12', color: 'Black', size: '41' },
      { sku: 'PSH-BLK-42', variantName: 'Size 42 (8) / Black Leather', price: '5499', stock: '15', color: 'Black', size: '42' },
      { sku: 'PSH-BRN-42', variantName: 'Size 42 (8) / Mustard Brown', price: '5499', stock: '10', color: 'Brown', size: '42' },
    ],
  },
];

const POPULAR_IMAGE_PRESETS = [
  { label: 'Smartphone', url: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&q=80' },
  { label: 'Laptop', url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80' },
  { label: 'Headphones', url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80' },
  { label: 'Dress / Fashion', url: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&q=80' },
  { label: 'Men Shalwar Kameez', url: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&q=80' },
  { label: 'Leather Shoes', url: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&q=80' },
  { label: 'Dry Fruits', url: 'https://images.unsplash.com/photo-1509358271058-acd22cc93898?w=800&q=80' },
  { label: 'Cosmetic / Serum', url: 'https://images.unsplash.com/photo-1608248597359-0744e83ea88c?w=800&q=80' },
];

export default function NewProductPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  // Basic Info
  const [title, setTitle] = useState('');
  const [brand, setBrand] = useState('');
  const [categoryId, setCategoryId] = useState('smartphones-gadgets');
  const [description, setDescription] = useState('');
  const [basePrice, setBasePrice] = useState('15000');
  const [imageUrls, setImageUrls] = useState([
    'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&q=80',
  ]);

  // Categories list
  const categoryOptions = [
    { id: 'smartphones-gadgets', name: 'Smartphones & Gadgets' },
    { id: 'laptops-computers', name: 'Laptops & Computing' },
    { id: 'electronics-gadgets', name: 'Electronics & Gadgets' },
    { id: 'apparel-clothing', name: 'Apparel & Clothing' },
    { id: 'mens-fashion', name: "Men's Fashion & Apparel" },
    { id: 'womens-fashion', name: "Women's Ethnic & Western" },
    { id: 'shoes-footwear', name: 'Shoes & Footwear' },
    { id: 'fresh-grocery', name: 'Fresh Grocery & Organics' },
    { id: 'gourmet-dry-fruits', name: 'Gourmet Dry Fruits & Spices' },
    { id: 'spices-herbs', name: 'Organic Spices & Herbs' },
    { id: 'home-living', name: 'Home Decor & Furnishing' },
    { id: 'beauty-care', name: 'Beauty & Personal Care' },
    { id: 'sports-fitness', name: 'Sports & Outdoor' },
  ];

  // Multi-Variants builder
  const [variants, setVariants] = useState([
    {
      sku: 'PRD-STD-01',
      variantName: 'Standard Edition',
      price: '15000',
      stock: '20',
      color: 'Default',
      size: 'Standard',
    },
  ]);

  const handleApplyPreset = (preset: (typeof SAMPLE_PRESETS)[0]) => {
    setTitle(preset.title);
    setBrand(preset.brand);
    setCategoryId(preset.categoryId);
    setBasePrice(preset.basePrice);
    setDescription(preset.description);
    setImageUrls(preset.images);
    setVariants(preset.variants);
    toast(`Applied "${preset.title}" template! You can now adjust price or publish.`, 'success');
  };

  const handleAddVariant = () => {
    setVariants([
      ...variants,
      {
        sku: `PRD-${Date.now().toString().slice(-4)}`,
        variantName: 'New Variant',
        price: basePrice,
        stock: '10',
        color: '',
        size: '',
      },
    ]);
  };

  const handleRemoveVariant = (index: number) => {
    if (variants.length <= 1) return;
    setVariants(variants.filter((_, i) => i !== index));
  };

  const handleVariantChange = (index: number, field: string, value: string) => {
    const updated = [...variants];
    updated[index] = { ...updated[index], [field]: value };
    setVariants(updated);
  };

  const handleAddImage = (urlToAdd = '') => {
    setImageUrls([...imageUrls, urlToAdd]);
  };

  const handleRemoveImage = (index: number) => {
    if (imageUrls.length <= 1) return;
    setImageUrls(imageUrls.filter((_, i) => i !== index));
  };

  const handleImageChange = (index: number, val: string) => {
    const updated = [...imageUrls];
    updated[index] = val;
    setImageUrls(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast('Please enter a product title', 'error');
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.set('title', title.trim());
      formData.set('brand', brand.trim());
      formData.set('categoryId', categoryId);
      formData.set('description', description.trim());
      formData.set('basePrice', basePrice);
      formData.set('images', JSON.stringify(imageUrls.filter(Boolean)));

      // Format variants payload
      const formattedVariants = variants.map((v) => ({
        sku: v.sku.trim() || `SKU-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
        variantName: v.variantName.trim() || 'Standard Edition',
        price: parseFloat(v.price) || parseFloat(basePrice) || 0,
        stock: parseInt(v.stock) || 0,
        attributes: {
          ...(v.color ? { color: v.color } : {}),
          ...(v.size ? { size: v.size } : {}),
        },
      }));

      formData.set('variants', JSON.stringify(formattedVariants));

      const res = await createProduct(formData);
      if (res.success) {
        toast('🎉 Product successfully added to your store inventory!', 'success');
        router.push('/vendor/products');
      } else {
        toast(res.error || 'Failed to create product', 'error');
      }
    });
  };

  const totalStock = variants.reduce((sum, v) => sum + (parseInt(v.stock) || 0), 0);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Header & Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          href="/vendor/products"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-700 hover:text-brand-900 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to My Inventory
        </Link>
      </div>

      <div className="bg-brand-950 text-white p-6 sm:p-8 rounded-3xl border-2 border-brand-800 shadow-brand flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-accent-400 animate-ping" />
            <span className="text-accent-400 text-xs font-bold uppercase tracking-wider block">
              Seller Product Publishing Studio
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-white">
            Add New Product to Your Store
          </h1>
          <p className="text-xs text-amber-200/80 max-w-lg">
            This product will be placed in your private seller inventory and published across Pakistan's buyer marketplace.
          </p>
        </div>

        <div className="p-3 bg-brand-900/90 border border-brand-700 rounded-2xl text-center shrink-0">
          <span className="text-[10px] text-amber-300 font-bold uppercase block">Stock Units</span>
          <span className="text-xl font-extrabold text-white font-mono">{totalStock} Units</span>
        </div>
      </div>

      {/* 1-Click Fast Fill Templates Banner */}
      <div className="bg-white p-5 rounded-2xl border-2 border-brand-800/20 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-amber-500" />
            <span>1-Click Sample Templates (For Quick Testing)</span>
          </span>
          <span className="text-[11px] text-slate-400">Click any preset to auto-fill details</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {SAMPLE_PRESETS.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleApplyPreset(preset)}
              className="p-2.5 rounded-xl border border-slate-200 hover:border-brand-600 hover:bg-brand-50/60 text-left transition group cursor-pointer"
            >
              <span className="text-[10px] font-bold text-brand-700 block uppercase tracking-wider">
                {preset.categoryName}
              </span>
              <span className="text-xs font-bold text-slate-900 block truncate group-hover:text-brand-900">
                {preset.title.split('(')[0]}
              </span>
              <span className="text-[11px] font-mono font-extrabold text-slate-600 mt-1 block">
                {formatPKR(parseFloat(preset.basePrice))}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Add Product Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: General Product Information */}
        <div className="bg-white p-6 rounded-3xl border-2 border-brand-800/20 shadow-sm space-y-4 text-xs">
          <h3 className="text-sm font-extrabold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
            <Package className="w-4 h-4 text-brand-700" />
            <span>1. Product General Details</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5 sm:col-span-2">
              <label className="font-bold text-slate-700">Product Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Handmade Cowhide Leather Peshawari Chappal / Samsung Galaxy S24"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-brand-600 font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">Brand Name</label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="e.g. Apple, Samsung, Khaadi, J., Local Artisan"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-brand-600 font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">Category *</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-brand-600 font-semibold cursor-pointer"
              >
                {categoryOptions.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">Base Starting Price (PKR) *</label>
              <div className="relative">
                <input
                  type="number"
                  required
                  min="1"
                  value={basePrice}
                  onChange={(e) => setBasePrice(e.target.value)}
                  placeholder="15000"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-brand-600 font-extrabold"
                />
              </div>
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="font-bold text-slate-700">Description & Item Specifications *</label>
              <textarea
                required
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter detailed description of item specifications, warranty, materials, origin, washing instructions..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-brand-600 font-medium"
              />
            </div>
          </div>
        </div>

        {/* Step 2: Image Gallery URLs & Quick Presets */}
        <div className="bg-white p-6 rounded-3xl border-2 border-brand-800/20 shadow-sm space-y-4 text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-brand-700" />
                <span>2. Product Image Gallery</span>
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Add high-definition product image URLs or pick a preset image below.
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleAddImage()}
              className="text-xs font-bold text-brand-700 hover:text-brand-900 flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Add Image URL
            </button>
          </div>

          {/* Quick Image Category Presets */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-slate-600">Quick High-Quality Image Picker:</span>
            <div className="flex flex-wrap gap-2">
              {POPULAR_IMAGE_PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    if (imageUrls.length === 1 && imageUrls[0] === '') {
                      setImageUrls([preset.url]);
                    } else {
                      handleAddImage(preset.url);
                    }
                    toast(`Added ${preset.label} image!`, 'success');
                  }}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-brand-100 text-slate-700 hover:text-brand-900 rounded-lg text-[11px] font-semibold transition border border-slate-200 cursor-pointer"
                >
                  + {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Image URL Inputs */}
          <div className="space-y-3">
            {imageUrls.map((url, idx) => (
              <div key={idx} className="flex items-center gap-2.5">
                {url ? (
                  <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                    <Image src={url} alt="Thumbnail preview" fill className="object-cover" />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 text-slate-400">
                    <ImageIcon className="w-5 h-5" />
                  </div>
                )}

                <input
                  type="url"
                  required
                  value={url}
                  onChange={(e) => handleImageChange(idx, e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:border-brand-600 font-mono"
                />

                {imageUrls.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="p-2 text-rose-500 hover:text-rose-700 rounded-lg hover:bg-rose-50 cursor-pointer"
                    title="Remove image"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step 3: Multi-Variants & Inventory Stock */}
        <div className="bg-white p-6 rounded-3xl border-2 border-brand-800/20 shadow-sm space-y-4 text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-brand-700" />
                <span>3. Multi-Variants & Stock Units ({variants.length} Variants)</span>
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Configure separate SKUs, storage sizes, colors, individual prices, and available stock units.
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddVariant}
              className="px-3 py-1.5 bg-brand-100 text-brand-800 rounded-xl font-bold text-xs hover:bg-brand-200 flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Add Variant
            </button>
          </div>

          <div className="space-y-3">
            {variants.map((v, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-6 gap-3 items-end"
              >
                <div className="sm:col-span-2 space-y-1">
                  <label className="font-bold text-slate-700">Variant Name *</label>
                  <input
                    type="text"
                    required
                    value={v.variantName}
                    onChange={(e) => handleVariantChange(idx, 'variantName', e.target.value)}
                    placeholder="e.g. 256GB / Titanium Black or Size 42"
                    className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 font-semibold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">SKU Code *</label>
                  <input
                    type="text"
                    required
                    value={v.sku}
                    onChange={(e) => handleVariantChange(idx, 'sku', e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-mono text-slate-900 font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Price (PKR) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={v.price}
                    onChange={(e) => handleVariantChange(idx, 'price', e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 font-extrabold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Stock Units *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={v.stock}
                    onChange={(e) => handleVariantChange(idx, 'stock', e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 font-bold"
                  />
                </div>

                <div className="text-right">
                  {variants.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveVariant(idx)}
                      className="p-2.5 text-rose-500 hover:text-rose-700 rounded-xl hover:bg-rose-50 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Preview Card */}
        {title && (
          <div className="bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 shadow-xl space-y-3">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Live Customer Card Preview
              </span>
            </div>
            <div className="flex items-center gap-4 bg-slate-800/80 p-4 rounded-2xl border border-slate-700">
              <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-slate-700 shrink-0">
                <Image
                  src={imageUrls[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80'}
                  alt="Preview"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-white truncate">{title}</p>
                <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                  {brand || 'Store Brand'} • {variants.length} Variants ({totalStock} units available)
                </p>
                <p className="text-sm font-black text-amber-300 font-display mt-1">
                  {formatPKR(parseFloat(basePrice) || 0)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link
            href="/vendor/products"
            className="px-5 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-100 transition"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={isPending}
            className="px-8 py-3.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-brand-700 hover:from-emerald-500 hover:to-brand-600 text-white font-extrabold text-xs rounded-xl shadow-brand flex items-center gap-2 transition disabled:opacity-50 cursor-pointer active:scale-95"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Publishing to Store...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Publish Product to Store</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
