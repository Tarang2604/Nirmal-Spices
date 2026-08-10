import { NextResponse } from 'next/server';
import { getBackendApiUrl } from '@/lib/backend';
import { CATEGORIES } from '@/data/catalog';

export async function GET() {
  try {
    const res = await fetch(`${getBackendApiUrl()}/categories`, {
      cache: 'no-store',
    });

    if (res.ok) {
      const json = await res.json();
      if (json.data && Array.isArray(json.data) && json.data.length > 0) {
        return NextResponse.json({
          success: true,
          data: json.data,
        });
      }
    }
  } catch {
    // ignore, use fallback catalog categories below
  }

  const fallback = CATEGORIES.filter((c) => c.slug).map((c) => ({
    _id: c.slug,
    name: c.label,
    slug: c.slug,
    count: c.count,
    image: c.image || '/spices_flatlay.png',
  }));

  return NextResponse.json({
    success: true,
    data: fallback,
  });
}
