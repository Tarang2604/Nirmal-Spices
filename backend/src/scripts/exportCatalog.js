/**
 * Extracts RAW_PRODUCTS from frontend catalog.ts into catalog.seed.json
 */
const fs = require('fs');
const path = require('path');

const catalogPath = path.resolve(__dirname, '../../../frontend/src/data/catalog.ts');
const outPath = path.resolve(__dirname, 'catalog.seed.json');
const CDN = 'https://nirmalspices.in/admin/images/media_gallery/thumb';

const src = fs.readFileSync(catalogPath, 'utf8');
const start = src.indexOf('const RAW_PRODUCTS = [');
const exportIdx = src.indexOf('export const PRODUCTS', start);
if (start < 0 || exportIdx < 0) {
  console.error('Could not locate RAW_PRODUCTS in catalog.ts');
  process.exit(1);
}

// Walk backwards from export to find the closing ]; of RAW_PRODUCTS
const beforeExport = src.slice(start, exportIdx);
const arrayClose = beforeExport.lastIndexOf('];');
if (arrayClose < 0) {
  console.error('Could not find end of RAW_PRODUCTS array');
  process.exit(1);
}

let expr = beforeExport.slice('const RAW_PRODUCTS = '.length, arrayClose + 1);
expr = expr.replace(/`\$\{CDN\}([^`]+)`/g, (_, p) => JSON.stringify(CDN + p));

// Evaluate as JS array literal (single quotes, unquoted keys OK in Function)
const products = Function(`"use strict"; return (${expr});`)();

const slim = products.map((p) => ({
  name: p.name,
  slug: p.slug,
  categorySlug: p.categorySlug,
  description: p.description,
  shortDescription: p.shortDescription,
  ingredients: p.ingredients,
  usageSuggestions: p.usageSuggestions,
  images: p.images,
  tags: p.tags,
  badge: p.badge,
  rating: p.rating,
  reviewCount: p.reviewCount,
  packSize: p.packSize,
  price: p.price,
  salePrice: p.salePrice,
  inStock: p.inStock,
  seo: p.seo,
}));

fs.writeFileSync(outPath, JSON.stringify(slim, null, 2));
console.log(`Wrote ${slim.length} products to ${outPath}`);
