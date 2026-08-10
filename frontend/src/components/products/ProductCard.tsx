"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, Star, ShoppingBag, Eye } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { cn } from '@/lib/utils';
import { getSafeImageUrl, imageLoader } from '@/lib/imageUrl';
import { toast } from 'sonner';
import type { Product } from '@/data/catalog';

import { useAuthStore } from '@/store/authStore';

interface ProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
}

export default function ProductCard({ product, onQuickView }: ProductCardProps) {
  const { addItem } = useCartStore();
  const { toggleWishlist, has } = useWishlistStore();
  const { isLoggedIn } = useAuthStore();
  const wishlisted = has(product._id);

  const displayPrice = product.salePrice ?? product.price;
  const discountPercent = product.salePrice
    ? Math.round(((product.price - product.salePrice) / product.price) * 100)
    : 0;

  const badgeLabel =
    product.badge === 'best-seller' ? '🔥 Best Seller' :
    product.badge === 'new' ? '✨ New' :
    product.badge === 'sale' ? '🏷️ Sale' : null;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!product.inStock) {
      toast.error('Out of stock');
      return;
    }
    addItem(product._id, product.packSize, 1);
    toast.success(`${product.name} added to cart!`);
  };

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    await toggleWishlist(product._id);
    toast.success(wishlisted ? 'Removed from wishlist' : 'Added to wishlist ❤️');
  };

  return (
    <div className="group bg-white rounded-2xl border border-border/50 overflow-hidden hover:border-primary/30 hover:shadow-xl hover:shadow-crimson/8 transition-all duration-300 flex flex-col h-full relative">

      {/* Badges */}
      <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1 pointer-events-none">
        {badgeLabel && (
          <span className={cn(
            "text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shadow-sm",
            product.badge === 'best-seller' ? "bg-crimson text-white" :
            product.badge === 'new' ? "bg-saffron text-white" : "bg-accent text-white"
          )}>
            {badgeLabel}
          </span>
        )}
        {discountPercent > 0 && (
          <span className="bg-green-500 text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shadow-sm">
            {discountPercent}% OFF
          </span>
        )}
      </div>

      {/* Wishlist */}
      <button
        onClick={handleWishlist}
        suppressHydrationWarning
        className="absolute top-2.5 right-2.5 z-10 w-8 h-8 bg-white/90 border border-border/40 backdrop-blur-sm flex items-center justify-center rounded-full text-muted-foreground hover:text-crimson hover:border-crimson/30 transition-colors duration-150 shadow-sm"
        aria-label="Toggle wishlist"
      >
        <Heart size={13} className={cn(wishlisted && "fill-crimson text-crimson")} />
      </button>

      {/* Image */}
      <Link
        href={`/products/${product.slug}`}
        className="relative aspect-square w-full overflow-hidden bg-cream/40 shrink-0 block"
      >
        <Image
          src={getSafeImageUrl(product.images[0])}
          alt={product.name}
          fill
          loader={imageLoader}
          sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, 25vw"
          className="object-contain p-4 group-hover:scale-105 transition-transform duration-400"
        />
        {/* Quick view overlay */}
        {onQuickView && (
          <div className="absolute inset-0 bg-charcoal/0 group-hover:bg-charcoal/10 flex items-end justify-center pb-3 opacity-0 group-hover:opacity-100 transition-all duration-300">
            <button
              onClick={(e) => { e.preventDefault(); onQuickView(product); }}
              className="flex items-center gap-1.5 bg-white/95 backdrop-blur-sm text-charcoal text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full shadow-lg hover:bg-white transition-colors"
            >
              <Eye size={11} /> Quick View
            </button>
          </div>
        )}
      </Link>

      {/* Info */}
      <div className="p-3 sm:p-4 flex flex-col flex-1 gap-2">
        <Link
          href={`/shop?cat=${encodeURIComponent(product.categorySlug || '')}`}
          className="text-[9px] text-muted-foreground font-accent uppercase tracking-widest hover:text-primary transition-colors"
        >
          {product.category}
        </Link>

        <Link href={`/products/${product.slug}`}>
          <h3 className="font-display font-semibold text-sm sm:text-[15px] leading-snug text-charcoal line-clamp-2 hover:text-primary transition-colors duration-150">
            {product.name}
          </h3>
        </Link>

        {/* Stars */}
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              size={11}
              className={i < Math.floor(product.rating) ? "text-saffron fill-saffron" : "text-border/80"}
              fill={i < Math.floor(product.rating) ? 'currentColor' : 'none'}
            />
          ))}
          <span className="text-[10px] text-muted-foreground font-sans ml-0.5">({product.reviewCount})</span>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Pack size + Price + Cart */}
        <div className="flex items-end justify-between gap-2 mt-1">
          <div>
            <span className="text-[10px] text-muted-foreground font-sans block">{product.packSize}</span>
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span className="font-bold text-base text-primary font-display">
                ₹{displayPrice}
              </span>
              {product.salePrice && (
                <span className="text-[11px] text-muted-foreground line-through">₹{product.price}</span>
              )}
            </div>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={!product.inStock}
            suppressHydrationWarning
            className={cn(
              "w-9 h-9 flex items-center justify-center rounded-full transition-all duration-200 flex-shrink-0",
              product.inStock
                ? "bg-primary text-white hover:bg-crimson-dark hover:scale-110 shadow-sm hover:shadow-md"
                : "bg-muted text-muted-foreground cursor-not-allowed"
            )}
            aria-label={`Add ${product.name} to cart`}
          >
            <ShoppingBag size={14} />
          </button>
        </div>

        {!product.inStock && (
          <p className="text-[10px] text-destructive font-semibold font-accent uppercase tracking-wider">
            Out of Stock
          </p>
        )}
      </div>
    </div>
  );
}
