import React from 'react';
import Link from 'next/link';
import { Users, Store, ArrowRight } from 'lucide-react';
import { supabaseAdmin } from '@/lib/supabase';
import { AdminCustomersView, CustomerProfile, CustomerPurchasedItem } from '@/components/admin/AdminCustomersView';

export default async function AdminCustomersPage() {
  const [
    { data: usersRaw },
    { data: ordersRaw },
    { data: storesRaw },
  ] = await Promise.all([
    supabaseAdmin
      .from('users')
      .select('id, name, email, whatsapp, role, created_at, addresses(street, area, city)')
      .eq('role', 'CUSTOMER')
      .order('created_at', { ascending: false }),
    supabaseAdmin
      .from('orders')
      .select(`
        id,
        customer_id,
        total_amount,
        payment_method,
        payment_status,
        created_at,
        users (
          id,
          name,
          email,
          whatsapp
        ),
        addresses (
          street,
          area,
          city
        ),
        sub_orders (
          id,
          store_id,
          status,
          subtotal,
          platform_fee,
          vendor_earnings,
          created_at,
          stores (
            id,
            brand_name,
            city,
            slug
          ),
          order_items (
            id,
            quantity,
            unit_price,
            total_price,
            product_variants (
              id,
              variant_name,
              price,
              products (
                id,
                title,
                slug,
                images
              )
            )
          )
        )
      `)
      .order('created_at', { ascending: false }),
    supabaseAdmin
      .from('stores')
      .select('id, brand_name, city')
      .order('brand_name', { ascending: true }),
  ]);

  // Build Customer Map
  const customerMap = new Map<string, CustomerProfile>();

  // 1. Initialize from users table (role == CUSTOMER)
  for (const u of usersRaw || []) {
    const address = Array.isArray(u.addresses) && u.addresses.length > 0 ? u.addresses[0] : null;
    customerMap.set(u.id, {
      id: u.id,
      name: u.name || 'Verified Customer',
      email: u.email,
      whatsapp: u.whatsapp || '',
      city: address?.city || 'Pakistan',
      streetAddress: address?.street || '',
      createdAt: u.created_at || new Date().toISOString(),
      totalSpent: 0,
      totalOrdersCount: 0,
      purchases: [],
    });
  }

  // 2. Process all Orders and SubOrders to link detailed purchases to each customer
  for (const order of (ordersRaw as any[]) || []) {
    const customerId = order.customer_id || order.users?.id;
    if (!customerId) continue;

    let customer = customerMap.get(customerId);
    if (!customer) {
      // Guest or unregistered buyer
      const userObj = Array.isArray(order.users) ? order.users[0] : order.users;
      const addrObj = Array.isArray(order.addresses) ? order.addresses[0] : order.addresses;

      customer = {
        id: customerId,
        name: userObj?.name || 'Customer',
        email: userObj?.email || 'customer@marketplace.pk',
        whatsapp: userObj?.whatsapp || '',
        city: addrObj?.city || 'Pakistan',
        streetAddress: addrObj?.street || '',
        createdAt: order.created_at || new Date().toISOString(),
        totalSpent: 0,
        totalOrdersCount: 0,
        purchases: [],
      };
      customerMap.set(customerId, customer);
    }

    customer.totalSpent += order.total_amount || 0;
    customer.totalOrdersCount += 1;

    // Process SubOrders and items
    for (const sub of (order.sub_orders as any[]) || []) {
      const storeObj = Array.isArray(sub.stores) ? sub.stores[0] : sub.stores;
      const storeId = storeObj?.id || sub.store_id || 'store-unknown';
      const storeName = storeObj?.brand_name || 'Merchant Store';
      const storeCity = storeObj?.city || 'Pakistan';
      const storeSlug = storeObj?.slug;
      const orderStatus = sub.status || 'PENDING';

      for (const item of (sub.order_items as any[]) || []) {
        const variantObj = Array.isArray(item.product_variants)
          ? item.product_variants[0]
          : item.product_variants;
        const prodObj = Array.isArray(variantObj?.products)
          ? variantObj.products[0]
          : variantObj?.products;

        let images: string[] = [];
        try {
          images = JSON.parse(prodObj?.images || '[]');
        } catch {
          images = [prodObj?.images || ''];
        }

        const purchaseItem: CustomerPurchasedItem = {
          id: item.id,
          subOrderId: sub.id,
          orderId: order.id,
          orderDate: sub.created_at || order.created_at,
          productTitle: prodObj?.title || 'Purchased Product',
          productSlug: prodObj?.slug || '',
          productImage: images[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80',
          variantName: variantObj?.variant_name || 'Standard',
          quantity: item.quantity || 1,
          unitPrice: item.unit_price || 0,
          totalPrice: item.total_price || (item.quantity || 1) * (item.unit_price || 0),
          paymentMethod: order.payment_method || 'COD',
          paymentStatus: order.payment_status || 'PENDING',
          orderStatus,
          storeId,
          storeName,
          storeCity,
          storeSlug,
        };

        customer.purchases.push(purchaseItem);
      }
    }
  }

  // Convert customer map to sorted array
  const customers = Array.from(customerMap.values()).sort((a, b) => {
    if (b.totalSpent !== a.totalSpent) return b.totalSpent - a.totalSpent;
    return b.purchases.length - a.purchases.length;
  });

  const stores = (storesRaw || []).map((s: any) => ({
    id: s.id,
    brandName: s.brand_name,
    city: s.city,
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b-2 border-brand-800/20">
        <div>
          <span className="text-xs font-bold text-brand-700 uppercase tracking-wider flex items-center gap-1">
            <Users className="w-4 h-4" /> Customer & Order Intelligence
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 font-display">
            Customer Directory & Purchase Ledger
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-600 bg-white px-3 py-1.5 rounded-xl border border-slate-200">
            {customers.length} Verified Buyers Monitored
          </span>
        </div>
      </div>

      <AdminCustomersView customers={customers} stores={stores} />
    </div>
  );
}
