'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Users,
  ShoppingBag,
  Store,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Phone,
  Mail,
  MapPin,
  Calendar,
  DollarSign,
  Package,
  ExternalLink,
  CreditCard,
  CheckCircle2,
  Clock,
  Truck,
  Sparkles,
  Download,
} from 'lucide-react';
import { formatPKR, formatDate, formatOrderId, getOrderStatusBadge } from '@/lib/utils';

export interface CustomerPurchasedItem {
  id: string;
  subOrderId: string;
  orderId: string;
  orderDate: string | Date;
  productTitle: string;
  productSlug: string;
  productImage?: string;
  variantName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  storeId: string;
  storeName: string;
  storeCity: string;
  storeSlug?: string;
}

export interface CustomerProfile {
  id: string;
  name: string;
  email: string;
  whatsapp: string;
  city: string;
  streetAddress?: string;
  createdAt: string | Date;
  totalSpent: number;
  totalOrdersCount: number;
  purchases: CustomerPurchasedItem[];
}

interface AdminCustomersViewProps {
  customers: CustomerProfile[];
  stores: Array<{ id: string; brandName: string; city: string }>;
}

export function AdminCustomersView({ customers: initialCustomers, stores }: AdminCustomersViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStoreId, setSelectedStoreId] = useState('ALL');
  const [timeframeFilter, setTimeframeFilter] = useState<'ALL' | 'THIS_WEEK' | 'THIS_MONTH'>('ALL');
  const [expandedCustomerId, setExpandedCustomerId] = useState<string | null>(null);

  // Time boundaries
  const now = new Date();
  const startOfThisWeek = new Date(now);
  const day = startOfThisWeek.getDay();
  const diffToMonday = (day === 0 ? -6 : 1) - day;
  startOfThisWeek.setDate(startOfThisWeek.getDate() + diffToMonday);
  startOfThisWeek.setHours(0, 0, 0, 0);

  const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);

  // Filtered Customers
  const filteredCustomers = useMemo(() => {
    return initialCustomers.filter((c) => {
      // 1. Filter by Store (did this customer buy from selected store?)
      if (selectedStoreId !== 'ALL') {
        const hasPurchasedFromStore = c.purchases.some((p) => p.storeId === selectedStoreId);
        if (!hasPurchasedFromStore) return false;
      }

      // 2. Filter by Timeframe (orders within this week or month)
      if (timeframeFilter === 'THIS_WEEK') {
        const hasRecentOrder = c.purchases.some((p) => new Date(p.orderDate) >= startOfThisWeek);
        if (!hasRecentOrder && c.purchases.length > 0) return false;
      } else if (timeframeFilter === 'THIS_MONTH') {
        const hasRecentOrder = c.purchases.some((p) => new Date(p.orderDate) >= startOfThisMonth);
        if (!hasRecentOrder && c.purchases.length > 0) return false;
      }

      // 3. Search Filter (Name, Email, WhatsApp, City)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const nameMatch = c.name?.toLowerCase().includes(q);
        const emailMatch = c.email?.toLowerCase().includes(q);
        const phoneMatch = c.whatsapp?.toLowerCase().includes(q);
        const cityMatch = c.city?.toLowerCase().includes(q);
        const productMatch = c.purchases.some((p) => p.productTitle?.toLowerCase().includes(q));
        if (!nameMatch && !emailMatch && !phoneMatch && !cityMatch && !productMatch) {
          return false;
        }
      }

      return true;
    });
  }, [initialCustomers, selectedStoreId, timeframeFilter, searchQuery]);

  // Key platform metrics
  const totalCustomersCount = initialCustomers.length;
  const totalCustomerSpend = initialCustomers.reduce((sum, c) => sum + c.totalSpent, 0);
  const totalOrdersPlaced = initialCustomers.reduce((sum, c) => sum + c.totalOrdersCount, 0);
  const avgCustomerSpend = totalCustomersCount > 0 ? Math.round(totalCustomerSpend / totalCustomersCount) : 0;

  const toggleExpand = (customerId: string) => {
    setExpandedCustomerId((prev) => (prev === customerId ? null : customerId));
  };

  const handleExportCSV = () => {
    const headers = [
      'Customer Name',
      'Email',
      'WhatsApp Phone',
      'City',
      'Total Spent (PKR)',
      'Total Orders',
      'Purchased Products',
      'Sellers Purchased From',
    ];

    const rows = filteredCustomers.map((c) => [
      `"${c.name || 'Customer'}"`,
      `"${c.email || ''}"`,
      `"${c.whatsapp || ''}"`,
      `"${c.city || ''}"`,
      c.totalSpent,
      c.totalOrdersCount,
      `"${c.purchases.map((p) => `${p.productTitle} (Qty: ${p.quantity})`).join('; ')}"`,
      `"${Array.from(new Set(c.purchases.map((p) => p.storeName))).join(', ')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `bazaar_customers_purchase_report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Customers */}
        <div className="bg-white p-5 rounded-2xl border-2 border-brand-800/20 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>Registered & Guest Customers</span>
            <div className="p-2 bg-brand-100 text-brand-800 rounded-xl">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 font-display">
            {totalCustomersCount} Customers
          </div>
          <span className="text-[11px] text-brand-700 font-medium">Nationwide buyers</span>
        </div>

        {/* Total Customer Spend */}
        <div className="bg-white p-5 rounded-2xl border-2 border-brand-800/20 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>Total Customer Volume</span>
            <div className="p-2 bg-amber-100 text-amber-800 rounded-xl">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-amber-600 font-display">
            {formatPKR(totalCustomerSpend)}
          </div>
          <span className="text-[11px] text-slate-500">Gross customer purchasing power</span>
        </div>

        {/* Total Customer Orders */}
        <div className="bg-white p-5 rounded-2xl border-2 border-brand-800/20 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>Total Orders Placed</span>
            <div className="p-2 bg-blue-100 text-blue-800 rounded-xl">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 font-display">
            {totalOrdersPlaced} Orders
          </div>
          <span className="text-[11px] text-slate-500">Across all marketplace stores</span>
        </div>

        {/* Average Spend */}
        <div className="bg-white p-5 rounded-2xl border-2 border-brand-800/20 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>Avg Customer Lifetime Value</span>
            <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-emerald-700 font-display">
            {formatPKR(avgCustomerSpend)}
          </div>
          <span className="text-[11px] text-slate-500">Per customer expenditure</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-5 rounded-3xl border-2 border-brand-800/20 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search customer name, email, phone (+92...), city, or product bought..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-brand-600 font-medium"
            />
          </div>

          {/* Filters & Export */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Filter by Seller (Kis seller se khareda hai) */}
            <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs">
              <Store className="w-3.5 h-3.5 text-brand-700 shrink-0" />
              <select
                value={selectedStoreId}
                onChange={(e) => setSelectedStoreId(e.target.value)}
                className="bg-transparent font-bold text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="ALL">Bought from Any Seller ({stores.length})</option>
                {stores.map((s) => (
                  <option key={s.id} value={s.id}>
                    Bought from: {s.brandName} ({s.city})
                  </option>
                ))}
              </select>
            </div>

            {/* Timeframe Filter */}
            <select
              value={timeframeFilter}
              onChange={(e) => setTimeframeFilter(e.target.value as any)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Time Orders</option>
              <option value="THIS_WEEK">Orders This Week (Is Haftay)</option>
              <option value="THIS_MONTH">Orders This Month (Is Mahine)</option>
            </select>

            {/* CSV Export Button */}
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="Download customer purchase ledger CSV"
            >
              <Download className="w-3.5 h-3.5 text-brand-700" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Filter Summary */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          <span>
            Showing <strong className="text-slate-900 font-extrabold">{filteredCustomers.length}</strong> of{' '}
            {totalCustomersCount} customers
            {selectedStoreId !== 'ALL' && (
              <span className="text-brand-800 font-bold ml-1">
                (Bought from {stores.find((s) => s.id === selectedStoreId)?.brandName})
              </span>
            )}
          </span>

          {(searchQuery || selectedStoreId !== 'ALL' || timeframeFilter !== 'ALL') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedStoreId('ALL');
                setTimeframeFilter('ALL');
              }}
              className="text-brand-700 font-bold hover:underline"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Customer List with Expandable Item Drill-Down */}
      <div className="space-y-4">
        {filteredCustomers.length > 0 ? (
          filteredCustomers.map((customer) => {
            const isExpanded = expandedCustomerId === customer.id;

            return (
              <div
                key={customer.id}
                className="bg-white rounded-3xl border-2 border-brand-800/20 shadow-sm overflow-hidden transition-all"
              >
                {/* Customer Summary Bar */}
                <div
                  onClick={() => toggleExpand(customer.id)}
                  className="p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/80 transition select-none"
                >
                  <div className="flex items-start sm:items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-900 to-brand-700 text-amber-300 flex items-center justify-center font-extrabold text-base shadow-sm shrink-0">
                      {(customer.name || 'C').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base font-extrabold text-slate-900 font-display">
                          {customer.name || 'Verified Customer'}
                        </h3>
                        <span className="bg-brand-50 text-brand-800 border border-brand-200 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                          {customer.purchases.length} {customer.purchases.length === 1 ? 'Item Bought' : 'Items Bought'}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap mt-1">
                        <span className="flex items-center gap-1 font-medium">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          {customer.email}
                        </span>

                        {customer.whatsapp && (
                          <span className="flex items-center gap-1 text-emerald-700 font-bold">
                            <Phone className="w-3.5 h-3.5 text-emerald-600" />
                            {customer.whatsapp}
                          </span>
                        )}

                        <span className="flex items-center gap-1 text-slate-600">
                          <MapPin className="w-3.5 h-3.5 text-brand-600" />
                          📍 {customer.city || 'Pakistan'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right side financials and expand button */}
                  <div className="flex items-center justify-between lg:justify-end gap-6 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                    <div className="text-left lg:text-right">
                      <span className="text-[11px] text-slate-400 block font-medium">Lifetime Spend</span>
                      <span className="text-base sm:text-lg font-black text-brand-950 font-display">
                        {formatPKR(customer.totalSpent)}
                      </span>
                      <span className="text-[10px] text-slate-500 block">
                        {customer.totalOrdersCount} {customer.totalOrdersCount === 1 ? 'Order' : 'Orders'}
                      </span>
                    </div>

                    <button
                      type="button"
                      className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                        isExpanded
                          ? 'bg-brand-900 text-amber-300'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      <span>{isExpanded ? 'Hide Purchase Items' : 'View What They Bought'}</span>
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Detailed Item-by-Item Drill-Down */}
                {isExpanded && (
                  <div className="border-t-2 border-dashed border-brand-800/20 bg-slate-50/70 p-5 sm:p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ShoppingBag className="w-4 h-4 text-brand-700" />
                        <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
                          Itemized Purchase Ledger for {customer.name || customer.email}
                        </h4>
                      </div>
                      <span className="text-[11px] text-slate-500 font-medium">
                        Shows exact product, variant, quantity, price & seller source
                      </span>
                    </div>

                    {customer.purchases.length > 0 ? (
                      <div className="overflow-x-auto bg-white rounded-2xl border border-slate-200 shadow-2xs">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-100/80 text-slate-700 font-bold border-b border-slate-200">
                            <tr>
                              <th className="p-3">Product Bought (Konsi Cheez)</th>
                              <th className="p-3">Variant / Options</th>
                              <th className="p-3">Seller / Store (Kis Se Kharedi)</th>
                              <th className="p-3">Qty & Price</th>
                              <th className="p-3">Total (PKR)</th>
                              <th className="p-3">Payment</th>
                              <th className="p-3">Status</th>
                              <th className="p-3 text-right">Date</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {customer.purchases.map((item, idx) => {
                              const badge = getOrderStatusBadge(item.orderStatus);

                              return (
                                <tr key={idx} className="hover:bg-amber-50/30 transition">
                                  {/* Product Name */}
                                  <td className="p-3 font-semibold text-slate-900">
                                    <div className="flex items-center gap-2.5">
                                      <div className="w-9 h-9 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden shrink-0 relative">
                                        <Image
                                          src={
                                            item.productImage ||
                                            'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80'
                                          }
                                          alt={item.productTitle}
                                          fill
                                          sizes="36px"
                                          className="object-cover"
                                        />
                                      </div>
                                      <div>
                                        <Link
                                          href={`/products/${item.productSlug}`}
                                          target="_blank"
                                          className="font-bold text-slate-900 hover:text-brand-700 flex items-center gap-1"
                                        >
                                          <span>{item.productTitle}</span>
                                          <ExternalLink className="w-3 h-3 text-slate-400" />
                                        </Link>
                                        <span className="text-[10px] text-slate-400 font-mono">
                                          SubOrder: {formatOrderId(item.subOrderId)}
                                        </span>
                                      </div>
                                    </div>
                                  </td>

                                  {/* Variant */}
                                  <td className="p-3">
                                    <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded-md font-medium text-[10px] border border-slate-200">
                                      {item.variantName || 'Standard'}
                                    </span>
                                  </td>

                                  {/* Seller / Store (Kis se kharedi hai) */}
                                  <td className="p-3">
                                    <div className="flex items-center gap-1.5">
                                      <Store className="w-3.5 h-3.5 text-brand-700 shrink-0" />
                                      <div>
                                        <span className="font-extrabold text-brand-900 block">
                                          {item.storeName}
                                        </span>
                                        <span className="text-[10px] text-slate-500">📍 {item.storeCity}</span>
                                      </div>
                                    </div>
                                  </td>

                                  {/* Qty & Unit Price */}
                                  <td className="p-3">
                                    <span className="font-bold text-slate-800">{item.quantity}x</span>{' '}
                                    <span className="text-slate-500">@ {formatPKR(item.unitPrice)}</span>
                                  </td>

                                  {/* Total Price */}
                                  <td className="p-3 font-extrabold text-slate-900">
                                    {formatPKR(item.totalPrice)}
                                  </td>

                                  {/* Payment Method */}
                                  <td className="p-3">
                                    <span className="font-mono text-[10px] font-bold text-slate-700 block">
                                      {item.paymentMethod}
                                    </span>
                                    <span
                                      className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full inline-block ${
                                        item.paymentStatus === 'PAID'
                                          ? 'bg-emerald-100 text-emerald-800'
                                          : 'bg-amber-100 text-amber-800'
                                      }`}
                                    >
                                      {item.paymentStatus}
                                    </span>
                                  </td>

                                  {/* Status */}
                                  <td className="p-3">
                                    <span
                                      className={`px-2 py-0.5 rounded-full font-bold text-[10px] border ${badge.bg}`}
                                    >
                                      {badge.label}
                                    </span>
                                  </td>

                                  {/* Date */}
                                  <td className="p-3 text-right text-slate-500 font-medium text-[11px] whitespace-nowrap">
                                    {formatDate(new Date(item.orderDate))}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="p-6 bg-white rounded-2xl border border-slate-200 text-center text-xs text-slate-400">
                        No orders recorded yet for this customer profile.
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="bg-white p-12 rounded-3xl border-2 border-brand-800/20 text-center shadow-sm space-y-2">
            <Users className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">No Customers Found</h3>
            <p className="text-xs text-slate-500">No customers match the current filter or search criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}
