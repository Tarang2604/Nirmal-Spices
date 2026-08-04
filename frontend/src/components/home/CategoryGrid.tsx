"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

type Category = {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  count?: number;
};

const ACCENTS = [
  { color: 'bg-saffron/10', border: 'border-saffron/20', accent: 'text-saffron' },
  { color: 'bg-crimson/10', border: 'border-crimson/20', accent: 'text-crimson' },
  { color: 'bg-amber-500/10', border: 'border-amber-500/20', accent: 'text-amber-600' },
  { color: 'bg-slate-400/10', border: 'border-slate-400/20', accent: 'text-slate-600' },
  { color: 'bg-green-500/10', border: 'border-green-500/20', accent: 'text-green-700' },
];

export default function CategoryGrid() {
  const { data, isLoading } = useQuery({
    queryKey: ['store-categories'],
    queryFn: async () => {
      const res = await fetch('/api/categories', { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to load categories');
      const json = await res.json();
      return (json.data || []) as Category[];
    },
    staleTime: 60_000,
    retry: 2,
  });

  const categories = data || [];

  const gridVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 100 } },
  };

  return (
    <section className="py-16 md:py-24 bg-white" aria-labelledby="category-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-16">
          <h2 id="category-heading" className="font-display font-bold text-3xl md:text-4xl text-charcoal mb-4">
            Shop By Collection
          </h2>
          <p className="text-muted-foreground text-sm font-sans">
            Explore our curated ranges of authentic Indian spices, manufactured and hand-packed
            with precision for perfect taste.
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-2xl bg-cream/60 h-72 animate-pulse" />
            ))}
          </div>
        ) : categories.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground">Categories will appear once seeded.</p>
        ) : (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            variants={gridVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
          >
            {categories.map((cat, idx) => {
              const style = ACCENTS[idx % ACCENTS.length];
              const count = cat.count ?? 0;
              const imageSrc = cat.image || '/masala_collection.png';
              // /uploads/* is proxied by Next rewrites — not in /public, so skip optimizer
              const usePlainImg =
                imageSrc.startsWith('/uploads/') || imageSrc.startsWith('http://localhost');

              return (
                <motion.div
                  key={cat._id || cat.slug}
                  variants={cardVariants}
                  whileHover={{ y: -8 }}
                  className={`group flex flex-col rounded-2xl border ${style.border} ${style.color} overflow-hidden transition-all duration-300`}
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-white">
                    {usePlainImg ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={imageSrc}
                        alt={cat.name}
                        className="absolute inset-0 h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <Image
                        src={imageSrc}
                        alt={cat.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 768px) 100vw, 350px"
                      />
                    )}
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/5 transition-colors" />
                  </div>

                  <div className="p-6 flex flex-col items-start gap-2 shrink-0">
                    <h3 className="font-display font-bold text-xl text-charcoal">{cat.name}</h3>
                    <p className="text-muted-foreground text-xs leading-normal font-sans mb-4">
                      {cat.description ||
                        `${count} product${count === 1 ? '' : 's'} in this collection`}
                    </p>
                    <Link
                      href={`/shop?cat=${cat.slug}`}
                      className={`inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider font-accent ${style.accent} hover:underline mt-auto`}
                    >
                      Shop Now
                      <ArrowUpRight
                        size={14}
                        className="group-hover:translate-x-0.5 group-hover:translate-y-[-0.5px] transition-transform"
                      />
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </section>
  );
}
