import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { CATEGORIES, STORES } from '../lib/seed-data';
import { SEEDED_PRODUCTS } from '../lib/seed-products';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting comprehensive multi-vendor platform database seed...');

  // Clean existing tables in reverse dependency order
  await prisma.review.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.subOrder.deleteMany();
  await prisma.order.deleteMany();
  await prisma.address.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.vendorKYC.deleteMany();
  await prisma.store.deleteMany();
  await prisma.user.deleteMany();

  const defaultPasswordHash = await bcrypt.hash('admin123', 10);
  const customerPasswordHash = await bcrypt.hash('customer123', 10);
  const vendorPasswordHash = await bcrypt.hash('vendor123', 10);

  // 1. Create Super Admin
  const admin = await prisma.user.create({
    data: {
      name: 'Super Admin',
      email: 'admin@marketplace.pk',
      whatsapp: '+923000000001',
      passwordHash: defaultPasswordHash,
      role: 'ADMIN',
    },
  });
  console.log('✅ Created Super Admin:', admin.email);

  // 2. Create Default Customer & Additional Reviewers
  const customer1 = await prisma.user.create({
    data: {
      name: 'Zainab Fatima',
      email: 'customer@marketplace.pk',
      whatsapp: '+923007654321',
      passwordHash: customerPasswordHash,
      role: 'CUSTOMER',
    },
  });

  const customer2 = await prisma.user.create({
    data: {
      name: 'Hamza Tariq',
      email: 'hamza@marketplace.pk',
      whatsapp: '+923009876543',
      passwordHash: customerPasswordHash,
      role: 'CUSTOMER',
    },
  });

  const customer3 = await prisma.user.create({
    data: {
      name: 'Ayesha Malik',
      email: 'ayesha@marketplace.pk',
      whatsapp: '+923001122334',
      passwordHash: customerPasswordHash,
      role: 'CUSTOMER',
    },
  });

  const customer4 = await prisma.user.create({
    data: {
      name: 'Bilal Ahmed',
      email: 'bilal@marketplace.pk',
      whatsapp: '+923005544332',
      passwordHash: customerPasswordHash,
      role: 'CUSTOMER',
    },
  });
  console.log('✅ Created Seed Customers:', customer1.email, customer2.email, customer3.email, customer4.email);

  // Create Customer Addresses
  const addressLahore = await prisma.address.create({
    data: {
      userId: customer1.id,
      fullName: 'Zainab Fatima',
      whatsapp: '+923007654321',
      street: 'House 45, Street 12, Block C, Phase 5 DHA',
      area: 'DHA Phase 5',
      city: 'Lahore',
      latitude: 31.4700,
      longitude: 74.3900,
      isDefault: true,
    },
  });

  const addressKarachi = await prisma.address.create({
    data: {
      userId: customer1.id,
      fullName: 'Zainab Fatima (Karachi Office)',
      whatsapp: '+923007654321',
      street: 'Office 702, Emerald Tower, Clifton Block 5',
      area: 'Clifton Block 5',
      city: 'Karachi',
      latitude: 24.8140,
      longitude: 67.0330,
      isDefault: false,
    },
  });

  // 3. Create Categories
  const categoryMap = new Map<string, string>();
  for (const cat of CATEGORIES) {
    const created = await prisma.category.create({
      data: {
        name: cat.name,
        slug: cat.slug,
      },
    });
    categoryMap.set(cat.slug, created.id);
  }
  console.log(`✅ Seeded ${CATEGORIES.length} Categories.`);

  // 4. Create Stores & Vendors & KYC records
  const storeMap = new Map<string, string>();
  for (const storeData of STORES) {
    const vendorUser = await prisma.user.create({
      data: {
        name: storeData.userName,
        email: storeData.userEmail,
        whatsapp: storeData.userWhatsapp,
        passwordHash: vendorPasswordHash,
        role: 'VENDOR',
      },
    });

    const store = await prisma.store.create({
      data: {
        userId: vendorUser.id,
        brandName: storeData.brandName,
        slug: storeData.slug,
        brandAddress: storeData.brandAddress,
        city: storeData.city,
        area: storeData.area,
        latitude: storeData.latitude,
        longitude: storeData.longitude,
        commissionRate: storeData.commissionRate,
        status: storeData.status,
      },
    });
    storeMap.set(storeData.slug, store.id);

    await prisma.vendorKYC.create({
      data: {
        storeId: store.id,
        cnicNumber: storeData.kyc.cnicNumber,
        cnicFrontUrl: storeData.kyc.cnicFrontUrl,
        cnicBackUrl: storeData.kyc.cnicBackUrl,
        bankName: storeData.kyc.bankName,
        ibanNumber: storeData.kyc.ibanNumber,
        accountTitle: storeData.kyc.accountTitle,
        status: storeData.kyc.status,
        rejectionReason: storeData.kyc.rejectionReason,
        reviewedAt: storeData.kyc.status === 'APPROVED' ? new Date() : null,
      },
    });
  }
  console.log(`✅ Seeded ${STORES.length} Stores with KYC and Vendor accounts.`);

  // 5. Create Products & Variants
  const createdVariantIds: string[] = [];
  const createdProducts: any[] = [];
  const productBySlug = new Map<string, any>();

  for (const p of SEEDED_PRODUCTS) {
    const categoryId = categoryMap.get(p.categorySlug);
    const storeId = storeMap.get(p.storeSlug);

    if (!categoryId || !storeId) {
      console.warn(`Skipping product ${p.title}: Category or Store missing`);
      continue;
    }

    const product = await prisma.product.create({
      data: {
        title: p.title,
        brand: p.brand,
        slug: p.slug,
        description: p.description,
        basePrice: p.basePrice,
        images: JSON.stringify(p.images),
        isActive: true,
        isApproved: true,
        categoryId: categoryId,
        storeId: storeId,
      },
    });
    createdProducts.push(product);
    productBySlug.set(p.slug, product);

    for (const v of p.variants) {
      const variant = await prisma.productVariant.create({
        data: {
          productId: product.id,
          sku: v.sku,
          variantName: v.variantName,
          price: v.price,
          stock: v.stock,
          attributes: JSON.stringify(v.attributes),
        },
      });
      createdVariantIds.push(variant.id);
    }
  }
  console.log(`✅ Seeded ${createdProducts.length} Products with ${createdVariantIds.length} category-specific variants.`);

  // 6. Seed Realistic Customer Reviews Across Products
  const seedReviews = [
    // iPhone 16 Pro Max
    {
      slug: 'apple-iphone-16-pro-max',
      user: customer1,
      rating: 5,
      comment: 'Absolutely authentic! PTA status was verified instantly via DIRBS. Received factory sealed packaging within 90 minutes in DHA Lahore!',
      daysAgo: 3,
    },
    {
      slug: 'apple-iphone-16-pro-max',
      user: customer2,
      rating: 5,
      comment: 'Top notch merchant. Battery health 100%, 1-year official warranty card stamped. Very smooth purchase experience.',
      daysAgo: 5,
    },
    // Samsung Galaxy S24 Ultra
    {
      slug: 'samsung-galaxy-s24-ultra-5g',
      user: customer3,
      rating: 5,
      comment: 'Galaxy AI is incredible and camera zoom is unbeatable. Direct delivery in Karachi with original seal.',
      daysAgo: 2,
    },
    {
      slug: 'samsung-galaxy-s24-ultra-5g',
      user: customer4,
      rating: 4,
      comment: 'Great phone, 100% genuine Samsung Pakistan stock. Fast delivery.',
      daysAgo: 7,
    },
    // Sony WH-1000XM5
    {
      slug: 'sony-wh-1000xm5-headphones',
      user: customer1,
      rating: 5,
      comment: 'The noise cancellation is phenomenal for office work and flights. Original Sony warranty registered online without issues.',
      daysAgo: 4,
    },
    // Sindhri Mangoes
    {
      slug: 'sindhri-mangoes-5kg-crate',
      user: customer2,
      rating: 5,
      comment: 'Extremely sweet, aromatic, and fiberless! Farm-fresh quality delivered directly in ventilated export box.',
      daysAgo: 1,
    },
    {
      slug: 'sindhri-mangoes-5kg-crate',
      user: customer3,
      rating: 5,
      comment: 'Best mangoes of the season! Delivered fresh without any damage.',
      daysAgo: 4,
    },
    // Pure Organic Desi Ghee
    {
      slug: 'pure-organic-desi-ghee-1kg',
      user: customer1,
      rating: 5,
      comment: 'Pure traditional bilona aroma and granular golden texture. Reminds me of pure village ghee in Punjab.',
      daysAgo: 6,
    },
    {
      slug: 'pure-organic-desi-ghee-1kg',
      user: customer4,
      rating: 5,
      comment: '100% genuine buffalo desi ghee. Tastes divine on parathas and sweets!',
      daysAgo: 8,
    },
    // Pure Wild Sidr Honey
    {
      slug: 'pure-wild-sidr-beri-honey-1kg',
      user: customer2,
      rating: 5,
      comment: 'Thick, unadulterated Sidr honey with rich caramel undertones. Excellent medicinal quality.',
      daysAgo: 3,
    },
    // Chilgoza Pine Nuts
    {
      slug: 'premium-roasted-chilgoza-500g',
      user: customer3,
      rating: 5,
      comment: 'Huge giant size pine nuts from Waziristan! Super fresh, crisp, and perfectly roasted.',
      daysAgo: 2,
    },
    {
      slug: 'premium-roasted-chilgoza-500g',
      user: customer1,
      rating: 5,
      comment: 'Clean vacuum packaging and full kernels. Highly recommended dry fruit seller.',
      daysAgo: 9,
    },
    // Afghani Jumbo Pistachios
    {
      slug: 'afghani-jumbo-salted-pistachios-500g',
      user: customer4,
      rating: 4,
      comment: 'Very tasty, light sea salt coating and all shells opened. Good value for money.',
      daysAgo: 5,
    },
    // Peshawari Chappal
    {
      slug: 'handcrafted-peshawari-chappal-kaptaan',
      user: customer2,
      rating: 5,
      comment: 'Authentic pure calfskin leather! Stitched to perfection with memory foam sole. Extremely comfortable fit.',
      daysAgo: 4,
    },
    {
      slug: 'handcrafted-peshawari-chappal-kaptaan',
      user: customer4,
      rating: 5,
      comment: 'True master craftsmanship from Charsadda. Fits true to size and looks royal.',
      daysAgo: 6,
    },
    // Egyptian Cotton Shalwar Kameez
    {
      slug: 'egyptian-cotton-mens-shalwar-kameez',
      user: customer3,
      rating: 5,
      comment: 'Luxurious fall and crisp drape. Breathable Egyptian cotton fabric with elegant stitching.',
      daysAgo: 2,
    },
    // Luxury 3pc Chiffon Formal Suit
    {
      slug: 'luxury-3pc-embroidered-chiffon-suit',
      user: customer1,
      rating: 5,
      comment: 'Exquisite hand embroidery and fine zari detail. Looked stunning at a wedding event!',
      daysAgo: 5,
    },
    // Pure Velvet Embroidered Shawl
    {
      slug: 'pure-velvet-embroidered-shawl-kashmiri',
      user: customer3,
      rating: 5,
      comment: 'Heavy pure 9000 micro velvet with intricate gold tilla borders. Truly royal festive piece.',
      daysAgo: 3,
    },
    // Multani Blue Pottery Vase
    {
      slug: 'multani-blue-pottery-ceramic-vase-14in',
      user: customer2,
      rating: 5,
      comment: 'Masterpiece ceramic craft! Arrived safely double-boxed with heavy bubble wrap.',
      daysAgo: 4,
    },
    // Organic Rose Water Facial Mist
    {
      slug: 'organic-rose-water-facial-mist-200ml',
      user: customer1,
      rating: 5,
      comment: '100% steam distilled damask rose aroma. Extremely soothing and hydrating spray!',
      daysAgo: 2,
    },
    // Pure Cold-Pressed Moroccan Argan Oil
    {
      slug: 'cold-pressed-moroccan-argan-oil-100ml',
      user: customer3,
      rating: 5,
      comment: 'Lightweight, absorbs quickly without grease. Tamed my hair frizz instantly!',
      daysAgo: 3,
    },
    // Oud Al-Layl Luxury Concentrated Arabian Attar
    {
      slug: 'oud-al-layl-concentrated-attar-12ml',
      user: customer4,
      rating: 5,
      comment: 'Enchanting woody oriental fragrance. Lasts easily over 24 hours on clothes.',
      daysAgo: 1,
    },
  ];

  for (const sr of seedReviews) {
    const prod = productBySlug.get(sr.slug);
    if (prod) {
      await prisma.review.create({
        data: {
          productId: prod.id,
          userId: sr.user.id,
          ratingStars: sr.rating,
          comment: sr.comment,
          createdAt: new Date(Date.now() - sr.daysAgo * 24 * 60 * 60 * 1000),
        },
      });
    }
  }
  console.log(`✅ Seeded ${seedReviews.length} authentic multi-star customer reviews across product catalog.`);

  // 7. Create Seed Multi-Vendor Orders
  const variants = await prisma.productVariant.findMany({
    include: { product: true },
  });

  if (variants.length >= 4) {
    const v1 = variants[0];
    const v2 = variants[1];

    const subtotal1 = v1.price * 1;
    const fee1 = subtotal1 * 0.10;
    const subtotal2 = v2.price * 1;
    const fee2 = subtotal2 * 0.10;
    const totalOrder1 = subtotal1 + subtotal2;

    const order1 = await prisma.order.create({
      data: {
        customerId: customer1.id,
        shippingAddressId: addressLahore.id,
        totalAmount: totalOrder1,
        paymentMethod: 'JAZZCASH',
        paymentStatus: 'PAID',
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      },
    });

    const subOrder1 = await prisma.subOrder.create({
      data: {
        orderId: order1.id,
        storeId: v1.product.storeId,
        status: 'DELIVERED',
        subtotal: subtotal1,
        platformFee: fee1,
        vendorEarnings: subtotal1 - fee1,
        riderName: 'Muhammad Rizwan (Speedy Express)',
        riderPhone: '+923015556677',
        trackingNumber: 'TRK-PK-981245',
      },
    });

    await prisma.orderItem.create({
      data: {
        subOrderId: subOrder1.id,
        variantId: v1.id,
        quantity: 1,
        unitPrice: v1.price,
        totalPrice: subtotal1,
      },
    });

    console.log('✅ Created Seed Multi-Vendor Orders with Sub-Orders and Assigned Riders.');
  }

  console.log('🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
