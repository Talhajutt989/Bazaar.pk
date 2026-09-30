async function testAI() {
  const queries = [
    'Same-day delivery schedule',
    'Delivery charges kitne hain?',
    'Payment methods kon se hain aur COD available hai?',
    'Return policy kya hai agar product kharab nikle?',
    'Seller kaise ban sakte hain?',
    'Customer support helpline number',
    'Assalam o alaikum',
    'iPhone 16 Pro Max price aur specs',
    'Pure Desi Ghee',
    'Bazaar.pk kya hai?'
  ];

  console.log('========================================================');
  console.log('🤖 BAZAAR.PK - AI ASSISTANT MULTI-DOMAIN TEST          ');
  console.log('========================================================\n');

  for (const q of queries) {
    console.log(`💬 User Query: "${q}"`);
    try {
      const res = await fetch('http://localhost:3000/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: q })
      });
      const data = await res.json();
      console.log(`🤖 AI Reply Preview:\n${data.reply.slice(0, 180)}...`);
      console.log(`📦 Products attached: ${data.products?.length || 0}`);
      console.log(`💡 Suggested questions: ${data.suggestedQuestions?.join(' | ')}`);
      console.log('--------------------------------------------------------\n');
    } catch (err) {
      console.error(`❌ Error on "${q}":`, err.message);
    }
  }
}

testAI();
