import React from 'react';
import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, Outfit } from 'next/font/google';
import './globals.css';
import { ToastProvider } from '@/context/ToastContext';
import { CartProvider } from '@/context/CartContext';
import { SupportProvider } from '@/context/SupportContext';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { AIChatAssistant } from '@/components/ai/AIChatAssistant';
import { getSession } from '@/lib/auth';
import { getSupabaseCategories } from '@/lib/supabase-service';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-sans',
  display: 'swap',
});

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['500', '600', '700', '800', '900'],
  variable: '--font-display',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Bazaar.pk | Direct From Verified Local Shops & Markets',
  description:
    'Pakistan’s trusted online marketplace connecting verified local stores and bazaars in Lahore, Karachi, Islamabad, Rawalpindi, Peshawar, and Faisalabad directly with buyers.',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  const categories = await getSupabaseCategories();

  return (
    <html lang="en" className={`${plusJakarta.variable} ${outfit.variable}`} suppressHydrationWarning>
      <body
        className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-900 selection:bg-emerald-600 selection:text-white font-sans antialiased"
        suppressHydrationWarning
      >
        <ToastProvider>
          <SupportProvider>
            <CartProvider>
              {/* Navigation Bar */}
              <React.Suspense fallback={<div className="h-20 bg-[#070A14] border-b border-slate-800/80" />}>
                <Navbar session={session} categories={categories} />
              </React.Suspense>

              {/* Main Application Page */}
              <main className="flex-1">{children}</main>

              {/* Slide-over Cart Drawer */}
              <CartDrawer />

              {/* AI Shopping Assistant Chatbot */}
              <AIChatAssistant />

              {/* Platform Footer */}
              <Footer />
            </CartProvider>
          </SupportProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
