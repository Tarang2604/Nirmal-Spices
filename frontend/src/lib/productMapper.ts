import type { Product } from '@/data/catalog';

const BADGE_TO_STOREFRONT: Record<string, Product['badge']> = {
  bestseller: 'best-seller',
  'best-seller': 'best-seller',
  new: 'new',
  sale: 'sale',
};

function categoryLabel(slug: string): string {
  return String(slug || 'Spices')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c: string) => c.toUpperCase());
}

/** Normalize a backend (or already-storefront) product into the UI Product shape — no static filler text */
export function toStorefrontProduct(raw: any): Product {
  if (raw?.categorySlug && raw?.packSize !== undefined && raw?.weights) {
    return raw as Product;
  }

  const weights = Array.isArray(raw.weights) ? raw.weights : [];
  const primary = weights[0] || { weight: '', price: 0, mrp: 0, stock: 0 };
  const slug = String(raw.category || '');
  const mrp = primary.mrp ?? primary.price ?? 0;
  const price = primary.price ?? mrp;
  const salePrice = price < mrp ? price : null;

  const ingredients = Array.isArray(raw.ingredients)
    ? raw.ingredients.join(', ')
    : typeof raw.ingredients === 'string'
      ? raw.ingredients
      : '';

  const usageSuggestions = Array.isArray(raw.usageTips)
    ? raw.usageTips.join('\n\n')
    : typeof raw.usageTips === 'string'
      ? raw.usageTips
      : raw.usageSuggestions || '';

  const nutritionalNotes = Array.isArray(raw.benefits)
    ? raw.benefits.join('\n\n')
    : typeof raw.benefits === 'string'
      ? raw.benefits
      : raw.nutritionalNotes || '';

  const shortDescription = typeof raw.shortDescription === 'string' ? raw.shortDescription : '';

  return {
    _id: String(raw._id),
    name: raw.name || '',
    slug: raw.slug || '',
    category: categoryLabel(slug),
    categorySlug: slug,
    brand: raw.brand || '',
    price: mrp,
    salePrice,
    packSize: primary.weight || '',
    images: Array.isArray(raw.images) ? raw.images : [],
    shortDescription,
    description: raw.description || '',
    ingredients,
    usageSuggestions,
    shelfLife: raw.shelfLife || '',
    storageInstructions: raw.storageInstructions || '',
    nutritionalNotes,
    inStock: weights.some((w: any) => (w.stock ?? 0) > 0),
    rating: raw.rating ?? 0,
    reviewCount: raw.reviewCount ?? 0,
    badge: raw.badge ? BADGE_TO_STOREFRONT[raw.badge] ?? null : null,
    tags: raw.tags || [],
    seo: {
      title: raw.seo?.title || raw.name || '',
      description: raw.seo?.description || shortDescription || raw.description || '',
      keywords: raw.seo?.keywords || raw.tags || [],
    },
    weights: weights.map((w: any) => ({
      weight: w.weight,
      price: w.price,
      mrp: w.mrp ?? w.price,
      stock: w.stock ?? 0,
    })),
  };
}

export function toStorefrontProducts(list: any[]): Product[] {
  return (list || []).map(toStorefrontProduct);
}
