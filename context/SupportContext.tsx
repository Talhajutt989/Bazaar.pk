'use client';

import React, { createContext, useContext, useState } from 'react';
import { CustomerSupportModal } from '@/components/support/CustomerSupportModal';

interface SupportContextType {
  isSupportOpen: boolean;
  openSupport: () => void;
  closeSupport: () => void;
  supportPhone: string;
}

const SupportContext = createContext<SupportContextType | undefined>(undefined);

export const ADMIN_SUPPORT_PHONE = '03315242667';
export const ADMIN_SUPPORT_PHONE_FORMATTED = '0331-5242667';
export const ADMIN_SUPPORT_WHATSAPP_LINK = 'https://wa.me/923315242667?text=Assalam-o-Alaikum%20Bazaar.pk%20Customer%20Support,%20I%20need%20assistance%20regarding...';

export function SupportProvider({ children }: { children: React.ReactNode }) {
  const [isSupportOpen, setIsSupportOpen] = useState(false);

  const openSupport = () => setIsSupportOpen(true);
  const closeSupport = () => setIsSupportOpen(false);

  return (
    <SupportContext.Provider
      value={{
        isSupportOpen,
        openSupport,
        closeSupport,
        supportPhone: ADMIN_SUPPORT_PHONE,
      }}
    >
      {children}
      <CustomerSupportModal isOpen={isSupportOpen} onClose={closeSupport} />
    </SupportContext.Provider>
  );
}

export function useSupport() {
  const context = useContext(SupportContext);
  if (!context) {
    throw new Error('useSupport must be used within a SupportProvider');
  }
  return context;
}
