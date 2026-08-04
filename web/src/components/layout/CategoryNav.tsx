"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';

export default function CategoryNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentCat = searchParams.get('cat');

  const links = [
    { label: "🏠 Home", href: "/" },
    { label: "✨ About Us", href: "/about" },
    { label: "🛍️ All Products", href: "/shop" },
    { label: "🧂 Blended Masalas", href: "/shop?cat=blended-masalas", slug: "blended-masalas" },
    { label: "🌶️ Ground Spices", href: "/shop?cat=ground-spices", slug: "ground-spices" },
    { label: "🌿 Whole Spices", href: "/shop?cat=whole-spices", slug: "whole-spices" },
    { label: "🧂 Salts", href: "/shop?cat=salts", slug: "salts" },
    { label: "⚡ Instant Mix", href: "/shop?cat=instant-mix", slug: "instant-mix" },
    { label: "🌾 Flour", href: "/shop?cat=flour", slug: "flour" },
    { label: "📞 Contact Us", href: "/contact" },
  ];

  return (
    <nav className="bg-white border-b border-border/70 shadow-sm sticky top-[94px] z-40 hidden md:block" aria-label="Quick Category navigation">
      <div className="max-w-7xl mx-auto px-4 overflow-x-auto scrollbar-none">
        <ul className="flex items-center justify-start lg:justify-center gap-6 lg:gap-8 py-3 text-[13px] font-sans font-semibold tracking-wide whitespace-nowrap">
          {links.map((link) => {
            const isActive = link.slug 
              ? currentCat === link.slug 
              : pathname === link.href && !currentCat;

            return (
              <li key={link.label} className="inline-block">
                <Link
                  href={link.href}
                  className={cn(
                    "text-muted-foreground hover:text-primary transition-colors duration-250 relative py-2 flex items-center gap-1.5",
                    isActive && "text-primary"
                  )}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
