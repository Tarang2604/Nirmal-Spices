"use client";

export const dynamic = 'force-dynamic';

import React, { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import ProductCard from '@/components/products/ProductCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get('q') || '';

  const { data, isLoading } = useQuery({
    queryKey: ['search', query],
    queryFn: async () => {
      if (!query.trim()) return { data: [], meta: { total: 0 } };
      const res = await fetch(`/api/products?search=${encodeURIComponent(query)}&limit=50`);
      if (!res.ok) throw new Error('Search failed');
      return res.json();
    },
    enabled: !!query,
  });

  const products = data?.data || [];
  const total = data?.meta?.total || 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 font-sans min-h-[60vh]">

      {/* Back + Header */}
      <div className="flex flex-col gap-6 mb-10">
        <Link
          href="/shop"
          className="flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors w-fit"
        >
          <ArrowLeft size={14} /> Back to Shop
        </Link>

        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <Search size={22} className="text-primary" />
            <h1 className="font-display font-bold text-2xl sm:text-3xl text-charcoal">
              Search Results
            </h1>
          </div>
          {query && (
            <p className="text-sm text-muted-foreground ml-9">
              {isLoading
                ? 'Searching...'
                : total > 0
                  ? `Found ${total} result${total !== 1 ? 's' : ''} for `
                  : `No results found for `}
              {!isLoading && (
                <strong className="text-charcoal">&ldquo;{query}&rdquo;</strong>
              )}
            </p>
          )}
        </div>

        {/* Search Bar — allows refining query */}
        <form
          className="flex items-center gap-2 max-w-lg"
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const newQuery = (formData.get('q') as string)?.trim();
            if (newQuery) router.push(`/search?q=${encodeURIComponent(newQuery)}`);
          }}
        >
          <div className="relative flex-grow">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <input
              type="search"
              name="q"
              defaultValue={query}
              placeholder="Search spices, masalas..."
              className="w-full bg-cream/40 border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-full px-4 py-2.5 pl-10 text-sm outline-none transition-all duration-200"
            />
          </div>
          <button
            type="submit"
            className="bg-primary text-white text-xs font-semibold font-accent uppercase tracking-wider px-5 py-2.5 rounded-full hover:bg-crimson-dark transition-colors"
          >
            Search
          </button>
        </form>
      </div>

      {/* Results Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex flex-col gap-3">
              <Skeleton className="aspect-square w-full rounded-2xl bg-border-spice/10" />
              <Skeleton className="h-4 w-3/4 bg-border-spice/10" />
              <Skeleton className="h-4 w-1/2 bg-border-spice/10" />
            </div>
          ))}
        </div>
      ) : !query ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
          <div className="bg-cream/60 p-6 rounded-full">
            <Search size={40} className="text-muted-foreground" />
          </div>
          <h2 className="font-bold text-charcoal text-lg">Start Searching</h2>
          <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
            Type a spice name, masala, or category above to find products.
          </p>
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
          <div className="bg-cream/60 p-6 rounded-full">
            <Search size={40} className="text-muted-foreground" />
          </div>
          <h2 className="font-bold text-charcoal text-lg">No results for &ldquo;{query}&rdquo;</h2>
          <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
            Try a different keyword, or browse all our spices in the shop.
          </p>
          <Link
            href="/shop"
            className="mt-2 bg-primary text-white text-xs font-semibold font-accent uppercase tracking-wider px-6 py-3 rounded-full hover:bg-crimson-dark transition-colors"
          >
            Browse All Spices
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product: any) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}

    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <Skeleton className="h-8 w-48 bg-border-spice/10" />
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
