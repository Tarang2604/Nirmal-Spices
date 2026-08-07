"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import type { Product } from '@/data/catalog';
import { toStorefrontProducts } from '@/lib/productMapper';
import { ShoppingBag, Star, Heart, ArrowRight, Flame, Sparkles, Grid, Eye } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { Skeleton } from '@/components/ui/skeleton';
import dynamic from 'next/dynamic';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const QuickViewModal = dynamic(() => import('@/components/products/QuickViewModal'), {
  ssr: false,
});

export default function TrendingProducts() {
  const [activeTab, setActiveTab] = useState<'bestseller' | 'new' | 'all'>('bestseller');
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  const addItem = useCartStore((s) => s.addItem);
  const { toggleWishlist, has } = useWishlistStore();

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['trending-products', activeTab],
    queryFn: async () => {
      const params = new URLSearchParams({ limit: '16' });
      if (activeTab === 'bestseller') params.set('badge', 'bestseller');
      else if (activeTab === 'new') params.set('badge', 'new');

      const res = await fetch(`/api/products?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to load products');
      const json = await res.json();
      return toStorefrontProducts(json.data || []);
    },
    staleTime: 60_000,
  });

  const tabs = [
    { label: "Best Sellers", value: "bestseller" as const, icon: Flame },
    { label: "New Arrivals", value: "new" as const, icon: Sparkles },
    { label: "All Spices", value: "all" as const, icon: Grid },
  ];

  const filtered: Product[] = products.slice(0, 16);

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    if (!product.inStock) {
      toast.error('Out of stock');
      return;
    }
    addItem(product._id, product.packSize, 1);
    toast.success(`${product.name} added to cart!`);
  };

  const handleWishlist = async (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    const wishlisted = has(product._id);
    await toggleWishlist(product._id);
    toast.success(wishlisted ? 'Removed from wishlist' : 'Added to wishlist ❤️');
  };

  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-cream/30 via-white to-amber-50/20" aria-labelledby="trending-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="inline-flex items-center gap-1.5 bg-crimson/10 border border-crimson/20 text-crimson px-3.5 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-widest font-accent mb-4 shadow-2xs">
            <Flame size={12} className="text-crimson animate-pulse" />
            Curated Collections
          </span>
          <h2 id="trending-heading" className="font-display font-bold text-3xl md:text-4xl text-charcoal mb-3 tracking-tight">
            Trending &amp; Popular Spices
          </h2>
          <p className="text-muted-foreground text-sm font-sans leading-relaxed">
            Discover our customer-favourite blends, freshly ground single spices, and newly arrived kitchen essentials from Harda, MP.
          </p>
        </div>

        {/* Interactive Filter Tabs */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-12">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.value;
            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => setActiveTab(tab.value)}
                suppressHydrationWarning
                className={cn(
                  "inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider font-accent transition-all duration-250 border outline-none cursor-pointer",
                  isActive
                    ? "bg-primary text-white border-primary shadow-md shadow-primary/20 scale-[1.02]"
                    : "bg-white text-charcoal border-border/80 hover:border-primary/40 hover:bg-cream/40"
                )}
              >
                <Icon size={13} className={isActive ? "text-white" : "text-primary"} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Product Grid / Loading / Empty */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {Array.from({ length: 8 }).map((_, idx) => (
              <div key={idx} className="bg-white rounded-2xl border border-border/40 p-4 space-y-3 shadow-xs">
                <Skeleton className="w-full aspect-square rounded-xl bg-cream/50" />
                <Skeleton className="h-3 w-1/3 bg-muted/60" />
                <Skeleton className="h-4 w-3/4 bg-muted/70" />
                <div className="flex justify-between items-center pt-2">
                  <Skeleton className="h-5 w-16 bg-muted/80" />
                  <Skeleton className="h-8 w-8 rounded-full bg-muted/80" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 px-4 bg-white rounded-3xl border border-border/50 max-w-md mx-auto shadow-sm">
            <ShoppingBag size={40} className="mx-auto text-muted-foreground/50 mb-3" />
            <h3 className="font-display font-bold text-lg text-charcoal mb-1">No Spices Found</h3>
            <p className="text-xs text-muted-foreground mb-4">
              There are currently no items in this category collection.
            </p>
            <button
              onClick={() => setActiveTab('all')}
              className="text-xs font-bold text-primary hover:underline uppercase font-accent tracking-wider cursor-pointer"
            >
              View All Spices &rarr;
            </button>
          </div>
        ) : (
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6"
          >
            {filtered.map((product, i) => {
              const displayPrice = product.salePrice ?? product.price;
              const discountPercent = product.salePrice
                ? Math.round(((product.price - product.salePrice) / product.price) * 100)
                : 0;
              const isWishlisted = has(product._id);

              const badgeLabel =
                product.badge === 'best-seller' ? '🔥 Best Seller' :
                  product.badge === 'new' ? '✨ New' :
                    product.badge === 'sale' ? '🏷️ Sale' : null;

              return (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: (i % 8) * 0.04, duration: 0.35 }}
                  className="group bg-white rounded-2xl border border-border/50 overflow-hidden hover:border-primary/40 hover:shadow-xl hover:shadow-crimson/8 transition-all duration-300 flex flex-col h-full relative"
                >
                  {/* Badges Overlay */}
                  <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1 pointer-events-none">
                    {badgeLabel && (
                      <span className={cn(
                        "text-[9px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-xs",
                        product.badge === 'best-seller'
                          ? "bg-crimson text-white"
                          : product.badge === 'new'
                            ? "bg-saffron text-white"
                            : "bg-charcoal text-white"
                      )}>
                        {badgeLabel}
                      </span>
                    )}
                    {discountPercent > 0 && (
                      <span className="bg-emerald-600 text-white text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full shadow-xs">
                        {discountPercent}% OFF
                      </span>
                    )}
                  </div>

                  {/* Wishlist Button */}
                  <button
                    type="button"
                    onClick={(e) => handleWishlist(e, product)}
                    suppressHydrationWarning
                    aria-label="Wishlist"
                    className="absolute top-2.5 right-2.5 z-10 w-8 h-8 bg-white/90 border border-border/40 backdrop-blur-sm flex items-center justify-center rounded-full text-muted-foreground hover:text-crimson hover:border-crimson/30 transition-all duration-200 shadow-xs hover:scale-110 cursor-pointer"
                  >
                    <Heart size={13} className={cn(isWishlisted && "fill-crimson text-crimson")} />
                  </button>

                  {/* Image Container */}
                  <Link
                    href={`/products/${product.slug}`}
                    className="relative aspect-square w-full overflow-hidden bg-cream/30 shrink-0 block"
                  >
                    <Image
                      src={product.images[0] || '/hero_spices.png'}
                      alt={product.name}
                      fill
                      sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, 25vw"
                      className="object-contain p-4 group-hover:scale-105 transition-transform duration-400"
                    />

                    {/* Quick View Button */}
                    <div className="absolute inset-0 bg-charcoal/5 group-hover:bg-charcoal/10 flex items-end justify-center pb-3 opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setQuickViewProduct(product);
                        }}
                        suppressHydrationWarning
                        className="flex items-center gap-1.5 bg-white/95 backdrop-blur-sm text-charcoal text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full shadow-md hover:bg-white transition-colors cursor-pointer"
                      >
                        <Eye size={11} /> Quick View
                      </button>
                    </div>
                  </Link>

                  {/* Content Container */}
                  <div className="p-3.5 sm:p-4 flex flex-col flex-1 gap-2">
                    <span className="text-[9px] text-muted-foreground font-accent uppercase tracking-widest truncate">
                      {product.category}
                    </span>

                    <Link href={`/products/${product.slug}`}>
                      <h3 className="font-display font-semibold text-sm leading-snug text-charcoal line-clamp-2 hover:text-primary transition-colors">
                        {product.name}
                      </h3>
                    </Link>

                    {/* Rating */}
                    <div className="flex items-center gap-1">
                      <Star size={11} className="text-saffron fill-saffron" />
                      <span className="text-[10px] font-bold text-charcoal">{product.rating.toFixed(1)}</span>
                      <span className="text-[10px] text-muted-foreground">({product.reviewCount})</span>
                    </div>

                    <div className="flex-1" />

                    {/* Price & Action Button */}
                    <div className="flex items-end justify-between gap-2 pt-1 border-t border-border-spice/30 mt-1">
                      <div>
                        <span className="text-[10px] text-muted-foreground font-sans block">{product.packSize}</span>
                        <div className="flex items-baseline gap-1.5 flex-wrap">
                          <span className="font-bold text-base text-primary font-display">
                            ₹{displayPrice}
                          </span>
                          {product.salePrice && (
                            <span className="text-[11px] text-muted-foreground line-through">
                              ₹{product.price}
                            </span>
                          )}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => handleAddToCart(e, product)}
                        disabled={!product.inStock}
                        suppressHydrationWarning
                        className={cn(
                          "w-9 h-9 flex items-center justify-center rounded-full transition-all duration-200 shrink-0 cursor-pointer",
                          product.inStock
                            ? "bg-primary text-white hover:bg-crimson-dark hover:scale-110 shadow-sm hover:shadow-md"
                            : "bg-muted text-muted-foreground cursor-not-allowed"
                        )}
                        aria-label={`Add ${product.name} to cart`}
                      >
                        <ShoppingBag size={14} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* View All Button */}
        <div className="text-center mt-12">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider font-accent text-primary border-2 border-primary/20 hover:border-primary hover:bg-primary/5 px-6 py-3 rounded-full transition-all duration-200 shadow-2xs hover:shadow-sm"
          >
            Explore All Spices Catalog <ArrowRight size={14} />
          </Link>
        </div>

      </div>

      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        open={Boolean(quickViewProduct)}
        onClose={() => setQuickViewProduct(null)}
      />
    </section>
  );
}
