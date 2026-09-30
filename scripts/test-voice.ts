import { cleanVoiceTranscript, isStrictMatch, calculateRelevanceScore } from '../lib/search';
import { getSupabaseProducts } from '../lib/supabase-service';

async function main() {
  console.log('--- 1. Testing cleanVoiceTranscript ---');
  const samples = [
    'mujhay watches dikhao',
    'search for cell phone',
    'find desi ghee',
    'mujhe chahiye Apple Watch Ultra 2',
    'dikhao gourmet dry fruits please',
    'peshawari chappal dikha den',
    'asli shehad',
  ];

  for (const s of samples) {
    console.log(`"${s}" -> "${cleanVoiceTranscript(s)}"`);
  }

  console.log('\n--- 2. Testing Supabase Catalog Match with Spoken Keywords ---');
  const products = await getSupabaseProducts();
  console.log(`Loaded ${products.length} products from Supabase.`);

  const testQueries = ['watches', 'cell phone', 'desi ghee', 'apple watch', 'honey', 'chilgoza', 'chappal'];
  for (const q of testQueries) {
    const matched = products
      .filter((p) => isStrictMatch(p as any, q))
      .sort((a, b) => calculateRelevanceScore(b as any, q) - calculateRelevanceScore(a as any, q));

    console.log(`\nQuery "${q}" -> ${matched.length} results:`);
    matched.slice(0, 3).forEach((p) => {
      console.log(`  * ${p.title} (Rs. ${p.basePrice.toLocaleString()})`);
    });
  }
}

main().catch(console.error);
