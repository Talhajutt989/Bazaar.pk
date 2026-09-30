import http from 'http';

const BASE_URL = 'http://localhost:3000';

async function fetchUrl(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const start = Date.now();
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        'Accept': 'text/html,application/json,*/*',
        'User-Agent': 'TestRunner/1.0',
        ...(options.headers || {})
      },
      redirect: 'manual'
    });
    const duration = Date.now() - start;
    const body = await res.text();
    return {
      path,
      status: res.status,
      statusText: res.statusText,
      duration,
      headers: Object.fromEntries(res.headers.entries()),
      body,
      ok: res.status >= 200 && res.status < 400
    };
  } catch (err) {
    return {
      path,
      status: 0,
      statusText: 'FETCH_ERROR',
      duration: Date.now() - start,
      headers: {},
      body: err.message,
      ok: false,
      error: err
    };
  }
}

async function runTests() {
  console.log('================================================================');
  console.log('   STARTING COMPREHENSIVE E-COMMERCE PLATFORM AUTOMATED AUDIT   ');
  console.log('================================================================\n');

  // 1. Static & Public Routes to Test
  const coreRoutes = [
    '/',
    '/products',
    '/cart',
    '/checkout',
    '/login',
    '/register',
    '/admin',
    '/vendor',
    '/account',
    '/order'
  ];

  console.log('--- 1. Testing Core Frontend Pages ---');
  const results = [];
  for (const route of coreRoutes) {
    const res = await fetchUrl(route);
    const hasErrorText = res.body.includes('Application error') || 
                         res.body.includes('Unhandled Runtime Error') ||
                         res.body.includes('500 Internal Server Error') ||
                         res.body.includes('Something went wrong');
    
    const isSuccess = res.ok && !hasErrorText;
    results.push({ ...res, isSuccess, hasErrorText });

    const statusBadge = isSuccess ? '✅ PASS' : (res.status === 307 || res.status === 308 || res.status === 302 ? '↪️ REDIRECT' : '❌ FAIL');
    console.log(`${statusBadge} [${res.status}] ${route.padEnd(20)} (${res.duration}ms) ${hasErrorText ? '⚠️ [Contains Error Text]' : ''}`);
  }

  // 2. Test dynamic routes
  console.log('\n--- 2. Testing Dynamic Product & Store Routes ---');
  // First let's test search API to get product slugs and store slugs
  let productSlugs = ['fresh-organic-apples', 'basmati-super-rice', 'dairy-pure-milk'];
  let storeSlugs = ['fresh-mart', 'lahore-organics', 'punjab-grocers'];

  // Test products list page HTML to extract any real slugs if possible
  const prodPage = await fetchUrl('/products');
  const hrefMatches = [...prodPage.body.matchAll(/href="\/products\/([^"]+)"/g)].map(m => m[1]);
  if (hrefMatches.length > 0) {
    productSlugs = [...new Set(hrefMatches)].slice(0, 5);
  }

  const storeMatches = [...prodPage.body.matchAll(/href="\/store\/([^"]+)"/g)].map(m => m[1]);
  if (storeMatches.length > 0) {
    storeSlugs = [...new Set(storeMatches)].slice(0, 5);
  }

  console.log(`Discovered Product Slugs: ${productSlugs.join(', ')}`);
  for (const slug of productSlugs) {
    const route = `/products/${slug}`;
    const res = await fetchUrl(route);
    const hasErrorText = res.body.includes('Application error') || res.body.includes('Unhandled Runtime Error');
    const isSuccess = res.ok && !hasErrorText;
    const statusBadge = isSuccess ? '✅ PASS' : (res.status === 404 ? '⚠️ 404' : '❌ FAIL');
    console.log(`${statusBadge} [${res.status}] ${route.padEnd(40)} (${res.duration}ms)`);
  }

  console.log(`\nDiscovered Store Slugs: ${storeSlugs.join(', ')}`);
  for (const slug of storeSlugs) {
    const route = `/store/${slug}`;
    const res = await fetchUrl(route);
    const hasErrorText = res.body.includes('Application error') || res.body.includes('Unhandled Runtime Error');
    const isSuccess = res.ok && !hasErrorText;
    const statusBadge = isSuccess ? '✅ PASS' : (res.status === 404 ? '⚠️ 404' : '❌ FAIL');
    console.log(`${statusBadge} [${res.status}] ${route.padEnd(40)} (${res.duration}ms)`);
  }

  // 3. Test API Endpoints
  console.log('\n--- 3. Testing API Endpoints ---');
  const apiRoutes = [
    { path: '/api/health', method: 'GET' },
    { path: '/api/search?q=milk', method: 'GET' },
    { path: '/api/search?q=apple&category=fruits', method: 'GET' },
    { path: '/api/ai', method: 'POST', body: JSON.stringify({ message: 'Hello, what fruits do you have?' }), headers: { 'Content-Type': 'application/json' } }
  ];

  for (const api of apiRoutes) {
    const res = await fetchUrl(api.path, {
      method: api.method,
      body: api.body,
      headers: api.headers
    });
    let parsedJson = null;
    try {
      parsedJson = JSON.parse(res.body);
    } catch {}

    const isSuccess = res.ok && (parsedJson !== null || res.status === 200);
    const statusBadge = isSuccess ? '✅ PASS' : '❌ FAIL';
    console.log(`${statusBadge} [${res.status}] ${api.method} ${api.path.padEnd(45)} (${res.duration}ms)`);
    if (parsedJson) {
      console.log(`   Response snippet: ${JSON.stringify(parsedJson).slice(0, 100)}...`);
    } else {
      console.log(`   Raw response (${res.body.length} bytes): ${res.body.slice(0, 100)}`);
    }
  }

  console.log('\n================================================================');
  console.log('                    AUDIT RUN COMPLETED                         ');
  console.log('================================================================');
}

runTests().catch(console.error);
