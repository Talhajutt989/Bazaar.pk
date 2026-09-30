const routesToTest = [
  // 1. Core Public Pages
  { name: 'Home Landing Page', path: '/' },
  { name: 'Catalog - All Products', path: '/products' },
  { name: 'Catalog - Search Query "iPhone"', path: '/products?search=iPhone' },
  { name: 'Catalog - Search Query "Lawn"', path: '/products?search=Lawn' },
  { name: 'Catalog - Search Query "S24"', path: '/products?search=S24' },
  
  // 2. City & Category Filter Matrix
  { name: 'Faisalabad + Electronics (Nationwide Delivery Fallback)', path: '/products?city=Faisalabad&category=electronics-gadgets' },
  { name: 'Lahore + Smartphones', path: '/products?city=Lahore&category=smartphones-gadgets' },
  { name: 'Lahore + Laptops', path: '/products?city=Lahore&category=laptops-computers' },
  { name: 'Karachi + Fresh Grocery', path: '/products?city=Karachi&category=fresh-grocery' },
  { name: 'Islamabad + Men\'s Fashion', path: '/products?city=Islamabad&category=mens-fashion' },
  { name: 'Islamabad + Women\'s Fashion', path: '/products?city=Islamabad&category=womens-fashion' },
  { name: 'Peshawar + Gourmet Dry Fruits', path: '/products?city=Peshawar&category=gourmet-dry-fruits' },
  { name: 'Peshawar + Spices & Herbs', path: '/products?city=Peshawar&category=spices-herbs' },
  { name: 'Faisalabad + Home & Living', path: '/products?city=Faisalabad&category=home-living' },
  { name: 'Rawalpindi + Beauty Care', path: '/products?city=Rawalpindi&category=beauty-care' },
  
  // 3. Price & Sorting Filters
  { name: 'Price Filter (Under 2500)', path: '/products?maxPrice=2500' },
  { name: 'Price Filter (10k to 50k)', path: '/products?minPrice=10000&maxPrice=50000' },
  { name: 'Sort: Price Low to High', path: '/products?sort=price_asc' },
  { name: 'Sort: Price High to Low', path: '/products?sort=price_desc' },
  { name: 'Sort: Newest Arrivals', path: '/products?sort=newest' },
  
  // 4. Product Detail Pages (PDP)
  { name: 'PDP - Apple iPhone 16 Pro Max', path: '/products/apple-iphone-16-pro-max' },
  { name: 'PDP - Samsung Galaxy S24 Ultra', path: '/products/samsung-galaxy-s24-ultra-5g' },
  
  // 5. Vendor Store Profiles
  { name: 'Store - Lahore Tech Hub', path: '/store/lahore-tech-hub' },
  { name: 'Store - Karachi Fresh Mart', path: '/store/karachi-fresh-mart' },
  { name: 'Store - Islamabad Apparel & Couture', path: '/store/islamabad-apparel' },
  
  // 6. Commerce & Cart Flow
  { name: 'Cart View', path: '/cart' },
  { name: 'Checkout Form', path: '/checkout' },
  { name: 'Customer Order History', path: '/account/orders' },
  
  // 7. Auth Pages
  { name: 'Sign In Page', path: '/login' },
  { name: 'Customer Registration', path: '/register' },
  { name: 'Vendor Onboarding Portal', path: '/register/vendor' },
  
  // 8. Super Admin Suite
  { name: 'Admin Dashboard', path: '/admin' },
  { name: 'Admin - Vendor Approvals', path: '/admin/vendors' },
  { name: 'Admin - Category Manager', path: '/admin/categories' },
  { name: 'Admin - Platform Orders', path: '/admin/orders' },
  { name: 'Admin - KYC Verification Suite', path: '/admin/kyc' },
  
  // 9. Vendor Merchant Suite
  { name: 'Vendor Main Dashboard', path: '/vendor' },
  { name: 'Vendor - Product Inventory', path: '/vendor/products' },
  { name: 'Vendor - Add Product Form', path: '/vendor/products/new' },
  { name: 'Vendor - Orders Management', path: '/vendor/orders' },
  { name: 'Vendor - KYC Document Center', path: '/vendor/kyc' },
  
  // 10. APIs & Live Search
  { name: 'API - Database Health', path: '/api/health/db' },
  { name: 'API - Auto-Suggestions (Query: "apple")', path: '/api/search?q=apple' },
  { name: 'API - Auto-Suggestions (Query: "shirt")', path: '/api/search?q=shirt' },
  { name: 'API - Auto-Suggestions (Query: "samsung")', path: '/api/search?q=samsung' },
];

async function executeDeepTest() {
  console.log('========================================================================');
  console.log('🚀 BAZAAR.PK — 100% EXHAUSTIVE MULTI-TIER RE-TEST SUITE                ');
  console.log('========================================================================\n');

  let passed = 0;
  let failed = 0;
  const timings = [];

  for (let i = 0; i < routesToTest.length; i++) {
    const item = routesToTest[i];
    const url = 'http://localhost:3000' + item.path;
    const start = Date.now();
    try {
      const res = await fetch(url);
      const elapsed = Date.now() - start;
      timings.push(elapsed);
      const text = await res.text();
      const status = res.status;
      const isSuccess = status >= 200 && status < 400;

      if (isSuccess) {
        passed++;
        console.log(`[${String(i + 1).padStart(2, '0')}/${routesToTest.length}] ✅ [${status}] ${item.name.padEnd(50, ' ')} (${elapsed}ms, ${(text.length / 1024).toFixed(1)} KB)`);
      } else {
        failed++;
        console.error(`[${String(i + 1).padStart(2, '0')}/${routesToTest.length}] ❌ [${status}] ${item.name.padEnd(50, ' ')} (${elapsed}ms)`);
      }
    } catch (err) {
      failed++;
      console.error(`[${String(i + 1).padStart(2, '0')}/${routesToTest.length}] 💥 [ERR] ${item.name.padEnd(50, ' ')} -> ${err.message}`);
    }
  }

  const avgTime = timings.reduce((a, b) => a + b, 0) / timings.length;

  console.log('\n========================================================================');
  console.log(`📊 TOTAL ENDPOINTS AUDITED : ${routesToTest.length}`);
  console.log(`✅ PASSED                   : ${passed}`);
  console.log(`❌ FAILED                   : ${failed}`);
  console.log(`⚡ AVERAGE LATENCY          : ${avgTime.toFixed(1)} ms`);
  console.log(`🏆 OVERALL HEALTH SCORE     : ${((passed / routesToTest.length) * 100).toFixed(1)}%`);
  console.log('========================================================================\n');
}

executeDeepTest();
