import { NextResponse } from 'next/server';
import { getBackendApiUrl } from '@/lib/backend';

export async function GET() {
  try {
    const res = await fetch(`${getBackendApiUrl()}/categories`, {
      cache: 'no-store',
    });

    if (!res.ok) {
      return NextResponse.json(
        { success: false, message: 'Failed to load categories from API' },
        { status: 502 },
      );
    }

    const json = await res.json();
    return NextResponse.json({
      success: true,
      data: json.data || [],
    });
  } catch {
    return NextResponse.json(
      { success: false, message: 'Category API unavailable' },
      { status: 503 },
    );
  }
}
