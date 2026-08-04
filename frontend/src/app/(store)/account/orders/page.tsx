"use client";

export const dynamic = 'force-dynamic';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { ShoppingBag, Calendar, ArrowRight, Loader2, MapPinned, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import OrderTracker, {
  formatStatusLabel,
  statusBadgeClass,
} from '@/components/orders/OrderTracker';

export default function MyOrdersPage() {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['my-orders'],
    queryFn: async () => {
      const res = await api.get('/orders');
      return res.data;
    },
    refetchInterval: 20_000,
    refetchOnWindowFocus: true,
  });

  const orders = data?.data || [];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display font-bold text-2xl text-charcoal">My Orders</h1>
        <p className="text-muted-foreground text-xs mt-1">
          Track and manage your spice orders — status updates live from the store.
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : error ? (
        <div className="text-center p-8 border border-dashed rounded-2xl text-muted-foreground text-sm font-sans">
          Failed to load order history. Please try again.
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center p-12 border border-dashed rounded-2xl text-muted-foreground text-xs leading-normal font-sans bg-cream-dark/5 flex flex-col items-center gap-3">
          <ShoppingBag size={24} />
          <span>You haven&apos;t placed any orders yet.</span>
          <Link
            href="/shop"
            className="bg-primary text-white text-[10px] font-bold uppercase tracking-wider font-accent px-4 py-2 rounded-lg mt-1"
          >
            Shop Spices
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {orders.map((order: any) => {
            const open = expandedId === order._id;
            return (
              <div
                key={order._id}
                className="border border-border-spice/40 bg-white rounded-xl overflow-hidden font-sans text-xs hover:border-primary/45 transition-colors"
              >
                <div className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-charcoal">
                        Order #{order._id.substring(order._id.length - 8)}
                      </span>
                      <span className={statusBadgeClass(order.status)}>
                        {formatStatusLabel(order.status)}
                      </span>
                    </div>
                    <span className="text-muted-foreground flex items-center gap-1 mt-1">
                      <Calendar size={12} /> {new Date(order.createdAt).toLocaleDateString('en-IN')}
                    </span>
                    <span className="text-muted-foreground mt-0.5">
                      Items: {order.items.reduce((acc: number, curr: any) => acc + curr.qty, 0)} | Total:{' '}
                      <strong className="text-charcoal font-semibold">
                        ₹{order.total.toLocaleString('en-IN')}
                      </strong>
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
                    <button
                      type="button"
                      onClick={() => setExpandedId(open ? null : order._id)}
                      className="border border-primary/40 text-primary hover:bg-primary/5 text-[10px] font-bold uppercase tracking-wider font-accent py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 transition-colors outline-none"
                    >
                      <MapPinned size={12} /> Track Order
                      <ChevronDown size={12} className={open ? 'rotate-180 transition-transform' : ''} />
                    </button>
                    <Link
                      href={`/order/${order._id}#track`}
                      className="border border-border text-charcoal hover:bg-muted text-[10px] font-bold uppercase tracking-wider font-accent py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 transition-colors outline-none"
                    >
                      Details <ArrowRight size={12} />
                    </Link>
                  </div>
                </div>

                {open && (
                  <div className="px-4 pb-4 border-t border-border-spice/30 bg-cream/20">
                    <div className="pt-4">
                      <OrderTracker
                        compact
                        status={order.status}
                        timeline={order.timeline}
                        trackingNumber={order.trackingNumber}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
