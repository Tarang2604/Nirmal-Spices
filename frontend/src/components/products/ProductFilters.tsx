"use client";

import React, { useState, useEffect } from 'react';
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

  // Local state so typing doesn't trigger router.push on every keystroke
  const [localMin, setLocalMin] = useState(minPrice);
  const [localMax, setLocalMax] = useState(maxPrice);

  // Keep local state in sync when URL params change externally (e.g. Clear All)
  useEffect(() => { setLocalMin(minPrice); }, [minPrice]);
  useEffect(() => { setLocalMax(maxPrice); }, [maxPrice]);

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

  // Apply price filter only when user is done typing (blur or Enter)
  const applyPriceFilter = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (localMin) { params.set('minPrice', localMin); } else { params.delete('minPrice'); }
    if (localMax) { params.set('maxPrice', localMax); } else { params.delete('maxPrice'); }
    params.set('page', '1');
    router.push(`/shop?${params.toString()}`);
  };

  const handlePriceKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      applyPriceFilter();
      (e.target as HTMLInputElement).blur();
    }
  };

  const handleClearAll = () => {
    setLocalMin('');
    setLocalMax('');
    if (onCloseMobile) onCloseMobile();
    router.push('/shop');
    router.refresh();
  };

  return (
    <aside className="w-full flex flex-col gap-8 font-sans">
      {/* Sidebar Header */}
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
                "text-left text-xs font-medium py-1.5 px-3 rounded-lg transition-all duration-200 outline-none",
                activeCategory === cat.value
                  ? "bg-secondary text-primary font-bold pl-4"
                  : "text-muted-foreground hover:bg-primary/5 hover:text-primary hover:pl-4"
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
                "text-left text-xs font-medium py-1.5 px-3 rounded-lg transition-all duration-200 outline-none",
                activeBadge === b.value
                  ? "bg-secondary text-primary font-bold pl-4"
                  : "text-muted-foreground hover:bg-primary/5 hover:text-primary hover:pl-4"
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
            value={localMin}
            onChange={(e) => setLocalMin(e.target.value)}
            onBlur={applyPriceFilter}
            onKeyDown={handlePriceKeyDown}
            min={0}
            className="w-full bg-cream-dark/30 border border-border focus:border-primary rounded-lg px-3 py-2 text-xs outline-none"
          />
          <span className="text-muted-foreground text-xs font-bold">–</span>
          <input
            type="number"
            placeholder="Max"
            value={localMax}
            onChange={(e) => setLocalMax(e.target.value)}
            onBlur={applyPriceFilter}
            onKeyDown={handlePriceKeyDown}
            min={0}
            className="w-full bg-cream-dark/30 border border-border focus:border-primary rounded-lg px-3 py-2 text-xs outline-none"
          />
        </div>
        <p className="text-[10px] text-muted-foreground italic">Press Enter or click away to apply</p>
      </div>
    </aside>
  );
}
