"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';
import { 
  CheckCircle, 
  MapPin, 
  CreditCard, 
  Truck, 
  ShoppingBag, 
  Loader2,
  ChevronRight,
  XCircle,
  PhoneCall
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function OrderConfirmationPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;
  const { isLoggedIn } = useAuthStore();

  // For guest orders we read stored email/phone from localStorage
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');

  useEffect(() => {
    if (!isLoggedIn) {
      setGuestEmail(localStorage.getItem('nirmal_guest_email') || '');
      setGuestPhone(localStorage.getItem('nirmal_guest_phone') || '');
    }
  }, [isLoggedIn]);

  // Query: authenticated users use /orders/:id, guests use /orders/guest/:id
  const { data: order, isLoading, error } = useQuery({
    queryKey: ['order-confirmation', orderId, isLoggedIn, guestEmail, guestPhone],
    queryFn: async () => {
      if (isLoggedIn) {
        const res = await api.get(`/orders/${orderId}`);
        return res.data.data;
      }
      // Guest fallback — verify via stored email or phone
      const params = new URLSearchParams();
      if (guestEmail) params.set('email', guestEmail);
      else if (guestPhone) params.set('phone', guestPhone);
      const res = await api.get(`/orders/guest/${orderId}?${params.toString()}`);
      return res.data.data;
    },
    enabled: isLoggedIn || !!guestEmail || !!guestPhone,
    retry: 1,
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 font-sans text-muted-foreground">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <span className="text-xs uppercase tracking-widest font-semibold font-accent">Loading Order Details...</span>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 font-sans text-center px-4">
        <div className="bg-red-50 p-4 rounded-full text-red-500 mb-2">
          <XCircle size={36} />
        </div>
        <h2 className="font-display font-bold text-xl text-charcoal">Order not found</h2>
        <p className="text-muted-foreground text-xs max-w-xs leading-normal">
          We couldn&apos;t retrieve details for order ID #{orderId}. If you just placed it, please wait a moment or contact support.
        </p>
        <div className="flex gap-3 mt-2 flex-wrap justify-center">
          <button
            onClick={() => router.push('/')}
            className="bg-primary text-white text-xs font-semibold font-accent uppercase tracking-wider px-6 py-3 rounded-full"
          >
            Return Home
          </button>
          <a
            href="tel:+919770057005"
            className="border border-primary text-primary text-xs font-semibold font-accent uppercase tracking-wider px-6 py-3 rounded-full flex items-center gap-2"
          >
            <PhoneCall size={12} /> Call Support
          </a>
        </div>
      </div>
    );
  }

  const timelineSteps = [
    { value: 'pending', label: 'Ordered' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'dispatched', label: 'Dispatched' },
    { value: 'delivered', label: 'Delivered' },
  ];

  // Calculate current active step index in timeline
  const getCurrentStepIndex = () => {
    const current = order.status;
    if (current === 'cancelled' || current === 'payment-failed') return -1;
    if (current === 'pending') return 0;
    if (current === 'confirmed' || current === 'processing') return 1;
    if (current === 'dispatched' || current === 'out-for-delivery') return 2;
    if (current === 'delivered') return 3;
    return 1;
  };

  const activeStepIdx = getCurrentStepIndex();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-16 font-sans">
      
      {/* Success banner */}
      <div className="flex flex-col items-center text-center gap-3 mb-10">
        <div className="bg-green-100 p-3.5 rounded-full text-green-600 mb-2">
          <CheckCircle size={36} className="animate-pulse" />
        </div>
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-charcoal leading-tight">
          Thank you for your order!
        </h1>
        <p className="text-xs text-muted-foreground max-w-sm leading-normal">
          Your order <strong className="text-charcoal font-semibold">#{order._id}</strong> has been successfully registered. A confirmation receipt was emailed to you.
        </p>
      </div>

      {/* Progress Timeline bar */}
      <div className="bg-white border border-border-spice/40 rounded-2xl p-6 mb-8 shadow-sm flex flex-col gap-6">
        <h3 className="font-bold text-xs uppercase tracking-wider text-muted-foreground">Order Status</h3>
        
        {order.status === 'cancelled' ? (
          <div className="bg-red-50 text-red-700 border border-red-200 p-3 rounded-xl text-center text-xs font-semibold">
            🚫 This order has been cancelled and stocks returned. Refund (if online payment) is processing.
          </div>
        ) : (
          <div className="flex items-center justify-between relative select-none">
            {timelineSteps.map((stepItem, idx) => {
              const isActive = activeStepIdx === idx;
              const isDone = activeStepIdx > idx;

              return (
                <div key={stepItem.value} className="flex flex-col items-center gap-2 relative z-10 flex-1">
                  <span 
                    className={cn(
                      "w-6 h-6 flex items-center justify-center rounded-full text-[10px] font-bold border transition-colors",
                      isActive && "bg-primary border-primary text-white scale-110",
                      isDone && "bg-green-600 border-green-600 text-white",
                      !isActive && !isDone && "bg-white border-border text-muted-foreground"
                    )}
                  >
                    {isDone ? "✓" : idx + 1}
                  </span>
                  <span className={cn(
                    "text-[10px] font-bold uppercase tracking-wider font-accent",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}>
                    {stepItem.label}
                  </span>
                </div>
              );
            })}
            {/* Background line */}
            <div className="absolute top-3 left-[12%] right-[12%] h-0.5 bg-border-spice/40 -z-0" />
          </div>
        )}

        {/* Tracking number details */}
        {order.trackingNumber && (
          <div className="bg-cream/40 border border-border-spice/55 p-3 rounded-xl flex items-center justify-between text-xs mt-2">
            <span className="flex items-center gap-1.5"><Truck size={14} className="text-primary" /> Tracking Courier Number:</span>
            <strong className="text-charcoal font-semibold">{order.trackingNumber}</strong>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        
        {/* Left Card Details */}
        <div className="flex flex-col gap-6">
          
          {/* Items Bought list */}
          <div className="bg-white border border-border-spice/40 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
            <h3 className="font-bold text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <ShoppingBag size={14} className="text-primary" /> Items Ordered
            </h3>
            <div className="flex flex-col gap-3">
              {order.items.map((item: any, idx: number) => (
                <div key={idx} className="flex justify-between items-center gap-4 text-xs font-sans">
                  <div className="flex flex-col">
                    <strong className="text-charcoal font-bold">{item.name}</strong>
                    <span className="text-[10px] text-muted-foreground font-semibold">{item.weight} × {item.qty}</span>
                  </div>
                  <span className="font-bold text-charcoal">₹{(item.price * item.qty).toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-border-spice/40 pt-4 flex flex-col gap-2 text-xs text-muted-foreground font-sans">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{order.subtotal.toLocaleString('en-IN')}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-green-600 font-semibold">
                  <span>Discount</span>
                  <span>-₹{order.discount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{order.shipping === 0 ? "FREE" : `₹${order.shipping}`}</span>
              </div>
              {order.codCharge > 0 && (
                <div className="flex justify-between">
                  <span>COD Charge</span>
                  <span>₹20</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-bold text-charcoal border-t border-border-spice/40 pt-3 mt-1">
                <span>Total Amount Paid</span>
                <span className="text-primary">₹{order.total.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Right Card Details */}
        <div className="flex flex-col gap-6">
          
          {/* Destination & Payment info */}
          <div className="bg-white border border-border-spice/40 rounded-2xl p-6 shadow-sm flex flex-col gap-5 text-xs font-sans text-charcoal">
            
            {/* Delivery address */}
            <div>
              <h3 className="font-bold text-muted-foreground mb-2.5 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                <MapPin size={12} className="text-primary" /> Delivery Destination
              </h3>
              <div className="flex flex-col leading-normal">
                <strong className="text-sm font-semibold">{order.address.fullName}</strong>
                <span>{order.address.line1}, {order.address.line2}</span>
                <span>{order.address.city}, {order.address.state} - {order.address.pincode}</span>
                <span className="font-medium mt-1">📞 {order.address.phone}</span>
              </div>
            </div>

            {/* Payment details */}
            <div className="border-t border-border-spice/40 pt-5">
              <h3 className="font-bold text-muted-foreground mb-2.5 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                <CreditCard size={12} className="text-primary" /> Payment Summary
              </h3>
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between">
                  <span>Method</span>
                  <span className="capitalize font-semibold">{order.paymentMethod === 'razorpay' ? "UPI / Card Online Payment" : "Cash on Delivery (COD)"}</span>
                </div>
                <div className="flex justify-between">
                  <span>Status</span>
                  <span className={cn(
                    "font-bold uppercase text-[10px] px-2 py-0.5 rounded-full shrink-0",
                    order.paymentStatus === 'paid' && "bg-green-50 text-green-700 border border-green-200",
                    order.paymentStatus === 'pending' && "bg-yellow-50 text-yellow-700 border border-yellow-200",
                    order.paymentStatus === 'failed' && "bg-red-50 text-red-700 border border-red-200"
                  )}>
                    {order.paymentStatus}
                  </span>
                </div>
              </div>
            </div>

          </div>

          <Link
            href="/shop"
            className="w-full bg-primary hover:bg-crimson-dark text-white font-semibold font-accent uppercase tracking-wider py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-crimson/15 transition-all outline-none"
          >
            Continue Shopping
            <ChevronRight size={14} />
          </Link>

        </div>

      </div>
    </div>
  );
}
