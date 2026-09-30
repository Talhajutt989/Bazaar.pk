import { supabaseAdmin } from './supabase';
import { SEEDED_PRODUCTS } from './seed-products';

export interface ProductMatch {
  id?: string;
  title: string;
  slug: string;
  brand?: string | null;
  basePrice: number;
  description: string;
  images: string[];
  categoryName?: string;
  storeName?: string;
  city?: string;
  variantsSummary?: string;
}

export interface ChatResponse {
  reply: string;
  products: ProductMatch[];
  suggestedQuestions: string[];
}

interface IntentDefinition {
  canonicalName: string;
  synonyms: string[];
  targetCategoryKeywords: string[];
  mustIncludeAny: string[];
  mustExcludeAny?: string[];
}

const INTENT_DICTIONARY: IntentDefinition[] = [
  {
    canonicalName: 'Smartphones & Mobile Phones',
    synonyms: [
      'mobile', 'mobiles', 'cell phone', 'cellphone', 'cell phones', 'cellphones',
      'smartphone', 'smartphones', 'smart phone', 'smart phones',
      'touch phone', 'handset', 'handsets', 'ios phone', 'android phone'
    ],
    targetCategoryKeywords: ['smartphones', 'smartphones-gadgets'],
    mustIncludeAny: ['iphone', 'galaxy s', 'pixel', 'xiaomi', 'smartphone', '5g flagship'],
    mustExcludeAny: ['headphones', 'airpods', 'watch', 'keyboard', 'power bank', 'charger']
  },
  {
    canonicalName: 'Smart Watches & Wrist Watches',
    synonyms: [
      'watch', 'watches', 'ghari', 'ghadi', 'smart watch', 'smartwatch', 'smart watches',
      'smartwatches', 'wrist watch', 'wristwatch', 'hand watch', 'fitness tracker', 'fitness band', 'timepiece'
    ],
    targetCategoryKeywords: ['watch', 'smartwatch'],
    mustIncludeAny: ['watch', 'smartwatch'],
    mustExcludeAny: ['iphone', 'airpods', 'galaxy s24', 'pixel 9']
  },
  {
    canonicalName: 'AirPods, Headphones & Audio',
    synonyms: [
      'airpod', 'airpods', 'air pod', 'air pods', 'earbud', 'earbuds', 'earphone',
      'earphones', 'headphone', 'headphones', 'handfree', 'handsfree', 'headset', 'headsets', 'ear piece'
    ],
    targetCategoryKeywords: ['audio', 'headphones', 'airpods'],
    mustIncludeAny: ['airpods', 'headphones', 'earbuds', 'wh-1000xm5'],
    mustExcludeAny: ['iphone', 'watch', 'laptop']
  },
  {
    canonicalName: 'Laptops & Computers',
    synonyms: [
      'laptop', 'laptops', 'computer', 'computers', 'pc', 'notebook', 'notebooks',
      'macbook', 'macbooks', 'mac', 'system', 'machine'
    ],
    targetCategoryKeywords: ['laptops', 'laptops-computers', 'computing'],
    mustIncludeAny: ['macbook', 'laptop', 'xps', 'thinkpad', 'notebook'],
    mustExcludeAny: ['keyboard', 'charger']
  },
  {
    canonicalName: 'Pure Organic Desi Ghee & Cooking Oils',
    synonyms: [
      'ghee', 'ghees', 'desi ghee', 'asli ghee', 'bilona ghee', 'makhan', 'butter',
      'oil', 'olive oil', 'zeytoon', 'cooking oil', 'mustard oil', 'sarson'
    ],
    targetCategoryKeywords: ['grocery', 'fresh-grocery', 'organics'],
    mustIncludeAny: ['ghee', 'olive oil'],
    mustExcludeAny: ['mangoes', 'eggs', 'mask', 'rice']
  },
  {
    canonicalName: 'Pure Wild Sidr Honey',
    synonyms: [
      'shehad', 'shehed', 'shahad', 'honey', 'honeys', 'sidr', 'sidr honey',
      'beri honey', 'choti makhi', 'asli shehad', 'organic honey'
    ],
    targetCategoryKeywords: ['grocery', 'fresh-grocery'],
    mustIncludeAny: ['honey', 'sidr'],
    mustExcludeAny: ['mangoes', 'ghee', 'eggs']
  },
  {
    canonicalName: 'Farm Fresh Organic Eggs',
    synonyms: [
      'anday', 'ande', 'anda', 'egg', 'eggs', 'desi anday', 'desi anda', 'poultry'
    ],
    targetCategoryKeywords: ['grocery', 'fresh-grocery'],
    mustIncludeAny: ['egg', 'eggs'],
    mustExcludeAny: ['mangoes', 'honey', 'ghee']
  },
  {
    canonicalName: 'Gourmet Dry Fruits & Spices',
    synonyms: [
      'dry fruit', 'dry fruits', 'dryfruit', 'dryfruits', 'meva', 'mewa', 'badam',
      'almond', 'almonds', 'akhrot', 'walnut', 'walnuts', 'chilgoza', 'pine nut', 'pine nuts',
      'pista', 'pistachio', 'pistachios', 'kishmish', 'zafran', 'saffron', 'kesar',
      'spices', 'masalay', 'garam masala', 'kahwa', 'tea', 'kashmiri chai'
    ],
    targetCategoryKeywords: ['dryfruits', 'gourmet-dry-fruits', 'spices'],
    mustIncludeAny: ['chilgoza', 'pistachio', 'walnut', 'almond', 'saffron', 'spices', 'kahwa', 'tea', 'cardamom', 'clove', 'dates'],
    mustExcludeAny: ['mangoes', 'ghee']
  },
  {
    canonicalName: 'Footwear & Traditional Chappals',
    synonyms: [
      'chappal', 'chappals', 'peshawari chappal', 'kheri', 'norzi', 'kaptaan chappal',
      'joota', 'jootay', 'shoes', 'sandals', 'footwear', 'leather shoes'
    ],
    targetCategoryKeywords: ['footwear', 'mens-fashion'],
    mustIncludeAny: ['chappal', 'footwear', 'leather shoes'],
    mustExcludeAny: ['suit', 'kameez', 'shawl']
  },
  {
    canonicalName: "Men's Apparel & Couture",
    synonyms: [
      'mens clothes', 'mens suit', 'kurta', 'kurtay', 'kameez', 'shalwar kameez',
      'waistcoat', 'waskat', 'cotton suit', 'latha'
    ],
    targetCategoryKeywords: ['mens-fashion'],
    mustIncludeAny: ['shalwar kameez', 'waistcoat', 'kurta', 'cotton'],
    mustExcludeAny: ['chappal', 'women']
  },
  {
    canonicalName: "Women's Fashion & Formal Suits",
    synonyms: [
      'womens dress', 'womens suit', 'dress', 'dresses', 'kapray', 'kapre', 'lawn',
      'chiffon', 'khaddar', 'shawl', 'shawls', 'velvet shawl', 'shadi suit', 'wedding dress',
      'embroidered suit', 'karhai'
    ],
    targetCategoryKeywords: ['womens-fashion'],
    mustIncludeAny: ['chiffon', 'velvet shawl', 'suit', 'embroidered', 'dress'],
    mustExcludeAny: ['men', 'chappal']
  },
  {
    canonicalName: 'Beauty, Skincare & Fragrances',
    synonyms: [
      'cream', 'serum', 'face wash', 'face mask', 'multani mitti', 'argan oil',
      'rose water', 'arq e gulab', 'attar', 'itr', 'perfume', 'khushboo', 'oud'
    ],
    targetCategoryKeywords: ['beauty', 'beauty-care'],
    mustIncludeAny: ['multani mitti', 'argan oil', 'rose water', 'serum', 'attar', 'oud', 'face mask']
  },
  {
    canonicalName: 'Home Living & Artisanal Crafts',
    synonyms: [
      'vase', 'pottery', 'blue pottery', 'clay', 'decor', 'rug', 'carpet', 'haleen',
      'mirror frame', 'sheesham', 'brass lantern', 'lamp'
    ],
    targetCategoryKeywords: ['home-living'],
    mustIncludeAny: ['blue pottery', 'sheesham', 'rug', 'lantern', 'vase']
  }
];

function containsWord(text: string, term: string): boolean {
  if (!text || !term) return false;
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`\\b${escaped}\\b`, 'i');
  return regex.test(text);
}

/**
 * Normalizes user input and identifies matched semantic intent
 */
function analyzeUserQuery(text: string): {
  cleaned: string;
  matchedIntents: IntentDefinition[];
  specificModelTerms: string[];
} {
  const cleaned = text
    .toLowerCase()
    .replace(/[^\w\s]/gi, ' ')
    .trim();

  const matchedIntents: IntentDefinition[] = [];

  for (const intent of INTENT_DICTIONARY) {
    for (const syn of intent.synonyms) {
      if (cleaned.includes(syn) || containsWord(cleaned, syn)) {
        matchedIntents.push(intent);
        break;
      }
    }
  }

  // Model-specific terms
  const specificModels = [
    'iphone 16 pro max', 'iphone 16', 'iphone', 's24 ultra', 's24', 'galaxy s24',
    'pixel 9 pro xl', 'pixel 9', 'pixel', 'xiaomi 14 ultra', 'xiaomi 14',
    'apple watch ultra 2', 'apple watch ultra', 'apple watch series 10', 'apple watch 10', 'galaxy watch 7', 'amazfit gtr 4', 'amazfit',
    'airpods pro 2', 'airpods pro', 'airpods', 'sony wh-1000xm5', 'xm5',
    'macbook air m3', 'macbook air', 'macbook pro 16', 'macbook pro', 'macbook', 'thinkpad x1', 'thinkpad', 'dell xps 15', 'dell xps',
    'desi ghee', 'bilona ghee', 'sidr honey', 'wild honey', 'desi eggs', 'olive oil',
    'chilgoza', 'pistachios', 'walnuts', 'saffron', 'kahwa',
    'peshawari chappal', 'shalwar kameez', 'waistcoat', 'chiffon suit', 'velvet shawl',
    'multani mitti', 'argan oil', 'rose water', 'oud'
  ];

  const matchedModels = specificModels.filter((m) => cleaned.includes(m) || containsWord(cleaned, m));

  return {
    cleaned,
    matchedIntents,
    specificModelTerms: matchedModels,
  };
}

/**
 * Fetch catalog products from Supabase (or fallback to SEEDED_PRODUCTS)
 */
export async function getFullCatalog(): Promise<ProductMatch[]> {
  try {
    const { data: dbProducts } = await supabaseAdmin
      .from('products')
      .select('id, title, slug, brand, description, base_price, images, categories(name, slug), stores(brand_name, city), product_variants(sku, variant_name, price, stock)')
      .eq('is_active', true)
      .limit(150);

    if (dbProducts && dbProducts.length > 0) {
      return dbProducts.map((p: any) => {
        let parsedImages: string[] = [];
        try {
          parsedImages = typeof p.images === 'string' ? JSON.parse(p.images) : p.images || [];
        } catch {
          parsedImages = [p.images];
        }

        const variantsList = (p.product_variants || []).map(
          (v: any) => `${v.variant_name} (Rs. ${v.price.toLocaleString()})`
        );

        return {
          id: p.id,
          title: p.title,
          slug: p.slug,
          brand: p.brand,
          basePrice: p.base_price,
          description: p.description,
          images: parsedImages,
          categoryName: p.categories?.name || 'General',
          storeName: p.stores?.brand_name || 'Verified Merchant',
          city: p.stores?.city || 'Pakistan',
          variantsSummary: variantsList.length > 0 ? variantsList.slice(0, 3).join(' • ') : undefined,
        };
      });
    }
  } catch (err) {
    console.warn('Supabase catalog fetch fallback:', err);
  }

  // Fallback to local SEEDED_PRODUCTS
  return SEEDED_PRODUCTS.map((p) => ({
    title: p.title,
    slug: p.slug,
    brand: p.brand,
    basePrice: p.basePrice,
    description: p.description,
    images: p.images,
    categoryName: p.categorySlug.replace(/-/g, ' ').toUpperCase(),
    storeName: p.storeSlug.replace(/-/g, ' ').toUpperCase(),
    city: p.storeSlug.includes('lahore') ? 'Lahore' : p.storeSlug.includes('karachi') ? 'Karachi' : 'Pakistan',
    variantsSummary: p.variants.map((v) => `${v.variantName} (Rs. ${v.price.toLocaleString()})`).join(' • '),
  }));
}

/**
 * Intelligent AI Assistant with comprehensive knowledge base & multi-domain support
 */
export async function processAiAssistantQuery(query: string): Promise<ChatResponse> {
  const catalog = await getFullCatalog();
  const { cleaned, matchedIntents, specificModelTerms } = analyzeUserQuery(query);

  // =========================================================================
  // 1. EXACT SPECIFIC MODEL / PRODUCT MATCH
  // =========================================================================
  if (specificModelTerms.length > 0) {
    const targetModel = specificModelTerms[0];
    const exactMatched = catalog.filter((p) => {
      const t = p.title.toLowerCase();
      const b = (p.brand || '').toLowerCase();
      const s = p.slug.toLowerCase();
      return t.includes(targetModel) || b.includes(targetModel) || s.includes(targetModel.replace(/\s+/g, '-'));
    });

    if (exactMatched.length > 0) {
      const p = exactMatched[0];
      return {
        reply: `### 📌 **${p.title}**\n` +
          `- 💰 **Price:** Rs. ${p.basePrice.toLocaleString()}\n` +
          `- 🎯 **Iska Kaam / Features:** ${p.description}\n` +
          `${p.variantsSummary ? `- 📦 **Available Variants & Options:** ${p.variantsSummary}\n` : ''}` +
          `- 🏢 **Vendor Store:** ${p.storeName} (📍 ${p.city})\n\n` +
          `👉 *Aap neechay diye gaye card par click karke direct yeh product dekh sakte hain.*`,
        products: [p],
        suggestedQuestions: [
          'Same-day delivery schedule',
          `Is ${p.title.slice(0, 18)} in stock?`,
          'Payment methods (COD)',
          'Customer Support (03315242667)',
        ],
      };
    }
  }

  // =========================================================================
  // 2. SEMANTIC CATEGORY MATCH (e.g. "cell phones", "ghari", "dry fruits", "laptop", "desi ghee")
  // =========================================================================
  if (matchedIntents.length > 0) {
    const primaryIntent = matchedIntents[0];

    const matchedCategoryProducts = catalog.filter((p) => {
      const t = p.title.toLowerCase();
      const c = (p.categoryName || '').toLowerCase();
      const d = p.description.toLowerCase();

      if (primaryIntent.mustExcludeAny && primaryIntent.mustExcludeAny.some((ex) => containsWord(t, ex) || containsWord(c, ex))) {
        return false;
      }

      if (primaryIntent.mustIncludeAny && primaryIntent.mustIncludeAny.length > 0) {
        return primaryIntent.mustIncludeAny.some((inc) => containsWord(t, inc) || containsWord(c, inc) || t.includes(inc));
      }

      return primaryIntent.targetCategoryKeywords.some((k) => c.includes(k) || t.includes(k) || d.includes(k));
    });

    if (matchedCategoryProducts.length > 0) {
      const topProducts = matchedCategoryProducts.slice(0, 4);
      const listText = topProducts
        .map(
          (p, idx) =>
            `**${idx + 1}. ${p.title}**\n• 💰 **Price:** Rs. ${p.basePrice.toLocaleString()}\n• 🎯 **Kaam / Detail:** ${p.description}\n• 🏢 **Vendor:** ${p.storeName} (📍 ${p.city})`
        )
        .join('\n\n');

      return {
        reply: `Bazaar.pk par **${primaryIntent.canonicalName}** ke mutabiq yeh authentic products mojood hain:\n\n${listText}\n\n👉 *Neechay diye gaye cards par click karke direct kisi bhi product ko open karein.*`,
        products: topProducts,
        suggestedQuestions: [
          'Same-day delivery schedule',
          'Cash on Delivery available hai?',
          'Customer Support (03315242667)',
          ...topProducts.slice(0, 2).map((p) => `${p.title.slice(0, 20)} details`),
        ],
      };
    }
  }

  // =========================================================================
  // 3. DELIVERY, SHIPPING & TIMING INQUIRIES
  // =========================================================================
  if (
    cleaned.includes('delivery') ||
    cleaned.includes('shipping') ||
    cleaned.includes('schedule') ||
    cleaned.includes('same day') ||
    cleaned.includes('sameday') ||
    cleaned.includes('express') ||
    cleaned.includes('timing') ||
    cleaned.includes('time') ||
    cleaned.includes('kitnay din') ||
    cleaned.includes('kitne din') ||
    cleaned.includes('kab tak') ||
    cleaned.includes('kab pohanch') ||
    cleaned.includes('rider') ||
    cleaned.includes('courier')
  ) {
    return {
      reply: `🚚 **Bazaar.pk Delivery & Shipping Policy:**\n\n` +
        `• ⚡ **Same-Day Express Rider Delivery (Local Cities):**\n` +
        `  - Agar aap **Lahore, Karachi, Islamabad, Rawalpindi, Faisalabad, ya Peshawar** ke local stores se order karte hain, tu **60 se 120 minutes** mein Express Rider aapke ghar parcel deliver karta hai.\n\n` +
        `• 📦 **Standard Nationwide Courier Delivery:**\n` +
        `  - Doosray sheharon ya All Pakistan ke verified sellers se mangwane par **2 se 3 business days** mein TCS, Leopards, aur Trax ke zariye safe doorstep delivery hoti hai.\n\n` +
        `• 💸 **Delivery Charges:**\n` +
        `  - Rs. 2,000 se oopar ke local orders par **Free Delivery**!\n` +
        `  - Nationwide courier shipping ka standard charge sirf **Rs. 150 - Rs. 250** hai.\n\n` +
        `• 💵 **Payment:** Tamam delivery options par **Cash on Delivery (COD)** poore Pakistan mein available hai.`,
      products: [],
      suggestedQuestions: [
        'Cash on Delivery available hai?',
        'How to track my order?',
        'Customer Support (03315242667)',
        'Konsi products mojood hain?',
      ],
    };
  }

  // =========================================================================
  // 4. PAYMENT METHODS & CASH ON DELIVERY (COD)
  // =========================================================================
  if (
    cleaned.includes('payment') ||
    cleaned.includes('cod') ||
    cleaned.includes('cash on delivery') ||
    cleaned.includes('jazzcash') ||
    cleaned.includes('easypaisa') ||
    cleaned.includes('sadapay') ||
    cleaned.includes('nayapay') ||
    cleaned.includes('bank') ||
    cleaned.includes('card') ||
    cleaned.includes('kese pay') ||
    cleaned.includes('kis tarah pay') ||
    cleaned.includes('paise dene') ||
    cleaned.includes('installment') ||
    cleaned.includes('qist')
  ) {
    return {
      reply: `💳 **Bazaar.pk Payment Methods:**\n\n` +
        `Hum Pakistan ke tamam asan aur mehfooz tareeqay support karte hain:\n\n` +
        `1. 💵 **Cash on Delivery (COD):** Poore Pakistan ke tamam shahron aur dehaton mein parcel hath mein anay ke baad cash payment karein.\n` +
        `2. 📱 **Mobile Wallets:** JazzCash, EasyPaisa, SadaPay, aur NayaPay ke zariye instant transfer.\n` +
        `3. 💳 **Debit & Credit Cards:** Visa, MasterCard aur PayPak cards (3D Secure 256-bit encrypted).\n` +
        `4. 🏦 **Online Bank Transfer:** Meezan Bank, HBL, Bank Alfalah, SCB, aur Faysal Bank.\n\n` +
        `👉 *Aap checkout page par apni pasand ka payment method select kar sakte hain.*`,
      products: [],
      suggestedQuestions: [
        'Same-day delivery schedule',
        '7-Day Return & Replacement',
        'Customer Support (03315242667)',
        'All Products List',
      ],
    };
  }

  // =========================================================================
  // 5. RETURNS, REFUNDS, WARRANTY & REPLACEMENT
  // =========================================================================
  if (
    cleaned.includes('return') ||
    cleaned.includes('refund') ||
    cleaned.includes('replacement') ||
    cleaned.includes('exchange') ||
    cleaned.includes('warranty') ||
    cleaned.includes('guarantee') ||
    cleaned.includes('kharab') ||
    cleaned.includes('toot') ||
    cleaned.includes('damage') ||
    cleaned.includes('nakli') ||
    cleaned.includes('asli') ||
    cleaned.includes('wapas')
  ) {
    return {
      reply: `🛡️ **7-Day Return & 100% Refund Policy:**\n\n` +
        `• 🔄 **7 Days Free Replacement:** Agar parcel open karne par product damaged, defective, ya order se mukhtalif nikle tu 7 din ke andar free exchange ya 100% money-back refund milta hai.\n` +
        `• 🔒 **100% Authenticity Guarantee:** Tamam products direct verified dukanon aur farms se aati hain. Koi fake ya counterfeit item allow nahi.\n` +
        `• 📱 **Official PTA Approved Warranty:** Tamam smartphones aur tech items official PTA approved aur brand warranty ke sath hain.\n` +
        `• 📞 **Claim Process:** Helpline **0331-5242667** par WhatsApp karein ya Support Modal open karke message bhejein.`,
      products: [],
      suggestedQuestions: [
        'Customer Support (03315242667)',
        'Same-day delivery schedule',
        'How to track my order?',
        'Cell phones / Mobiles',
      ],
    };
  }

  // =========================================================================
  // 6. ORDER TRACKING & CANCELLATION
  // =========================================================================
  if (
    cleaned.includes('track') ||
    cleaned.includes('tracking') ||
    cleaned.includes('kahan pohancha') ||
    cleaned.includes('mera order') ||
    cleaned.includes('order status') ||
    cleaned.includes('order details') ||
    cleaned.includes('cancel') ||
    cleaned.includes('cancellation')
  ) {
    return {
      reply: `📦 **Order Tracking & Order Management:**\n\n` +
        `• 🔍 **Live Online Tracking:** Top bar mein **"Orders"** par click karein ya direct \`/account/orders\` page par jakar apne order ka real-time status check karein.\n` +
        `• 📲 **SMS & WhatsApp Alerts:** Order dispatch hone ke foran baad aapko courier tracking number aur rider details SMS/WhatsApp par send ho jati hain.\n` +
        `• ❌ **Order Cancel Karna:** Order place hone ke 1 ghantay ke andar aap cancel kar sakte hain, ya hamari support helpline **0331-5242667** par call/WhatsApp karein.`,
      products: [],
      suggestedQuestions: [
        'Customer Support (03315242667)',
        'Same-day delivery schedule',
        'Payment options',
      ],
    };
  }

  // =========================================================================
  // 7. VENDOR & SELLER ONBOARDING / HOW TO SELL
  // =========================================================================
  if (
    cleaned.includes('seller') ||
    cleaned.includes('vendor') ||
    cleaned.includes('bechna') ||
    cleaned.includes('store banana') ||
    cleaned.includes('dukan') ||
    cleaned.includes('onboarding') ||
    cleaned.includes('commission') ||
    cleaned.includes('register vendor') ||
    cleaned.includes('karobar') ||
    cleaned.includes('payout')
  ) {
    return {
      reply: `🏪 **Bazaar.pk Par Apna Seller Store Kholain:**\n\n` +
        `Agar aapki koi dukan, brand ya verified karobar hai, tu aap asani se seller ban sakte hain:\n\n` +
        `1. 📝 **Registration:** \`/register/vendor\` par visit karein aur apna business details enter karein.\n` +
        `2. 📄 **KYC Verification:** Apna CNIC (front/back) aur Bank Account / IBAN upload karein. Hamari team 24 hours mein verify kardegi.\n` +
        `3. 💰 **Low Commission & Fast Payouts:** Sirf 10% platform fee, aur har hafte automatic bank payouts!\n` +
        `4. 🤖 **AI Seller Growth Tools:** AI Analytics suite se apni sales aur customer demand track karein.\n\n` +
        `👉 *Direct Seller Support Helpline: Call/WhatsApp **0331-5242667***`,
      products: [],
      suggestedQuestions: [
        'Vendor registration page',
        'Customer Support (03315242667)',
        'Products catalog',
      ],
    };
  }

  // =========================================================================
  // 8. CUSTOMER SUPPORT & HELPLINE QUERY
  // =========================================================================
  const isExplicitSupport =
    cleaned.includes('support') ||
    cleaned.includes('helpline') ||
    cleaned.includes('complaint') ||
    cleaned.includes('rabta') ||
    cleaned.includes('help desk') ||
    cleaned.includes('admin number') ||
    cleaned.includes('support number') ||
    cleaned.includes('contact number') ||
    cleaned.includes('phone number') ||
    cleaned.includes('call center') ||
    (cleaned.includes('contact') && !cleaned.includes('lens')) ||
    (cleaned.includes('whatsapp') && !cleaned.includes('share'));

  if (isExplicitSupport) {
    return {
      reply: `🎧 **Official 24/7 Customer Support & Help Desk**\n\nBazaar.pk Platform Administration se rabtay ke liye:\n\n• 📱 **Admin Support Number:** \`03315242667\` (+92 331 5242667)\n• 💬 **WhatsApp Chat:** Available 24/7 for instant assistance\n• 📦 **Support Scope:** Order tracking, payment verification, vendor registration & refund support.\n\nAap direct **0331-5242667** par call ya WhatsApp kar saktay hain!`,
      products: [],
      suggestedQuestions: [
        'Same-day delivery schedule',
        'How to track my order?',
        'Vendor Registration Help',
        'Products List',
      ],
    };
  }

  // =========================================================================
  // 9. ABOUT BAZAAR.PK / TRUST & VERIFICATION
  // =========================================================================
  if (
    cleaned.includes('bazaar.pk') ||
    cleaned.includes('about') ||
    cleaned.includes('kya hai') ||
    cleaned.includes('who are you') ||
    cleaned.includes('kya company hai') ||
    cleaned.includes('real hai') ||
    cleaned.includes('trusted')
  ) {
    return {
      reply: `✨ **Bazaar.pk — Pakistan's Trusted Hyper-Local Marketplace:**\n\n` +
        `Bazaar.pk Pakistan ka pehla smart hyper-local e-commerce platform hai jo aapko aapke shehar ke behtareen verified dukanon aur nationwide authentic sellers se jorta hai.\n\n` +
        `• 🏬 **Verified Hub Stores:** Lahore Tech Hub, Karachi Fresh Mart, Islamabad Couture, Khyber Dry Fruits (Peshawar), Faisalabad Textile, Rawalpindi Organics.\n` +
        `• 🛵 **Instant Hyper-Local Delivery:** Shehar ke andar 60-120 minute rider delivery.\n` +
        `• 🇵🇰 **All Pakistan Delivery:** 100+ cities mein doorstep courier shipping.\n` +
        `• 📞 **24/7 Helpline Support:** 0331-5242667.`,
      products: [],
      suggestedQuestions: [
        'Same-day delivery schedule',
        'Payment options',
        'Customer Support (03315242667)',
        'Konsi products mojood hain?',
      ],
    };
  }

  // =========================================================================
  // 10. GREETINGS & CASUAL CONVERSATION
  // =========================================================================
  if (
    ['hi', 'hello', 'salam', 'assalam', 'assalam o alaikum', 'hey', 'start', 'help', 'kya hal hai', 'kaise ho', 'kese ho', 'shukriya', 'thanks', 'thank you', 'bye', 'good morning', 'good evening'].some(
      (g) => cleaned === g || cleaned.startsWith(g + ' ') || cleaned.endsWith(' ' + g)
    )
  ) {
    return {
      reply: `Wa Alaikum Assalam! 🌟 **Bazaar.pk AI Assistant** mein khush-aamdeed!\n\nMain aapki shopping, delivery, orders, payments, aur tamam authentic products ke baray mein rehnumai ke liye hazir hoon.\n\nAap mujh se kuch bhi pooch sakte hain:\n- 🚚 *"Same-day delivery schedule"* ya *"Delivery charges"*?\n- 💳 *"Payment methods aur Cash on Delivery (COD)"*?\n- 📱 *"Cell Phones / Mobiles"* (iPhone 16, Galaxy S24, Pixel 9)?\n- 🍯 *"Pure Desi Ghee aur Sidr Honey ke faiday"*?\n- 🎧 *"Customer Support Helpline (0331-5242667)"*`,
      products: [],
      suggestedQuestions: [
        'Same-day delivery schedule',
        'Customer Support (03315242667)',
        'Cell phone / Mobile phones',
        'Pure Organic Desi Ghee',
      ],
    };
  }

  // =========================================================================
  // 11. BROAD CATALOG OVERVIEW ("Konsi products hain / Products list")
  // =========================================================================
  if (
    cleaned.includes('kon konsi') ||
    cleaned.includes('kon si') ||
    cleaned.includes('kya kya') ||
    cleaned === 'products' ||
    cleaned === 'all products' ||
    cleaned === 'list' ||
    cleaned.includes('categories')
  ) {
    const categoriesMap: Record<string, number> = {};
    catalog.forEach((p) => {
      const cat = p.categoryName || 'General';
      categoriesMap[cat] = (categoriesMap[cat] || 0) + 1;
    });

    const categoryList = Object.entries(categoriesMap)
      .map(([cat, count]) => `• 🏷️ **${cat}** (${count} products)`)
      .join('\n');

    return {
      reply: `Bazaar.pk par kul **${catalog.length} authentic products** mojood hain:\n\n${categoryList}\n\nAap kisi bhi specific product (maslan *Cell Phones, Watches, Desi Ghee, Chilgoza, Laptops*) ke baray mein pooch sakte hain!`,
      products: [],
      suggestedQuestions: [
        'Cell Phones / Mobiles',
        'Watches / Smartwatches',
        'Desi Ghee & Fresh Groceries',
        'Gourmet Dry Fruits',
      ],
    };
  }

  // =========================================================================
  // 12. KEYWORD-BASED FUZZY FALLBACK ACROSS TITLE AND BRAND
  // =========================================================================
  const words = cleaned.split(/\s+/).filter((w) => w.length > 2);
  const keywordMatches = catalog.filter((p) => {
    const t = p.title.toLowerCase();
    const b = (p.brand || '').toLowerCase();
    return words.some((w) => containsWord(t, w) || containsWord(b, w));
  });

  if (keywordMatches.length > 0) {
    const topMatches = keywordMatches.slice(0, 3);
    const listText = topMatches
      .map(
        (p, idx) =>
          `**${idx + 1}. ${p.title}**\n• 💰 **Price:** Rs. ${p.basePrice.toLocaleString()}\n• 🎯 **Kaam:** ${p.description}\n• 🏢 **Store:** ${p.storeName} (📍 ${p.city})`
      )
      .join('\n\n');

    return {
      reply: `Aapke poochay gaye **"${query}"** ke mutabiq yeh matching products mili hain:\n\n${listText}\n\n👉 *Neechay diye gaye card par click karke direct product open karein.*`,
      products: topMatches,
      suggestedQuestions: [
        'Same-day delivery schedule',
        'Payment options (COD)',
        `Check availability of ${topMatches[0].title.slice(0, 15)}`,
        'Customer Support (03315242667)',
      ],
    };
  }

  // =========================================================================
  // 13. INTELLIGENT CONVERSATIONAL ASSISTANT & GUIDANCE (Never rigid dead-end)
  // =========================================================================
  return {
    reply: `Maaf kijiye ga, **"${query}"** filhal hamare verified catalog mein available nahi hai. 🌟\n\n` +
      `Bazaar.pk par hum aapko authentic local products, fast **Same-Day Express Delivery (60-120 mins)**, **Cash on Delivery (COD)**, aur **24/7 Helpline Support (0331-5242667)** provide karte hain.\n\n` +
      `Aap humari top categories aur services mein se kisi bhi cheez ke baray mein pooch sakte hain:\n` +
      `• 🚚 **Delivery & Shipping:** Local sheharon mein 60-120 min express rider, nationwide 2-3 din.\n` +
      `• 💳 **Payment Methods:** Cash on Delivery (COD), JazzCash, EasyPaisa, SadaPay & Cards.\n` +
      `• 📱 **Tech & Gadgets:** PTA Approved iPhone 16, Samsung S24 Ultra, Pixel 9, Laptops & Smartwatches.\n` +
      `• 🍯 **Organics & Groceries:** Pure Bilona Desi Ghee, Sidr Honey, Organic Eggs.\n` +
      `• 🥜 **Dry Fruits & Spices:** Chilgoza, Kashmiri Saffron, Walnuts & Herbs.\n` +
      `• 🎧 **Live Admin Support:** Call ya WhatsApp karein \`03315242667\` par.`,
    products: [],
    suggestedQuestions: [
      'Same-day delivery schedule',
      'Cash on Delivery available hai?',
      'Customer Support (03315242667)',
      'Konsi products mojood hain?',
    ],
  };
}
