"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { PRODUCTS } from '@/data/catalog';
import { ShoppingBag, Star, Heart, ArrowRight, Zap } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { toast } from 'sonner';

export default function TrendingProducts() {
  const [activeTab, setActiveTab] = useState<'bestseller' | 'new' | 'all'>('bestseller');
  const addItem = useCartStore(s => s.addItem);

  const tabs = [
    { label: "🔥 Best Sellers", value: "bestseller" as const },
    { label: "✨ New Arrivals", value: "new" as const },
    { label: "🌶️ All Products", value: "all" as const },
  ];

  const filtered = PRODUCTS.filter(p => {
    if (activeTab === 'bestseller') return p.badge === 'best-seller';
    if (activeTab === 'new') return p.badge === 'new';
    return true;
  }).slice(0, 8);

  const handleAddToCart = (product: typeof PRODUCTS[0]) => {
    addItem(product._id, product.packSize, 1);
    toast.success(`${product.name} added to cart!`);
  };

  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-cream/20 to-white" aria-labelledby="trending-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="inline-flex items-center gap-1.5 bg-saffron/10 border border-saffron/20 text-saffron px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest font-accent mb-4">
            <Zap size={10} /> Our Products
          </span>
          <h2 id="trending-heading" className="font-display font-bold text-3xl sm:text-4xl text-charcoal mb-3">
            Explore Our Spice Collection
          </h2>
          <p className="text-muted-foreground text-sm font-sans leading-relaxed">
            26 varieties of pure, hygienically-processed Indian spices — from blended masalas to whole spices, salts, and instant mixes.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center justify-center gap-2 mb-10">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              suppressHydrationWarning
              className={[
                "px-5 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider font-accent transition-all duration-200 outline-none",
                activeTab === tab.value
                  ? "bg-primary text-white shadow-lg shadow-crimson/25 scale-105"
                  : "bg-white border border-border text-muted-foreground hover:border-primary/40 hover:text-primary hover:bg-primary/5",
              ].join(' ')}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {filtered.map((product, i) => (
            <motion.div
              key={product._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: i * 0.05 }}
              className="group relative bg-white rounded-2xl overflow-hidden border border-border/60 hover:border-primary/30 hover:shadow-xl hover:shadow-crimson/10 transition-all duration-300"
            >
              {/* Badge */}
              {product.badge && (
                <div className={[
                  "absolute top-2.5 left-2.5 z-10 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider",
                  product.badge === 'best-seller' ? "bg-crimson text-white" :
                  product.badge === 'new' ? "bg-saffron text-white" :
                  "bg-accent text-white"
                ].join(' ')}>
                  {product.badge === 'best-seller' ? '🔥 Best Seller' : product.badge === 'new' ? '✨ New' : '🏷️ Sale'}
                </div>
              )}

              {/* Wishlist */}
              <button suppressHydrationWarning className="absolute top-2.5 right-2.5 z-10 w-7 h-7 bg-white/90 border border-border/50 rounded-full flex items-center justify-center text-muted-foreground hover:text-crimson hover:border-crimson/30 transition-colors duration-150">
                <Heart size={12} />
              </button>

              {/* Product Image */}
              <Link href={`/products/${product.slug}`} className="block relative w-full aspect-square bg-cream/30 overflow-hidden">
                <Image
                  src={product.images[0]}
                  alt={product.name}
                  fill
                  className="object-contain p-3 group-hover:scale-105 transition-transform duration-400"
                  sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, 25vw"
                />
              </Link>

              {/* Info */}
              <div className="p-3 sm:p-4 flex flex-col gap-2">
                <p className="text-[10px] text-muted-foreground font-accent uppercase tracking-wider">{product.category}</p>
                <Link href={`/products/${product.slug}`}>
                  <h3 className="font-display font-semibold text-sm sm:text-base leading-tight text-charcoal line-clamp-2 hover:text-primary transition-colors">
                    {product.name}
                  </h3>
                </Link>

                {/* Rating */}
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, j) => (
                    <Star
                      key={j}
                      size={11}
                      className={j < Math.floor(product.rating) ? "text-saffron fill-saffron" : "text-border"}
                      fill={j < Math.floor(product.rating) ? "currentColor" : "none"}
                    />
                  ))}
                  <span className="text-[10px] text-muted-foreground font-sans ml-1">({product.reviewCount})</span>
                </div>

                {/* Pack size + Price */}
                <div className="flex items-center justify-between gap-1 mt-1">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-muted-foreground font-sans">{product.packSize}</span>
                    <div className="flex items-baseline gap-1.5">
                      <span className="font-bold text-sm sm:text-base text-primary font-accent">
                        ₹{product.salePrice ?? product.price}
                      </span>
                      {product.salePrice && (
                        <span className="text-[11px] text-muted-foreground line-through">₹{product.price}</span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => handleAddToCart(product)}
                    suppressHydrationWarning
                    className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full bg-primary text-white hover:bg-crimson-dark shadow-sm hover:shadow-md hover:scale-110 transition-all duration-200"
                    aria-label={`Add ${product.name} to cart`}
                  >
                    <ShoppingBag size={14} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* View All CTA */}
        <div className="text-center mt-12">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 bg-charcoal hover:bg-primary text-white font-bold font-accent uppercase tracking-wider text-xs px-8 py-4 rounded-full shadow-lg hover:shadow-crimson/25 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
          >
            View All 26 Varieties
            <ArrowRight size={14} />
          </Link>
        </div>

      </div>
    </section>
  );
}
