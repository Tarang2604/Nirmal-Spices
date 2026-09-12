import { NextResponse } from 'next/server';
import { getBackendApiUrl } from '@/lib/backend';
import { CATEGORIES } from '@/data/catalog';

// Categories are public, non-user-specific data.
// Revalidate once per hour on the server — safe for all visitors.
export const revalidate = 3600;

export async function GET() {
  try {
    const res = await fetch(`${getBackendApiUrl()}/categories`, {
      next: { revalidate: 3600 },
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
    image: c.image || 'https://res.cloudinary.com/dzymvhmu/image/upload/v1789151413/nirmal-spices/marketing/spices_flatlay.jpg',
  }));

  return NextResponse.json({
    success: true,
    data: fallback,
  });
}
