import { supabaseAdmin } from '../lib/supabase';
import { getSupabaseCategories, getSupabaseStores, getSupabaseProducts, getSupabaseProductBySlug, getSupabaseStoreBySlug } from '../lib/supabase-service';
import { processAiAssistantQuery } from '../lib/ai-assistant';
import { queryAIGrowthAdvisor } from '../lib/ai-seller-analytics';
import { isStrictMatch, calculateRelevanceScore } from '../lib/search';
import { validatePakistaniPhone, validateEmail, validateFullName, validateCnicNumber, validateBankDetails } from '../lib/validation';
import { getAllKycRecords, saveOrSubmitVendorKyc, approveKycRecord, rejectKycRecord } from '../lib/kyc';

interface TestResult {
  suite: string;
  name: string;
  status: 'PASS' | 'FAIL';
  details?: string;
  durationMs: number;
}

const results: TestResult[] = [];

async function test(suite: string, name: string, fn: () => Promise<void>) {
  const start = Date.now();
  try {
    await fn();
    results.push({ suite, name, status: 'PASS', durationMs: Date.now() - start });
    console.log(`  ✔ [PASS] ${name} (${Date.now() - start}ms)`);
  } catch (err: any) {
    results.push({ suite, name, status: 'FAIL', details: err?.message || String(err), durationMs: Date.now() - start });
    console.error(`  ✖ [FAIL] ${name}: ${err?.message || err}`);
  }
}

async function runAllTests() {
  console.log('\n======================================================');
  console.log('       Bazaar.pk - Complete Automated System Tests     ');
  console.log('======================================================\n');

  // -----------------------------------------------------------------
  // 1. Database Connectivity & Data Integrity
  // -----------------------------------------------------------------
  console.log('📌 SUITE 1: Database & Data Integrity');

  await test('Database', 'Verify Supabase connection & categories count', async () => {
    const categories = await getSupabaseCategories();
    if (!categories || categories.length === 0) throw new Error('No categories found in Supabase');
    if (categories.length < 5) throw new Error(`Expected at least 5 categories, got ${categories.length}`);
  });

  await test('Database', 'Verify active stores count and structure', async () => {
    const stores = await getSupabaseStores();
    if (!stores || stores.length === 0) throw new Error('No active stores found in Supabase');
    const store = stores[0];
    if (!store.id || !store.brand_name || !store.slug || !store.city) {
      throw new Error(`Store missing required fields: ${JSON.stringify(store)}`);
    }
  });

  await test('Database', 'Verify products and relational variants', async () => {
    const products = await getSupabaseProducts({ limit: 10 });
    if (!products || products.length === 0) throw new Error('No products found in Supabase');
    const product = products[0];
    if (!product.title || !product.slug || !product.basePrice) {
      throw new Error(`Product missing required fields: ${JSON.stringify(product)}`);
    }
    if (!Array.isArray(product.variants)) {
      throw new Error('Product variants relation missing or not an array');
    }
  });

  await test('Database', 'Fetch single product by slug', async () => {
    const products = await getSupabaseProducts({ limit: 1 });
    if (products.length === 0) throw new Error('No products available to test slug lookup');
    const targetSlug = products[0].slug;
    const product = await getSupabaseProductBySlug(targetSlug);
    if (!product) throw new Error(`Product lookup by slug "${targetSlug}" returned null`);
    if (product.slug !== targetSlug) throw new Error(`Slug mismatch: expected ${targetSlug}, got ${product.slug}`);
  });

  await test('Database', 'Fetch single store by slug', async () => {
    const stores = await getSupabaseStores();
    if (stores.length === 0) throw new Error('No stores available to test store slug lookup');
    const targetSlug = stores[0].slug;
    const store = await getSupabaseStoreBySlug(targetSlug);
    if (!store) throw new Error(`Store lookup by slug "${targetSlug}" returned null`);
    if (store.slug !== targetSlug) throw new Error(`Slug mismatch: expected ${targetSlug}, got ${store.slug}`);
    if (!Array.isArray(store.products)) throw new Error('Store products list missing or not an array');
  });

  // -----------------------------------------------------------------
  // 2. Input Validation
  // -----------------------------------------------------------------
  console.log('\n📌 SUITE 2: Input Validation Logic');

  await test('Validation', 'Pakistani Phone number format validation', async () => {
    const valid1 = validatePakistaniPhone('03001234567');
    const valid2 = validatePakistaniPhone('+923219876543');
    const valid3 = validatePakistaniPhone('0345-1234567');
    const invalid1 = validatePakistaniPhone('12345');
    const invalid2 = validatePakistaniPhone('02134567890'); // Landline

    if (!valid1.isValid || !valid2.isValid || !valid3.isValid) {
      throw new Error('Valid Pakistani mobile numbers rejected');
    }
    if (invalid1.isValid || invalid2.isValid) {
      throw new Error('Invalid phone numbers incorrectly accepted');
    }
  });

  await test('Validation', 'Email format validation', async () => {
    const valid = validateEmail('customer@bazaar.pk');
    const invalid1 = validateEmail('notanemail');
    const invalid2 = validateEmail('test@');

    if (!valid.isValid) throw new Error('Valid email rejected');
    if (invalid1.isValid || invalid2.isValid) throw new Error('Invalid email accepted');
  });

  await test('Validation', 'Pakistani CNIC validation', async () => {
    const valid1 = validateCnicNumber('35202-1234567-1');
    const valid2 = validateCnicNumber('3520212345671');
    const invalid1 = validateCnicNumber('12345');
    const invalid2 = validateCnicNumber('ABCDE-1234567-1');

    if (!valid1.isValid || !valid2.isValid) throw new Error('Valid CNIC rejected');
    if (invalid1.isValid || invalid2.isValid) throw new Error('Invalid CNIC accepted');
    if (valid2.formatted !== '35202-1234567-1') throw new Error(`CNIC auto-formatting failed: got ${valid2.formatted}`);
  });

  await test('Validation', 'Bank IBAN format validation', async () => {
    const valid = validateBankDetails('Meezan Bank', 'Hamza Malik', 'PK42MEZN0001234567890101');
    const invalid = validateBankDetails('', 'Hamza Malik', '1234');

    if (!valid.isValid) throw new Error(`Valid IBAN rejected: ${valid.error}`);
    if (invalid.isValid) throw new Error('Invalid IBAN accepted');
  });

  // -----------------------------------------------------------------
  // 3. Search Engine & Relevance Scoring
  // -----------------------------------------------------------------
  console.log('\n📌 SUITE 3: Search Engine & Relevance Matching');

  await test('Search', 'Strict match & relevance scoring for gadgets', async () => {
    const mockProduct = {
      id: 'p1',
      title: 'Apple iPhone 16 Pro Max',
      brand: 'Apple',
      slug: 'apple-iphone-16-pro-max',
      description: 'Flagship Apple smartphone with Titanium design and A18 Pro chip',
      category: { name: 'Smartphones & Gadgets', slug: 'smartphones-gadgets' },
      store: { brandName: 'Lahore Tech Hub', city: 'Lahore' }
    };

    const match1 = isStrictMatch(mockProduct as any, 'iphone');
    const match2 = isStrictMatch(mockProduct as any, 'mobile');
    const match3 = isStrictMatch(mockProduct as any, 'samsung'); // Should be false

    if (!match1) throw new Error('Expected "iphone" to match iPhone 16 Pro Max');
    if (!match2) throw new Error('Expected "mobile" synonym to match iPhone');
    if (match3) throw new Error('Expected "samsung" NOT to match iPhone 16 Pro Max');

    const scoreExact = calculateRelevanceScore(mockProduct as any, 'iPhone 16 Pro Max');
    const scorePartial = calculateRelevanceScore(mockProduct as any, 'phone');
    if (scoreExact <= scorePartial) throw new Error('Exact title match should score higher than generic keyword');
  });

  // -----------------------------------------------------------------
  // 4. AI Assistant Engine
  // -----------------------------------------------------------------
  console.log('\n📌 SUITE 4: AI Shopping Assistant');

  await test('AI Assistant', 'Greeting query returns welcome guide', async () => {
    const res = await processAiAssistantQuery('Salam! Help me shop');
    if (!res.reply || !res.suggestedQuestions || res.suggestedQuestions.length === 0) {
      throw new Error('AI Assistant did not return welcome response with suggested questions');
    }
  });

  await test('AI Assistant', 'Specific model query (iPhone / Apple Watch)', async () => {
    const res = await processAiAssistantQuery('iPhone 16 Pro Max price');
    if (!res.reply.includes('Price') && !res.reply.includes('Rs.')) {
      throw new Error('AI Assistant did not return price details for specific model');
    }
    if (!res.products || res.products.length === 0) {
      throw new Error('AI Assistant did not return product card for specific model');
    }
  });

  await test('AI Assistant', 'Category synonym query ("ghari" -> Watches)', async () => {
    const res = await processAiAssistantQuery('ghari dikhao');
    if (!res.products || res.products.length === 0) {
      throw new Error('AI Assistant failed to map "ghari" to watches category products');
    }
    const hasWatch = res.products.some((p) => p.title.toLowerCase().includes('watch'));
    if (!hasWatch) throw new Error('AI Assistant returned non-watch products for "ghari" query');
  });

  await test('AI Assistant', 'No-match query returns polite guidance without leaking unrelated items', async () => {
    const res = await processAiAssistantQuery('alien spaceship turbo rocket');
    if (res.products.length > 0) {
      throw new Error('AI Assistant leaked unrelated products for impossible query');
    }
    if (!res.reply.includes('Maaf kijiye ga') && !res.reply.includes('available nahi')) {
      throw new Error('AI Assistant should indicate item is unavailable');
    }
  });

  // -----------------------------------------------------------------
  // 5. KYC & Merchant Lifecycle
  // -----------------------------------------------------------------
  console.log('\n📌 SUITE 5: KYC Verification & Merchant Store Lifecycle');

  await test('KYC', 'Read all KYC records and verify approval status', async () => {
    const records = await getAllKycRecords();
    if (!records || records.length === 0) throw new Error('No KYC records returned');
    const approved = records.filter((r) => r.status === 'APPROVED');
    if (approved.length === 0) throw new Error('Expected at least 1 approved demo KYC record');
  });

  await test('KYC', 'Submit, reject, and approve KYC workflow test', async () => {
    const testStoreId = 'test_store_temp_' + Date.now();
    
    // 1. Submit
    const subRes = await saveOrSubmitVendorKyc({
      storeId: testStoreId,
      storeName: 'Test Dynamic Mart',
      ownerName: 'Test Owner',
      email: 'testowner@bazaar.pk',
      whatsapp: '+923009998877',
      city: 'Islamabad',
      cnicNumber: '61101-1234567-9',
      cnicFrontUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800',
      cnicBackUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800',
      bankName: 'Standard Chartered',
      accountTitle: 'Test Dynamic Mart',
      ibanNumber: 'PK99SCBL0001234567890101',
    });

    if (!subRes.success || !subRes.kyc) throw new Error(`KYC submission failed: ${subRes.error}`);
    if (subRes.kyc.status !== 'UNDER_REVIEW') throw new Error(`Expected UNDER_REVIEW, got ${subRes.kyc.status}`);

    // 2. Reject
    const rejRes = await rejectKycRecord(testStoreId, 'CNIC corner cropped');
    if (!rejRes.success) throw new Error(`KYC rejection failed: ${rejRes.error}`);

    // 3. Approve
    const appRes = await approveKycRecord(testStoreId);
    if (!appRes.success) throw new Error(`KYC approval failed: ${appRes.error}`);
  });

  // -----------------------------------------------------------------
  // 6. Super Admin AI Growth Advisor
  // -----------------------------------------------------------------
  console.log('\n📌 SUITE 6: Super Admin AI Growth Advisor');

  await test('AI Advisor', 'Super Admin growth queries generate strategic recommendations', async () => {
    const res = await queryAIGrowthAdvisor('How can we increase sales for electronics sellers?');
    if (!res.answer || !res.recommendedAction) {
      throw new Error('AI Growth Advisor returned empty response');
    }
  });

  // -----------------------------------------------------------------
  // Summary
  // -----------------------------------------------------------------
  console.log('\n======================================================');
  const total = results.length;
  const passed = results.filter((r) => r.status === 'PASS').length;
  const failed = results.filter((r) => r.status === 'FAIL').length;
  console.log(`Test Execution Finished: ${passed}/${total} PASSED (${failed} FAILED)`);
  console.log('======================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runAllTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
