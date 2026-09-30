import { getSupabaseProducts } from '../lib/supabase-service';
import { isStrictMatch, calculateRelevanceScore } from '../lib/search';


async function test() {
  const products = await getSupabaseProducts();
  const queries = [
    'mobile',
    's24',
    'iphone',
    'laptop',
    'dry fruits',
    'badam',
    'honey',
    'shoes',
    'chappal',
    'lawn',
    'perfume',
    'atta',
    'ghee',
    'mango',
    'rice',
    'airpods',
    'watch',
    'pottery',
  ];

  console.log(`\n================ SEARCH VERIFICATION (Total Catalog: ${products.length} items) ================`);
  for (const q of queries) {
    const matched = products
      .filter((p) => isStrictMatch(p, q))
      .sort((a, b) => calculateRelevanceScore(b, q) - calculateRelevanceScore(a, q));

    console.log(`\n🔍 Query: "${q}" -> Matched: ${matched.length} items`);
    matched.slice(0, 3).forEach((p, idx) => {
      console.log(`   ${idx + 1}. ${p.title} (${p.category?.name}) - PKR ${p.basePrice}`);
    });
  }
}

test().catch(console.error);
