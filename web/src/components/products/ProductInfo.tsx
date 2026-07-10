"use client";

import React, { useState } from 'react';
import { Heart, Star, ShoppingCart, ShieldCheck, Truck, RotateCcw, Package, Zap } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import type { Product } from '@/data/catalog';

interface ProductInfoProps {
  product: Product;
}

export default function ProductInfo({ product }: ProductInfoProps) {
  const [qty, setQty] = useState(1);
  const [wishlisted, setWishlisted] = useState(false);

  const { addItem } = useCartStore();

  const displayPrice = product.salePrice ?? product.price;
  const discountPercent = product.salePrice
    ? Math.round(((product.price - product.salePrice) / product.price) * 100)
    : 0;

  const handleAddToCart = () => {
    if (!product.inStock) {
      toast.error('This product is currently out of stock');
      return;
    }
    addItem(product._id, product.packSize, qty);
    toast.success(`${qty} × ${product.name} added to cart!`);
  };

  const handleWishlist = () => {
    setWishlisted(w => !w);
    toast.success(wishlisted ? 'Removed from wishlist' : 'Added to wishlist ❤️');
  };

  const badgeLabel =
    product.badge === 'best-seller' ? '🔥 Best Seller' :
    product.badge === 'new' ? '✨ New Arrival' :
    product.badge === 'sale' ? '🏷️ Sale' : null;

  return (
    <div className="flex flex-col gap-6 font-sans">

      {/* Breadcrumb + badge */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-muted-foreground uppercase tracking-widest font-semibold font-accent">
          {product.brand}
        </span>
        <span className="text-border/60">·</span>
        <span className="text-xs text-muted-foreground uppercase tracking-widest font-semibold font-accent">
          {product.category}
        </span>
        {badgeLabel && (
          <span className={cn(
            "text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full",
            product.badge === 'best-seller' ? "bg-crimson text-white" :
            product.badge === 'new' ? "bg-saffron text-white" : "bg-accent text-white"
          )}>
            {badgeLabel}
          </span>
        )}
      </div>

      {/* Product name */}
      <h1 className="font-display font-bold text-3xl md:text-4xl text-charcoal leading-tight">
        {product.name}
      </h1>

      {/* Short description */}
      <p className="text-muted-foreground text-sm leading-relaxed">
        {product.shortDescription}
      </p>

      {/* Star ratings */}
      <div className="flex items-center gap-2 text-xs">
        <div className="flex items-center gap-0.5">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              size={14}
              className={cn(
                i < Math.floor(product.rating) ? "fill-saffron text-saffron" : "text-border"
              )}
              fill={i < Math.floor(product.rating) ? 'currentColor' : 'none'}
            />
          ))}
        </div>
        <span className="font-bold text-charcoal">{product.rating}</span>
        <span className="text-muted-foreground">({product.reviewCount} reviews)</span>
      </div>

      {/* Pricing */}
      <div className="flex items-center gap-3 border-y border-border/40 py-5">
        <span className="text-3xl font-bold text-primary font-display">
          ₹{displayPrice}
        </span>
        {product.salePrice && (
          <>
            <span className="text-base text-muted-foreground line-through font-sans">
              ₹{product.price}
            </span>
            <span className="text-xs bg-green-100 text-green-700 font-bold px-2.5 py-1 rounded-full">
              {discountPercent}% OFF
            </span>
          </>
        )}
      </div>

      {/* Pack size info */}
      <div className="flex items-center gap-3 bg-cream/60 border border-border/50 rounded-xl p-4">
        <Package size={16} className="text-primary flex-shrink-0" />
        <div>
          <p className="text-[10px] text-muted-foreground font-accent uppercase tracking-wider">Pack Size</p>
          <p className="font-bold text-sm text-charcoal font-sans mt-0.5">{product.packSize}</p>
        </div>
        <div className="ml-auto">
          <p className="text-[10px] text-muted-foreground font-accent uppercase tracking-wider">Status</p>
          <p className={cn(
            "font-bold text-sm mt-0.5",
            product.inStock ? "text-green-600" : "text-destructive"
          )}>
            {product.inStock ? '✓ In Stock' : 'Out of Stock'}
          </p>
        </div>
      </div>

      {/* Quantity + Add to Cart */}
      {product.inStock && (
        <div className="flex items-center gap-3">
          {/* Qty stepper */}
          <div className="flex items-center border border-border rounded-xl bg-white select-none overflow-hidden">
            <button
              disabled={qty <= 1}
              onClick={() => setQty(q => Math.max(1, q - 1))}
              className="px-4 py-3 text-sm font-bold text-muted-foreground hover:text-charcoal hover:bg-muted outline-none disabled:opacity-30 transition-colors"
            >
              −
            </button>
            <span className="px-4 text-sm font-bold text-charcoal min-w-[40px] text-center">{qty}</span>
            <button
              disabled={qty >= 10}
              onClick={() => setQty(q => Math.min(10, q + 1))}
              className="px-4 py-3 text-sm font-bold text-muted-foreground hover:text-charcoal hover:bg-muted outline-none disabled:opacity-30 transition-colors"
            >
              +
            </button>
          </div>

          {/* Add to Cart */}
          <button
            onClick={handleAddToCart}
            className="flex-grow py-3.5 rounded-xl font-bold uppercase tracking-wider font-accent text-xs flex items-center justify-center gap-2 bg-primary text-white hover:bg-crimson-dark shadow-lg shadow-crimson/20 hover:shadow-crimson/30 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
          >
            <ShoppingCart size={15} />
            Add to Cart
          </button>

          {/* Wishlist */}
          <button
            onClick={handleWishlist}
            className="p-3.5 border border-border rounded-xl text-muted-foreground hover:text-crimson hover:border-crimson/40 hover:bg-crimson/5 outline-none transition-colors duration-150"
            aria-label="Add to wishlist"
          >
            <Heart size={17} className={cn(wishlisted && "fill-crimson text-crimson")} />
          </button>
        </div>
      )}

      {/* Buy Now shortcut */}
      {product.inStock && (
        <button
          onClick={() => {
            handleAddToCart();
          }}
          className="w-full py-3.5 rounded-xl font-bold uppercase tracking-wider font-accent text-xs flex items-center justify-center gap-2 border-2 border-primary text-primary hover:bg-primary hover:text-white transition-all duration-200"
        >
          <Zap size={14} />
          Buy Now — ₹{displayPrice}
        </button>
      )}

      {/* Trust badges */}
      <div className="border-t border-border/40 pt-5 grid grid-cols-1 gap-2.5 text-xs text-muted-foreground">
        <div className="flex items-center gap-2.5">
          <ShieldCheck size={15} className="text-green-600 flex-shrink-0" />
          <span>FSSAI Certified · 100% Natural · No Artificial Additives</span>
        </div>
        <div className="flex items-center gap-2.5">
          <Truck size={15} className="text-primary flex-shrink-0" />
          <span>Free Delivery above ₹499 · Dispatched in 24 hours</span>
        </div>
        <div className="flex items-center gap-2.5">
          <RotateCcw size={15} className="text-saffron flex-shrink-0" />
          <span>7-day easy returns if seal is intact</span>
        </div>
      </div>

      {/* Shelf life info */}
      {product.shelfLife && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/30 rounded-lg px-4 py-2.5">
          <Package size={13} className="text-muted-foreground flex-shrink-0" />
          <span><strong>Shelf Life:</strong> {product.shelfLife}</span>
        </div>
      )}

    </div>
  );
}
