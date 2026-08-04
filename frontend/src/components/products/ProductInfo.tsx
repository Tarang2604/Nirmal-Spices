"use client";

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Heart, Star, ShoppingCart, Package, Zap, Loader2 } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { useUIStore } from '@/store/uiStore';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import type { Product } from '@/data/catalog';
import AvailableCouponsStrip from '@/components/coupons/AvailableCouponsStrip';

interface ProductInfoProps {
  product: Product;
}

export default function ProductInfo({ product }: ProductInfoProps) {
  const router = useRouter();
  const weights = product.weights?.length
    ? product.weights
    : [{ weight: product.packSize, price: product.salePrice ?? product.price, mrp: product.price, stock: product.inStock ? 1 : 0 }];

  const [selectedIdx, setSelectedIdx] = useState(0);
  const [qty, setQty] = useState(1);
  const [buying, setBuying] = useState(false);
  const { addItem } = useCartStore();
  const { setCartOpen } = useUIStore();
  const { toggleWishlist, has } = useWishlistStore();
  const wishlisted = has(product._id);

  const selected = weights[Math.min(selectedIdx, weights.length - 1)] || weights[0];
  const mrp = selected.mrp ?? selected.price;
  const price = selected.price ?? mrp;
  const salePrice = price < mrp ? price : null;
  const displayPrice = salePrice ?? price;
  const discountPercent = salePrice ? Math.round(((mrp - price) / mrp) * 100) : 0;
  const inStock = (selected.stock ?? 0) > 0;
  const maxQty = Math.min(10, Math.max(1, selected.stock || 1));

  const badgeLabel =
    product.badge === 'best-seller' ? 'Best Seller' :
    product.badge === 'new' ? 'New Arrival' :
    product.badge === 'sale' ? 'Sale' : null;

  const handleAddToCart = () => {
    if (!inStock) {
      toast.error('This pack is currently out of stock');
      return;
    }
    void addItem(product._id, selected.weight, qty);
    toast.success(`${qty} × ${product.name} (${selected.weight}) added to cart!`);
  };

  const handleBuyNow = async () => {
    if (!inStock) {
      toast.error('This pack is currently out of stock');
      return;
    }
    if (buying) return;
    setBuying(true);
    try {
      await addItem(product._id, selected.weight, qty);
      setCartOpen(false);
      router.push('/checkout');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Could not start checkout');
    } finally {
      setBuying(false);
    }
  };

  const handleWishlist = () => {
    const was = has(product._id);
    void toggleWishlist(product._id);
    toast.success(was ? 'Removed from wishlist' : 'Added to wishlist');
  };

  const stars = useMemo(() => Math.floor(product.rating || 0), [product.rating]);

  return (
    <div className="flex flex-col gap-6 font-sans">
      <div className="flex items-center gap-2 flex-wrap">
        {product.brand ? (
          <>
            <span className="text-xs text-muted-foreground uppercase tracking-widest font-semibold font-accent">
              {product.brand}
            </span>
            <span className="text-border/60">·</span>
          </>
        ) : null}
        <span className="text-xs text-muted-foreground uppercase tracking-widest font-semibold font-accent">
          <Link
            href={`/shop?cat=${encodeURIComponent(product.categorySlug)}`}
            className="hover:text-primary transition-colors"
          >
            {product.category}
          </Link>
        </span>
        {badgeLabel && (
          <span
            className={cn(
              'text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full',
              product.badge === 'best-seller'
                ? 'bg-crimson text-white'
                : product.badge === 'new'
                  ? 'bg-saffron text-white'
                  : 'bg-accent text-white',
            )}
          >
            {badgeLabel}
          </span>
        )}
      </div>

      <h1 className="font-display font-bold text-3xl md:text-4xl text-charcoal leading-tight">
        {product.name}
      </h1>

      {product.shortDescription ? (
        <p className="text-muted-foreground text-sm leading-relaxed">{product.shortDescription}</p>
      ) : null}

      {(product.rating > 0 || product.reviewCount > 0) && (
        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={14}
                className={cn(i < stars ? 'fill-saffron text-saffron' : 'text-border')}
                fill={i < stars ? 'currentColor' : 'none'}
              />
            ))}
          </div>
          <span className="font-bold text-charcoal">{product.rating}</span>
          <span className="text-muted-foreground">({product.reviewCount} reviews)</span>
        </div>
      )}

      <div className="flex items-center gap-3 border-y border-border/40 py-5">
        <span className="text-3xl font-bold text-primary font-display">₹{displayPrice}</span>
        {salePrice !== null && (
          <>
            <span className="text-base text-muted-foreground line-through font-sans">₹{mrp}</span>
            <span className="text-xs bg-green-100 text-green-700 font-bold px-2.5 py-1 rounded-full">
              {discountPercent}% OFF
            </span>
          </>
        )}
      </div>

      <AvailableCouponsStrip mode="product" />

      {weights.length > 1 && (
        <div className="flex flex-col gap-2">
          <p className="text-[10px] text-muted-foreground font-accent uppercase tracking-wider">
            Pack size
          </p>
          <div className="flex flex-wrap gap-2">
            {weights.map((w, i) => (
              <button
                key={`${w.weight}-${i}`}
                type="button"
                onClick={() => {
                  setSelectedIdx(i);
                  setQty(1);
                }}
                className={cn(
                  'px-3 py-2 rounded-xl text-xs font-semibold border transition-colors',
                  i === selectedIdx
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border text-muted-foreground hover:border-primary/40',
                  (w.stock ?? 0) <= 0 && 'opacity-50',
                )}
              >
                {w.weight}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center gap-3 bg-cream/60 border border-border/50 rounded-xl p-4">
        <Package size={16} className="text-primary flex-shrink-0" />
        <div>
          <p className="text-[10px] text-muted-foreground font-accent uppercase tracking-wider">Pack Size</p>
          <p className="font-bold text-sm text-charcoal font-sans mt-0.5">{selected.weight || '—'}</p>
        </div>
        <div className="ml-auto">
          <p className="text-[10px] text-muted-foreground font-accent uppercase tracking-wider">Status</p>
          <p className={cn('font-bold text-sm mt-0.5', inStock ? 'text-green-600' : 'text-destructive')}>
            {inStock ? 'In Stock' : 'Out of Stock'}
          </p>
        </div>
      </div>

      {inStock && (
        <div className="flex items-center gap-3">
          <div className="flex items-center border border-border rounded-xl bg-white select-none overflow-hidden">
            <button
              type="button"
              disabled={qty <= 1}
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              className="px-4 py-3 text-sm font-bold text-muted-foreground hover:text-charcoal hover:bg-muted outline-none disabled:opacity-30 transition-colors"
            >
              −
            </button>
            <span className="px-4 text-sm font-bold text-charcoal min-w-[40px] text-center">{qty}</span>
            <button
              type="button"
              disabled={qty >= maxQty}
              onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
              className="px-4 py-3 text-sm font-bold text-muted-foreground hover:text-charcoal hover:bg-muted outline-none disabled:opacity-30 transition-colors"
            >
              +
            </button>
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            className="flex-grow py-3.5 rounded-xl font-bold uppercase tracking-wider font-accent text-xs flex items-center justify-center gap-2 bg-primary text-white hover:bg-crimson-dark shadow-lg shadow-crimson/20 transition-all duration-200"
          >
            <ShoppingCart size={15} />
            Add to Cart
          </button>

          <button
            type="button"
            onClick={handleWishlist}
            className="p-3.5 border border-border rounded-xl text-muted-foreground hover:text-crimson hover:border-crimson/40 outline-none transition-colors"
            aria-label="Add to wishlist"
          >
            <Heart size={17} className={cn(wishlisted && 'fill-crimson text-crimson')} />
          </button>
        </div>
      )}

      {inStock && (
        <button
          type="button"
          onClick={() => void handleBuyNow()}
          disabled={buying}
          className="w-full py-3.5 rounded-xl font-bold uppercase tracking-wider font-accent text-xs flex items-center justify-center gap-2 border-2 border-primary text-primary hover:bg-primary hover:text-white transition-all duration-200 disabled:opacity-60"
        >
          {buying ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} />}
          {buying ? 'Redirecting…' : `Buy Now — ₹${displayPrice * qty}`}
        </button>
      )}

      {product.shelfLife ? (
        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/30 rounded-lg px-4 py-2.5">
          <Package size={13} className="flex-shrink-0" />
          <span>
            <strong>Shelf Life:</strong> {product.shelfLife}
          </span>
        </div>
      ) : null}
    </div>
  );
}
