"use client";

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { Filter } from 'lucide-react';

interface ProductFiltersProps {
  onCloseMobile?: () => void;
}

export default function ProductFilters({ onCloseMobile }: ProductFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const activeCategory = searchParams.get('cat') || '';
  const activeBadge = searchParams.get('badge') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';

  const { data: catData } = useQuery({
    queryKey: ['store-categories'],
    queryFn: async () => {
      const res = await fetch('/api/categories', { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to load categories');
      const json = await res.json();
      return (json.data || []) as { name: string; slug: string }[];
    },
  });

  const categories = [
    { label: 'All Spices', value: '' },
    ...(catData || []).map((c) => ({ label: c.name, value: c.slug })),
  ];

  const badges = [
    { label: 'All Products', value: '' },
    { label: 'Best Sellers', value: 'best-seller' },
    { label: 'New Arrivals', value: 'new' },
  ];

  const updateParam = (key: string, value: string, closeMobile = false) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set('page', '1');
    const href = `/shop?${params.toString()}`;
    if (closeMobile && onCloseMobile) onCloseMobile();
    router.push(href);
    router.refresh();
  };

  const handleClearAll = () => {
    if (onCloseMobile) onCloseMobile();
    router.push('/shop');
    router.refresh();
  };

  return (
    <aside className="w-full flex flex-col gap-8 font-sans">
      <div className="flex items-center justify-between pb-4 border-b border-border-spice">
        <h2 className="text-sm font-bold uppercase tracking-wider text-charcoal flex items-center gap-2">
          <Filter size={16} /> Filters
        </h2>
        <button
          type="button"
          onClick={handleClearAll}
          className="text-xs text-primary font-semibold uppercase tracking-wider font-accent hover:underline"
        >
          Clear All
        </button>
      </div>

      <div className="flex flex-col gap-3">
        <h3 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">Category</h3>
        <div className="flex flex-col gap-2">
          {categories.map((cat) => (
            <button
              key={cat.value || 'all'}
              type="button"
              onClick={() => updateParam('cat', cat.value, true)}
              className={cn(
                'text-left text-xs font-medium py-1.5 px-3 rounded-lg transition-colors outline-none',
                activeCategory === cat.value
                  ? 'bg-secondary text-primary font-bold'
                  : 'text-muted-foreground hover:bg-muted',
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <h3 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">Collections</h3>
        <div className="flex flex-col gap-2">
          {badges.map((b) => (
            <button
              key={b.value || 'all-products'}
              type="button"
              onClick={() => updateParam('badge', b.value, true)}
              className={cn(
                'text-left text-xs font-medium py-1.5 px-3 rounded-lg transition-colors outline-none',
                activeBadge === b.value
                  ? 'bg-secondary text-primary font-bold'
                  : 'text-muted-foreground hover:bg-muted',
              )}
            >
              {b.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <h3 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">Price Range (₹)</h3>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => updateParam('minPrice', e.target.value)}
            className="w-full bg-cream-dark/30 border border-border focus:border-primary rounded-lg px-3 py-2 text-xs outline-none"
          />
          <span className="text-muted-foreground text-xs font-bold">-</span>
          <input
            type="number"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => updateParam('maxPrice', e.target.value)}
            className="w-full bg-cream-dark/30 border border-border focus:border-primary rounded-lg px-3 py-2 text-xs outline-none"
          />
        </div>
      </div>
    </aside>
  );
}
