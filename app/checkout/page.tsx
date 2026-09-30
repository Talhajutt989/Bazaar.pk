'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import confetti from 'canvas-confetti';
import {
  ShoppingBag,
  ShieldCheck,
  CreditCard,
  Truck,
  Store,
  MapPin,
  Lock,
  ArrowRight,
  Phone,
  Mail,
  User,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
  Copy,
  Check,
  Headphones,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import { useSupport, ADMIN_SUPPORT_PHONE_FORMATTED } from '@/context/SupportContext';
import { formatPKR, CITIES_OF_PAKISTAN } from '@/lib/utils';
import { placeOrder } from '@/app/actions/orders';
import { validateCustomerName, validateEmail, validatePakistaniPhone, validatePassword } from '@/lib/validation';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, itemsByStore, totalAmount, clearCart } = useCart();
  const { toast } = useToast();
  const { openSupport } = useSupport();
  const [isPending, startTransition] = useTransition();

  // Form State
  const [customerName, setCustomerName] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [street, setStreet] = useState('');
  const [area, setArea] = useState('');
  const [city, setCity] = useState('Lahore');
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [formError, setFormError] = useState('');

  const handleCopy = (text: string, label: string) => {
    try {
      navigator.clipboard.writeText(text);
      setCopiedField(label);
      toast(`${label} copied to clipboard!`, 'success');
      setTimeout(() => setCopiedField(null), 2000);
    } catch {}
  };

  // Handle WhatsApp 11-digit input (03XX XXXXXXX)
  const handlePhoneChange = (val: string) => {
    let digits = val.replace(/\D/g, '');
    if (digits.length > 11) {
      digits = digits.substring(0, 11);
    }
    setWhatsapp(digits);
  };

  // Live Validations
  const nameValidation = validateCustomerName(customerName);
  const emailValidation = validateEmail(email);
  const phoneValidation = validatePakistaniPhone(whatsapp);
  const passwordValidation = password ? validatePassword(password) : { isValid: true };

  const storeIds = Object.keys(itemsByStore);

  // Delivery calculation: Rs. 150 standard delivery per vendor store
  const shippingFee = storeIds.length * 150;
  const grandTotal = totalAmount + shippingFee;

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (items.length === 0) {
      setFormError('Your cart is empty');
      return;
    }

    if (!nameValidation.isValid) {
      setFormError(nameValidation.error || 'Please enter a valid customer name (e.g. Soban, Talha, Muhammad Tariq, Ayesha Iqbal)');
      return;
    }

    if (!emailValidation.isValid) {
      setFormError(emailValidation.error || 'Please enter an authentic, valid email (e.g. infodigitalsoft@gmail.com, muhammadtalhafsd2004@gmail.com)');
      return;
    }

    if (!phoneValidation.isValid) {
      setFormError(phoneValidation.error || 'Please enter a valid 11-digit Pakistani WhatsApp number starting with 03 (e.g. 03001234567)');
      return;
    }

    if (password && !passwordValidation.isValid) {
      setFormError(passwordValidation.error || 'Password must be at least 6 characters');
      return;
    }

    if (!street.trim() || street.trim().length < 5) {
      setFormError('Please enter a valid street delivery address');
      return;
    }

    if (!area.trim() || area.trim().length < 3) {
      setFormError('Please enter your area or colony name');
      return;
    }

    startTransition(async () => {
      const payload = {
        items: items.map((i) => ({
          variantId: i.variantId,
          quantity: i.quantity,
          price: i.price,
          storeId: i.storeId,
        })),
        paymentMethod,
        customerName: customerName.trim(),
        email: email.trim().toLowerCase(),
        whatsapp: whatsapp.trim(),
        password: password || undefined,
        street: street.trim(),
        area: area.trim(),
        city,
      };

      const res = await placeOrder(payload);

      if (res.success && res.orderId) {
        // Confetti explosion
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });

        clearCart();
        toast('Order placed successfully! Sub-orders sent to local stores.', 'success');
        router.push(`/order/${res.orderId}`);
      } else {
        setFormError(res.error || 'Failed to complete checkout');
        toast(res.error || 'Failed to place order', 'error');
      }
    });
  };

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center mx-auto">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Your basket is empty</h2>
        <p className="text-xs text-slate-500">
          Add items from local stores before proceeding to checkout.
        </p>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-brand transition"
        >
          Explore Products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Checkout Header */}
      <div className="bg-brand-950 text-white p-6 rounded-3xl border-2 border-brand-800 shadow-brand flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-accent-400 text-xs font-bold uppercase tracking-wider block">
            Secure Direct Checkout
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display">
            Complete Your Order
          </h1>
        </div>
        <div className="flex items-center gap-2 text-xs bg-brand-900/80 px-3 py-2 rounded-xl border border-brand-700/50">
          <ShieldCheck className="w-4 h-4 text-accent-400" />
          <span className="text-amber-100 font-medium">Safe Buyer Protection Guarantee</span>
        </div>
      </div>

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Late-Auth Credentials, Address & Payment */}
        <div className="lg:col-span-7 space-y-6">
          {/* Late Checkout Gate: Account Credentials */}
          <div className="bg-white p-6 rounded-2xl border-2 border-brand-800/20 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <User className="w-4 h-4 text-brand-700" />
              <h3 className="text-sm font-extrabold text-slate-900">
                1. Customer & Order Tracking Contact
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* Full Name */}
              <div className="space-y-1.5 sm:col-span-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-700">Full Name *</label>
                  {customerName.length > 0 && (
                    <span className={`text-[10px] font-bold ${nameValidation.isValid ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {nameValidation.isValid ? '✓ Valid Name' : 'Needs valid name'}
                    </span>
                  )}
                </div>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Soban, Talha, Muhammad Tariq, Ayesha Iqbal"
                    className={`w-full bg-slate-50 border rounded-xl pl-9 pr-8 py-2.5 text-xs text-slate-900 focus:outline-none transition ${
                      customerName.length === 0
                        ? 'border-slate-200 focus:border-brand-600'
                        : nameValidation.isValid
                        ? 'border-emerald-400 bg-emerald-50/20 focus:border-emerald-600'
                        : 'border-rose-300 bg-rose-50/20 focus:border-rose-500'
                    }`}
                  />
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  {customerName.length > 0 && nameValidation.isValid && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 absolute right-3 top-3" />
                  )}
                </div>
                {customerName.length > 0 && !nameValidation.isValid && (
                  <p className="text-[11px] text-rose-600 font-medium">{nameValidation.error}</p>
                )}
              </div>

              {/* Email Address */}
              <div className="space-y-1.5 sm:col-span-1">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-700">Email Address *</label>
                  {email.length > 0 && (
                    <span className={`text-[10px] font-bold ${emailValidation.isValid ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {emailValidation.isValid ? '✓ Valid Email' : 'Needs valid email'}
                    </span>
                  )}
                </div>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. infodigitalsoft@gmail.com"
                    className={`w-full bg-slate-50 border rounded-xl pl-9 pr-8 py-2.5 text-xs text-slate-900 focus:outline-none transition ${
                      email.length === 0
                        ? 'border-slate-200 focus:border-brand-600'
                        : emailValidation.isValid
                        ? 'border-emerald-400 bg-emerald-50/20 focus:border-emerald-600'
                        : 'border-rose-300 bg-rose-50/20 focus:border-rose-500'
                    }`}
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  {email.length > 0 && emailValidation.isValid && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 absolute right-3 top-3" />
                  )}
                </div>
                {email.length > 0 && !emailValidation.isValid && (
                  <p className="text-[11px] text-rose-600 font-medium">{emailValidation.error}</p>
                )}
              </div>

              {/* WhatsApp Phone (11 Digits 03XX XXXXXXX) */}
              <div className="space-y-1.5 sm:col-span-1">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-700">WhatsApp Phone (For Rider Updates) *</label>
                  <span className={`text-[10px] font-bold ${whatsapp.length === 11 && phoneValidation.isValid ? 'text-emerald-600' : 'text-slate-400'}`}>
                    {whatsapp.length}/11 digits
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="tel"
                    required
                    maxLength={11}
                    value={whatsapp}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    placeholder="03001234567"
                    className={`w-full bg-slate-50 border rounded-xl pl-9 pr-8 py-2.5 text-xs font-mono text-slate-900 focus:outline-none transition ${
                      whatsapp.length === 0
                        ? 'border-slate-200 focus:border-brand-600'
                        : phoneValidation.isValid
                        ? 'border-emerald-400 bg-emerald-50/20 focus:border-emerald-600'
                        : 'border-rose-300 bg-rose-50/20 focus:border-rose-500'
                    }`}
                  />
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  {whatsapp.length > 0 && phoneValidation.isValid && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 absolute right-3 top-3" />
                  )}
                </div>
                {whatsapp.length > 0 && !phoneValidation.isValid ? (
                  <p className="text-[11px] text-rose-600 font-medium">{phoneValidation.error}</p>
                ) : (
                  <p className="text-[10px] text-slate-400">
                    Exactly 11 digits starting with 03 (e.g. 0300 1234567, 0321 9876543)
                  </p>
                )}
              </div>

              {/* Optional Password */}
              <div className="space-y-1.5 sm:col-span-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-700">Set Account Password (Optional for Late Account Gate)</label>
                  {password.length > 0 && (
                    <span className={`text-[10px] font-bold ${passwordValidation.isValid ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {passwordValidation.isValid ? '✓ Good' : 'Min 6 chars'}
                    </span>
                  )}
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a password to easily track future orders (min 6 chars)"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-10 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-brand-600"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 p-0.5 text-slate-400 hover:text-slate-700 transition focus:outline-none"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Delivery Address */}
          <div className="bg-white p-6 rounded-2xl border-2 border-brand-800/20 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <MapPin className="w-4 h-4 text-brand-700" />
              <h3 className="text-sm font-extrabold text-slate-900">
                2. Shipping & Delivery Address
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5 sm:col-span-2">
                <label className="font-bold text-slate-700">Street Address & House/Flat # *</label>
                <input
                  type="text"
                  required
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  placeholder="e.g. House 42, Street 10, Sector G-11/2"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:border-brand-600"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Area / Colony / Sector *</label>
                <input
                  type="text"
                  required
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  placeholder="e.g. DHA Phase 5 / Gulberg"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:border-brand-600"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">City *</label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-semibold text-slate-900 focus:outline-none focus:border-brand-600"
                >
                  {CITIES_OF_PAKISTAN.filter((c) => c !== 'All Cities').map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="bg-white p-6 rounded-2xl border-2 border-brand-800/20 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <CreditCard className="w-4 h-4 text-brand-700" />
              <h3 className="text-sm font-extrabold text-slate-900">
                3. Choose Payment Method
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {[
                {
                  id: 'COD',
                  title: 'Cash on Delivery (COD)',
                  desc: 'Pay cash directly to the dispatch rider upon delivery',
                  badge: 'Standard',
                },
                {
                  id: 'JAZZCASH',
                  title: 'JazzCash Mobile Wallet',
                  desc: 'Instant online mobile account confirmation',
                  badge: 'Popular',
                },
                {
                  id: 'EASYPAISA',
                  title: 'EasyPaisa Wallet',
                  desc: 'Pay via EasyPaisa App or mobile number',
                  badge: 'Fast',
                },
                {
                  id: 'SADAPAY',
                  title: 'SadaPay / NayaPay',
                  desc: 'Fast 0% fee debit/virtual card payment',
                  badge: 'Zero Fee',
                },
                {
                  id: 'BANK_TRANSFER',
                  title: 'Direct Bank Transfer',
                  desc: '1-Link Transfer (Meezan, HBL, Alfalah, Standard Chartered)',
                  badge: 'Enterprise',
                },
              ].map((pm) => {
                const isSelected = paymentMethod === pm.id;
                return (
                  <button
                    type="button"
                    key={pm.id}
                    onClick={() => setPaymentMethod(pm.id)}
                    className={`p-4 rounded-xl border-2 text-left transition flex flex-col justify-between gap-2 ${
                      isSelected
                        ? 'border-brand-600 bg-brand-50/60 shadow-sm ring-1 ring-brand-500'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-bold text-slate-900 text-xs">{pm.title}</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 border border-slate-200">
                        {pm.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">{pm.desc}</p>
                  </button>
                );
              })}
            </div>

            {/* Interactive Digital Wallet / Bank Instructions Box */}
            {paymentMethod !== 'COD' && (
              <div className="p-4 rounded-2xl bg-amber-50/60 border-2 border-brand-800/15 text-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-slate-900">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>
                      {paymentMethod === 'JAZZCASH' && 'JazzCash Escrow Account Details'}
                      {paymentMethod === 'EASYPAISA' && 'EasyPaisa Escrow Account Details'}
                      {paymentMethod === 'SADAPAY' && 'SadaPay / NayaPay Gateway Details'}
                      {paymentMethod === 'BANK_TRANSFER' && 'Direct 1-Link Bank Account Details'}
                    </span>
                  </div>
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    Buyer Escrow Protected
                  </span>
                </div>

                {paymentMethod === 'JAZZCASH' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    <div className="bg-white p-2.5 rounded-xl border border-slate-200 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-500 block font-medium">JazzCash Account / Till</span>
                        <span className="font-mono font-bold text-slate-900 text-xs">03336175771</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy('03336175771', 'JazzCash Account')}
                        className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 transition"
                        title="Copy Account"
                      >
                        {copiedField === 'JazzCash Account' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                      <span className="text-[10px] text-slate-500 block font-medium">Account Title</span>
                      <span className="font-bold text-slate-900 text-xs">Bazaar.pk Escrow Gateway</span>
                    </div>
                  </div>
                )}

                {paymentMethod === 'EASYPAISA' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    <div className="bg-white p-2.5 rounded-xl border border-slate-200 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-500 block font-medium">EasyPaisa Account Number</span>
                        <span className="font-mono font-bold text-slate-900 text-xs">03336175771</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy('03336175771', 'EasyPaisa Account')}
                        className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 transition"
                        title="Copy Account"
                      >
                        {copiedField === 'EasyPaisa Account' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                      <span className="text-[10px] text-slate-500 block font-medium">Account Title</span>
                      <span className="font-bold text-slate-900 text-xs">Bazaar.pk Escrow Services</span>
                    </div>
                  </div>
                )}

                {paymentMethod === 'SADAPAY' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    <div className="bg-white p-2.5 rounded-xl border border-slate-200 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-500 block font-medium">SadaPay Account Number</span>
                        <span className="font-mono font-bold text-slate-900 text-xs">03336175771</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy('03336175771', 'SadaPay Account')}
                        className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 transition"
                        title="Copy Account"
                      >
                        {copiedField === 'SadaPay Account' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                      <span className="text-[10px] text-slate-500 block font-medium">Account Title</span>
                      <span className="font-bold text-slate-900 text-xs">Bazaar Hyperlocal Escrow</span>
                    </div>
                  </div>
                )}

                {paymentMethod === 'BANK_TRANSFER' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    <div className="bg-white p-2.5 rounded-xl border border-slate-200 flex items-center justify-between sm:col-span-2">
                      <div>
                        <span className="text-[10px] text-slate-500 block font-medium">Meezan Bank 1-Link IBAN</span>
                        <span className="font-mono font-bold text-slate-900 text-xs">PK42MEZN0001234567890101</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy('PK42MEZN0001234567890101', 'Bank IBAN')}
                        className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 transition"
                        title="Copy IBAN"
                      >
                        {copiedField === 'Bank IBAN' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                      <span className="text-[10px] text-slate-500 block font-medium">Bank Name</span>
                      <span className="font-bold text-slate-900 text-xs">Meezan Bank Ltd</span>
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                      <span className="text-[10px] text-slate-500 block font-medium">Account Title</span>
                      <span className="font-bold text-slate-900 text-xs">Bazaar.pk Marketplace (Pvt) Ltd</span>
                    </div>
                  </div>
                )}

                <p className="text-[11px] text-slate-600 leading-relaxed">
                  💡 <strong>How it works:</strong> Transfer the exact order amount ({formatPKR(grandTotal)}) to the escrow account above. Once confirmed, local sellers will instantly dispatch your packages with live rider tracking.
                </p>
              </div>
            )}
          </div>

          {formError && (
            <div className="p-4 bg-rose-50 border border-rose-300 rounded-xl text-rose-800 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{formError}</span>
            </div>
          )}
        </div>

        {/* Right Column: Multi-Vendor Order Breakdown */}
        <div className="lg:col-span-5 space-y-6 sticky top-24">
          <div className="bg-white p-6 rounded-2xl border-2 border-brand-800/20 shadow-sm space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900 pb-3 border-b border-slate-100">
              Multi-Vendor Sub-Orders Breakdown ({storeIds.length} Stores)
            </h3>

            <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
              {storeIds.map((storeId) => {
                const group = itemsByStore[storeId];
                const storeSubtotal = group.items.reduce(
                  (sum, i) => sum + i.price * i.quantity,
                  0
                );

                return (
                  <div
                    key={storeId}
                    className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-bold text-xs text-brand-900">
                        <Store className="w-3.5 h-3.5 text-brand-700" />
                        <span>{group.storeName}</span>
                      </div>
                      <span className="text-[10px] bg-white border border-slate-200 px-2 py-0.5 rounded-full font-semibold text-slate-600">
                        📍 {group.storeCity}
                      </span>
                    </div>

                    <div className="space-y-2 divide-y divide-slate-100 text-xs">
                      {group.items.map((i) => (
                        <div key={i.variantId} className="pt-2 first:pt-0 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-800">{i.quantity}x</span>
                            <span className="text-slate-700 truncate max-w-[180px]">{i.title}</span>
                          </div>
                          <span className="font-semibold text-slate-900">
                            {formatPKR(i.price * i.quantity)}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-2 border-t border-slate-200 flex justify-between text-[11px] text-slate-500 font-medium">
                      <span>Subtotal + Rs. 150 Express Delivery:</span>
                      <span className="font-bold text-slate-800">
                        {formatPKR(storeSubtotal + 150)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Financial Summary */}
            <div className="pt-4 border-t border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Items Subtotal:</span>
                <span className="font-bold text-slate-900">{formatPKR(totalAmount)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Multi-Vendor Shipping ({storeIds.length} hubs):</span>
                <span className="font-bold text-slate-900">{formatPKR(shippingFee)}</span>
              </div>
              <div className="flex justify-between text-base font-extrabold text-slate-900 pt-2 border-t border-slate-200">
                <span>Total Amount:</span>
                <span className="text-brand-900 font-display">{formatPKR(grandTotal)}</span>
              </div>
            </div>

            {/* Place Order CTA Button */}
            <button
              type="submit"
              disabled={isPending}
              className="w-full py-4 px-6 bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-sm rounded-xl shadow-brand flex items-center justify-center gap-2 transition transform active:scale-95 disabled:opacity-50"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Confirming Order...</span>
                </>
              ) : (
                <>
                  <span>Confirm Order</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Need Help with Checkout? */}
            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={openSupport}
                className="text-slate-500 hover:text-emerald-700 text-[11px] font-bold inline-flex items-center gap-1.5 transition"
              >
                <Headphones className="w-3.5 h-3.5 text-emerald-600" />
                <span>Need help with payment or order? 24/7 Helpline: <strong>{ADMIN_SUPPORT_PHONE_FORMATTED}</strong></span>
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
