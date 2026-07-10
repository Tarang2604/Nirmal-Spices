"use client";

export const dynamic = 'force-dynamic';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { ShoppingBag, Eye, Calendar, ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function MyOrdersPage() {
  // Query orders
  const { data, isLoading, error } = useQuery({
    queryKey: ['my-orders'],
    queryFn: async () => {
      const res = await api.get('/orders');
      return res.data;
    },
  });

  const orders = data?.data || [];

  return (
    <div className="flex flex-col gap-6">
      
      {/* Title */}
      <div>
        <h1 className="font-display font-bold text-2xl text-charcoal">My Orders</h1>
        <p className="text-muted-foreground text-xs mt-1">Track and manage your spice orders history.</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>
      ) : error ? (
        <div className="text-center p-8 border border-dashed rounded-2xl text-muted-foreground text-sm font-sans">
          Failed to load order history. Please try again.
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center p-12 border border-dashed rounded-2xl text-muted-foreground text-xs leading-normal font-sans bg-cream-dark/5 flex flex-col items-center gap-3">
          <ShoppingBag size={24} />
          <span>You haven&apos;t placed any orders yet.</span>
          <Link href="/shop" className="bg-primary text-white text-[10px] font-bold uppercase tracking-wider font-accent px-4 py-2 rounded-lg mt-1">
            Shop Spices
          </Link>
        </div>
      ) : (
        /* Orders list cards */
        <div className="flex flex-col gap-4">
          {orders.map((order: any) => (
            <div 
              key={order._id} 
              className="border border-border-spice/40 bg-white rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 font-sans text-xs hover:border-primary/45 transition-colors"
            >
              
              {/* Order Info */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-charcoal">Order #{order._id.substring(order._id.length - 8)}</span>
                  <span className={cn(
                    "text-[9px] font-bold uppercase px-2 py-0.5 rounded-full shrink-0",
                    order.status === 'delivered' && "bg-green-50 text-green-700 border border-green-200",
                    order.status === 'pending' && "bg-yellow-50 text-yellow-700 border border-yellow-200",
                    order.status === 'cancelled' && "bg-red-50 text-red-700 border border-red-200",
                    order.status === 'confirmed' && "bg-blue-50 text-blue-700 border border-blue-200",
                    order.status === 'processing' && "bg-indigo-50 text-indigo-700 border border-indigo-200",
                    order.status === 'dispatched' && "bg-purple-50 text-purple-700 border border-purple-200"
                  )}>
                    {order.status}
                  </span>
                </div>
                <span className="text-muted-foreground flex items-center gap-1 mt-1">
                  <Calendar size={12} /> {new Date(order.createdAt).toLocaleDateString()}
                </span>
                <span className="text-muted-foreground mt-0.5">
                  Items: {order.items.reduce((acc: number, curr: any) => acc + curr.qty, 0)} | Total: <strong className="text-charcoal font-semibold">₹{order.total.toLocaleString('en-IN')}</strong>
                </span>
              </div>

              {/* View actions */}
              <Link
                href={`/order/${order._id}`}
                className="border border-border text-charcoal hover:bg-muted text-[10px] font-bold uppercase tracking-wider font-accent py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 self-start sm:self-auto transition-colors outline-none"
              >
                Track Order <ArrowRight size={12} />
              </Link>

            </div>
          ))}
        </div>
      )}

    </div>
  );
}

