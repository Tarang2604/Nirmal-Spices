import React from 'react';
import type { Metadata } from 'next';
import { getProductBySlug, getProductsByCategory } from '@/data/catalog';
import ProductGallery from '@/components/products/ProductGallery';
import ProductInfo from '@/components/products/ProductInfo';
import ProductTabs from '@/components/products/ProductTabs';
import ProductCard from '@/components/products/ProductCard';
import { notFound } from 'next/navigation';

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

// Fetch helpers — read from static catalog (no backend required)
async function getProduct(slug: string) {
  return getProductBySlug(slug) ?? null;
}

async function getRelatedProducts(categorySlug: string, currentId: string) {
  return getProductsByCategory(categorySlug)
    .filter(p => p._id !== currentId)
    .slice(0, 4);
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

  const relatedProducts = await getRelatedProducts(product.categorySlug, product._id);
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

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="border-t border-border/40 pt-16" aria-labelledby="related-heading">
          <h2 id="related-heading" className="font-display font-bold text-2xl text-charcoal mb-8">
            You May Also Like
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </section>
      )}

    </div>
  );
}
