import { NextRequest, NextResponse } from 'next/server';
import { getBackendApiUrl } from '@/lib/backend';
import { toStorefrontProduct } from '@/lib/productMapper';

// Public product detail data — safe to cache server-side.
// Revalidate once per hour; full ISR in production.
export const revalidate = 3600;

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  try {
    const res = await fetch(`${getBackendApiUrl()}/products/${slug}`, {
      next: { revalidate: 3600 },
    });

    if (res.status === 404) {
      return NextResponse.json(
        { success: false, message: 'Product not found' },
        { status: 404 },
      );
    }

    if (!res.ok) {
      return NextResponse.json(
        { success: false, message: 'Failed to load product from API' },
        { status: 502 },
      );
    }

    const json = await res.json();
    if (!json.data) {
      return NextResponse.json(
        { success: false, message: 'Product not found' },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: toStorefrontProduct(json.data),
    });
  } catch {
    return NextResponse.json(
      { success: false, message: 'Product API unavailable' },
      { status: 503 },
    );
  }
}
