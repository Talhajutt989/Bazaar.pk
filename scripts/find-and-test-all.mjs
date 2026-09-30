import fs from 'fs';
import path from 'path';

const APP_DIR = path.resolve(process.cwd(), 'app');
const BASE_URL = 'http://localhost:3000';

function findRoutes(dir, baseRoute = '') {
  let routes = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name.startsWith('(') && entry.name.endsWith(')')) {
        // Route group, does not affect URL
        routes = routes.concat(findRoutes(fullPath, baseRoute));
      } else {
        const nextRoute = `${baseRoute}/${entry.name}`;
        routes = routes.concat(findRoutes(fullPath, nextRoute));
      }
    } else if (entry.isFile()) {
      if (entry.name === 'page.tsx' || entry.name === 'page.jsx' || entry.name === 'page.js' || entry.name === 'page.ts') {
        routes.push({ type: 'page', route: baseRoute || '/', file: fullPath });
      } else if (entry.name === 'route.ts' || entry.name === 'route.js') {
        routes.push({ type: 'api', route: baseRoute || '/', file: fullPath });
      }
    }
  }
  return routes;
}

async function run() {
  const routes = findRoutes(APP_DIR);
  console.log(`Discovered ${routes.length} total endpoints/pages in app/:\n`);

  // Sample dynamic parameters map
  const dynamicMap = {
    '[slug]': 'extra-bold-green-cardamom-sabz-elaichi-250g',
    '[id]': 'ord_12345'
  };

  const results = {
    passed: [],
    failed: [],
    redirected: []
  };

  for (const r of routes) {
    let testPath = r.route;
    if (testPath.includes('[slug]')) {
      if (testPath.startsWith('/store/')) {
        testPath = testPath.replace('[slug]', 'fresh-mart');
      } else {
        testPath = testPath.replace('[slug]', 'extra-bold-green-cardamom-sabz-elaichi-250g');
      }
    }
    if (testPath.includes('[id]')) {
      testPath = testPath.replace('[id]', 'sample-order-id-123');
    }

    const start = Date.now();
    try {
      const res = await fetch(`${BASE_URL}${testPath}`, {
        method: r.type === 'api' ? 'GET' : 'GET',
        headers: { 'Accept': 'text/html,application/json,*/*' },
        redirect: 'manual'
      });
      const duration = Date.now() - start;
      const text = await res.text();

      const hasErrorText = text.includes('Application error') || 
                           text.includes('Unhandled Runtime Error') ||
                           text.includes('Internal Server Error');

      const isRedirect = res.status >= 300 && res.status < 400;
      const isOk = (res.status >= 200 && res.status < 300) && !hasErrorText;

      const item = {
        route: r.route,
        testPath,
        type: r.type,
        status: res.status,
        duration,
        hasErrorText
      };

      if (isOk) {
        results.passed.push(item);
        console.log(`✅ PASS [${res.status}] ${r.type.toUpperCase().padEnd(4)} ${testPath.padEnd(45)} (${duration}ms)`);
      } else if (isRedirect) {
        results.redirected.push(item);
        console.log(`↪️ REDIRECT [${res.status}] ${r.type.toUpperCase().padEnd(4)} ${testPath.padEnd(45)} (${duration}ms)`);
      } else {
        results.failed.push(item);
        console.log(`❌ FAIL [${res.status}] ${r.type.toUpperCase().padEnd(4)} ${testPath.padEnd(45)} (${duration}ms) ${hasErrorText ? '⚠️ [Runtime Error Text]' : ''}`);
      }
    } catch (err) {
      results.failed.push({
        route: r.route,
        testPath,
        type: r.type,
        status: 0,
        error: err.message
      });
      console.log(`❌ ERROR ${r.type.toUpperCase().padEnd(4)} ${testPath.padEnd(45)}: ${err.message}`);
    }
  }

  console.log('\n================ SUMMARY ================');
  console.log(`Total Endpoints: ${routes.length}`);
  console.log(`Passed: ${results.passed.length}`);
  console.log(`Redirected: ${results.redirected.length}`);
  console.log(`Failed: ${results.failed.length}`);
  console.log('=========================================');
}

run().catch(console.error);
