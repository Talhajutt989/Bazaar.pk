const http = require('http');

const BASE_URL = 'http://localhost:3000';

function createSessionCookie(role, email, name, storeId) {
  const payload = {
    userId: role === 'ADMIN' ? 'admin-1' : role === 'VENDOR' ? 'vendor-1' : 'customer-1',
    email,
    name,
    role,
    ...(storeId ? { storeId, storeName: name } : {}),
  };
  return 'hyperlocal_session=' + Buffer.from(JSON.stringify(payload)).toString('base64');
}

function testUrl(path, cookie = null) {
  return new Promise((resolve) => {
    const url = new URL(path, BASE_URL);
    const headers = {};
    if (cookie) {
      headers['Cookie'] = cookie;
    }

    http.get(url, { headers }, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        const isError =
          res.statusCode >= 400 ||
          body.includes('Unhandled Runtime Error') ||
          body.includes('Internal Server Error') ||
          body.includes('Can\'t reach database server');

        const errorSnippet = isError ? body.substring(0, 300).replace(/\n/g, ' ') : '';

        resolve({
          path,
          status: res.statusCode,
          success: !isError,
          length: body.length,
          errorSnippet,
        });
      });
    }).on('error', (err) => {
      resolve({
        path,
        status: 0,
        success: false,
        length: 0,
        errorSnippet: err.message,
      });
    });
  });
}

async function runAllTests() {
  console.log('🚀 Starting Comprehensive Marketplace Platform Diagnostics...\n');

  // Sessions
  const adminCookie = createSessionCookie('ADMIN', 'admin@marketplace.pk', 'Super Admin');
  const vendorCookie = createSessionCookie('VENDOR', 'lahore.tech@marketplace.pk', 'Lahore Tech Hub', 'f1111111-1111-1111-1111-111111111101');
  const customerCookie = createSessionCookie('CUSTOMER', 'customer@marketplace.pk', 'Verified Customer');

  const routesToTest = [
    // Public routes
    { path: '/', name: 'Storefront Homepage', cookie: null },
    { path: '/products', name: 'Products Catalog', cookie: null },
    { path: '/cart', name: 'Shopping Cart', cookie: null },
    { path: '/checkout', name: 'Checkout Page', cookie: null },
    { path: '/login', name: 'Login Page', cookie: null },
    { path: '/register', name: 'Customer Register', cookie: null },
    { path: '/register/vendor', name: 'Vendor Register', cookie: null },
    { path: '/api/health/db', name: 'Database Health API', cookie: null },
    { path: '/api/search?q=wireless', name: 'Live Search API (q=wireless)', cookie: null },
    { path: '/api/search?q=laptop', name: 'Live Search API (q=laptop)', cookie: null },
    { path: '/api/search?q=ajrak', name: 'Live Search API (q=ajrak)', cookie: null },

    // Protected Customer Routes
    { path: '/account/orders', name: 'Customer Orders Page', cookie: customerCookie },

    // Protected Vendor Routes
    { path: '/vendor', name: 'Vendor Dashboard', cookie: vendorCookie },
    { path: '/vendor/products', name: 'Vendor Products Inventory', cookie: vendorCookie },
    { path: '/vendor/products/new', name: 'Vendor Add Product Form', cookie: vendorCookie },
    { path: '/vendor/orders', name: 'Vendor Orders Stream', cookie: vendorCookie },
    { path: '/vendor/kyc', name: 'Vendor KYC Compliance', cookie: vendorCookie },

    // Protected Admin Routes
    { path: '/admin', name: 'Super Admin Control Center & AI Growth Engine', cookie: adminCookie },
    { path: '/admin/vendors', name: 'Admin Vendors Directory', cookie: adminCookie },
    { path: '/admin/kyc', name: 'Admin KYC Verification Queue', cookie: adminCookie },
    { path: '/admin/orders', name: 'Admin Global Order Tracker', cookie: adminCookie },
    { path: '/admin/categories', name: 'Admin Categories Manager', cookie: adminCookie },
  ];

  let passed = 0;
  let failed = 0;
  const failureDetails = [];

  for (const route of routesToTest) {
    process.stdout.write(`Testing [${route.name}] (${route.path})... `);
    const result = await testUrl(route.path, route.cookie);

    if (result.success && (result.status === 200 || result.status === 307 || result.status === 302)) {
      console.log(`✅ OK (${result.status})`);
      passed++;
    } else {
      console.log(`❌ FAILED (${result.status})`);
      failed++;
      failureDetails.push({ ...route, ...result });
    }
  }

  console.log('\n========================================');
  console.log(`Test Summary: Total: ${routesToTest.length} | Passed: ${passed} | Failed: ${failed}`);
  console.log('========================================\n');

  if (failureDetails.length > 0) {
    console.log('⚠️ Failed Routes Details:');
    failureDetails.forEach((f) => {
      console.log(`- ${f.name} (${f.path}): Status ${f.status} | ${f.errorSnippet}`);
    });
  }
}

runAllTests();
