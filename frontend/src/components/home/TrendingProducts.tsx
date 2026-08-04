"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import type { Product } from '@/data/catalog';
import { toStorefrontProducts } from '@/lib/productMapper';
import { ShoppingBag, Star, Heart, ArrowRight, Zap } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { toast } from 'sonner';

export default function TrendingProducts() {
  const [activeTab, setActiveTab] = useState<'bestseller' | 'new' | 'all'>('bestseller');
  const addItem = useCartStore(s => s.addItem);

  const { data: apiProducts = [], isLoading } = useQuery({
    queryKey: ['trending-products'],
    queryFn: async () => {
      const res = await fetch('/api/products?limit=24');
      if (!res.ok) throw new Error('Failed to load products');
      const json = await res.json();
      return toStorefrontProducts(json.data || []);
    },
  });

  const source: Product[] = apiProducts;

  const tabs = [
    { label: "Best Sellers", value: "bestseller" as const },
    { label: "New Arrivals", value: "new" as const },
    { label: "All Products", value: "all" as const },
  ];

  const filtered = source.filter(p => {
    if (activeTab === 'bestseller') return p.badge === 'best-seller';
    if (activeTab === 'new') return p.badge === 'new';
    return true;
  }).slice(0, 8);

  const handleAddToCart = (product: Product) => {
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
          <h2 id="trending-heading" className="font-display font-bold text-3xl md:text-4xl text-charcoal mb-3">
            Trending Spices
          </h2>
          <p className="text-muted-foreground text-sm">
            Handpicked favourites from our Harda kitchens — pure, aromatic, and ready for your recipes.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setActiveTab(tab.value)}
              className={`px-4 py-2 text-xs font-semibold rounded-full border transition-colors ${
                activeTab === tab.value
                  ? 'bg-crimson text-white border-crimson'
                  : 'bg-white text-charcoal border-border hover:border-crimson/40'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="text-center text-sm text-muted-foreground py-16">Loading products…</div>
        ) : filtered.length === 0 ? (
          <div className="text-center text-sm text-muted-foreground py-16">
            No products found. Seed the catalog from the admin console.
          </div>
        ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {filtered.map((product, i) => (
            <motion.div
              key={product._id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="group bg-white rounded-2xl border border-border/50 overflow-hidden hover:shadow-lg transition-shadow"
            >
              <Link href={`/products/${product.slug}`} className="block relative aspect-square bg-cream/30">
                {product.images[0] && (
                  <Image
                    src={product.images[0]}
                    alt={product.name}
                    fill
                    className="object-contain p-4 group-hover:scale-105 transition-transform"
                    sizes="(max-width:768px) 50vw, 25vw"
                  />
                )}
              </Link>
              <div className="p-3 sm:p-4">
                <div className="flex items-center gap-1 text-[10px] text-saffron mb-1">
                  <Star size={10} fill="currentColor" />
                  <span>{product.rating.toFixed(1)}</span>
                  <span className="text-muted-foreground">({product.reviewCount})</span>
                </div>
                <Link href={`/products/${product.slug}`} className="font-semibold text-sm text-charcoal line-clamp-2 hover:text-crimson">
                  {product.name}
                </Link>
                <div className="mt-2 flex items-center justify-between gap-2">
                  <div className="text-sm font-bold text-crimson">
                    ₹{product.salePrice ?? product.price}
                    {product.salePrice && (
                      <span className="ml-1 text-[10px] font-normal text-muted-foreground line-through">
                        ₹{product.price}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      aria-label="Wishlist"
                      className="p-1.5 rounded-full border border-border text-muted-foreground hover:text-crimson"
                    >
                      <Heart size={14} />
                    </button>
                    <button
                      type="button"
                      aria-label="Add to cart"
                      onClick={() => handleAddToCart(product)}
                      className="p-1.5 rounded-full bg-crimson text-white hover:bg-crimson/90"
                    >
                      <ShoppingBag size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        )}

        <div className="text-center mt-10">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 text-sm font-semibold text-crimson hover:underline"
          >
            View all spices <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
}
