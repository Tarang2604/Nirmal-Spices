"use client";

import React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import {
  Layers,
  Users,
  ShoppingBag,
  Clock,
  IndianRupee,
  AlertTriangle,
  FolderTree,
  ArrowRight,
  Sparkles,
  TrendingUp,
  PackageCheck,
  PackageX
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminDashboardPage() {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['admin-dashboard-stats'],
    queryFn: async () => {
      const res = await api.get('/admin/dashboard');
      return res.data.data;
    },
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-gray-200 rounded-xl w-64" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-white rounded-2xl border border-gray-100 p-4" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-72 bg-white rounded-2xl border border-gray-100 p-4" />
          <div className="h-72 bg-white rounded-2xl border border-gray-100 p-4" />
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="text-center py-16 px-4 bg-white rounded-3xl border border-rose-100 shadow-xs max-w-lg mx-auto my-12">
        <AlertTriangle size={36} className="text-rose-500 mx-auto mb-3" />
        <h3 className="font-display font-bold text-lg text-charcoal mb-1">Failed to Load Dashboard</h3>
        <p className="text-xs text-muted-foreground mb-4">Could not retrieve live store metrics from the database.</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-primary text-white text-xs font-semibold rounded-xl hover:bg-crimson-dark transition-colors"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  const lowStockCount = Array.isArray(stats.lowStockProducts) ? stats.lowStockProducts.length : 0;
  const recentOrders = Array.isArray(stats.recentOrders) ? stats.recentOrders : [];

  const kpis = [
    {
      title: 'Total Revenue',
      value: `₹${Number(stats.totalSales || 0).toLocaleString('en-IN')}`,
      sub: 'All-time gross sales',
      href: '/admin/orders',
      icon: IndianRupee,
      bg: 'bg-emerald-500/10 text-emerald-700 border-emerald-200/50',
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders ?? 0,
      sub: `${stats.pendingOrders ?? 0} pending processing`,
      href: '/admin/orders',
      icon: ShoppingBag,
      bg: 'bg-sky-500/10 text-sky-700 border-sky-200/50',
    },
    {
      title: 'Total Products',
      value: stats.totalProducts ?? 56,
      sub: `${lowStockCount} items low in stock`,
      href: '/admin/products',
      icon: Layers,
      bg: 'bg-amber-500/10 text-amber-700 border-amber-200/50',
    },
    {
      title: 'Total Customers',
      value: stats.totalUsers ?? 0,
      sub: 'Registered accounts',
      href: '/admin/customers',
      icon: Users,
      bg: 'bg-indigo-500/10 text-indigo-700 border-indigo-200/50',
    },
  ];

  const daily = Array.isArray(stats.dailyRevenue) ? stats.dailyRevenue : [];
  const maxRev = Math.max(1, ...daily.map((d: any) => Number(d.revenue) || 0));

  return (
    <div className="space-y-8 font-sans pb-12">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-border/70 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-accent font-bold uppercase tracking-wider text-primary mb-1">
            <Sparkles size={14} /> Management Dashboard
          </div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-charcoal">
            Nirmal Spices Overview
          </h1>
          <p className="text-muted-foreground text-xs mt-1">
            Real-time analytics, order fulfillment, and inventory metrics direct from your database.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/admin/products"
            className="px-4 py-2.5 bg-primary hover:bg-crimson-dark text-white text-xs font-semibold rounded-xl transition-colors shadow-xs flex items-center gap-1.5"
          >
            Manage Products <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Link
              key={kpi.title}
              href={kpi.href}
              className="group bg-white p-5 rounded-3xl border border-border/60 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-xs font-semibold text-muted-foreground">{kpi.title}</span>
                <span className={`w-9 h-9 rounded-2xl flex items-center justify-center border ${kpi.bg} group-hover:scale-110 transition-transform`}>
                  <Icon size={18} />
                </span>
              </div>
              <div>
                <div className="font-display font-bold text-2xl text-charcoal">{kpi.value}</div>
                <div className="text-[11px] text-muted-foreground mt-0.5">{kpi.sub}</div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Recent Orders & Low Stock Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Recent Orders Real Table */}
        <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-border/60 shadow-xs flex flex-col gap-4">
          <div className="flex items-center justify-between pb-3 border-b border-border/50">
            <div>
              <h2 className="font-display font-bold text-base text-charcoal">Recent Customer Orders</h2>
              <p className="text-muted-foreground text-[11px]">Latest sales transactions</p>
            </div>
            <Link href="/admin/orders" className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
              View All Orders <ArrowRight size={12} />
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div className="py-12 text-center text-xs text-muted-foreground">
              No orders placed yet. Orders will appear here automatically.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border/40 text-[10px] font-accent uppercase tracking-wider text-muted-foreground">
                    <th className="py-2.5 px-3">Order ID</th>
                    <th className="py-2.5 px-3">Customer</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {recentOrders.map((ord: any) => (
                    <tr key={ord._id} className="hover:bg-cream/40 transition-colors">
                      <td className="py-3 px-3 font-mono font-semibold text-charcoal">
                        #{String(ord._id).slice(-6).toUpperCase()}
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-semibold text-charcoal">{ord.shippingAddress?.fullName || ord.user?.name || 'Customer'}</div>
                        <div className="text-[10px] text-muted-foreground">{ord.shippingAddress?.city || 'India'}</div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-700">
                          {ord.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-charcoal">
                        ₹{Number(ord.total).toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Low Stock Alerts */}
        <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-border/60 shadow-xs flex flex-col gap-4">
          <div className="flex items-center justify-between pb-3 border-b border-border/50">
            <div>
              <h2 className="font-display font-bold text-base text-charcoal flex items-center gap-1.5">
                <AlertTriangle size={16} className="text-amber-500" /> Low Stock Alerts
              </h2>
              <p className="text-muted-foreground text-[11px]">Items requiring restock (&lt; 10 units)</p>
            </div>
          </div>

          {lowStockCount === 0 ? (
            <div className="py-8 text-center text-xs text-emerald-700 bg-emerald-500/10 rounded-2xl border border-emerald-200/50 p-4">
              <PackageCheck size={24} className="mx-auto mb-2 text-emerald-600" />
              All inventory levels are optimal!
            </div>
          ) : (
            <div className="flex flex-col gap-2.5 max-h-72 overflow-y-auto scrollbar-thin">
              {stats.lowStockProducts.map((prod: any) => (
                <div key={prod._id} className="p-3 bg-cream/30 rounded-2xl border border-border/40 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-semibold text-charcoal leading-tight">{prod.name}</div>
                    <div className="text-[10px] text-muted-foreground uppercase font-accent">{prod.category}</div>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-700 font-bold text-[11px] shrink-0">
                    Low Stock
                  </span>
                </div>
              ))}
            </div>
          )}

          <Link
            href="/admin/products"
            className="mt-2 py-2 text-center bg-cream hover:bg-cream-dark/50 text-charcoal text-xs font-semibold rounded-xl transition-colors"
          >
            Open Inventory Manager
          </Link>
        </div>

      </div>

      {/* Revenue Analytics Chart */}
      <div className="bg-white p-6 rounded-3xl border border-border/60 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-display font-bold text-base text-charcoal flex items-center gap-1.5">
              <TrendingUp size={16} className="text-primary" /> 7-Day Revenue Analytics
            </h2>
            <p className="text-muted-foreground text-[11px]">Actual sales performance recorded in database</p>
          </div>
        </div>

        {daily.length === 0 ? (
          <div className="h-44 flex items-center justify-center text-xs text-muted-foreground bg-cream/20 rounded-2xl border border-dashed border-border">
            No completed sales in the past 7 days. New orders will automatically generate analytics bars.
          </div>
        ) : (
          <div className="h-48 flex items-end gap-3 pt-6">
            {daily.map((d: any, i: number) => {
              const h = Math.max(12, (Number(d.revenue) / maxRev) * 100);
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                  <span className="text-[10px] font-bold text-charcoal opacity-0 group-hover:opacity-100 transition-opacity">
                    ₹{Number(d.revenue).toLocaleString('en-IN')}
                  </span>
                  <div
                    className="w-full rounded-t-xl bg-primary hover:bg-crimson-dark transition-all duration-200 shadow-xs"
                    style={{ height: `${h}%` }}
                  />
                  <span className="text-[10px] text-muted-foreground font-semibold font-accent uppercase">
                    Day {i + 1}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}

