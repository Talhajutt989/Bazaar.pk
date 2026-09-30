const http = require('http');

const routes = [
  '/',
  '/products',
  '/products?city=Faisalabad&category=electronics-gadgets',
  '/products?city=Lahore&category=smartphones-gadgets',
  '/products?city=Karachi&category=fresh-grocery',
  '/products?search=iPhone',
  '/products/apple-iphone-16-pro-max',
  '/store/lahore-tech-hub',
  '/login',
  '/register',
  '/register/vendor',
  '/cart',
  '/checkout',
  '/account/orders',
  '/admin',
  '/admin/vendors',
  '/admin/categories',
  '/admin/orders',
  '/admin/kyc',
  '/vendor',
  '/vendor/products',
  '/vendor/products/new',
  '/vendor/orders',
  '/vendor/kyc',
  '/api/health/db',
  '/api/search?q=apple',
  '/api/search?q=dress'
];

async function run() {
  console.log('========================================================');
  console.log('🛍️  BAZAAR.PK - FULL PLATFORM COMPREHENSIVE TEST SUITE  ');
  console.log('========================================================\n');

  let passed = 0;
  let failed = 0;

  for (const route of routes) {
    const url = 'http://localhost:3000' + route;
    const start = Date.now();
    try {
      const res = await fetch(url);
      const time = Date.now() - start;
      const text = await res.text();
      const status = res.status;
      const isOk = status >= 200 && status < 400;

      if (isOk) {
        passed++;
        console.log(`✅ [${status}] ${route} (${time}ms, ${text.length} bytes)`);
      } else {
        failed++;
        console.error(`❌ [${status}] ${route} (${time}ms)`);
      }
    } catch (err) {
      failed++;
      console.error(`💥 [ERROR] ${route} -> ${err.message}`);
    }
  }

  console.log('\n========================================================');
  console.log(`📊 TOTAL ROUTES TESTED : ${routes.length}`);
  console.log(`✅ PASSED              : ${passed}`);
  console.log(`❌ FAILED              : ${failed}`);
  console.log(`🏆 SUCCESS RATE        : ${((passed / routes.length) * 100).toFixed(1)}%`);
  console.log('========================================================\n');
}

run();
