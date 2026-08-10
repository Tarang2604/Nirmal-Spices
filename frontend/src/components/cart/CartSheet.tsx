"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cartStore';
import { useUIStore } from '@/store/uiStore';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';
import { getSafeImageUrl, imageLoader } from '@/lib/imageUrl';
import { 
  X, 
  Trash2, 
  ShoppingBag, 
  ArrowRight, 
  Tag, 
  Percent, 
  Truck,
  Loader2
} from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { toast } from 'sonner';
import AvailableCouponsStrip from '@/components/coupons/AvailableCouponsStrip';
import { useQuery } from '@tanstack/react-query';

export default function CartSheet() {
  const router = useRouter();
  const { cartOpen, setCartOpen } = useUIStore();
  const { isLoggedIn } = useAuthStore();
  const { 
    items, 
    updateQty, 
    removeItem, 
    clearCart,
    coupon,
    applyCoupon,
    removeCoupon
  } = useCartStore();

  const [couponCode, setCouponCode] = useState('');
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  // Calculate pricing subtotal
  const subtotal = items.reduce((acc, item) => {
    const variant = item.product?.weights?.find(w => w.weight === item.weight);
    const itemPrice = variant ? variant.price : 0;
    return acc + itemPrice * item.qty;
  }, 0);

  const feeBase = Math.max(0, subtotal - (coupon?.discount || 0));
  const { data: feePreview } = useQuery({
    queryKey: ['checkout-fees', feeBase],
    queryFn: async () => {
      const res = await api.get(`/settings/fees?amount=${feeBase}`);
      return res.data.data as {
        shipping: number;
        freeDeliveryMin: number;
        deliveryCharge: number;
      };
    },
    enabled: items.length > 0,
    staleTime: 30_000,
  });

  const FREE_SHIPPING_LIMIT = feePreview?.freeDeliveryMin ?? 499;
  const shipping = feePreview?.shipping ?? (subtotal >= FREE_SHIPPING_LIMIT ? 0 : 40);
  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_LIMIT - feeBase);
  const progressPercent = FREE_SHIPPING_LIMIT > 0
    ? Math.min(100, (feeBase / FREE_SHIPPING_LIMIT) * 100)
    : 100;

  // Auto-fetch coupon validation on subtotal change
  useEffect(() => {
    if (coupon && subtotal < coupon.discount) {
      removeCoupon();
    }
  }, [subtotal]);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    if (!isLoggedIn) {
      toast.error("Please log in to apply discount coupons");
      return;
    }

    setValidatingCoupon(true);
    try {
      const res = await api.post('/coupons/validate', {
        code: couponCode.toUpperCase(),
        cartAmount: subtotal
      });
      const data = res.data.data;
      applyCoupon(data.code, data.discount, data.value, data.type);
      toast.success(`Coupon '${data.code}' applied! You saved ₹${data.discount}.`);
      setCouponCode('');
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Invalid coupon code");
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleCheckoutRedirect = () => {
    setCartOpen(false);
    router.push('/checkout');
  };

  return (
    <Sheet open={cartOpen} onOpenChange={setCartOpen}>
      <SheetContent side="right" className="w-full sm:max-w-md p-0 bg-white flex flex-col h-full border-l border-border-spice font-sans">
        
        {/* Header */}
        <SheetHeader className="p-6 border-b border-border-spice shrink-0 flex flex-row items-center justify-between">
          <SheetTitle className="font-display font-bold text-lg text-charcoal flex items-center gap-2">
            <ShoppingBag size={20} className="text-primary" /> Shopping Cart
          </SheetTitle>
        </SheetHeader>

        {/* Dynamic Cart Body */}
        {items.length === 0 ? (
          <div className="flex-grow flex flex-col items-center justify-center p-8 gap-4 text-center">
            <div className="bg-cream p-4 rounded-full text-muted-foreground">
              <ShoppingBag size={32} />
            </div>
            <h3 className="font-bold text-sm text-charcoal">Your cart is empty</h3>
            <p className="text-xs text-muted-foreground max-w-[250px] leading-normal">
              Looks like you haven&apos;t added any spices to your harvest cart yet.
            </p>
            <button
              onClick={() => {
                setCartOpen(false);
                router.push('/shop');
              }}
              className="bg-primary hover:bg-crimson-dark text-white text-xs font-semibold font-accent uppercase tracking-wider px-6 py-3 rounded-full mt-2 transition-colors"
            >
              Shop Spices
            </button>
          </div>
        ) : (
          <>
            {/* Free Shipping Alert Banner */}
            <div className="bg-cream/45 border-b border-border-spice/40 p-4 shrink-0 font-sans text-xs">
              <div className="flex items-center gap-2 text-charcoal mb-2 font-medium">
                <Truck size={14} className="text-primary animate-bounce" />
                {remainingForFreeShipping > 0 ? (
                  <span>
                    Add <strong className="text-primary">₹{remainingForFreeShipping}</strong> more for <strong>FREE Shipping!</strong>
                  </span>
                ) : (
                  <span className="text-green-600 font-bold">🎉 You qualify for FREE Shipping!</span>
                )}
              </div>
              <div className="w-full h-1.5 bg-border-spice/40 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Scrollable list items */}
            <div className="flex-grow overflow-y-auto p-6 flex flex-col gap-4">
              {items.map((item) => {
                const variant = item.product?.weights?.find(w => w.weight === item.weight);
                const itemPrice = variant ? variant.price : 0;
                
                return (
                  <div key={`${item.product?._id}-${item.weight}`} className="flex gap-4 pb-4 border-b border-border-spice/40 items-start">
                    
                    {/* Thumbnail */}
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-cream border border-border-spice/40 shrink-0">
                      <Image
                        src={getSafeImageUrl(item.product?.images?.[0])}
                        alt={item.product?.name || 'Spice item'}
                        fill
                        loader={imageLoader}
                        sizes="64px"
                        className="object-cover"
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-grow flex flex-col gap-1">
                      <h4 className="font-bold text-xs text-charcoal leading-tight">
                        {item.product?.name}
                      </h4>
                      <span className="text-[10px] text-muted-foreground font-semibold">
                        {item.weight}
                      </span>
                      
                      {/* Qty controls */}
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex items-center border border-border rounded-lg bg-white select-none">
                          <button
                            disabled={item.qty <= 1}
                            onClick={() => updateQty(item.product?._id, item.weight, item.qty - 1)}
                            className="px-2 py-0.5 text-xs font-semibold text-muted-foreground hover:text-charcoal disabled:opacity-30"
                          >
                            -
                          </button>
                          <span className="px-2 text-[10px] font-bold text-charcoal">{item.qty}</span>
                          <button
                            disabled={item.qty >= (variant?.stock || 50)}
                            onClick={() => updateQty(item.product?._id, item.weight, item.qty + 1)}
                            className="px-2 py-0.5 text-xs font-semibold text-muted-foreground hover:text-charcoal disabled:opacity-30"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Price and delete */}
                    <div className="flex flex-col items-end gap-3 shrink-0">
                      <span className="text-xs font-bold text-charcoal">
                        ₹{(itemPrice * item.qty).toLocaleString('en-IN')}
                      </span>
                      <button
                        onClick={() => removeItem(item.product?._id, item.weight)}
                        className="text-muted-foreground hover:text-destructive p-1"
                        aria-label="Remove item"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>

            {/* Footer Summary & Coupons */}
            <div className="p-6 bg-cream/25 border-t border-border-spice shrink-0 flex flex-col gap-4 font-sans text-xs">
              
              {/* Applied Coupon view */}
              {coupon ? (
                <div className="flex items-center justify-between bg-green-50 text-green-700 p-2.5 rounded-lg border border-green-200">
                  <span className="flex items-center gap-1.5 font-semibold">
                    <Tag size={14} /> {coupon.code} Applied
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold">-₹{coupon.discount}</span>
                    <button 
                      onClick={removeCoupon}
                      className="text-green-700 hover:text-destructive font-bold outline-none"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <AvailableCouponsStrip
                    mode="pick"
                    compact
                    selectedCode={undefined}
                    onSelect={(code) => {
                      setCouponCode(code);
                      void (async () => {
                        if (!isLoggedIn) {
                          toast.error('Please log in to apply discount coupons');
                          return;
                        }
                        setValidatingCoupon(true);
                        try {
                          const res = await api.post('/coupons/validate', {
                            code: code.toUpperCase(),
                            cartAmount: subtotal,
                          });
                          const data = res.data.data;
                          applyCoupon(data.code, data.discount, data.value, data.type);
                          toast.success(`Coupon '${data.code}' applied! You saved ₹${data.discount}.`);
                          setCouponCode('');
                        } catch (err: any) {
                          toast.error(err.response?.data?.message || 'Invalid coupon code');
                        } finally {
                          setValidatingCoupon(false);
                        }
                      })();
                    }}
                  />
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Coupon code..."
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="flex-grow bg-white border border-border rounded-lg px-3 py-2 text-xs outline-none focus:border-primary uppercase"
                    />
                    <button
                      type="submit"
                      disabled={validatingCoupon || !couponCode.trim()}
                      className="bg-secondary hover:bg-primary hover:text-white text-primary text-xs font-semibold font-accent uppercase tracking-wider px-4 py-2 rounded-lg outline-none transition-colors disabled:opacity-50"
                    >
                      {validatingCoupon ? <Loader2 className="w-4 h-4 animate-spin" /> : "Apply"}
                    </button>
                  </form>
                </div>
              )}

              {/* Subtotal lines */}
              <div className="flex flex-col gap-2 mt-2">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span className="font-semibold text-charcoal">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                {coupon && (
                  <div className="flex items-center justify-between text-green-600">
                    <span>Discount ({coupon.code})</span>
                    <span>-₹{coupon.discount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? "FREE" : `₹${shipping}`}</span>
                </div>
                <div className="flex items-center justify-between text-sm font-bold text-charcoal border-t border-border-spice/40 pt-3 mt-1">
                  <span>Estimated Total</span>
                  <span className="text-primary text-base">
                    ₹{(subtotal - (coupon?.discount || 0) + shipping).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Checkout CTA */}
              <button
                onClick={handleCheckoutRedirect}
                className="w-full bg-primary hover:bg-crimson-dark text-white font-semibold font-accent uppercase tracking-wider py-4 rounded-xl flex items-center justify-center gap-2 mt-2 shadow-lg shadow-crimson/15 outline-none transition-all"
              >
                Proceed to Checkout
                <ArrowRight size={14} />
              </button>

            </div>
          </>
        )}

      </SheetContent>
    </Sheet>
  );
}
