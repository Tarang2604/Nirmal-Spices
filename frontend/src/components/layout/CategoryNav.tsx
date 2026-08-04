"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { cn } from '@/lib/utils';

export default function CategoryNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentCat = searchParams.get('cat');

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
    ...(categories || []).map((c) => ({
      label: c.name,
      href: `/shop?cat=${c.slug}`,
      slug: c.slug,
    })),
    { label: 'Contact Us', href: '/contact', slug: undefined },
  ];

  return (
    <nav
      className="bg-cream-dark/50 border-b border-border/80 sticky top-16 z-40 backdrop-blur-md hidden md:block"
      aria-label="Quick Category navigation"
    >
      <div className="max-w-7xl mx-auto px-4">
        <ul className="flex items-center justify-center gap-6 lg:gap-8 py-3 text-sm font-sans font-semibold tracking-wide uppercase overflow-x-auto">
          {links.map((link) => {
            const isActive = link.slug
              ? currentCat === link.slug
              : pathname === link.href && !currentCat;

            return (
              <li key={`${link.label}-${link.href}`} className="shrink-0">
                <Link
                  href={link.href}
                  className={cn(
                    'text-muted-foreground hover:text-primary transition-colors duration-250 relative py-1.5',
                    isActive && 'text-primary',
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
