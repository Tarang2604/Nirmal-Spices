"use client";

import React, { Suspense, useState } from 'react';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams, useRouter } from 'next/navigation';
import ProductCard from '@/components/products/ProductCard';
import ProductFilters from '@/components/products/ProductFilters';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronLeft, ChevronRight, SlidersHorizontal } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const CATEGORY_COVER_MAP: Record<string, string> = {
  'blended-masalas': '/blended_masala_collection.jpg',
  'ground-spices': '/spices_flatlay.png',
  'whole-spices': '/whole_spices_collection.jpg',
  salts: '/salt_category_banner.png',
  'instant-mix': '/instant_mix_category_banner.png',
  flours: '/flour_catalog.jpg',
  flour: '/flour_catalog.jpg',
};

function ShopContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // URL query variables
  const page = Number(searchParams.get('page')) || 1;
  const cat = searchParams.get('cat') || '';
  const badge = searchParams.get('badge') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const sort = searchParams.get('sort') || '';

  const { data: catData } = useQuery({
    queryKey: ['store-categories'],
    queryFn: async () => {
      const res = await fetch('/api/categories', { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to load categories');
      const json = await res.json();
      return (json.data || []) as { name: string; slug: string }[];
    },
    staleTime: 60_000,
  });

  const activeCategoryName =
    catData?.find((c) => c.slug === cat)?.name ||
    (cat
      ? cat.replace(/-/g, ' ').replace(/\b\w/g, (ch) => ch.toUpperCase())
      : '');

  // API Query — Next.js BFF → Express products (MongoDB), filtered by category slug
  const { data, isLoading, isFetching, isError, error } = useQuery({
    queryKey: ['shop-products', { page, cat, badge, minPrice, maxPrice, sort }],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', '12');
      if (cat) params.set('category', cat);
      if (badge) {
        // Storefront uses best-seller; API stores bestseller
        params.set('badge', badge === 'best-seller' ? 'bestseller' : badge);
      }
      if (minPrice) params.set('minPrice', minPrice);
      if (maxPrice) params.set('maxPrice', maxPrice);
      if (sort) params.set('sort', sort);

      const res = await fetch(`/api/products?${params.toString()}`, { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to fetch products');
      return res.json();
    },
    // Fresh data when category / filters change — no stale grid flash
    staleTime: 0,
    gcTime: 60_000,
    refetchOnMount: 'always',
  });

  const products = data?.data || [];
  const meta = data?.meta || { page: 1, limit: 12, total: 0, totalPages: 1 };
  // Instant feedback: skeleton while first load OR when switching category/filters
  const showSkeleton = isLoading || (isFetching && !data);

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(newPage));
    router.push(`/shop?${params.toString()}`);
  };

  const handleSortChange = (newSort: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (newSort) params.set('sort', newSort);
    else params.delete('sort');
    params.set('page', '1');
    router.push(`/shop?${params.toString()}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 font-sans">

      {/* Category Hero Cover Banner */}
      {cat && CATEGORY_COVER_MAP[cat] && (
        <div className="relative w-full h-44 sm:h-56 md:h-64 rounded-2xl overflow-hidden mb-8 border border-border/40 shadow-sm">
          <Image
            src={CATEGORY_COVER_MAP[cat]}
            alt={activeCategoryName || 'Category Banner'}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent flex flex-col justify-center px-6 sm:px-10 text-white">
            <span className="text-xs uppercase font-accent font-bold tracking-widest text-saffron mb-1">
              Collection Showcase
            </span>
            <h2 className="font-display text-2xl sm:text-4xl font-bold">{activeCategoryName}</h2>
            <p className="text-xs sm:text-sm text-cream/90 mt-1 max-w-md">
              Explore authentic {activeCategoryName} carefully packed and freshly prepared in Harda, MP.
            </p>
          </div>
        </div>
      )}

      {/* Top Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-border-spice pb-6 mb-8 gap-4">
        <div>
          <h1 className="font-display font-bold text-3xl text-charcoal">
            {activeCategoryName || 'Spice Store'}
          </h1>
          <p className="text-muted-foreground text-xs mt-1">
            {isFetching && !showSkeleton
              ? 'Updating…'
              : cat
                ? `${meta.total} product${meta.total === 1 ? '' : 's'} in this collection`
                : `Displaying ${products.length} of ${meta.total} premium products`}
          </p>
        </div>

        {/* Sort Controls */}
        <div className="flex items-center gap-3 self-end sm:self-auto">

          {/* Mobile Filter Sheet Trigger */}
          <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
            <SheetTrigger
              className="lg:hidden border border-border bg-white text-charcoal text-xs font-semibold py-2 px-4 rounded-xl flex items-center gap-1.5 outline-none hover:bg-muted"
              aria-label="Filter"
            >
              <SlidersHorizontal size={14} /> Filter
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[350px] p-6 bg-white overflow-y-auto">
              <ProductFilters onCloseMobile={() => setMobileFiltersOpen(false)} />
            </SheetContent>
          </Sheet>

          {/* Sort Selection Box */}
          <select
            value={sort}
            onChange={(e) => handleSortChange(e.target.value)}
            suppressHydrationWarning
            className="bg-white border border-border text-xs font-semibold text-charcoal px-4 py-2 rounded-xl outline-none focus:border-primary"
            aria-label="Sort products"
          >
            <option value="">Sort: Default</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="rating">Top Rated</option>
          </select>
        </div>
      </div>

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* Sidebar Filters (Desktop only) */}
        <div className="hidden lg:block lg:col-span-3 bg-white p-6 rounded-2xl border border-border-spice/40 sticky top-36">
          <ProductFilters />
        </div>

        {/* Products Grid Area */}
        <div className="lg:col-span-9 flex flex-col gap-12">

          {showSkeleton ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6" key={`loading-${cat}-${page}`}>
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex flex-col gap-4">
                  <Skeleton className="aspect-square w-full rounded-2xl bg-border-spice/10" />
                  <Skeleton className="h-4 w-3/4 bg-border-spice/10" />
                  <Skeleton className="h-4 w-1/2 bg-border-spice/10" />
                </div>
              ))}
            </div>
          ) : isError || error ? (
            <div className="text-center p-16 border border-dashed rounded-2xl text-muted-foreground text-sm">
              Failed to load spices. Please check your internet connection and try again.
            </div>
          ) : products.length === 0 ? (
            <div className="text-center p-16 border border-dashed rounded-2xl text-muted-foreground text-sm bg-white">
              No products match your selected filters. Try broadening your criteria or search term.
            </div>
          ) : (
            <div
              key={`grid-${cat}-${badge}-${page}-${sort}`}
              className={`grid grid-cols-2 md:grid-cols-3 gap-6 transition-opacity ${isFetching ? 'opacity-60' : 'opacity-100'}`}
            >
              {products.map((product: any) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}

          {/* Simple Pagination Controls */}
          {meta.totalPages > 1 && !showSkeleton && (
            <div className="flex items-center justify-center gap-2 mt-4">
              <button
                disabled={page <= 1}
                onClick={() => handlePageChange(page - 1)}
                className="p-2.5 border rounded-xl hover:bg-muted text-charcoal outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Previous page"
              >
                <ChevronLeft size={16} />
              </button>

              <span className="text-xs font-semibold text-charcoal px-4 py-2 border rounded-xl bg-white select-none">
                Page {page} of {meta.totalPages}
              </span>

              <button
                disabled={page >= meta.totalPages}
                onClick={() => handlePageChange(page + 1)}
                className="p-2.5 border rounded-xl hover:bg-muted text-charcoal outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Next page"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 font-sans text-muted-foreground">
        <Skeleton className="h-8 w-48 bg-border-spice/10" />
      </div>
    }>
      <ShopContent />
    </Suspense>
  );
}

