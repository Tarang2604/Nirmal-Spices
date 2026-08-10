"use client";

import React, { useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import {
  CheckCircle,
  MapPin,
  CreditCard,
  ShoppingBag,
  Loader2,
  ChevronRight,
  MapPinned,
  Star,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import OrderTracker, { formatStatusLabel, statusBadgeClass } from '@/components/orders/OrderTracker';

export default function OrderConfirmationPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = params.id as string;
  const guestEmail = searchParams.get('email') || undefined;

  const { data: order, isLoading, error, refetch } = useQuery({
    queryKey: ['order-detail', orderId, guestEmail],
    queryFn: async () => {
      const res = await api.get(`/orders/${orderId}`, {
        params: guestEmail ? { email: guestEmail } : undefined,
      });
      return res.data.data;
    },
    refetchInterval: 15_000,
    refetchOnWindowFocus: true,
  });

  const { data: publicSettings } = useQuery({
    queryKey: ['public-settings'],
    queryFn: async () => {
      const res = await api.get('/settings/public');
      return res.data.data as { googleReviewUrl: string | null };
    },
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.location.hash === '#track') {
      document.getElementById('track')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [order]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 font-sans text-muted-foreground">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <span className="text-xs uppercase tracking-widest font-semibold font-accent">
          Loading Order Details...
        </span>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 font-sans text-center px-4">
        <h2 className="font-display font-bold text-xl text-charcoal">Order not found</h2>
        <p className="text-muted-foreground text-xs max-w-xs leading-normal">
          We couldn&apos;t retrieve details for order ID #{orderId}. If you just placed it, please wait a
          moment.
        </p>
        <button
          onClick={() => router.push('/')}
          className="bg-primary text-white text-xs font-semibold font-accent uppercase tracking-wider px-6 py-3 rounded-full mt-2"
        >
          Return Home
        </button>
      </div>
    );
  }

  const showTrack =
    order.paymentStatus === 'paid' ||
    ['confirmed', 'processing', 'dispatched', 'out-for-delivery', 'delivered'].includes(order.status);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-16 font-sans">
      <div className="flex flex-col items-center text-center gap-3 mb-10">
        <div className="bg-green-100 p-3.5 rounded-full text-green-600 mb-2">
          <CheckCircle size={36} />
        </div>
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-charcoal leading-tight">
          {order.status === 'delivered' ? 'Order delivered!' : 'Thank you for your order!'}
        </h1>
        <p className="text-xs text-muted-foreground max-w-sm leading-normal">
          Order <strong className="text-charcoal font-semibold">#{order._id}</strong>
          {' · '}
          <span className={statusBadgeClass(order.status)}>{formatStatusLabel(order.status)}</span>
        </p>

        {showTrack && (
          <a
            href="#track"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById('track')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}
            className="mt-2 inline-flex items-center gap-2 bg-primary text-white text-[11px] font-bold uppercase tracking-wider font-accent px-5 py-2.5 rounded-full hover:bg-crimson-dark transition-colors"
          >
            <MapPinned size={14} /> Track Order
          </a>
        )}

        {/* Only invite a public review after a good outcome (delivered) — never on cancelled/refunded */}
        {order.status === 'delivered' && publicSettings?.googleReviewUrl && (
          <a
            href={publicSettings.googleReviewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 inline-flex items-center gap-2 border border-primary text-primary text-[11px] font-bold uppercase tracking-wider font-accent px-5 py-2.5 rounded-full hover:bg-primary hover:text-white transition-colors"
          >
            <Star size={14} /> Leave us a Google Review
          </a>
        )}

        <button
          type="button"
          onClick={() => void refetch()}
          className="text-[10px] text-muted-foreground hover:text-primary underline"
        >
          Refresh status
        </button>
      </div>

      <div className="mb-8">
        <OrderTracker
          status={order.status}
          timeline={order.timeline}
          trackingNumber={order.trackingNumber}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        <div className="flex flex-col gap-6">
          <div className="bg-white border border-border-spice/40 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
            <h3 className="font-bold text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <ShoppingBag size={14} className="text-primary" /> Items Ordered
            </h3>
            <div className="flex flex-col gap-3">
              {order.items.map((item: any, idx: number) => (
                <div key={idx} className="flex justify-between items-center gap-4 text-xs font-sans">
                  <div className="flex flex-col">
                    <strong className="text-charcoal font-bold">{item.name}</strong>
                    <span className="text-[10px] text-muted-foreground font-semibold">
                      {item.weight} × {item.qty}
                    </span>
                  </div>
                  <span className="font-bold text-charcoal">
                    ₹{(item.price * item.qty).toLocaleString('en-IN')}
                  </span>
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
                <span>{order.shipping === 0 ? 'FREE' : `₹${order.shipping}`}</span>
              </div>
              {(order.commission ?? 0) > 0 && (
                <div className="flex justify-between">
                  <span>Commission</span>
                  <span>₹{order.commission.toLocaleString('en-IN')}</span>
                </div>
              )}
              {(order.platformFee ?? 0) > 0 && (
                <div className="flex justify-between">
                  <span>Platform Fee</span>
                  <span>₹{order.platformFee.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-bold text-charcoal border-t border-border-spice/40 pt-3 mt-1">
                <span>Total</span>
                <span className="text-primary">₹{order.total.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="bg-white border border-border-spice/40 rounded-2xl p-6 shadow-sm flex flex-col gap-5 text-xs font-sans text-charcoal">
            <div>
              <h3 className="font-bold text-muted-foreground mb-2.5 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                <MapPin size={12} className="text-primary" /> Delivery Destination
              </h3>
              <div className="flex flex-col leading-normal">
                <strong className="text-sm font-semibold">{order.address.fullName}</strong>
                <span>
                  {order.address.line1}
                  {order.address.line2 ? `, ${order.address.line2}` : ''}
                </span>
                <span>
                  {order.address.city}, {order.address.state} - {order.address.pincode}
                </span>
                <span className="font-medium mt-1">📞 {order.address.phone}</span>
              </div>
            </div>

            <div className="border-t border-border-spice/40 pt-5">
              <h3 className="font-bold text-muted-foreground mb-2.5 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                <CreditCard size={12} className="text-primary" /> Payment Summary
              </h3>
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between">
                  <span>Method</span>
                  <span className="capitalize font-semibold">
                    {order.paymentMethod === 'razorpay' ? 'UPI / Card Online' : order.paymentMethod}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Status</span>
                  <span
                    className={cn(
                      'font-bold uppercase text-[10px] px-2 py-0.5 rounded-full shrink-0',
                      order.paymentStatus === 'paid' &&
                        'bg-green-50 text-green-700 border border-green-200',
                      order.paymentStatus === 'pending' &&
                        'bg-yellow-50 text-yellow-700 border border-yellow-200',
                      order.paymentStatus === 'failed' &&
                        'bg-red-50 text-red-700 border border-red-200',
                    )}
                  >
                    {order.paymentStatus}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Link
              href="/account/orders"
              className="w-full border border-border text-charcoal hover:bg-muted font-semibold font-accent uppercase tracking-wider py-3.5 rounded-xl flex items-center justify-center gap-2 text-xs transition-all"
            >
              My Orders
            </Link>
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
    </div>
  );
}
