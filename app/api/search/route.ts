import { NextResponse } from 'next/server';
import { getSupabaseProducts, getSupabaseCategories } from '@/lib/supabase-service';
import { isStrictMatch, calculateRelevanceScore, normalizeSearchString } from '@/lib/search';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = (searchParams.get('q') || searchParams.get('search') || '').trim();

    if (!q || q.length < 1) {
      return NextResponse.json({ products: [], categories: [] });
    }

    const [allProducts, allCategories] = await Promise.all([
      getSupabaseProducts(),
      getSupabaseCategories(),
    ]);

    const normQ = normalizeSearchString(q);

    // 1. Matched Categories
    const matchedCategories = allCategories
      .filter((c) => {
        const catNorm = normalizeSearchString(c.name);
        return catNorm.includes(normQ) || normQ.includes(catNorm);
      })
      .slice(0, 3);

    // 2. Matched Products
    const matchedProducts = allProducts
      .filter((p) => isStrictMatch(p, q))
      .sort((a, b) => calculateRelevanceScore(b, q) - calculateRelevanceScore(a, q))
      .slice(0, 6)
      .map((p) => {
        let parsedImages: string[] = [];
        try {
          parsedImages = JSON.parse(p.images);
        } catch {
          parsedImages = [p.images];
        }

        return {
          id: p.id,
          title: p.title,
          slug: p.slug,
          brand: p.brand,
          basePrice: p.basePrice,
          image: parsedImages[0] || '',
          categoryName: p.category?.name || '',
          categorySlug: p.category?.slug || '',
          storeName: p.store?.brandName || '',
          city: p.store?.city || '',
        };
      });

    return NextResponse.json(
      {
        products: matchedProducts,
        categories: matchedCategories,
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=600',
        },
      }
    );
  } catch (error: any) {
    console.error('Error in live search API:', error);
    return NextResponse.json({ products: [], categories: [] }, { status: 500 });
  }
}
