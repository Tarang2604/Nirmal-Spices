import React from 'react';
import type { Metadata } from 'next';
import type { Product } from '@/data/catalog';
import ProductGallery from '@/components/products/ProductGallery';
import ProductInfo from '@/components/products/ProductInfo';
import ProductTabs from '@/components/products/ProductTabs';
import RelatedProducts from '@/components/products/RelatedProducts';
import { notFound } from 'next/navigation';
import { getBackendApiUrl } from '@/lib/backend';
import { toStorefrontProduct } from '@/lib/productMapper';

export const dynamic = 'force-dynamic';

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

async function getProduct(slug: string): Promise<Product | null> {
  try {
    const res = await fetch(`${getBackendApiUrl()}/products/${slug}`, {
      cache: 'no-store',
    });
    if (res.ok) {
      const json = await res.json();
      if (json.data) return toStorefrontProduct(json.data);
    }
  } catch {
    // Fall through
  }
  return null;
}

// Dynamic SEO metadata
export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) return { title: 'Product Not Found' };

  const imageUrl = product.images[0] ?? '';

  return {
    title: product.seo?.title || `${product.name} | Nirmal's Spices`,
    description: product.seo?.description || product.shortDescription,
    keywords: product.seo?.keywords ?? [],
    openGraph: {
      title: product.name,
      description: product.shortDescription,
      images: imageUrl ? [{ url: imageUrl }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: product.name,
      images: imageUrl ? [imageUrl] : [],
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) notFound();

  const displayPrice = product.salePrice ?? product.price;

  // JSON-LD structured data
  const schemaJson = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: product.images,
    description: product.description,
    brand: { '@type': 'Brand', name: product.brand },
    category: product.category,
    offers: {
      '@type': 'Offer',
      priceCurrency: 'INR',
      price: displayPrice,
      availability: product.inStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      seller: { '@type': 'Organization', name: "Nirmal's Spices" },
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: product.rating,
      reviewCount: product.reviewCount,
    },
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16 font-sans">

      {/* JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaJson) }}
      />

      {/* Main product columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 mb-16 items-start">
        <div className="lg:col-span-6 w-full">
          <ProductGallery images={product.images} />
        </div>
        <div className="lg:col-span-6 w-full">
          <ProductInfo product={product} />
        </div>
      </div>

      {/* Product detail tabs */}
      <div className="mb-20 w-full">
        <ProductTabs
          productId={product._id}
          description={product.description}
          ingredients={product.ingredients}
          usageTips={product.usageSuggestions}
          shelfLife={product.shelfLife}
          storageInstructions={product.storageInstructions}
          nutritionalNotes={product.nutritionalNotes}
        />
      </div>

      {/* Same-category products — client fetch for instant updates on navigation */}
      <RelatedProducts
        categorySlug={product.categorySlug}
        categoryName={product.category}
        currentProductId={product._id}
      />

    </div>
  );
}
