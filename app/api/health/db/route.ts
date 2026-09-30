

import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  const start = Date.now();
  try {
    const [
      { count: productsCount, error: prodErr },
      { count: categoriesCount },
      { count: storesCount },
      { count: usersCount },
    ] = await Promise.all([
      supabaseAdmin.from('products').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('categories').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('stores').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('users').select('*', { count: 'exact', head: true }),
    ]);

    if (prodErr) throw prodErr;

    const latencyMs = Date.now() - start;

    return NextResponse.json({
      status: 'healthy',
      database: 'Supabase Cloud (PostgreSQL)',
      latencyMs,
      metrics: {
        products: productsCount || 0,
        categories: categoriesCount || 0,
        stores: storesCount || 0,
        users: usersCount || 0,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: 'unreachable',
        database: 'Supabase Cloud',
        error: error.message || 'Could not connect to Supabase Cloud',
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}
