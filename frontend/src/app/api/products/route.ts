import { NextRequest, NextResponse } from 'next/server';
import { getBackendApiUrl } from '@/lib/backend';
import { toStorefrontProducts } from '@/lib/productMapper';
import { filterAndSortProducts } from '@/data/catalog';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const category = searchParams.get('category') || searchParams.get('cat') || '';
  const badgeRaw = searchParams.get('badge') || '';
  const badge =
    badgeRaw === 'best-seller' || badgeRaw === 'bestseller'
      ? 'bestseller'
      : badgeRaw;
  const minPrice = searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined;
  const maxPrice = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined;
  const sort = searchParams.get('sort') || '';
  const search = searchParams.get('search') || searchParams.get('q') || '';
  const page = Number(searchParams.get('page')) || 1;
  const limit = Number(searchParams.get('limit')) || 12;

  try {
    const params = new URLSearchParams();
    params.set('page', String(page));
    params.set('limit', String(limit));
    if (category) params.set('category', category);
    if (badge) params.set('badge', badge);
    if (minPrice !== undefined) params.set('minPrice', String(minPrice));
    if (maxPrice !== undefined) params.set('maxPrice', String(maxPrice));
    if (sort) params.set('sort', sort);
    if (search) params.set('search', search);

    const res = await fetch(`${getBackendApiUrl()}/products?${params.toString()}`, {
      cache: 'no-store',
    });

    if (res.ok) {
      const json = await res.json();
      const products = toStorefrontProducts(json.data || []);
      return NextResponse.json({
        success: true,
        data: products,
        meta: json.meta || { page, limit, total: products.length, totalPages: 1 },
      });
    }
  } catch {
    // ignore, fall back to local catalog
  }

  // Fallback to local catalog
  const { products, total, totalPages } = filterAndSortProducts({
    category,
    badge: badgeRaw,
    minPrice,
    maxPrice,
    sort,
    search,
    page,
    limit,
  });

  return NextResponse.json({
    success: true,
    data: products,
    meta: { page, limit, total, totalPages },
  });
}
