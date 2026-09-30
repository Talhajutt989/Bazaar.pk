import { supabaseAdmin } from '../lib/supabase';
import { SEEDED_PRODUCTS } from '../lib/seed-products';

// Default categories matching SEEDED_PRODUCTS
const SEED_CATEGORIES = [
  { id: 'cat_apparel', name: 'Apparel & Clothing', slug: 'apparel-clothing' },
  { id: 'cat_electronics', name: 'Electronics & Gadgets', slug: 'electronics-gadgets' },
  { id: 'cat_smartphones', name: 'Smartphones & Gadgets', slug: 'smartphones-gadgets' },
  { id: 'cat_laptops', name: 'Laptops & Computing', slug: 'laptops-computers' },
  { id: 'cat_grocery', name: 'Fresh Grocery & Organics', slug: 'fresh-grocery' },
  { id: 'cat_dryfruits', name: 'Gourmet Dry Fruits & Spices', slug: 'gourmet-dry-fruits' },
  { id: 'cat_spices', name: 'Organic Spices & Herbs', slug: 'spices-herbs' },
  { id: 'cat_mens_fashion', name: "Men's Fashion & Apparel", slug: 'mens-fashion' },
  { id: 'cat_womens_fashion', name: "Women's Ethnic & Western", slug: 'womens-fashion' },
  { id: 'cat_footwear', name: 'Shoes & Footwear', slug: 'shoes-footwear' },
  { id: 'cat_home', name: 'Home Decor & Furnishing', slug: 'home-living' },
  { id: 'cat_beauty', name: 'Beauty & Personal Care', slug: 'beauty-care' },
  { id: 'cat_sports', name: 'Sports & Outdoor', slug: 'sports-fitness' },
];

// Default stores matching SEEDED_PRODUCTS
const SEED_STORES = [
  {
    id: 'store_lahore_tech',
    brand_name: 'Lahore Tech Hub',
    slug: 'lahore-tech-hub',
    brand_address: 'Hafeez Centre, Main Boulevard Gulberg, Lahore',
    city: 'Lahore',
    area: 'Gulberg III',
    status: 'ACTIVE',
  },
  {
    id: 'store_karachi_fresh',
    brand_name: 'Karachi Fresh Mart',
    slug: 'karachi-fresh-mart',
    brand_address: 'Khayaban-e-Shahbaz, Phase 6 DHA, Karachi',
    city: 'Karachi',
    area: 'DHA Phase 6',
    status: 'ACTIVE',
  },
  {
    id: 'store_khyber_dryfruits',
    brand_name: 'Khyber Dry Fruits & Spices',
    slug: 'khyber-dry-fruits',
    brand_address: 'Namak Mandi, Heritage Bazaar, Peshawar',
    city: 'Peshawar',
    area: 'Namak Mandi',
    status: 'ACTIVE',
  },
  {
    id: 'store_islamabad_apparel',
    brand_name: 'Islamabad Apparel & Couture',
    slug: 'islamabad-apparel',
    brand_address: 'Beverly Centre, Blue Area, Islamabad',
    city: 'Islamabad',
    area: 'Blue Area',
    status: 'ACTIVE',
  },
  {
    id: 'store_faisalabad_decor',
    brand_name: 'Faisalabad Textile & Decor',
    slug: 'faisalabad-decor',
    brand_address: 'Clock Tower Market, Faisalabad',
    city: 'Faisalabad',
    area: 'Clock Tower',
    status: 'ACTIVE',
  },
  {
    id: 'store_rawalpindi_organic',
    brand_name: 'Rawalpindi Organic Herbs',
    slug: 'rawalpindi-organic',
    brand_address: 'Raja Bazaar, Rawalpindi',
    city: 'Rawalpindi',
    area: 'Raja Bazaar',
    status: 'ACTIVE',
  },
];

async function seedSupabase() {
  console.log('🚀 Seeding Supabase Cloud Database (https://hgxsnflufwcszwjrhgbl.supabase.co)...');

  // 1. Seed Categories
  console.log('\n📂 Inserting Categories into Supabase...');
  for (const cat of SEED_CATEGORIES) {
    const { error: catErr } = await supabaseAdmin
      .from('categories')
      .upsert(cat, { onConflict: 'id' });
    if (catErr) {
      console.warn(`Category notice for ${cat.slug}:`, catErr.message);
    }
  }

  // Fetch all active categories from DB
  const { data: dbCategories } = await supabaseAdmin.from('categories').select('*');
  const categoryMap = new Map((dbCategories || []).map((c) => [c.slug, c.id]));
  console.log(`✅ Loaded ${(dbCategories || []).length} Categories in database.`);

  // 2. Seed Stores
  console.log('\n🏬 Inserting Stores into Supabase...');
  for (const store of SEED_STORES) {
    const { error: storeErr } = await supabaseAdmin
      .from('stores')
      .upsert(store, { onConflict: 'id' });
    if (storeErr) {
      console.warn(`Store notice for ${store.slug}:`, storeErr.message);
    }
  }

  // Fetch all active stores from DB
  const { data: dbStores } = await supabaseAdmin.from('stores').select('*');
  const storeMap = new Map((dbStores || []).map((s) => [s.slug, s.id]));
  console.log(`✅ Loaded ${(dbStores || []).length} Stores in database.`);

  // 3. Seed Products & Variants
  console.log('\n📦 Inserting Products and Variants into Supabase...');
  let productCount = 0;
  let variantCount = 0;

  for (const p of SEEDED_PRODUCTS) {
    const categoryId = categoryMap.get(p.categorySlug) || (dbCategories && dbCategories[0]?.id);
    const storeId = storeMap.get(p.storeSlug) || (dbStores && dbStores[0]?.id);

    if (!categoryId || !storeId) {
      console.error(`Missing category (${p.categorySlug}) or store (${p.storeSlug}) for product: ${p.slug}`);
      continue;
    }

    const { data: productData, error: pErr } = await supabaseAdmin
      .from('products')
      .upsert(
        {
          id: (p as any).id || `prod_${p.slug.replace(/[^a-z0-9]/g, '_')}`,
          store_id: storeId,
          category_id: categoryId,
          title: p.title,
          brand: p.brand || null,
          slug: p.slug,
          description: p.description,
          base_price: p.basePrice,
          images: JSON.stringify(p.images),
          is_active: true,
          is_approved: true,
        },
        { onConflict: 'slug' }
      )
      .select()
      .single();

    if (pErr) {
      console.error(`❌ Error inserting product ${p.slug}:`, pErr.message);
      continue;
    }

    productCount++;

    // Insert variants
    if (p.variants && p.variants.length > 0) {
      const variantRows = p.variants.map((v, idx) => ({
        id: (v as any).id || `var_${p.slug.slice(0, 20)}_${idx}_${v.sku.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
        product_id: productData.id,
        sku: v.sku,
        variant_name: v.variantName,
        price: v.price,
        stock: v.stock,
        attributes: v.attributes ? JSON.stringify(v.attributes) : null,
      }));

      const { error: vErr } = await supabaseAdmin.from('product_variants').upsert(variantRows, { onConflict: 'sku' });
      if (vErr) {
        console.error(`❌ Error inserting variants for ${p.slug}:`, vErr.message);
      } else {
        variantCount += variantRows.length;
      }
    }
  }

  console.log(`\n🎉 Seed Completed!`);
  console.log(`✅ ${productCount} Products inserted into Supabase.`);
  console.log(`✅ ${variantCount} Variants inserted into Supabase.`);
  console.log(`🌐 Supabase Cloud Project: https://hgxsnflufwcszwjrhgbl.supabase.co`);
}

seedSupabase().catch(console.error);
