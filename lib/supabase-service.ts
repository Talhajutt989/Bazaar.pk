import { supabase, supabaseAdmin } from './supabase';
import { cache } from 'react';

export interface SupabaseCategory {
  id: string;
  name: string;
  slug: string;
}

export interface SupabaseStore {
  id: string;
  brand_name: string;
  slug: string;
  brand_address: string;
  city: string;
  area?: string;
  commission_rate?: number;
  status: string;
}

export interface SupabaseVariant {
  id: string;
  product_id: string;
  sku: string;
  variant_name: string;
  price: number;
  stock: number;
  attributes?: string;
}

export interface SupabaseReview {
  id: string;
  product_id: string;
  user_id: string;
  rating_stars: number;
  comment?: string;
  created_at: string;
  users?: {
    name: string | null;
  };
}

export interface SupabaseProduct {
  id: string;
  store_id: string;
  category_id: string;
  title: string;
  brand?: string;
  slug: string;
  description: string;
  base_price: number;
  images: string;
  is_active: boolean;
  is_approved: boolean;
  created_at: string;
  stores?: SupabaseStore;
  categories?: SupabaseCategory;
  product_variants?: SupabaseVariant[];
  reviews?: SupabaseReview[];
}

import { SEEDED_PRODUCTS } from './seed-products';

// In-Memory Stale-While-Revalidate (SWR) Ultra-Fast Cache Engine
interface CacheEntry<T> {
  data: T;
  freshUntil: number;
}

const INITIAL_CATEGORIES: SupabaseCategory[] = [
  { id: 'cat-1', name: 'Smartphones & Gadgets', slug: 'smartphones-gadgets' },
  { id: 'cat-2', name: 'Laptops & Computers', slug: 'laptops-computers' },
  { id: 'cat-3', name: 'Electronics & Gadgets', slug: 'electronics-gadgets' },
  { id: 'cat-4', name: 'Fresh Grocery & Organics', slug: 'fresh-grocery' },
  { id: 'cat-5', name: 'Gourmet Dry Fruits', slug: 'gourmet-dry-fruits' },
  { id: 'cat-6', name: 'Spices & Herbs', slug: 'spices-herbs' },
  { id: 'cat-7', name: "Men's Fashion", slug: 'mens-fashion' },
  { id: 'cat-8', name: "Women's Fashion", slug: 'womens-fashion' },
  { id: 'cat-9', name: 'Shoes & Footwear', slug: 'shoes-footwear' },
  { id: 'cat-10', name: 'Home & Living', slug: 'home-living' },
  { id: 'cat-11', name: 'Beauty & Personal Care', slug: 'beauty-care' },
];

const INITIAL_STORES: SupabaseStore[] = [
  { id: 'store_lahore_tech', brand_name: 'Lahore Tech Hub', slug: 'lahore-tech-hub', brand_address: 'Hafeez Centre, Main Boulevard, Gulberg III', city: 'Lahore', area: 'Gulberg III', status: 'ACTIVE' },
  { id: 'store_karachi_fresh', brand_name: 'Karachi Fresh Mart', slug: 'karachi-fresh-mart', brand_address: 'Khayaban-e-Shahbaz, Phase 6, DHA', city: 'Karachi', area: 'DHA Phase 6', status: 'ACTIVE' },
  { id: 'store_islamabad_apparel', brand_name: 'Islamabad Apparel & Couture', slug: 'islamabad-apparel', brand_address: 'Jinnah Super Market, F-7 Markaz', city: 'Islamabad', area: 'F-7 Markaz', status: 'ACTIVE' },
  { id: 'store_khyber_dryfruits', brand_name: 'Khyber Dry Fruits & Spices', slug: 'khyber-dry-fruits', brand_address: 'Namak Mandi Bazar', city: 'Peshawar', area: 'Namak Mandi', status: 'ACTIVE' },
  { id: 'store_faisalabad_decor', brand_name: 'Faisalabad Textile & Decor', slug: 'faisalabad-decor', brand_address: 'Clock Tower Market', city: 'Faisalabad', area: 'Clock Tower', status: 'ACTIVE' },
];

const storeLookupMap = new Map(INITIAL_STORES.map((s) => [s.slug, s]));
const categoryLookupMap = new Map(INITIAL_CATEGORIES.map((c) => [c.slug, c]));

const INITIAL_PRODUCTS: any[] = (SEEDED_PRODUCTS || []).map((p: any) => {
  const store = storeLookupMap.get(p.storeSlug) || INITIAL_STORES[0];
  const cat = categoryLookupMap.get(p.categorySlug) || { name: 'General', slug: p.categorySlug || 'general' };
  return {
    id: p.id || `prod_${p.slug.replace(/[^a-z0-9]/g, '_')}`,
    title: p.title,
    brand: p.brand || null,
    slug: p.slug,
    description: p.description,
    basePrice: p.basePrice,
    images: JSON.stringify(p.images || []),
    store: {
      id: store.id,
      brandName: store.brand_name,
      city: store.city,
      slug: store.slug,
      brandAddress: store.brand_address,
    },
    category: {
      name: cat.name,
      slug: cat.slug,
    },
    variants: (p.variants || []).map((v: any, idx: number) => ({
      id: v.id || `v-${idx}-${p.slug}`,
      sku: v.sku || `${p.slug}-${idx}`,
      variantName: v.variantName || 'Standard',
      price: v.price || p.basePrice,
      stock: v.stock || 15,
    })),
    reviews: (p.reviews || []).map((r: any, idx: number) => ({
      id: `r-${idx}`,
      ratingStars: r.ratingStars || 5,
      userId: r.userId || 'user-1',
      comment: r.comment || '',
      createdAt: new Date().toISOString(),
    })),
  };
});

const memoryCache = new Map<string, CacheEntry<any>>([
  ['categories_all', { data: INITIAL_CATEGORIES, freshUntil: 0 }],
  ['stores_active', { data: INITIAL_STORES, freshUntil: 0 }],
  ['products_{}', { data: INITIAL_PRODUCTS, freshUntil: 0 }],
  ['products_{"limit":36}', { data: INITIAL_PRODUCTS.slice(0, 36), freshUntil: 0 }],
]);

// Pre-populate individual product slug entries
for (const prod of INITIAL_PRODUCTS.slice(0, 40)) {
  memoryCache.set(`product_slug_${prod.slug}`, { data: prod, freshUntil: 0 });
}

const inFlightPromises = new Map<string, Promise<any>>();

async function fetchWithTimeout<T>(fetcher: () => Promise<T>, timeoutMs: number = 1500): Promise<T> {
  return Promise.race([
    fetcher(),
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`Fetch timed out after ${timeoutMs}ms`)), timeoutMs)
    ),
  ]);
}

async function getOrSetCacheSWR<T>(
  key: string,
  ttlSeconds: number,
  fetcher: () => Promise<T>,
  fallbackData?: T
): Promise<T> {
  const now = Date.now();
  const cached = memoryCache.get(key);

  // 1. If we have cached data:
  if (cached) {
    // If still fresh, return immediately (0ms)
    if (cached.freshUntil > now) {
      return cached.data as T;
    }

    // If stale, return cached data immediately (0ms) and revalidate in background
    if (!inFlightPromises.has(key)) {
      const bgPromise = fetchWithTimeout(fetcher, 5000)
        .then((fresh) => {
          if (fresh !== null && fresh !== undefined) {
            memoryCache.set(key, {
              data: fresh,
              freshUntil: Date.now() + ttlSeconds * 1000,
            });
          }
          return fresh;
        })
        .catch((err) => {
          // Keep serving cached data silently
        })
        .finally(() => {
          inFlightPromises.delete(key);
        });

      inFlightPromises.set(key, bgPromise);
    }

    return cached.data as T;
  }

  // 2. Cold Start (no cached data yet) - use deduplicated in-flight fetch with fast 1.5s timeout
  if (inFlightPromises.has(key)) {
    return (await inFlightPromises.get(key)) as T;
  }

  const freshPromise = (async () => {
    try {
      const fresh = await fetchWithTimeout(fetcher, 1500);
      if (fresh !== null && fresh !== undefined) {
        memoryCache.set(key, {
          data: fresh,
          freshUntil: Date.now() + ttlSeconds * 1000,
        });
        return fresh;
      }
      if (fallbackData !== undefined) return fallbackData;
      return fresh;
    } catch (err: any) {
      if (fallbackData !== undefined) {
        memoryCache.set(key, {
          data: fallbackData,
          freshUntil: Date.now() + 300 * 1000,
        });
        return fallbackData;
      }
      return [] as unknown as T;
    } finally {
      inFlightPromises.delete(key);
    }
  })();

  inFlightPromises.set(key, freshPromise);
  return await freshPromise;
}

export function invalidateSupabaseCache(prefix?: string) {
  if (!prefix) {
    memoryCache.clear();
    return;
  }
  for (const key of memoryCache.keys()) {
    if (key.startsWith(prefix)) {
      memoryCache.delete(key);
    }
  }
}

/**
 * Fetch all categories from Supabase (cached for 300s with SWR)
 */
export const getSupabaseCategories = cache(async function getSupabaseCategories(): Promise<SupabaseCategory[]> {
  return getOrSetCacheSWR('categories_all', 300, async () => {
    const { data, error } = await supabaseAdmin
      .from('categories')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching categories from Supabase:', error);
      return [];
    }
    return data || [];
  });
});

/**
 * Fetch active stores from Supabase (cached for 300s with SWR)
 */
export const getSupabaseStores = cache(async function getSupabaseStores(): Promise<SupabaseStore[]> {
  return getOrSetCacheSWR('stores_active', 300, async () => {
    const { data, error } = await supabaseAdmin
      .from('stores')
      .select('*')
      .eq('status', 'ACTIVE')
      .order('brand_name', { ascending: true });

    if (error) {
      console.error('Error fetching stores from Supabase:', error);
      return [];
    }
    return data || [];
  });
});

/**
 * Fetch products from Supabase with relational variants and reviews (cached for 180s with SWR)
 */
export const getSupabaseProducts = cache(async function getSupabaseProducts(filters?: {
  categorySlug?: string;
  city?: string;
  storeSlug?: string;
  search?: string;
  limit?: number;
}): Promise<any[]> {
  const cacheKey = `products_${JSON.stringify(filters || {})}`;

  return getOrSetCacheSWR(cacheKey, 180, async () => {
    let query = supabaseAdmin
      .from('products')
      .select(`
        id,
        title,
        brand,
        slug,
        description,
        base_price,
        images,
        is_active,
        created_at,
        stores ( id, brand_name, city, slug, brand_address ),
        categories ( id, name, slug ),
        product_variants ( id, sku, variant_name, price, stock ),
        reviews ( id, rating_stars, user_id, comment, created_at )
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching products from Supabase:', error);
      return [];
    }

    // Format to standard shape used by UI
    return (data || []).map((p: any) => ({
      id: p.id,
      title: p.title,
      brand: p.brand,
      slug: p.slug,
      description: p.description,
      basePrice: p.base_price,
      images: p.images,
      store: {
        id: p.stores?.id,
        brandName: p.stores?.brand_name,
        city: p.stores?.city,
        slug: p.stores?.slug,
        brandAddress: p.stores?.brand_address,
      },
      category: {
        name: p.categories?.name,
        slug: p.categories?.slug,
      },
      variants: (p.product_variants || []).map((v: any) => ({
        id: v.id,
        sku: v.sku,
        variantName: v.variant_name,
        price: v.price,
        stock: v.stock,
      })),
      reviews: (p.reviews || []).map((r: any) => ({
        id: r.id,
        ratingStars: r.rating_stars,
        userId: r.user_id,
        comment: r.comment,
        createdAt: r.created_at,
      })),
    }));
  });
});

/**
 * Fetch a single product by slug from Supabase (cached for 180s with SWR)
 */
export const getSupabaseProductBySlug = cache(async function getSupabaseProductBySlug(slug: string): Promise<any | null> {
  return getOrSetCacheSWR(`product_slug_${slug}`, 180, async () => {
    const { data, error } = await supabaseAdmin
      .from('products')
      .select(`
        id,
        title,
        brand,
        slug,
        description,
        base_price,
        images,
        is_active,
        created_at,
        stores ( id, brand_name, city, slug, brand_address ),
        categories ( id, name, slug ),
        product_variants ( id, sku, variant_name, price, stock ),
        reviews (
          id,
          rating_stars,
          user_id,
          comment,
          created_at,
          users ( name )
        )
      `)
      .eq('slug', slug)
      .single();

    if (error || !data) {
      console.error('Error fetching product by slug from Supabase:', error);
      return null;
    }

    return {
      id: data.id,
      title: data.title,
      brand: data.brand,
      slug: data.slug,
      description: data.description,
      basePrice: data.base_price,
      images: data.images,
      store: {
        id: (data.stores as any)?.id,
        brandName: (data.stores as any)?.brand_name,
        city: (data.stores as any)?.city,
        slug: (data.stores as any)?.slug,
        brandAddress: (data.stores as any)?.brand_address,
      },
      category: {
        name: (data.categories as any)?.name,
        slug: (data.categories as any)?.slug,
      },
      variants: ((data.product_variants as any[]) || []).map((v) => ({
        id: v.id,
        sku: v.sku,
        variantName: v.variant_name,
        price: v.price,
        stock: v.stock,
      })),
      reviews: ((data.reviews as any[]) || []).map((r) => ({
        id: r.id,
        ratingStars: r.rating_stars,
        userId: r.user_id,
        comment: r.comment,
        createdAt: r.created_at,
        user: {
          name: r.users?.name || 'Verified Customer',
        },
      })),
    };
  });
});

/**
 * Fetch store by slug with its active products from Supabase (cached for 180s with SWR)
 */
export const getSupabaseStoreBySlug = cache(async function getSupabaseStoreBySlug(slug: string): Promise<any | null> {
  return getOrSetCacheSWR(`store_slug_${slug}`, 180, async () => {
    const { data: store, error } = await supabaseAdmin
      .from('stores')
      .select(`
        id,
        brand_name,
        slug,
        brand_address,
        city,
        area,
        status,
        created_at
      `)
      .eq('slug', slug)
      .single();

    if (error || !store) {
      console.error('Error fetching store by slug from Supabase:', error);
      return null;
    }

    // Fetch store products
    const { data: products } = await supabaseAdmin
      .from('products')
      .select(`
        id,
        title,
        brand,
        slug,
        description,
        base_price,
        images,
        is_active,
        created_at,
        categories ( id, name, slug ),
        product_variants ( id, sku, variant_name, price, stock ),
        reviews ( id, rating_stars, user_id, comment, created_at )
      `)
      .eq('store_id', store.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    return {
      id: store.id,
      brandName: store.brand_name,
      slug: store.slug,
      brandAddress: store.brand_address,
      city: store.city,
      area: store.area,
      status: store.status,
      products: (products || []).map((p: any) => ({
        id: p.id,
        title: p.title,
        brand: p.brand,
        slug: p.slug,
        description: p.description,
        basePrice: p.base_price,
        images: p.images,
        category: {
          name: p.categories?.name,
          slug: p.categories?.slug,
        },
        variants: (p.product_variants || []).map((v: any) => ({
          id: v.id,
          sku: v.sku,
          variantName: v.variant_name,
          price: v.price,
          stock: v.stock,
        })),
        reviews: (p.reviews || []).map((r: any) => ({
          id: r.id,
          ratingStars: r.rating_stars,
          userId: r.user_id,
          comment: r.comment,
          createdAt: r.created_at,
        })),
      })),
    };
  });
});

/**
 * Create a direct rating / review in Supabase and invalidate product cache
 */
export async function createSupabaseReview(payload: {
  productId: string;
  userId: string;
  ratingStars: number;
  comment?: string | null;
}) {
  const { data, error } = await supabaseAdmin
    .from('reviews')
    .insert({
      product_id: payload.productId,
      user_id: payload.userId,
      rating_stars: payload.ratingStars,
      comment: payload.comment || null,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating review in Supabase:', error);
    throw new Error(error.message);
  }

  // Invalidate product cache so new rating is immediately visible
  invalidateSupabaseCache('products_');
  invalidateSupabaseCache('product_slug_');

  return data;
}

