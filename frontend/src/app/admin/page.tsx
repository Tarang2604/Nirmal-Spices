"use client";

import React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import {
  Plus,
  Tag,
  Clock,
  AlertTriangle,
  Layers,
  Users,
  ShoppingBag,
  Loader2,
  IndianRupee,
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
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 text-[#8B1E1E] animate-spin" />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="text-center p-8 border border-dashed rounded-xl text-sm text-muted-foreground">
        Failed to load dashboard statistics.
      </div>
    );
  }

  const quickActions = [
    { title: 'Add Product', href: '/admin/products?add=true', color: 'bg-[#D1F2E1]', icon: Plus, iconColor: 'text-[#50C878]' },
    { title: 'Create Coupon', href: '/admin/coupons', color: 'bg-[#FEE2EC]', icon: Tag, iconColor: 'text-[#FF69B4]' },
    { title: 'Pending Orders', href: '/admin/orders', color: 'bg-[#FEF0D5]', icon: Clock, iconColor: 'text-[#FFB347]' },
    { title: 'Categories', href: '/admin/categories', color: 'bg-[#E8E0FF]', icon: Layers, iconColor: 'text-[#7C5CFC]' },
    { title: 'Stock Alerts', href: '/admin/products', color: 'bg-[#FEE7DC]', icon: AlertTriangle, iconColor: 'text-[#FF8C69]' },
    { title: 'Customers', href: '/admin/customers?status=active', color: 'bg-[#E1F0FF]', icon: Users, iconColor: 'text-[#4A90E2]' },
  ];

  const kpi = [
    { title: 'Total Users', value: stats.totalUsers ?? 0, href: '/admin', icon: Users, iconBg: 'bg-[#D1E9FF]', iconColor: 'text-[#1976D2]' },
    { title: 'Total Revenue', value: `₹${Number(stats.totalSales || 0).toLocaleString('en-IN')}`, href: '/admin/orders', icon: IndianRupee, iconBg: 'bg-[#D7F2D9]', iconColor: 'text-[#43A047]' },
    { title: 'Total Orders', value: stats.totalOrders ?? 0, href: '/admin/orders', icon: ShoppingBag, iconBg: 'bg-[#D1F0FF]', iconColor: 'text-[#039BE5]' },
    { title: 'Pending Orders', value: stats.pendingOrders ?? 0, href: '/admin/orders', icon: Clock, iconBg: 'bg-[#FEE7C8]', iconColor: 'text-[#FB8C00]' },
  ];

  const daily = Array.isArray(stats.dailyRevenue) ? stats.dailyRevenue : [];
  const maxRev = Math.max(1, ...daily.map((d: any) => Number(d.revenue) || 0));

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-6">
      <div>
        <h1 className="font-display font-bold text-2xl md:text-3xl text-charcoal">Dashboard</h1>
        <p className="text-muted-foreground text-[13px] mt-1">
          Welcome back! Here&apos;s what&apos;s happening with your store.
        </p>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-bold text-charcoal">Quick Management</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {quickActions.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.title}
                href={item.href}
                className={`${item.color} p-3 rounded-xl flex flex-col items-center justify-center gap-2 shadow-sm border border-black/5 h-24 hover:-translate-y-0.5 transition-transform`}
              >
                <Icon size={16} className={item.iconColor} />
                <span className="text-[10px] font-bold text-center leading-tight">{item.title}</span>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {kpi.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.title}
              href={stat.href}
              className="bg-white p-3.5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between hover:-translate-y-0.5 transition-transform"
            >
              <div>
                <div className="text-[12px] font-bold text-charcoal mb-1">{stat.title}</div>
                <div className="text-xl font-bold text-charcoal">{stat.value}</div>
              </div>
              <div className={`w-10 h-10 ${stat.iconBg} ${stat.iconColor} rounded-lg flex items-center justify-center`}>
                <Icon size={18} />
              </div>
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-bold text-charcoal">Revenue Analytics</h3>
          <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-4">
            Platform financial performance overview
          </p>
          {daily.length === 0 ? (
            <div className="h-40 flex items-center justify-center text-xs text-muted-foreground">
              No revenue data for the last 7 days yet.
            </div>
          ) : (
            <div className="h-40 flex items-end gap-2">
              {daily.map((d: any, i: number) => {
                const h = Math.max(8, (Number(d.revenue) / maxRev) * 100);
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-full rounded-t-md bg-[#4A90E2]/80"
                      style={{ height: `${h}%` }}
                      title={`₹${Number(d.revenue).toLocaleString('en-IN')}`}
                    />
                    <span className="text-[9px] text-gray-400 font-bold">DAY{i + 1}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
          <h3 className="text-lg font-bold text-charcoal mb-1">Inventory Distribution</h3>
          <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-4">By category</p>
          <div className="flex-1 space-y-3">
            {(stats.categorySales || []).length === 0 ? (
              <div className="text-xs text-muted-foreground py-8 text-center">No sales by category yet.</div>
            ) : (
              (stats.categorySales as any[]).slice(0, 6).map((cat) => (
                <div key={cat._id} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="capitalize">{String(cat._id || '').replace(/-/g, ' ')}</span>
                    <span>₹{Number(cat.revenue).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#8B1E1E] rounded-full"
                      style={{
                        width: `${Math.min(100, (Number(cat.revenue) / Math.max(1, Number(stats.totalSales))) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
          <Link href="/admin/products" className="mt-4 text-[11px] font-bold uppercase tracking-wider text-[#8B1E1E] hover:underline">
            View inventory logs
          </Link>
        </div>
      </div>
    </div>
  );
}
