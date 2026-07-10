"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { cn } from '@/lib/utils';
import { Star, ShoppingCart, Heart, X, ArrowRight } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { toast } from 'sonner';

interface QuickViewModalProps {
  product: {
    _id: string;
    name: string;
    slug: string;
    category: string;
    images: string[];
    weights: Array<{
      weight: string;
      price: number;
      mrp: number;
      stock: number;
    }>;
    badge?: string;
    rating: number;
    reviewCount: number;
    description: string;
  } | null;
  open: boolean;
  onClose: () => void;
}

export default function QuickViewModal({ product, open, onClose }: QuickViewModalProps) {
  const [selectedVariantIdx, setSelectedVariantIdx] = useState(0);
  const [qty, setQty] = useState(1);

  const { addItem } = useCartStore();
  const { toggleWishlist, has } = useWishlistStore();

  // Reset local state on product swap/open
  useEffect(() => {
    if (open) {
      setSelectedVariantIdx(0);
      setQty(1);
    }
  }, [product, open]);

  if (!product) return null;

  const variant = product.weights[selectedVariantIdx] || product.weights[0];
  const isWishlisted = has(product._id);

  const discountPercent = variant.mrp > variant.price 
    ? Math.round(((variant.mrp - variant.price) / variant.mrp) * 100) 
    : 0;

  const handleAddToCart = async () => {
    if (variant.stock <= 0) {
      toast.error("This variant is currently out of stock");
      return;
    }

    try {
      await addItem(product._id, variant.weight, qty);
      toast.success(`Added ${qty} × ${product.name} (${variant.weight}) to cart!`);
      onClose();
    } catch {
      toast.error("Failed to add items to cart");
    }
  };

  const handleWishlistToggle = () => {
    toggleWishlist(product._id);
    toast.success(isWishlisted ? "Removed from wishlist" : "Added to wishlist");
  };

  return (
    <Dialog open={open} onOpenChange={(val) => { if (!val) onClose(); }}>
      <DialogContent className="max-w-3xl w-full p-0 bg-white border border-border-spice rounded-2xl overflow-hidden font-sans">
        
        {/* Custom close button because shadcn Dialog has its own, but we want it stylized */}
        <div className="grid grid-cols-1 md:grid-cols-12 items-stretch min-h-[400px]">
          
          {/* Left Visual Column */}
          <div className="md:col-span-6 relative aspect-square md:aspect-auto w-full bg-cream-dark/10">
            <Image
              src={product.images[0] || '/hero_spices.png'}
              alt={product.name}
              fill
              className="object-cover"
            />
            {product.badge && (
              <span className="absolute top-4 left-4 bg-primary text-white text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">
                {product.badge}
              </span>
            )}
          </div>

          {/* Right Info Details Column */}
          <div className="md:col-span-6 p-6 flex flex-col gap-4 relative justify-center">
            
            {/* Title Block */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold font-accent">
                {product.category.replace('-', ' ')}
              </span>
              <h2 className="font-display font-bold text-xl text-charcoal">
                {product.name}
              </h2>
            </div>

            {/* Ratings */}
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={12}
                    className={cn(
                      "text-border-spice",
                      i < Math.round(product.rating) && "fill-turmeric text-turmeric"
                    )}
                  />
                ))}
              </div>
              <span>({product.reviewCount})</span>
            </div>

            {/* Condensed Description */}
            <p className="text-slate text-xs leading-relaxed line-clamp-3">
              {product.description}
            </p>

            {/* Price Line */}
            <div className="flex items-baseline gap-2 border-y border-border-spice/40 py-2.5 my-1">
              <span className="text-lg font-bold text-primary">₹{variant.price}</span>
              {variant.mrp > variant.price && (
                <>
                  <span className="text-xs text-muted-foreground line-through">₹{variant.mrp}</span>
                  <span className="text-[9px] bg-accent text-white font-bold px-1.5 py-0.5 rounded-md">
                    {discountPercent}% OFF
                  </span>
                </>
              )}
            </div>

            {/* Variant selections */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Weight Variant</span>
              <div className="flex flex-wrap gap-1.5">
                {product.weights.map((w, idx) => (
                  <button
                    key={w.weight}
                    onClick={() => {
                      setSelectedVariantIdx(idx);
                      setQty(1);
                    }}
                    className={cn(
                      "text-[10px] font-semibold px-3 py-1.5 border rounded-lg transition-all duration-200 outline-none",
                      selectedVariantIdx === idx
                        ? "bg-primary border-primary text-white"
                        : "bg-white border-border text-muted-foreground hover:bg-muted"
                    )}
                  >
                    {w.weight}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity select & actions */}
            <div className="flex items-center gap-3 mt-2">
              {variant.stock > 0 && (
                <div className="flex items-center border border-border rounded-lg bg-white select-none shrink-0">
                  <button
                    disabled={qty <= 1}
                    onClick={() => setQty(qty - 1)}
                    className="px-2.5 py-1 text-xs font-semibold text-muted-foreground hover:text-charcoal outline-none disabled:opacity-30"
                  >
                    -
                  </button>
                  <span className="px-2 text-[10px] font-bold text-charcoal">{qty}</span>
                  <button
                    disabled={qty >= variant.stock}
                    onClick={() => setQty(qty + 1)}
                    className="px-2.5 py-1 text-xs font-semibold text-muted-foreground hover:text-charcoal outline-none disabled:opacity-30"
                  >
                    +
                  </button>
                </div>
              )}

              <button
                onClick={handleAddToCart}
                disabled={variant.stock <= 0}
                className={cn(
                  "flex-grow py-2.5 rounded-lg font-semibold uppercase tracking-wider font-accent text-[10px] flex items-center justify-center gap-1.5 transition-all outline-none",
                  variant.stock > 0
                    ? "bg-primary text-white hover:bg-crimson-dark"
                    : "bg-muted text-muted-foreground cursor-not-allowed"
                )}
              >
                <ShoppingCart size={12} />
                {variant.stock > 0 ? "Add to Cart" : "Out of stock"}
              </button>

              <button
                onClick={handleWishlistToggle}
                className="p-2.5 border border-border rounded-lg text-muted-foreground hover:text-primary outline-none transition-colors shrink-0"
                aria-label="Wishlist toggle"
              >
                <Heart size={14} className={cn(isWishlisted && "fill-primary text-primary")} />
              </button>
            </div>

            {/* Link to Full details */}
            <Link
              href={`/products/${product.slug}`}
              onClick={onClose}
              className="text-[10px] font-semibold uppercase tracking-wider font-accent text-primary hover:underline flex items-center gap-1 mt-2 self-start"
            >
              View Full Details <ArrowRight size={12} />
            </Link>

          </div>

        </div>

      </DialogContent>
    </Dialog>
  );
}
