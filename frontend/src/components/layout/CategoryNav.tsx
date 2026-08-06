"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { cn } from '@/lib/utils';

export default function CategoryNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentCat = searchParams.get('cat');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const { data: categories } = useQuery({
    queryKey: ['store-categories'],
    queryFn: async () => {
      const res = await fetch('/api/categories', { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to load categories');
      const json = await res.json();
      return (json.data || []) as { name: string; slug: string }[];
    },
    staleTime: 60_000,
    retry: 2,
  });

  const links = [
    { label: 'Home', href: '/', slug: undefined as string | undefined },
    { label: 'About Us', href: '/about', slug: undefined },
    { label: 'All Products', href: '/shop', slug: undefined },
    ...(isMounted && categories ? categories : []).map((c) => ({
      label: c.name,
      href: `/shop?cat=${c.slug}`,
      slug: c.slug,
    })),
    { label: 'Contact Us', href: '/contact', slug: undefined },
  ];

  return (
    <nav
      className="bg-white/95 border-b border-border/60 sticky top-[92px] z-30 backdrop-blur-md hidden md:block shadow-xs transition-all duration-200"
      aria-label="Quick Category navigation"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ul className="flex items-center justify-center gap-2.5 sm:gap-4 lg:gap-6 py-2.5 text-[11px] font-sans font-bold tracking-wider uppercase overflow-x-auto whitespace-nowrap scrollbar-none">
          {links.map((link) => {
            const isActive = link.slug
              ? currentCat === link.slug
              : pathname === link.href && !currentCat;

            return (
              <li key={`${link.label}-${link.href}`} className="shrink-0">
                <Link
                  href={link.href}
                  className={cn(
                    'text-muted-foreground hover:text-primary transition-colors duration-200 relative py-1 px-1.5 rounded-md hover:bg-cream/40 inline-flex items-center',
                    isActive && 'text-primary font-extrabold',
                  )}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-1 right-1 h-0.5 bg-primary rounded-full" />
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
