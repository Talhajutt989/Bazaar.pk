'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Headphones,
  Phone,
  MessageCircle,
  Copy,
  Check,
  X,
  Package,
  CreditCard,
  Store,
  RotateCcw,
  Clock,
  MapPin,
  Sparkles,
  Send,
  ShieldCheck,
  ArrowRight,
  Zap,
} from 'lucide-react';
import {
  ADMIN_SUPPORT_PHONE,
  ADMIN_SUPPORT_PHONE_FORMATTED,
  ADMIN_SUPPORT_WHATSAPP_LINK,
} from '@/context/SupportContext';
import { useToast } from '@/context/ToastContext';

interface CustomerSupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CustomerSupportModal({ isOpen, onClose }: CustomerSupportModalProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [customMessage, setCustomMessage] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close on Escape key & prevent body scrolling when open
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!mounted || !isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(ADMIN_SUPPORT_PHONE);
    setCopied(true);
    toast('Helpline number copied: 0331-5242667', 'success');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleCustomWhatsAppSend = (e: React.FormEvent) => {
    e.preventDefault();
    const text = customMessage.trim() || 'Assalam-o-Alaikum Bazaar.pk Support, I need assistance regarding my order.';
    const encoded = encodeURIComponent(text);
    window.open(`https://wa.me/923315242667?text=${encoded}`, '_blank');
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative w-full max-w-xl bg-white rounded-[32px] shadow-[0_25px_70px_rgba(0,0,0,0.35)] border border-slate-200/90 overflow-hidden text-slate-900 transform transition-all max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header with Rich Glow */}
        <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 text-white p-6 sm:p-7 relative overflow-hidden shrink-0">
          {/* Ambient Glows */}
          <div className="absolute top-[-30%] right-[-15%] w-60 h-60 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-[-30%] left-[-15%] w-52 h-52 bg-teal-500/20 rounded-full blur-3xl pointer-events-none" />

          {/* Close Button - High z-index to guarantee clickability */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onClose();
            }}
            className="absolute top-4 right-4 sm:top-5 sm:right-5 w-10 h-10 rounded-full bg-white/10 hover:bg-white/25 active:scale-90 text-slate-200 hover:text-white transition duration-150 flex items-center justify-center cursor-pointer z-50 shadow-md border border-white/10"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="relative z-10 space-y-3">
            {/* Live Status Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-80" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400" />
              </span>
              <span>Official Customer Care • Live Support</span>
            </div>

            {/* Title & Description */}
            <div>
              <h2 className="text-2xl sm:text-3xl font-black font-display tracking-tight text-white flex items-center gap-2.5">
                <span>How can we help you today?</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed pt-1 max-w-lg">
                Connect directly with our dedicated Pakistan support desk for fast help with your orders, deliveries, payments, or seller inquiries.
              </p>
            </div>
          </div>
        </div>

        {/* Modal Body - Scrollable */}
        <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
          
          {/* Main Direct Helpline Card */}
          <div className="bg-gradient-to-br from-slate-900 via-brand-950 to-slate-900 rounded-2xl p-3.5 sm:p-4 text-white border border-emerald-500/30 shadow-lg space-y-3 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

            {/* Unique VIP Hotline Card */}
            <div className="relative bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 p-3 sm:p-3.5 rounded-xl border border-emerald-500/30 shadow-inner flex items-center justify-between gap-3 overflow-hidden group">
              {/* Background Neon Accent Glow */}
              <div className="absolute top-0 right-0 w-36 h-36 bg-gradient-to-bl from-emerald-500/20 via-teal-500/10 to-transparent rounded-full blur-xl pointer-events-none" />
              
              <div className="space-y-0.5 relative z-10 min-w-0">
                {/* Status Tag */}
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-black uppercase tracking-wider border border-emerald-400/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Direct Priority Line
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium hidden sm:inline">
                    🇵🇰 Pakistan Official
                  </span>
                </div>

                {/* Unique Distinctive Number Typography - Clean Single Line */}
                <div className="flex items-center gap-2 pt-0.5 whitespace-nowrap">
                  <span className="text-base sm:text-lg font-black font-mono tracking-wide text-white whitespace-nowrap">
                    0331-5242667
                  </span>
                </div>

                {/* Subtext */}
                <p className="text-[10px] text-slate-400 flex items-center gap-1 font-medium truncate">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="truncate">24/7 Official Helpline & WhatsApp</span>
                </p>
              </div>

              {/* Copy Action Button */}
              <button
                type="button"
                onClick={handleCopy}
                className="px-3 py-2 bg-emerald-500/15 hover:bg-emerald-500/25 active:scale-95 text-emerald-300 hover:text-white font-bold rounded-lg transition flex items-center gap-1.5 border border-emerald-400/30 text-xs shrink-0 cursor-pointer shadow-sm group-hover:border-emerald-400/60"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-300 font-extrabold text-[11px]">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="hidden sm:inline text-[11px]">Copy</span>
                  </>
                )}
              </button>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 relative z-10">
              <a
                href={ADMIN_SUPPORT_WHATSAPP_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2.5 px-3.5 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-black text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 group"
              >
                <MessageCircle className="w-4 h-4 fill-slate-950 text-slate-950" />
                <span>Message on WhatsApp</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </a>

              <a
                href={`tel:${ADMIN_SUPPORT_PHONE}`}
                className="py-2.5 px-3.5 bg-white/10 hover:bg-white/20 active:scale-95 text-white font-bold text-xs rounded-xl border border-white/15 transition flex items-center justify-center gap-2"
              >
                <Phone className="w-4 h-4 text-emerald-400" />
                <span>Call Helpline</span>
              </a>
            </div>
          </div>

          {/* Quick Direct Inquiry Input Form */}
          <form onSubmit={handleCustomWhatsAppSend} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2.5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Send Quick Inquiry</span>
              </span>
              <span className="text-[10px] text-slate-400 font-medium">Opens WhatsApp instantly</span>
            </div>
            
            <div className="flex gap-2">
              <input
                type="text"
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder="e.g. Where is my order #1042? / Product details..."
                className="flex-1 px-3.5 py-2.5 text-xs bg-white rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-slate-900 placeholder:text-slate-400"
              />
              <button
                type="submit"
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition active:scale-95 flex items-center gap-1.5 shadow-xs shrink-0 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send</span>
              </button>
            </div>
          </form>

          {/* Frequently Assisted Topics */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-emerald-600" />
                <span>Frequently Assisted Topics</span>
              </span>
              <span className="text-[10px] text-slate-400 font-medium">Tap to chat</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              <a
                href="https://wa.me/923315242667?text=Assalam-o-Alaikum%20Bazaar.pk,%20I%20want%20to%20track%20my%20order%20status."
                target="_blank"
                rel="noopener noreferrer"
                className="p-3.5 bg-white hover:bg-emerald-50/70 rounded-2xl border border-slate-200 flex items-center justify-between transition group shadow-xs hover:border-emerald-300 hover:-translate-y-0.5"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition">
                    <Package className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 block leading-tight text-xs">
                      Track Order & Delivery
                    </span>
                    <span className="text-[10px] text-slate-500">Live courier & rider updates</span>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition" />
              </a>

              <a
                href="https://wa.me/923315242667?text=Assalam-o-Alaikum%20Bazaar.pk,%20I%20have%20a%20question%20regarding%20payment%20via%20JazzCash/EasyPaisa/Card."
                target="_blank"
                rel="noopener noreferrer"
                className="p-3.5 bg-white hover:bg-amber-50/70 rounded-2xl border border-slate-200 flex items-center justify-between transition group shadow-xs hover:border-amber-300 hover:-translate-y-0.5"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center shrink-0 group-hover:bg-amber-600 group-hover:text-white transition">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 block leading-tight text-xs">
                      Payments & Billing
                    </span>
                    <span className="text-[10px] text-slate-500">COD, JazzCash, SadaPay & Cards</span>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-600 group-hover:translate-x-1 transition" />
              </a>

              <a
                href="https://wa.me/923315242667?text=Assalam-o-Alaikum%20Bazaar.pk,%20I%20want%20to%20request%20a%20return%20or%20refund."
                target="_blank"
                rel="noopener noreferrer"
                className="p-3.5 bg-white hover:bg-violet-50/70 rounded-2xl border border-slate-200 flex items-center justify-between transition group shadow-xs hover:border-violet-300 hover:-translate-y-0.5"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-violet-50 text-violet-700 border border-violet-200 flex items-center justify-center shrink-0 group-hover:bg-violet-600 group-hover:text-white transition">
                    <RotateCcw className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 block leading-tight text-xs">
                      Returns & Refunds
                    </span>
                    <span className="text-[10px] text-slate-500">7-Day doorstep guarantee</span>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-violet-600 group-hover:translate-x-1 transition" />
              </a>

              <a
                href="https://wa.me/923315242667?text=Assalam-o-Alaikum%20Bazaar.pk,%20I%20am%20a%20shop%20owner%20and%20want%20to%20register%20my%20store."
                target="_blank"
                rel="noopener noreferrer"
                className="p-3.5 bg-white hover:bg-blue-50/70 rounded-2xl border border-slate-200 flex items-center justify-between transition group shadow-xs hover:border-blue-300 hover:-translate-y-0.5"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition">
                    <Store className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 block leading-tight text-xs">
                      Merchant & Store Inquiries
                    </span>
                    <span className="text-[10px] text-slate-500">Sell products on Bazaar.pk</span>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition" />
              </a>
            </div>
          </div>

          {/* Operating Hours & Trust Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 pt-3 border-t border-slate-100 gap-1.5 text-center sm:text-left">
            <span className="flex items-center gap-1.5 font-medium">
              <Clock className="w-3.5 h-3.5 text-emerald-600" />
              <span>Support Hours: 9:00 AM – 11:00 PM PKT (Daily)</span>
            </span>
            <span className="flex items-center gap-1 text-slate-600 font-semibold">
              <MapPin className="w-3 h-3 text-amber-500" />
              <span>Lahore • Karachi • Islamabad • Peshawar</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
}
