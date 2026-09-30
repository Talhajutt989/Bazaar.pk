/**
 * Intelligent & Comprehensive E-Commerce Search Engine
 * Provides multi-field matching (Title, Brand, Category, Description, Variants, Store, City),
 * Pakistani marketplace synonym expansion, word boundary precision, and relevance ranking.
 */

export interface ProductSearchCandidate {
  id: string;
  title: string;
  slug: string;
  brand: string | null;
  description?: string | null;
  basePrice: number;
  category?: {
    name: string;
    slug: string;
  } | null;
  store?: {
    brandName: string;
    city: string;
    slug: string;
  } | null;
  variants?: Array<{
    variantName?: string;
    sku?: string;
  }>;
}

// Precise Pakistani E-Commerce Synonym & Transliteration Dictionary
const SYNONYM_MAP: Record<string, string[]> = {
  // Mobile & Phones
  mobile: ['iphone', 'galaxy', 'pixel', 'xiaomi', 'oneplus', 'nothing phone', 'smartphone', 'smartphones', 'cellphone', 'cell phone', 'smartphones gadgets'],
  mobiles: ['iphone', 'galaxy', 'pixel', 'xiaomi', 'oneplus', 'nothing phone', 'smartphone', 'smartphones', 'cellphone', 'cell phone', 'smartphones gadgets'],
  cell: ['iphone', 'galaxy', 'pixel', 'smartphone', 'cell phone', 'cellphone'],
  cellphone: ['iphone', 'galaxy', 'pixel', 'smartphone', 'cell phone', 'mobile'],
  cellphones: ['iphone', 'galaxy', 'pixel', 'smartphone', 'cell phone', 'mobile'],
  'cell phone': ['iphone', 'galaxy', 'pixel', 'smartphone', 'cell phone', 'mobile'],
  'cell phones': ['iphone', 'galaxy', 'pixel', 'smartphone', 'cell phone', 'mobile'],
  'smart phone': ['iphone', 'galaxy', 'pixel', 'smartphone', 'cell phone', 'mobile'],
  'smart phones': ['iphone', 'galaxy', 'pixel', 'smartphone', 'cell phone', 'mobile'],
  phone: ['iphone', 'galaxy', 'pixel', 'xiaomi', 'oneplus', 'nothing phone', 'smartphone', 'smartphones gadgets'],
  phones: ['iphone', 'galaxy', 'pixel', 'xiaomi', 'oneplus', 'nothing phone', 'smartphone', 'smartphones gadgets'],
  smartphone: ['iphone', 'galaxy', 'pixel', 'xiaomi', 'oneplus', 'nothing phone'],
  smartphones: ['iphone', 'galaxy', 'pixel', 'xiaomi', 'oneplus', 'nothing phone'],
  iphone: ['apple iphone', 'iphone 16', 'iphone 15'],
  samsung: ['samsung galaxy', 'galaxy s24'],
  galaxy: ['samsung galaxy', 'galaxy s24'],
  pixel: ['google pixel'],

  // Laptops & Computing
  laptop: ['macbook', 'xps', 'thinkpad', 'zephyrus', 'notebook', 'laptops computing'],
  laptops: ['macbook', 'xps', 'thinkpad', 'zephyrus', 'notebook', 'laptops computing'],
  macbook: ['apple macbook', 'macbook pro'],
  dell: ['dell xps'],
  lenovo: ['lenovo thinkpad'],
  asus: ['asus rog', 'zephyrus'],
  computer: ['macbook', 'thinkpad', 'laptop', 'monitor'],

  // Audio & Wearables
  headphone: ['sony wh 1000xm5', 'headphones', 'noise cancelling'],
  headphones: ['sony wh 1000xm5', 'headphones', 'noise cancelling'],
  earbuds: ['apple airpods', 'airpods pro', 'earbuds'],
  earbud: ['apple airpods', 'airpods pro', 'earbuds'],
  airpods: ['apple airpods', 'airpods pro'],
  watch: ['apple watch', 'smartwatch', 'smartwatches', 'ultra 2', 'galaxy watch', 'amazfit'],
  watches: ['apple watch', 'smartwatch', 'smartwatches', 'ultra 2', 'galaxy watch', 'amazfit'],
  smartwatch: ['apple watch', 'smartwatch', 'smartwatches', 'ultra 2', 'galaxy watch', 'amazfit'],
  smartwatches: ['apple watch', 'smartwatch', 'smartwatches', 'ultra 2', 'galaxy watch', 'amazfit'],
  'smart watch': ['apple watch', 'smartwatch', 'smartwatches', 'ultra 2', 'galaxy watch', 'amazfit'],
  'smart watches': ['apple watch', 'smartwatch', 'smartwatches', 'ultra 2', 'galaxy watch', 'amazfit'],
  'apple watch': ['apple watch', 'ultra 2', 'series 10'],
  'galaxy watch': ['galaxy watch', 'galaxy watch 7'],
  ghari: ['apple watch', 'smartwatch', 'smartwatches', 'ultra 2', 'galaxy watch', 'amazfit'],
  ghariyan: ['apple watch', 'smartwatch', 'smartwatches', 'ultra 2', 'galaxy watch', 'amazfit'],
  ghadi: ['apple watch', 'smartwatch', 'smartwatches', 'ultra 2', 'galaxy watch', 'amazfit'],

  // Tech Accessories
  powerbank: ['anker 737', 'power bank', 'powercore'],
  charger: ['anker', 'power bank', 'fast charge'],
  mouse: ['logitech mx master', 'wireless mouse'],
  keyboard: ['keychron q1', 'mechanical keyboard'],
  monitor: ['lg ultrafine', '4k monitor'],
  ssd: ['sandisk extreme', 'portable ssd'],
  gimbal: ['dji osmo pocket', 'gimbal camera'],

  // Dry Fruits & Spices (English & Urdu / Transliteration)
  dryfruit: ['badam', 'almond', 'pista', 'pistachio', 'kaju', 'cashew', 'akhrot', 'walnut', 'khubani', 'apricot', 'zafran', 'saffron', 'chilgoza', 'pine nuts', 'anjeer', 'figs', 'kishmish', 'raisins', 'gourmet dry fruits'],
  dryfruits: ['badam', 'almond', 'pista', 'pistachio', 'kaju', 'cashew', 'akhrot', 'walnut', 'khubani', 'apricot', 'zafran', 'saffron', 'chilgoza', 'pine nuts', 'anjeer', 'figs', 'kishmish', 'raisins', 'gourmet dry fruits'],
  'dry fruit': ['badam', 'almond', 'pista', 'pistachio', 'kaju', 'cashew', 'akhrot', 'walnut', 'khubani', 'apricot', 'zafran', 'saffron', 'chilgoza', 'pine nuts', 'anjeer', 'figs', 'kishmish', 'raisins', 'gourmet dry fruits'],
  'dry fruits': ['badam', 'almond', 'pista', 'pistachio', 'kaju', 'cashew', 'akhrot', 'walnut', 'khubani', 'apricot', 'zafran', 'saffron', 'chilgoza', 'pine nuts', 'anjeer', 'figs', 'kishmish', 'raisins', 'gourmet dry fruits'],
  nuts: ['badam', 'almond', 'pista', 'pistachio', 'kaju', 'cashew', 'akhrot', 'walnut', 'chilgoza', 'pine nuts'],
  mewa: ['badam', 'pista', 'kaju', 'akhrot', 'khubani', 'zafran', 'chilgoza'],
  badam: ['almond', 'badam giri', 'mamra giri'],
  almond: ['badam', 'almond', 'mamra'],
  almonds: ['badam', 'almond', 'mamra'],
  pista: ['pistachio', 'pista akbar', 'salted pistachios'],
  pistachio: ['pista', 'pistachio', 'pista akbar'],
  pistachios: ['pista', 'pistachio', 'pista akbar'],
  kaju: ['cashew', 'kaju', 'roasted cashews'],
  cashew: ['kaju', 'cashew', 'roasted cashews'],
  cashews: ['kaju', 'cashew', 'roasted cashews'],
  akhrot: ['walnut', 'akhrot', 'kagzi walnuts'],
  walnut: ['akhrot', 'walnut', 'kagzi walnuts'],
  walnuts: ['akhrot', 'walnut', 'kagzi walnuts'],
  khubani: ['apricot', 'khubani', 'dried apricots'],
  apricot: ['khubani', 'apricot', 'dried apricots'],
  apricots: ['khubani', 'apricot', 'dried apricots'],
  zafran: ['saffron', 'zafran', 'kashmiri saffron', 'organic saffron'],
  saffron: ['zafran', 'saffron', 'kashmiri saffron', 'organic saffron'],
  chilgoza: ['pine nuts', 'chilgoza', 'roasted chilgoza'],
  anjeer: ['figs', 'anjeer', 'dried figs'],
  figs: ['anjeer', 'figs', 'dried figs'],
  kishmish: ['raisins', 'kishmish', 'sundarkhani'],
  raisins: ['kishmish', 'raisins', 'sundarkhani'],

  // Grocery & Organics
  grocery: ['atta', 'rice', 'ghee', 'oil', 'honey', 'eggs', 'salt', 'tea', 'mango', 'fresh grocery'],
  rashan: ['atta', 'rice', 'ghee', 'oil', 'honey', 'eggs', 'salt', 'tea'],
  mango: ['sindhri', 'chaunsa', 'mangoes', 'mango crate'],
  mangoes: ['sindhri', 'chaunsa', 'mango', 'mango crate'],
  aam: ['sindhri', 'chaunsa', 'mango', 'mangoes'],
  chaunsa: ['chaunsa mangoes', 'multan chaunsa'],
  sindhri: ['sindhri mangoes', 'farm fresh sindhri'],
  ghee: ['desi ghee', 'organic desi ghee'],
  'desi ghee': ['desi ghee', 'organic desi ghee', 'pure desi ghee'],
  'asli ghee': ['desi ghee', 'organic desi ghee', 'pure desi ghee'],
  honey: ['sidr honey', 'beri honey', 'wild honey'],
  'sidr honey': ['sidr honey', 'beri honey', 'wild honey'],
  shehd: ['sidr honey', 'beri honey', 'wild honey', 'honey'],
  shehed: ['sidr honey', 'beri honey', 'wild honey', 'honey'],
  shehad: ['sidr honey', 'beri honey', 'wild honey', 'honey'],
  'asli shehad': ['sidr honey', 'beri honey', 'wild honey', 'honey'],
  rice: ['basmati rice', 'super kernel', 'aged rice'],
  chawal: ['basmati rice', 'super kernel', 'aged rice'],
  atta: ['chakki atta', 'whole wheat atta'],
  flour: ['chakki atta', 'whole wheat atta'],
  oil: ['mustard oil', 'olive oil', 'sarson', 'argan oil'],
  sarson: ['mustard oil', 'sarson'],
  olive: ['olive oil', 'extra virgin olive'],
  salt: ['pink salt', 'himalayan pink salt'],
  namak: ['pink salt', 'himalayan pink salt'],
  tea: ['green tea', 'kahwa leaves', 'kashmiri green tea'],
  chai: ['green tea', 'kahwa leaves', 'kashmiri green tea'],
  kahwa: ['kahwa leaves', 'kashmiri green tea'],
  eggs: ['desi eggs', 'farm fresh eggs'],
  ande: ['desi eggs', 'farm fresh eggs'],

  // Fashion & Apparel
  apparel: ['kurta', 'kurti', 'kameez', 'shalwar kameez', 'suit', 'lawn', 'hoodie', 'jacket', 'tracksuit', 'polo', 'apparel clothing', 'mens fashion', 'womens fashion'],
  'apparel clothing': ['kurta', 'kurti', 'kameez', 'shalwar kameez', 'suit', 'lawn', 'hoodie', 'jacket', 'tracksuit', 'polo', 'apparel clothing', 'mens fashion', 'womens fashion'],
  clothes: ['kurta', 'kurti', 'kameez', 'shalwar kameez', 'suit', 'lawn', 'chiffon', 'waistcoat', 'shawl', 'cardigan', 'hoodie', 'jacket', 'mens fashion', 'womens ethnic', 'apparel clothing'],
  clothing: ['kurta', 'kurti', 'kameez', 'shalwar kameez', 'suit', 'lawn', 'chiffon', 'waistcoat', 'shawl', 'cardigan', 'hoodie', 'jacket', 'mens fashion', 'womens ethnic', 'apparel clothing'],
  kapray: ['kurta', 'kurti', 'kameez', 'shalwar kameez', 'suit', 'lawn', 'chiffon', 'waistcoat', 'shawl', 'cardigan', 'hoodie', 'jacket'],
  kurta: ['kurta', 'kurti', 'kameez', 'shalwar kameez'],
  kurti: ['kurti', 'lawn kurti', 'summer lawn kurti'],
  kameez: ['kurta', 'kurti', 'kameez', 'shalwar kameez'],
  suit: ['formal suit', '3 piece suit', 'shalwar kameez', 'chiffon suit', 'business suit'],
  hoodie: ['cotton fleece hoodie', 'hoodie', 'streetwear hoodie'],
  jacket: ['denim trucker jacket', 'jacket', 'leather jacket'],
  tracksuit: ['thermal fleece tracksuit', 'tracksuit', 'jogger'],
  lawn: ['cotton lawn', 'lawn kurti', 'summer lawn'],
  chiffon: ['chiffon suit', 'embroidered chiffon'],
  silk: ['raw silk waistcoat', 'pure silk', 'banarasi silk'],
  waistcoat: ['embroidered waistcoat', 'raw silk waistcoat'],
  shawl: ['velvet shawl', 'embroidered shawl', 'kashmiri shawl', 'banarasi silk shawl'],
  cardigan: ['wool cardigan', 'knit cardigan'],
  sweater: ['wool cardigan', 'knit cardigan'],
  belt: ['formal belt', 'leather belt'],

  // Electronics & Gadgets
  electronics: ['tv', 'smart tv', 'headphones', 'power bank', 'security camera', 'keyboard', 'speaker', 'purifier', 'gimbal', 'charger', 'electronics gadgets'],
  'electronics gadgets': ['tv', 'smart tv', 'headphones', 'power bank', 'security camera', 'keyboard', 'speaker', 'purifier', 'gimbal', 'charger', 'electronics gadgets'],
  gadgets: ['tv', 'smart tv', 'headphones', 'power bank', 'security camera', 'keyboard', 'speaker', 'purifier', 'gimbal', 'charger', 'smartphones gadgets'],
  tv: ['samsung 4k smart tv', 'crystal 4k', 'google tv'],
  speaker: ['jbl flip 6', 'bluetooth speaker', 'portable speaker'],
  camera: ['tapo security camera', 'dji osmo', 'gimbal camera'],

  // Sports & Fitness
  sports: ['cricket bat', 'football', 'dumbbell set', 'badminton racket', 'resistance bands', 'camping tent', 'sports outdoor'],
  'sports outdoor': ['cricket bat', 'football', 'dumbbell set', 'badminton racket', 'resistance bands', 'camping tent'],
  fitness: ['dumbbell set', 'resistance bands', 'gym', 'workout'],
  cricket: ['english willow cricket bat', 'sialkot cricket bat'],
  football: ['fifa approved match football', 'match football'],
  badminton: ['carbon fiber badminton racket', 'racket set'],
  dumbbells: ['cast iron dumbbell set', 'adjustable dumbbells'],

  // Spices & Herbs
  spices: ['saffron', 'zafran', 'kashmiri degi mirch', 'wild honey', 'cardamom', 'black pepper', 'turmeric', 'spices herbs'],
  'spices herbs': ['saffron', 'zafran', 'kashmiri degi mirch', 'wild honey', 'cardamom', 'black pepper', 'turmeric'],
  masala: ['degi mirch', 'black pepper', 'cardamom', 'saffron', 'zafran'],
  masalay: ['degi mirch', 'black pepper', 'cardamom', 'saffron', 'zafran'],

  // Footwear
  shoes: ['oxford brogue', 'kolhapuri khussa', 'peshawari chappal', 'running sneakers', 'dress shoes', 'shoes footwear'],
  'shoes footwear': ['oxford brogue', 'kolhapuri khussa', 'peshawari chappal', 'running sneakers', 'dress shoes'],
  shoe: ['oxford brogue', 'kolhapuri khussa', 'peshawari chappal', 'running sneakers', 'dress shoes'],
  sneakers: ['air cushion running sneakers', 'running sneakers'],
  sneaker: ['air cushion running sneakers', 'running sneakers'],
  jootay: ['oxford brogue', 'kolhapuri khussa', 'peshawari chappal', 'dress shoes', 'sneakers'],
  joota: ['oxford brogue', 'kolhapuri khussa', 'peshawari chappal', 'dress shoes', 'sneakers'],
  footwear: ['oxford brogue', 'kolhapuri khussa', 'peshawari chappal', 'dress shoes', 'sneakers'],
  chappal: ['peshawari chappal', 'kaptaan chappal'],
  chappalain: ['peshawari chappal', 'kaptaan chappal'],
  peshawari: ['peshawari chappal', 'kaptaan chappal'],
  'peshawari chappal': ['peshawari chappal', 'kaptaan chappal'],
  khussa: ['kolhapuri khussa', 'mirror work khussa', 'velvet mukaish khussa'],
  khussay: ['kolhapuri khussa', 'mirror work khussa', 'velvet mukaish khussa'],
  kolhapuri: ['kolhapuri khussa', 'mirror work khussa'],
  brogue: ['oxford brogue', 'leather dress shoes'],
  oxford: ['oxford brogue', 'leather dress shoes'],
  clutch: ['evening clutch', 'zardozi clutch'],
  bag: ['evening clutch', 'zardozi clutch'],

  // Home & Decor
  home: ['blue pottery', 'chinioti mirror', 'king bedsheet', 'jute rug', 'moroccan lantern', 'copper handi', 'home decor'],
  decor: ['blue pottery', 'chinioti mirror', 'king bedsheet', 'jute rug', 'moroccan lantern', 'copper handi', 'home decor'],
  pottery: ['blue pottery', 'ceramic vase', 'multani pottery'],
  vase: ['blue pottery', 'ceramic vase'],
  mirror: ['chinioti mirror', 'sheesham wood mirror'],
  bedsheet: ['egyptian cotton bedsheet', 'king bedsheet'],
  rug: ['jute cotton rug', 'woolen runner'],
  carpet: ['jute cotton rug', 'woolen runner'],
  lantern: ['moroccan lantern', 'brass lantern'],
  handi: ['copper serving handi', 'hammered copper'],

  // Beauty & Fragrances
  beauty: ['arabian attar', 'moroccan argan', 'ubtan', 'multani mitti', 'beauty personal care'],
  makeup: ['luxury ubtan', 'multani mitti mask'],
  perfume: ['arabian attar', 'oud al layl', 'concentrated attar'],
  fragrance: ['arabian attar', 'oud al layl', 'concentrated attar'],
  attar: ['arabian attar', 'oud al layl'],
  ittar: ['arabian attar', 'oud al layl'],
  oud: ['oud al layl', 'arabian attar'],
  serum: ['moroccan argan oil', 'vitamin c serum'],
  shampoo: ['moroccan argan oil'],
};

/**
 * Sanitizes voice transcripts by stripping conversational prefixes/suffixes
 * (e.g. "search for watches" -> "watches", "mujhay desi ghee dikhao" -> "desi ghee").
 */
export function cleanVoiceTranscript(rawText: string): string {
  if (!rawText) return '';
  let text = rawText.trim();

  // Strip common conversational prefixes in English and Roman Urdu / Urdu (longest matches first)
  const prefixRegex = /^(mujhe\s+chahiye|mujhay\s+chahiye|humain\s+chahiye|humein\s+chahiye|i\s+want\s+to\s+buy|i\s+want\s+to\s+see|i\s+want|can\s+you\s+find|can\s+you\s+show\s+me|please\s+show\s+me|please\s+find|please\s+search\s+for|please\s+search|search\s+for|look\s+for|show\s+me|get\s+me|search|find|show|open|mujhe|mujhay|humay|humein|batao|dikhao|dhundo|kya\s+hai|please)\s+/i;
  // Strip common conversational suffixes
  const suffixRegex = /\s+(dikhao\s+please|chahiye\s+mujhe|dikha\s+den|dikha\s+do|search\s+karo|show\s+karo|nikalo|dikhao|chahiye|batao|dhundo|please)$/i;

  let previous = '';
  while (text !== previous) {
    previous = text;
    text = text.replace(prefixRegex, '').replace(suffixRegex, '').trim();
  }

  return text || rawText.trim();
}

/**
 * Normalizes text by removing non-alphanumeric punctuation and standardizing spaces.
 */
export function normalizeSearchString(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/[^\w\s\d]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Checks if a word or phrase exists with word boundary in corpus
 */
function hasWordBoundaryMatch(corpus: string, term: string): boolean {
  if (!corpus || !term) return false;
  if (corpus === term) return true;

  // Exact word boundary regex
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(^|\\s)${escaped}(\\s|$)`, 'i');
  return regex.test(corpus);
}

/**
 * Extracts searchable text document from a product object.
 */
export function buildProductSearchCorpus(product: ProductSearchCandidate): string {
  const parts: string[] = [
    product.title || '',
    product.brand || '',
    product.category?.name || '',
    product.category?.slug || '',
    product.description || '',
    product.store?.brandName || '',
    product.store?.city || '',
  ];

  if (product.variants && Array.isArray(product.variants)) {
    for (const v of product.variants) {
      if (v.variantName) parts.push(v.variantName);
      if (v.sku) parts.push(v.sku);
    }
  }

  return normalizeSearchString(parts.join(' '));
}

/**
 * Checks if a product matches the query using direct matching, token overlap, and synonym expansion.
 */
export function isStrictMatch(product: ProductSearchCandidate, rawQuery: string): boolean {
  const q = normalizeSearchString(rawQuery);
  if (!q) return true;

  const corpus = buildProductSearchCorpus(product);
  const titleNorm = normalizeSearchString(product.title || '');
  const brandNorm = normalizeSearchString(product.brand || '');
  const catNorm = normalizeSearchString(product.category?.name || '');

  // 1. Direct word-boundary match of full query in title, brand, category, or corpus
  if (hasWordBoundaryMatch(titleNorm, q) || hasWordBoundaryMatch(brandNorm, q) || hasWordBoundaryMatch(catNorm, q) || hasWordBoundaryMatch(corpus, q)) {
    return true;
  }

  // If query is longer than 3 characters, substring in title or brand is also an instant match
  if (q.length >= 3 && (titleNorm.includes(q) || brandNorm.includes(q))) {
    return true;
  }

  // 2. Query tokens
  const queryTokens = q.split(' ').filter((t) => t.length > 0);

  // 3. Synonym expansions for query
  const expandedTerms = new Set<string>();
  for (const t of queryTokens) {
    const syns = SYNONYM_MAP[t];
    if (syns) {
      syns.forEach((s) => expandedTerms.add(normalizeSearchString(s)));
    }
  }
  const fullSyns = SYNONYM_MAP[q];
  if (fullSyns) {
    fullSyns.forEach((s) => expandedTerms.add(normalizeSearchString(s)));
  }

  // Check if any expanded term matches in corpus
  for (const term of expandedTerms) {
    if (term.length > 1) {
      if (hasWordBoundaryMatch(titleNorm, term) || hasWordBoundaryMatch(brandNorm, term) || hasWordBoundaryMatch(corpus, term)) {
        return true;
      }
      if (term.length >= 4 && (titleNorm.includes(term) || corpus.includes(term))) {
        return true;
      }
    }
  }

  // 4. Token-by-token matching
  let matchedTokens = 0;
  for (const token of queryTokens) {
    if (token.length <= 1) continue;

    const hasMatch =
      hasWordBoundaryMatch(titleNorm, token) ||
      hasWordBoundaryMatch(brandNorm, token) ||
      hasWordBoundaryMatch(catNorm, token) ||
      hasWordBoundaryMatch(corpus, token);

    if (hasMatch) {
      matchedTokens++;
    }
  }

  if (queryTokens.length === 1) {
    return matchedTokens >= 1;
  }

  return matchedTokens >= Math.min(queryTokens.length, 2);
}

/**
 * Calculates a search relevance score for ordering matched products.
 * High relevance placed on title matches, brand matches, and exact phrase matches.
 */
export function calculateRelevanceScore(product: ProductSearchCandidate, rawQuery: string): number {
  if (!rawQuery) return 1;
  const q = normalizeSearchString(rawQuery);
  let score = 0;

  const titleNorm = normalizeSearchString(product.title || '');
  const brandNorm = normalizeSearchString(product.brand || '');
  const catNorm = normalizeSearchString(product.category?.name || '');
  const descNorm = normalizeSearchString(product.description || '');
  const corpus = buildProductSearchCorpus(product);

  // 1. Exact Full Phrase Matches
  if (titleNorm === q) score += 500;
  else if (titleNorm.startsWith(q)) score += 350;
  else if (hasWordBoundaryMatch(titleNorm, q)) score += 250;
  else if (titleNorm.includes(q)) score += 180;

  if (brandNorm === q) score += 200;
  else if (hasWordBoundaryMatch(brandNorm, q)) score += 150;

  if (catNorm === q) score += 140;
  else if (hasWordBoundaryMatch(catNorm, q)) score += 100;

  if (hasWordBoundaryMatch(descNorm, q)) score += 50;

  // 2. Token Matches
  const queryTokens = q.split(' ').filter((t) => t.length > 0);
  for (const token of queryTokens) {
    if (token.length <= 1) continue;

    if (hasWordBoundaryMatch(titleNorm, token)) score += 80;
    if (hasWordBoundaryMatch(brandNorm, token)) score += 60;
    if (hasWordBoundaryMatch(catNorm, token)) score += 40;
    if (hasWordBoundaryMatch(descNorm, token)) score += 20;

    // Check synonyms
    const syns = SYNONYM_MAP[token];
    if (syns) {
      for (const syn of syns) {
        const normSyn = normalizeSearchString(syn);
        if (hasWordBoundaryMatch(titleNorm, normSyn)) score += 50;
        else if (hasWordBoundaryMatch(corpus, normSyn)) score += 30;
      }
    }
  }

  return score;
}
