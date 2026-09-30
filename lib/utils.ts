import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPKR(amount: number): string {
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    maximumFractionDigits: 0,
  }).format(amount).replace('PKR', 'Rs. ');
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-PK', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(d);
}

export const CITIES_OF_PAKISTAN = [
  'All Cities',
  'Lahore',
  'Karachi',
  'Islamabad',
  'Rawalpindi',
  'Peshawar',
  'Faisalabad',
  'Multan',
  'Quetta',
  'Sialkot',
  'Gujranwala',
];

export function getOrderStatusBadge(status: string) {
  switch (status) {
    case 'PENDING':
      return {
        label: 'Pending',
        bg: 'bg-amber-100 text-amber-900 border-amber-300',
        dot: 'bg-amber-500',
      };
    case 'CONFIRMED':
    case 'PROCESSING':
      return {
        label: 'Processing',
        bg: 'bg-yellow-100 text-yellow-900 border-yellow-400',
        dot: 'bg-yellow-500',
      };
    case 'SHIPPED':
      return {
        label: 'Shipped',
        bg: 'bg-orange-100 text-orange-900 border-orange-300',
        dot: 'bg-orange-500',
      };
    case 'OUT_FOR_DELIVERY':
      return {
        label: 'Out for Delivery',
        bg: 'bg-amber-200 text-amber-950 border-amber-400',
        dot: 'bg-amber-600',
      };
    case 'DELIVERED':
      return {
        label: 'Delivered',
        bg: 'bg-yellow-50 text-amber-900 border-yellow-500 font-bold',
        dot: 'bg-amber-500',
      };
    case 'CANCELLED':
    case 'REFUNDED':
      return {
        label: status === 'CANCELLED' ? 'Cancelled' : 'Refunded',
        bg: 'bg-rose-100 text-rose-800 border-rose-300',
        dot: 'bg-rose-500',
      };
    default:
      return {
        label: status,
        bg: 'bg-slate-100 text-slate-800 border-slate-300',
        dot: 'bg-slate-500',
      };
  }
}

export function getKycStatusBadge(status: string) {
  switch (status) {
    case 'APPROVED':
      return {
        label: 'KYC Verified (Active)',
        bg: 'bg-emerald-100 text-emerald-950 border-emerald-400 font-bold',
        iconColor: 'text-emerald-600',
      };
    case 'UNDER_REVIEW':
      return {
        label: 'Under Review (3-4 Hours)',
        bg: 'bg-amber-100 text-amber-950 border-amber-400 font-bold animate-pulse',
        iconColor: 'text-amber-600',
      };
    case 'REJECTED':
      return {
        label: 'KYC Rejected',
        bg: 'bg-rose-100 text-rose-800 border-rose-300 font-bold',
        iconColor: 'text-rose-600',
      };
    case 'PENDING':
    case 'PENDING_KYC':
    default:
      return {
        label: 'KYC Pending',
        bg: 'bg-slate-100 text-slate-800 border-slate-300 font-bold',
        iconColor: 'text-slate-600',
      };
  }
}

export function getStoreStatusBadge(status: string) {
  switch (status) {
    case 'ACTIVE':
      return {
        label: 'Active',
        bg: 'bg-yellow-100 text-amber-950 border-yellow-400 font-bold',
      };
    case 'SUSPENDED':
      return {
        label: 'Suspended',
        bg: 'bg-red-100 text-red-800 border-red-300',
      };
    case 'UNDER_REVIEW':
      return {
        label: 'Under Review',
        bg: 'bg-amber-100 text-amber-900 border-amber-300',
      };
    case 'PENDING_KYC':
    default:
      return {
        label: 'Pending KYC',
        bg: 'bg-amber-100 text-amber-900 border-amber-300',
      };
  }
}

/**
 * Formats a raw UUID order ID into a clean, unique, professional Pakistani Marketplace Order Reference.
 * Example: "32e5023d-..." -> "BZ-841197"
 */
export function formatOrderId(id?: string | null): string {
  if (!id) return 'BZ-100001';
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    const char = id.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // 32-bit integer
  }
  const positiveNum = (Math.abs(hash) % 900000) + 100000;
  return `BZ-${positiveNum}`;
}

