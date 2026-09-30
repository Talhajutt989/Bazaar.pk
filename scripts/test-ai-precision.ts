import { processAiAssistantQuery } from '../lib/ai-assistant';

async function testSynonyms() {
  const tests = [
    'cell phone dikhao',
    'mujhe mobile chahiyay',
    'ghari dikhao',
    'smart watch price',
    'asli shehad',
    'jootay / peshawari chappal',
    'computer ya laptop',
    'iPhone 16 Pro Max price',
    'gaari ya car'
  ];

  for (const q of tests) {
    const res = await processAiAssistantQuery(q);
    console.log(`\n========================================`);
    console.log(`QUERY: "${q}"`);
    console.log(`MATCHED PRODUCTS (${res.products.length}):`, res.products.map(p => p.title));
  }
}

testSynonyms();
