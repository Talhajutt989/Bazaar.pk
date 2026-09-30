export interface SeedCategory {
  name: string;
  slug: string;
}

export interface SeedStore {
  brandName: string;
  slug: string;
  brandAddress: string;
  city: string;
  area: string;
  latitude: number;
  longitude: number;
  commissionRate: number;
  status: 'ACTIVE' | 'PENDING_KYC' | 'UNDER_REVIEW' | 'SUSPENDED';
  userEmail: string;
  userName: string;
  userWhatsapp: string;
  kyc: {
    cnicNumber: string;
    cnicFrontUrl: string;
    cnicBackUrl: string;
    bankName: string;
    ibanNumber: string;
    accountTitle: string;
    status: 'APPROVED' | 'PENDING' | 'REJECTED';
    rejectionReason?: string;
  };
}

export interface SeedVariant {
  sku: string;
  variantName: string;
  price: number;
  stock: number;
  attributes: Record<string, string>;
}

export interface SeedProduct {
  title: string;
  brand: string;
  slug: string;
  description: string;
  basePrice: number;
  images: string[];
  categorySlug: string;
  storeSlug: string;
  variants: SeedVariant[];
}

export const CATEGORIES: SeedCategory[] = [
  { name: 'Smartphones & Gadgets', slug: 'smartphones-gadgets' },
  { name: 'Laptops & Computing', slug: 'laptops-computers' },
  { name: 'Fresh Grocery & Organics', slug: 'fresh-grocery' },
  { name: 'Gourmet Dry Fruits & Spices', slug: 'gourmet-dry-fruits' },
  { name: 'Men\'s Fashion & Apparel', slug: 'mens-fashion' },
  { name: 'Women\'s Ethnic & Western', slug: 'womens-fashion' },
  { name: 'Home Decor & Furnishing', slug: 'home-living' },
  { name: 'Beauty & Personal Care', slug: 'beauty-care' },
];

export const STORES: SeedStore[] = [
  {
    brandName: 'Lahore Tech Hub',
    slug: 'lahore-tech-hub',
    brandAddress: 'Shop 42, Level 2, Hafeez Centre, Main Boulevard Gulberg',
    city: 'Lahore',
    area: 'Gulberg III',
    latitude: 31.5204,
    longitude: 74.3587,
    commissionRate: 0.10,
    status: 'ACTIVE',
    userEmail: 'vendor.tech@marketplace.pk',
    userName: 'Hamza Malik (Tech Hub)',
    userWhatsapp: '+923001234567',
    kyc: {
      cnicNumber: '35202-1234567-1',
      cnicFrontUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&q=80',
      cnicBackUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&q=80',
      bankName: 'Meezan Bank Limited',
      ibanNumber: 'PK42MEZN0001234567890101',
      accountTitle: 'Lahore Tech Hub Traders',
      status: 'APPROVED',
    },
  },
  {
    brandName: 'Karachi Fresh Mart',
    slug: 'karachi-fresh-mart',
    brandAddress: 'Plot 14-C, Lane 5, Khayaban-e-Shahbaz, Phase 6 DHA',
    city: 'Karachi',
    area: 'DHA Phase 6',
    latitude: 24.8607,
    longitude: 67.0011,
    commissionRate: 0.10,
    status: 'ACTIVE',
    userEmail: 'vendor.fresh@marketplace.pk',
    userName: 'Bilal Farooq (Fresh Mart)',
    userWhatsapp: '+923219876543',
    kyc: {
      cnicNumber: '42101-7654321-3',
      cnicFrontUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&q=80',
      cnicBackUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&q=80',
      bankName: 'Habib Bank Limited (HBL)',
      ibanNumber: 'PK12HABB0098765432101234',
      accountTitle: 'Karachi Fresh Organics LLC',
      status: 'APPROVED',
    },
  },
  {
    brandName: 'Islamabad Apparel & Couture',
    slug: 'islamabad-apparel',
    brandAddress: 'Shop 18, Ground Floor, Beverly Centre, Blue Area',
    city: 'Islamabad',
    area: 'F-7 / Blue Area',
    latitude: 33.7182,
    longitude: 73.0605,
    commissionRate: 0.10,
    status: 'ACTIVE',
    userEmail: 'vendor.apparel@marketplace.pk',
    userName: 'Ayesha Siddiqui (Couture)',
    userWhatsapp: '+923335554433',
    kyc: {
      cnicNumber: '61101-4455667-2',
      cnicFrontUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&q=80',
      cnicBackUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&q=80',
      bankName: 'Bank Alfalah Islamic',
      ibanNumber: 'PK88ALFH0033221100998877',
      accountTitle: 'Islamabad Couture House',
      status: 'APPROVED',
    },
  },
  {
    brandName: 'Khyber Dry Fruits & Spices',
    slug: 'khyber-dry-fruits',
    brandAddress: 'Shop 8, Namak Mandi, Heritage Bazaar',
    city: 'Peshawar',
    area: 'Namak Mandi',
    latitude: 34.0151,
    longitude: 71.5249,
    commissionRate: 0.10,
    status: 'ACTIVE',
    userEmail: 'vendor.dryfruits@marketplace.pk',
    userName: 'Khan Zaman (Khyber Goods)',
    userWhatsapp: '+923451122334',
    kyc: {
      cnicNumber: '17301-8899001-5',
      cnicFrontUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&q=80',
      cnicBackUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&q=80',
      bankName: 'Faysal Bank Limited',
      ibanNumber: 'PK55FAYS0077665544332211',
      accountTitle: 'Khyber Trading Co.',
      status: 'APPROVED',
    },
  },
  {
    brandName: 'Faisalabad Loom & Decor',
    slug: 'faisalabad-decor',
    brandAddress: 'Plaza 7, D-Ground Commercial Area, Peoples Colony No. 1',
    city: 'Faisalabad',
    area: 'D-Ground',
    latitude: 31.4187,
    longitude: 73.0791,
    commissionRate: 0.10,
    status: 'ACTIVE',
    userEmail: 'vendor.decor@marketplace.pk',
    userName: 'Usman Tariq (Loom Craft)',
    userWhatsapp: '+923126677889',
    kyc: {
      cnicNumber: '33100-3344556-9',
      cnicFrontUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&q=80',
      cnicBackUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&q=80',
      bankName: 'MCB Bank Limited',
      ibanNumber: 'PK90MUCB0011223344556677',
      accountTitle: 'Faisalabad Loom Mills',
      status: 'APPROVED',
    },
  },
  {
    brandName: 'Rawalpindi Organic & Botanicals',
    slug: 'rawalpindi-organic',
    brandAddress: 'Shop 12, Saddar Bazaar, Bank Road',
    city: 'Rawalpindi',
    area: 'Saddar',
    latitude: 33.5973,
    longitude: 73.0479,
    commissionRate: 0.10,
    status: 'ACTIVE',
    userEmail: 'vendor.organic@marketplace.pk',
    userName: 'Zubair Qureshi (Botanicals)',
    userWhatsapp: '+923314455667',
    kyc: {
      cnicNumber: '37405-9988776-7',
      cnicFrontUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&q=80',
      cnicBackUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&q=80',
      bankName: 'Standard Chartered Pakistan',
      ibanNumber: 'PK19SCBL0000123456789012',
      accountTitle: 'Rawalpindi Botanicals Care',
      status: 'APPROVED',
    },
  },
];

