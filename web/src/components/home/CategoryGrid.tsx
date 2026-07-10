"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';

export default function CategoryGrid() {
  const categories = [
    {
      title: "Blended Masalas",
      subtitle: "18 authentic masala blends",
      categorySlug: "blended-masalas",
      image: "/masala_collection.png",
      color: "bg-saffron/10",
      border: "border-saffron/20",
      accent: "text-saffron",
      count: 18,
    },
    {
      title: "Ground Spices",
      subtitle: "Pure stone-ground powders",
      categorySlug: "ground-spices",
      image: "/spices_flatlay.png",
      color: "bg-crimson/10",
      border: "border-crimson/20",
      accent: "text-crimson",
      count: 4,
    },
    {
      title: "Whole Spices",
      subtitle: "Naturally dried aromatic seeds",
      categorySlug: "whole-spices",
      image: "/hero_spices.png",
      color: "bg-amber-500/10",
      border: "border-amber-500/20",
      accent: "text-amber-600",
      count: 2,
    },
    {
      title: "Salts",
      subtitle: "Sendha Namak & Kala Namak",
      categorySlug: "salts",
      image: "/hero_spices.png",
      color: "bg-slate-400/10",
      border: "border-slate-400/20",
      accent: "text-slate-600",
      count: 2,
    },
    {
      title: "Instant Mix",
      subtitle: "Idli Mix & Gulab Jamun Mix",
      categorySlug: "instant-mix",
      image: "/masala_collection.png",
      color: "bg-green-500/10",
      border: "border-green-500/20",
      accent: "text-green-700",
      count: 2,
    },
  ];

  const gridVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 100 } }
  };

  return (
    <section className="py-16 md:py-24 bg-white" aria-labelledby="category-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Title */}
        <div className="text-center max-w-xl mx-auto mb-16">
          <h2 id="category-heading" className="font-display font-bold text-3xl md:text-4xl text-charcoal mb-4">
            Shop By Collection
          </h2>
          <p className="text-muted-foreground text-sm font-sans">
            Explore our curated ranges of authentic Indian spices, manufactured and hand-packed 
            with precision for perfect taste.
          </p>
        </div>

        {/* Categories Grid */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
          variants={gridVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {categories.map((cat, idx) => (
            <motion.div
              key={idx}
              variants={cardVariants}
              whileHover={{ y: -8 }}
              className={`group flex flex-col rounded-2xl border ${cat.border} ${cat.color} overflow-hidden transition-all duration-300`}
            >
              
              {/* Image Banner */}
              <div className="relative aspect-[4/3] overflow-hidden bg-white">
                <Image
                  src={cat.image}
                  alt={cat.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-w-768px) 100vw, 350px"
                />
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/5 transition-colors" />
              </div>

              {/* Text Body */}
              <div className="p-6 flex flex-col items-start gap-2 shrink-0">
                <h3 className="font-display font-bold text-xl text-charcoal">
                  {cat.title}
                </h3>
                <p className="text-muted-foreground text-xs leading-normal font-sans mb-4">
                  {cat.subtitle}
                </p>
                <Link
                  href={`/shop?cat=${cat.categorySlug}`}
                  className={`inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider font-accent ${cat.accent} hover:underline mt-auto`}
                >
                  Shop Now
                  <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:translate-y-[-0.5px] transition-transform" />
                </Link>
              </div>

            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  );
}
