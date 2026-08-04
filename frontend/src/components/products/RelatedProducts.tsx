"use client";

import React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import ProductCard from '@/components/products/ProductCard';
import { Skeleton } from '@/components/ui/skeleton';
import type { Product } from '@/data/catalog';

interface RelatedProductsProps {
  categorySlug: string;
  categoryName?: string;
  currentProductId: string;
}

export default function RelatedProducts({
  categorySlug,
  categoryName,
  currentProductId,
}: RelatedProductsProps) {
  const { data, isLoading, isFetching, isError } = useQuery({
    queryKey: ['related-products', categorySlug, currentProductId],
    enabled: Boolean(categorySlug),
    queryFn: async () => {
      const params = new URLSearchParams({
        category: categorySlug,
        limit: '8',
      });
      const res = await fetch(`/api/products?${params.toString()}`, { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to load related products');
      const json = await res.json();
      const products = (json.data || []) as Product[];
      return products.filter((p) => p._id !== currentProductId).slice(0, 4);
    },
    staleTime: 30_000,
    retry: 2,
  });

  const products = data || [];
  const showSkeleton = isLoading || (isFetching && products.length === 0);

  if (!categorySlug) return null;
  if (isError && products.length === 0) return null;
  if (!showSkeleton && products.length === 0) return null;

  const title = categoryName
    ? `More from ${categoryName}`
    : 'You May Also Like';

  return (
    <section className="border-t border-border/40 pt-16" aria-labelledby="related-heading">
      <div className="flex flex-wrap items-end justify-between gap-3 mb-8">
        <h2 id="related-heading" className="font-display font-bold text-2xl text-charcoal">
          {title}
        </h2>
        <Link
          href={`/shop?cat=${encodeURIComponent(categorySlug)}`}
          className="text-xs font-bold uppercase tracking-wider font-accent text-primary hover:underline"
        >
          View all in category
        </Link>
      </div>

      {showSkeleton ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex flex-col gap-3">
              <Skeleton className="aspect-square w-full rounded-2xl" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      ) : (
        <div
          key={categorySlug + currentProductId}
          className="grid grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {products.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      )}
    </section>
  );
}
