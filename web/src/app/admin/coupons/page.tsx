"use client";

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { Plus, Trash2, Tag, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminCouponsPage() {
  const queryClient = useQueryClient();
  const [showAddForm, setShowAddForm] = useState(false);

  // Form states
  const [code, setCode] = useState('');
  const [type, setType] = useState<'percent' | 'flat'>('percent');
  const [value, setValue] = useState('15');
  const [minOrder, setMinOrder] = useState('499');
  const [maxUses, setMaxUses] = useState('500');
  const [expiresAt, setExpiresAt] = useState('');

  // Fetch coupons
  const { data: coupons, isLoading, error } = useQuery({
    queryKey: ['admin-coupons-list'],
    queryFn: async () => {
      const res = await api.get('/coupons');
      return res.data.data;
    },
  });

  // Create coupon mutation
  const createMutation = useMutation({
    mutationFn: async (newCoupon: any) => {
      const res = await api.post('/coupons', newCoupon);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Coupon created successfully!");
      setShowAddForm(false);
      setCode('');
      setExpiresAt('');
      queryClient.invalidateQueries({ queryKey: ['admin-coupons-list'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to create coupon");
    }
  });

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !expiresAt) {
      toast.error("Please fill in code and expiry date");
      return;
    }

    createMutation.mutate({
      code: code.toUpperCase(),
      type,
      value: Number(value),
      minOrder: Number(minOrder),
      maxUses: Number(maxUses),
      expiresAt: new Date(expiresAt).toISOString(),
    });
  };

  // Delete coupon mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/coupons/${id}`);
    },
    onSuccess: () => {
      toast.success("Coupon deleted successfully");
      queryClient.invalidateQueries({ queryKey: ['admin-coupons-list'] });
    },
    onError: () => {
      toast.error("Failed to delete coupon");
    }
  });

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this coupon?")) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="flex flex-col gap-6 font-sans">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-display font-bold text-2xl text-charcoal">Manage Coupons</h1>
          <p className="text-muted-foreground text-xs mt-1">Configure checkout discount coupon codes.</p>
        </div>
        {!showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-primary hover:bg-crimson-dark text-white font-semibold font-accent uppercase tracking-wider text-[10px] px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-colors outline-none"
          >
            <Plus size={12} /> Add Coupon
          </button>
        )}
      </div>

      {/* Coupons List Grid */}
      {!showAddForm && (
        <div className="bg-white rounded-2xl border border-border-spice/40 overflow-hidden shadow-sm">
          {isLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>
          ) : error ? (
            <div className="text-center p-8 text-muted-foreground text-xs">Failed to load coupons.</div>
          ) : !coupons || coupons.length === 0 ? (
            <div className="text-center p-12 text-muted-foreground text-xs">No active coupons found. Add one above.</div>
          ) : (
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-cream/45 border-b border-border-spice/55 font-bold uppercase tracking-wider text-muted-foreground">
                    <th className="p-4">Coupon Code</th>
                    <th className="p-4">Discount Type</th>
                    <th className="p-4">Discount Value</th>
                    <th className="p-4">Usage Stats</th>
                    <th className="p-4">Expiry Date</th>
                    <th className="p-4">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-spice/45 text-charcoal">
                  {coupons.map((c: any) => (
                    <tr key={c._id} className="hover:bg-cream-dark/5">
                      <td className="p-4 font-bold text-primary">{c.code}</td>
                      <td className="p-4 capitalize">{c.type}</td>
                      <td className="p-4 font-bold">
                        {c.type === 'percent' ? `${c.value}%` : `₹${c.value}`}
                      </td>
                      <td className="p-4">
                        {c.usedCount} / {c.maxUses}
                      </td>
                      <td className="p-4 text-muted-foreground">
                        {new Date(c.expiresAt).toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => handleDelete(c._id)}
                          className="text-muted-foreground hover:text-destructive p-1"
                          aria-label="Delete coupon"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Add Coupon Form */}
      {showAddForm && (
        <form onSubmit={handleFormSubmit} className="bg-white p-6 rounded-2xl border border-border-spice/40 shadow-sm flex flex-col gap-5 text-xs text-charcoal">
          
          <div className="flex justify-between items-center border-b border-border-spice pb-3">
            <h2 className="font-display font-bold text-lg flex items-center gap-1.5"><Tag size={18} className="text-primary" /> Create Discount Coupon</h2>
            <button 
              type="button" 
              onClick={() => setShowAddForm(false)} 
              className="text-muted-foreground hover:text-charcoal outline-none"
            >
              <X size={16} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Code */}
            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-muted-foreground">Coupon Code</label>
              <input
                type="text"
                required
                placeholder="E.g. FIRST15"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="bg-cream-dark/25 border border-border rounded-xl px-3 py-2 text-xs outline-none uppercase"
              />
            </div>

            {/* Type */}
            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-muted-foreground">Discount Type</label>
              <select
                value={type}
                onChange={(e: any) => setType(e.target.value)}
                className="bg-cream-dark/25 border border-border rounded-xl px-3 py-2 text-xs outline-none"
              >
                <option value="percent">Percentage (%)</option>
                <option value="flat">Flat Amount (₹)</option>
              </select>
            </div>

            {/* Value */}
            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-muted-foreground">Discount Value (Percent or Amount)</label>
              <input
                type="number"
                required
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="bg-cream-dark/25 border border-border rounded-xl px-3 py-2 text-xs outline-none"
              />
            </div>

            {/* Minimum Order */}
            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-muted-foreground">Min Order Amount (₹)</label>
              <input
                type="number"
                required
                value={minOrder}
                onChange={(e) => setMinOrder(e.target.value)}
                className="bg-cream-dark/25 border border-border rounded-xl px-3 py-2 text-xs outline-none"
              />
            </div>

            {/* Max Uses */}
            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-muted-foreground">Usage Limit (Max Uses)</label>
              <input
                type="number"
                required
                value={maxUses}
                onChange={(e) => setMaxUses(e.target.value)}
                className="bg-cream-dark/25 border border-border rounded-xl px-3 py-2 text-xs outline-none"
              />
            </div>

            {/* Expiry Date */}
            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-muted-foreground">Expiry Date</label>
              <input
                type="date"
                required
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="bg-cream-dark/25 border border-border rounded-xl px-3 py-2 text-xs outline-none"
              />
            </div>

          </div>

          <div className="flex justify-between items-center border-t border-border-spice/40 pt-4 mt-4">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="text-xs text-muted-foreground font-semibold outline-none hover:underline"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="bg-primary hover:bg-crimson-dark text-white font-semibold font-accent uppercase tracking-wider text-xs py-3 px-8 rounded-xl flex items-center justify-center gap-1.5 outline-none"
            >
              {createMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              Publish Coupon
            </button>
          </div>

        </form>
      )}

    </div>
  );
}
