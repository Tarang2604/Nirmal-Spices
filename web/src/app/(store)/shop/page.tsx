"use client";

export const dynamic = 'force-dynamic';

import React, { Suspense, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import ProductCard from '@/components/products/ProductCard';
import ProductFilters from '@/components/products/ProductFilters';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { Filter, ChevronLeft, ChevronRight, SlidersHorizontal } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

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

  // API Query — calls Next.js /api/products route (static catalog, no backend needed)
  const { data, isLoading, error } = useQuery({
    queryKey: ['shop-products', { page, cat, badge, minPrice, maxPrice, sort }],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', '12');
      if (cat) params.set('category', cat);
      if (badge) params.set('badge', badge);
      if (minPrice) params.set('minPrice', minPrice);
      if (maxPrice) params.set('maxPrice', maxPrice);
      if (sort) params.set('sort', sort);

      const res = await fetch(`/api/products?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch products');
      return res.json();
    },
  });

  const products = data?.data || [];
  const meta = data?.meta || { page: 1, limit: 12, total: 0, totalPages: 1 };

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
      
      {/* Top Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-border-spice pb-6 mb-8 gap-4">
        <div>
          <h1 className="font-display font-bold text-3xl text-charcoal">
            Spice Store
          </h1>
          <p className="text-muted-foreground text-xs mt-1">
            Displaying {products.length} of {meta.total} premium products
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
          
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex flex-col gap-4">
                  <Skeleton className="aspect-square w-full rounded-2xl bg-border-spice/10" />
                  <Skeleton className="h-4 w-3/4 bg-border-spice/10" />
                  <Skeleton className="h-4 w-1/2 bg-border-spice/10" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center p-16 border border-dashed rounded-2xl text-muted-foreground text-sm">
              Failed to load spices. Please check your internet connection and try again.
            </div>
          ) : products.length === 0 ? (
            <div className="text-center p-16 border border-dashed rounded-2xl text-muted-foreground text-sm bg-white">
              No products match your selected filters. Try broadening your criteria or search term.
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {products.map((product: any) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}

          {/* Simple Pagination Controls */}
          {meta.totalPages > 1 && (
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

