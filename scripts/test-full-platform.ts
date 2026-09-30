import http from 'http';
import { supabaseAdmin } from '../lib/supabase';
import {
  getSupabaseCategories,
  getSupabaseStores,
  getSupabaseProducts,
  getSupabaseProductBySlug,
  getSupabaseStoreBySlug,
} from '../lib/supabase-service';
import { isStrictMatch, calculateRelevanceScore } from '../lib/search';

interface TestResult {
  module: string;
  testName: string;
  status: 'PASS' | 'FAIL';
  details?: string;
}

const results: TestResult[] = [];

function record(module: string, testName: string, passed: boolean, details?: string) {
  results.push({
    module,
    testName,
    status: passed ? 'PASS' : 'FAIL',
    details,
  });
}

function httpGet(url: string): Promise<{ statusCode: number; body: string }> {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => resolve({ statusCode: res.statusCode || 500, body: data }));
    }).on('error', (err) => reject(err));
  });
}

async function runFullPlatformAudit() {
  console.log('========================================================================');
  console.log('🚀 RUNNING COMPREHENSIVE E-COMMERCE PLATFORM AUDIT & FUNCTIONALITY TEST');
  console.log('========================================================================\n');

  // ==========================================
  // MODULE 1: SUPABASE CLOUD DATABASE INTEGRITY
  // ==========================================
  console.log('📦 1. Testing Supabase Cloud Database Integrity...');
  try {
    const { count: catCount, error: cErr } = await supabaseAdmin
      .from('categories')
      .select('*', { count: 'exact', head: true });
    record('Database', 'Categories Table Active', !cErr && (catCount || 0) >= 8, `Count: ${catCount}`);

    const { count: storeCount, error: sErr } = await supabaseAdmin
      .from('stores')
      .select('*', { count: 'exact', head: true });
    record('Database', 'Stores Table Active', !sErr && (storeCount || 0) >= 6, `Count: ${storeCount}`);

    const { count: prodCount, error: pErr } = await supabaseAdmin
      .from('products')
      .select('*', { count: 'exact', head: true });
    record('Database', 'Products Table Active', !pErr && (prodCount || 0) >= 60, `Count: ${prodCount}`);

    const { count: varCount, error: vErr } = await supabaseAdmin
      .from('product_variants')
      .select('*', { count: 'exact', head: true });
    record('Database', 'Product Variants Table Active', !vErr && (varCount || 0) >= 150, `Count: ${varCount}`);
  } catch (err: any) {
    record('Database', 'Supabase Connection', false, err.message);
  }

  // ==========================================
  // MODULE 2: DATA SERVICE METHODS
  // ==========================================
  console.log('⚡ 2. Testing Data Service Layer (lib/supabase-service)...');
  try {
    const categories = await getSupabaseCategories();
    record('Data Service', 'getSupabaseCategories()', categories.length >= 8, `Fetched ${categories.length} categories`);

    const stores = await getSupabaseStores();
    record('Data Service', 'getSupabaseStores()', stores.length >= 5, `Fetched ${stores.length} active stores`);

    const products = await getSupabaseProducts({ limit: 12 });
    record(
      'Data Service',
      'getSupabaseProducts() with Relational Joins',
      products.length === 12 && !!products[0].store?.brandName && !!products[0].category?.name,
      `Sample: ${products[0]?.title} [${products[0]?.store?.brandName}]`
    );

    const singleProduct = await getSupabaseProductBySlug('samsung-galaxy-s24-ultra-5g');
    record(
      'Data Service',
      'getSupabaseProductBySlug()',
      !!singleProduct && singleProduct.variants?.length >= 3,
      `Variants loaded: ${singleProduct?.variants?.length}`
    );

    const singleStore = await getSupabaseStoreBySlug('lahore-tech-hub');
    record(
      'Data Service',
      'getSupabaseStoreBySlug()',
      !!singleStore && singleStore.products?.length > 0,
      `Store: ${singleStore?.brandName}, Products: ${singleStore?.products?.length}`
    );
  } catch (err: any) {
    record('Data Service', 'Service Layer Execution', false, err.message);
  }

  // ==========================================
  // MODULE 3: SEARCH ENGINE & AUTO-SUGGESTIONS API
  // ==========================================
  console.log('🔍 3. Testing Search Engine & API Suggestions...');
  try {
    const allProducts = await getSupabaseProducts();

    // Test Search Precision
    const phoneResults = allProducts.filter((p) => isStrictMatch(p, 'phone'));
    record('Search Engine', "Query: 'phone'", phoneResults.length >= 5, `Matched ${phoneResults.length} phones`);

    const badamResults = allProducts.filter((p) => isStrictMatch(p, 'badam'));
    record('Search Engine', "Urdu Synonym: 'badam'", badamResults.length >= 1, `Matched: ${badamResults[0]?.title}`);

    const honeyResults = allProducts.filter((p) => isStrictMatch(p, 'shehd'));
    record('Search Engine', "Urdu Synonym: 'shehd'", honeyResults.length >= 1, `Matched: ${honeyResults[0]?.title}`);

    const s24Results = allProducts.filter((p) => isStrictMatch(p, 's24'));
    record('Search Engine', "Exact Model: 's24'", s24Results.length === 1, `Matched: ${s24Results[0]?.title}`);

    // Test Search API Endpoint
    const apiRes = await httpGet('http://localhost:3000/api/search?q=laptop');
    const apiData = JSON.parse(apiRes.body);
    record(
      'Search API',
      'GET /api/search?q=laptop',
      apiRes.statusCode === 200 && apiData.products?.length >= 1,
      `Returned ${apiData.products?.length} products & ${apiData.categories?.length} categories`
    );
  } catch (err: any) {
    record('Search Engine', 'Search Execution', false, err.message);
  }

  // ==========================================
  // MODULE 4: HTTP FRONTEND ROUTES & PAGES
  // ==========================================
  console.log('🌐 4. Testing Next.js Frontend Routes...');
  const testUrls = [
    { url: 'http://localhost:3000/', name: 'Home Page', checkContent: 'BAZAAR' },
    { url: 'http://localhost:3000/products', name: 'Product Catalog', checkContent: 'Products' },
    { url: 'http://localhost:3000/products?category=smartphones-gadgets', name: 'Category Filter Page', checkContent: 'Smartphones' },
    { url: 'http://localhost:3000/products?city=Lahore', name: 'Hyper-Local City Filter', checkContent: 'Lahore' },
    { url: 'http://localhost:3000/products?search=samsung', name: 'Search Results Page', checkContent: 'samsung' },
    { url: 'http://localhost:3000/products/samsung-galaxy-s24-ultra-5g', name: 'Product Details Showcase', checkContent: 'Samsung Galaxy S24 Ultra' },
    { url: 'http://localhost:3000/products/pure-wild-sidr-beri-honey-1kg', name: 'Organic Product Details', checkContent: 'Sidr' },
    { url: 'http://localhost:3000/store/lahore-tech-hub', name: 'Vendor Store Page', checkContent: 'Lahore Tech Hub' },
    { url: 'http://localhost:3000/store/khyber-dry-fruits', name: 'Peshawar Store Page', checkContent: 'Khyber Dry Fruits' },
    { url: 'http://localhost:3000/login', name: 'Customer / Vendor Login', checkContent: 'Sign In' },
    { url: 'http://localhost:3000/register', name: 'Customer / Vendor Registration', checkContent: 'Account' },
  ];

  for (const t of testUrls) {
    try {
      const res = await httpGet(t.url);
      const passed = res.statusCode === 200 && res.body.includes(t.checkContent);
      record('Frontend Route', `${t.name} (${t.url.replace('http://localhost:3000', '')})`, passed, `Status: ${res.statusCode}`);
    } catch (err: any) {
      record('Frontend Route', t.name, false, err.message);
    }
  }

  // ==========================================
  // PRINT SUMMARY REPORT
  // ==========================================
  console.log('\n========================================================================');
  console.log('📊 AUDIT SUMMARY REPORT');
  console.log('========================================================================\n');

  let passedCount = 0;
  let failedCount = 0;

  for (const r of results) {
    const icon = r.status === 'PASS' ? '✅' : '❌';
    console.log(`${icon} [${r.module}] ${r.testName.padEnd(50, ' ')} : ${r.status} ${r.details ? `(${r.details})` : ''}`);
    if (r.status === 'PASS') passedCount++;
    else failedCount++;
  }

  console.log('\n------------------------------------------------------------------------');
  console.log(`TOTAL TESTS: ${results.length} | PASSED: ${passedCount} | FAILED: ${failedCount}`);
  console.log(`SUCCESS RATE: ${Math.round((passedCount / results.length) * 100)}%`);
  console.log('========================================================================\n');
}

runFullPlatformAudit().catch(console.error);
