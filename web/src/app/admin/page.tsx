"use client";

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { 
  TrendingUp, 
  ShoppingBag, 
  Users, 
  AlertTriangle, 
  Loader2,
  DollarSign
} from 'lucide-react';

export default function AdminDashboardPage() {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const res = await api.get('/admin/dashboard');
      return res.data.data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="text-center p-8 border border-dashed rounded-xl text-muted-foreground text-sm font-sans">
        Failed to load dashboard statistics. Check connection.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 font-sans">
      
      {/* Title */}
      <div>
        <h1 className="font-display font-bold text-2xl text-charcoal">Overview</h1>
        <p className="text-muted-foreground text-xs mt-1">Real-time business performance metrics for Nirmal&apos;s Spices.</p>
      </div>

      {/* Grid of basic stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Total Sales */}
        <div className="bg-white p-6 rounded-2xl border border-border-spice/40 shadow-sm flex items-center gap-4">
          <div className="bg-green-100 p-3 rounded-full text-green-700">
            <DollarSign size={20} />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Total Sales</span>
            <strong className="text-lg font-bold text-charcoal mt-0.5">₹{stats.totalSales.toLocaleString('en-IN')}</strong>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white p-6 rounded-2xl border border-border-spice/40 shadow-sm flex items-center gap-4">
          <div className="bg-blue-100 p-3 rounded-full text-blue-700">
            <ShoppingBag size={20} />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Total Orders</span>
            <strong className="text-lg font-bold text-charcoal mt-0.5">{stats.totalOrders}</strong>
          </div>
        </div>

        {/* Total Users */}
        <div className="bg-white p-6 rounded-2xl border border-border-spice/40 shadow-sm flex items-center gap-4">
          <div className="bg-purple-100 p-3 rounded-full text-purple-700">
            <Users size={20} />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Active Customers</span>
            <strong className="text-lg font-bold text-charcoal mt-0.5">{stats.totalUsers}</strong>
          </div>
        </div>

        {/* Low Stock Alerts count */}
        <div className="bg-white p-6 rounded-2xl border border-border-spice/40 shadow-sm flex items-center gap-4">
          <div className="bg-red-100 p-3 rounded-full text-red-700">
            <AlertTriangle size={20} />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Low Stock Items</span>
            <strong className="text-lg font-bold text-charcoal mt-0.5">{stats.lowStockProducts.length}</strong>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        
        {/* Category Sales progress list */}
        <div className="bg-white p-6 rounded-2xl border border-border-spice/40 shadow-sm flex flex-col gap-4">
          <h3 className="font-bold text-xs uppercase tracking-wider text-muted-foreground">Category Performance</h3>
          <div className="flex flex-col gap-4">
            {stats.categorySales.map((cat: any) => (
              <div key={cat._id} className="flex flex-col gap-1.5 text-xs">
                <div className="flex justify-between font-bold text-charcoal">
                  <span className="capitalize">{cat._id.replace('-', ' ')}</span>
                  <span>₹{cat.revenue.toLocaleString('en-IN')} ({cat.units} units)</span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary rounded-full"
                    style={{ width: `${Math.min(100, (cat.revenue / (stats.totalSales || 1)) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Low Stock Alert list details */}
        <div className="bg-white p-6 rounded-2xl border border-border-spice/40 shadow-sm flex flex-col gap-4">
          <h3 className="font-bold text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5"><AlertTriangle size={14} className="text-primary" /> Low Stock Warning</h3>
          {stats.lowStockProducts.length === 0 ? (
            <div className="text-center py-6 text-xs text-muted-foreground">🎉 All spice inventory levels are healthy!</div>
          ) : (
            <div className="flex flex-col gap-3">
              {stats.lowStockProducts.map((p: any) => (
                <div key={p._id} className="flex justify-between items-center text-xs border-b border-border-spice/45 pb-2">
                  <div className="flex flex-col">
                    <span className="font-bold text-charcoal">{p.name}</span>
                    <span className="text-[10px] text-muted-foreground capitalize">{p.category}</span>
                  </div>
                  <div className="flex flex-col items-end">
                    {p.weights.map((w: any) => (
                      <span key={w.weight} className={w.stock < 10 ? "text-destructive font-bold" : "text-muted-foreground"}>
                        {w.weight}: {w.stock} left
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
