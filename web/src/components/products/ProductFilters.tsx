"use client";

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Filter, X } from 'lucide-react';

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

  const categories = [
    { label: "All Spices", value: "" },
    { label: "Blended Masalas", value: "blended-masalas" },
    { label: "Ground Spices", value: "ground-spices" },
    { label: "Whole Spices", value: "whole-spices" },
    { label: "Salts", value: "salts" },
    { label: "Instant Mix", value: "instant-mix" },
    { label: "Flour", value: "flour" },
  ];

  const badges = [
    { label: "All Products", value: "" },
    { label: "🔥 Best Sellers", value: "best-seller" },
    { label: "✨ New Arrivals", value: "new" },
  ];

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    // Always reset to page 1 on filter changes
    params.set('page', '1');
    router.push(`/shop?${params.toString()}`);
  };

  const handleClearAll = () => {
    router.push('/shop');
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <aside className="w-full flex flex-col gap-8 font-sans">
      
      {/* Sidebar Header */}
      <div className="flex items-center justify-between pb-4 border-b border-border-spice">
        <h2 className="text-sm font-bold uppercase tracking-wider text-charcoal flex items-center gap-2">
          <Filter size={16} /> Filters
        </h2>
        <button
          onClick={handleClearAll}
          className="text-xs text-primary font-semibold uppercase tracking-wider font-accent hover:underline"
        >
          Clear All
        </button>
      </div>

      {/* Category selection */}
      <div className="flex flex-col gap-3">
        <h3 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">Category</h3>
        <div className="flex flex-col gap-2">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => {
                updateParam('cat', cat.value);
                if (onCloseMobile) onCloseMobile();
              }}
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

      {/* Badge filters */}
      <div className="flex flex-col gap-3">
        <h3 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">Collections</h3>
        <div className="flex flex-col gap-2">
          {badges.map((b) => (
            <button
              key={b.value}
              onClick={() => {
                updateParam('badge', b.value);
                if (onCloseMobile) onCloseMobile();
              }}
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

      {/* Price filter input boxes */}
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
