import { NextRequest, NextResponse } from 'next/server';
import { filterAndSortProducts } from '@/data/catalog';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const category = searchParams.get('category') || searchParams.get('cat') || '';
  const badge = searchParams.get('badge') || '';
  const minPrice = searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined;
  const maxPrice = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined;
  const sort = searchParams.get('sort') || '';
  const search = searchParams.get('search') || searchParams.get('q') || '';
  const page = Number(searchParams.get('page')) || 1;
  const limit = Number(searchParams.get('limit')) || 12;

  const { products, total, totalPages } = filterAndSortProducts({
    category,
    badge,
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
