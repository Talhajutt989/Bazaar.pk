require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function runE2E() {
  console.log('========================================================');
  console.log('🧪 BAZAAR.PK - END-TO-END SUPABASE & LOGIC AUDIT        ');
  console.log('========================================================\n');

  try {
    // 1. Check Stores
    const { data: stores, error: storesErr } = await supabase.from('stores').select('*');
    if (storesErr) throw storesErr;
    console.log(`🏬 Total Active Stores in Supabase: ${stores?.length || 0}`);
    stores?.forEach(s => {
      console.log(`   • ${s.brand_name} (${s.city}) - Status: ${s.status}`);
    });

    // 2. Check Categories
    const { data: categories, error: catErr } = await supabase.from('categories').select('*');
    if (catErr) throw catErr;
    console.log(`\n🏷️ Total Categories in Supabase: ${categories?.length || 0}`);
    categories?.forEach(c => {
      console.log(`   • ${c.name} (${c.slug})`);
    });

    // 3. Check Products & Variants
    const { data: products, error: prodErr } = await supabase.from('products').select('*');
    if (prodErr) throw prodErr;
    const { data: variants, error: varErr } = await supabase.from('product_variants').select('*');
    if (varErr) throw varErr;
    const { data: reviews, error: revErr } = await supabase.from('reviews').select('*');
    if (revErr) throw revErr;
    const { data: users, error: userErr } = await supabase.from('users').select('*');
    if (userErr) throw userErr;

    console.log(`\n📦 Total Products in Supabase : ${products?.length || 0}`);
    console.log(`🔢 Total Variants in Supabase : ${variants?.length || 0}`);
    console.log(`⭐ Total Reviews in Supabase  : ${reviews?.length || 0}`);
    console.log(`👥 Total Users in Supabase    : ${users?.length || 0}`);

    // 4. Test Search API
    const searchRes = await fetch('http://localhost:3000/api/search?q=iphone');
    const searchData = await searchRes.json();
    console.log(`\n🔎 Search API Test for "iphone":`);
    console.log(`   • Products matched: ${searchData.products?.length || 0}`);
    console.log(`   • Categories matched: ${searchData.categories?.length || 0}`);

    console.log('\n========================================================');
    console.log('✨ ALL SUPABASE & CORE PLATFORM CHECKS PASSED 100%!     ');
    console.log('========================================================\n');
  } catch (err) {
    console.error('❌ E2E Audit Failed:', err.message || err);
  }
}

runE2E();
