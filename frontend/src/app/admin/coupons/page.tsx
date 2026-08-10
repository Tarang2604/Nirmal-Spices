"use client";

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Plus, Trash2, Tag, Loader2, X, ToggleLeft, ToggleRight } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

type CouponRow = {
  _id: string;
  code: string;
  title?: string;
  description?: string;
  type: 'percent' | 'flat';
  value: number;
  maxDiscount?: number;
  minOrder: number;
  maxUses: number;
  usedCount: number;
  expiresAt: string;
  isActive: boolean;
  oncePerUser?: boolean;
};

export default function AdminCouponsPage() {
  const queryClient = useQueryClient();
  const [showAddForm, setShowAddForm] = useState(false);

  const [code, setCode] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'percent' | 'flat'>('percent');
  const [value, setValue] = useState('10');
  const [maxDiscount, setMaxDiscount] = useState('');
  const [minOrder, setMinOrder] = useState('299');
  const [maxUses, setMaxUses] = useState('500');
  const [expiresAt, setExpiresAt] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [oncePerUser, setOncePerUser] = useState(true);

  const { data: coupons, isLoading, error } = useQuery({
    queryKey: ['admin-coupons-list'],
    queryFn: async () => {
      const res = await api.get('/coupons');
      return res.data.data as CouponRow[];
    },
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const resetForm = () => {
    setCode('');
    setTitle('');
    setDescription('');
    setType('percent');
    setValue('10');
    setMaxDiscount('');
    setMinOrder('299');
    setMaxUses('500');
    setExpiresAt('');
    setIsActive(true);
    setOncePerUser(true);
    setShowAddForm(false);
  };

  const createMutation = useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      const res = await api.post('/coupons', payload);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Coupon created — it will show on product & checkout pages');
      resetForm();
      queryClient.invalidateQueries({ queryKey: ['admin-coupons-list'] });
      queryClient.invalidateQueries({ queryKey: ['available-coupons'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to create coupon');
    },
  });

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !expiresAt) {
      toast.error('Please fill in code and expiry date');
      return;
    }

    createMutation.mutate({
      code: code.toUpperCase().trim(),
      title: title.trim() || code.toUpperCase().trim(),
      description: description.trim(),
      type,
      value: Number(value),
      maxDiscount: maxDiscount ? Number(maxDiscount) : undefined,
      minOrder: Number(minOrder),
      maxUses: Number(maxUses),
      expiresAt,
      isActive,
      oncePerUser,
    });
  };

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => api.delete(`/coupons/${id}`),
    onSuccess: () => {
      toast.success('Coupon deleted');
      queryClient.invalidateQueries({ queryKey: ['admin-coupons-list'] });
      queryClient.invalidateQueries({ queryKey: ['available-coupons'] });
    },
    onError: () => toast.error('Failed to delete coupon'),
  });

  const toggleMutation = useMutation({
    mutationFn: async (c: CouponRow) =>
      api.put(`/coupons/${c._id}`, { isActive: !c.isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-coupons-list'] });
      queryClient.invalidateQueries({ queryKey: ['available-coupons'] });
      toast.success('Coupon status updated');
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Update failed'),
  });

  return (
    <div className="flex flex-col gap-6 font-sans max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-display font-bold text-2xl text-charcoal">Coupons</h1>
          <p className="text-muted-foreground text-xs mt-1">
            Coupons you create are stored in MongoDB and appear on product pages, cart, and checkout when active.
          </p>
        </div>
        {!showAddForm && (
          <button
            type="button"
            onClick={() => setShowAddForm(true)}
            className="bg-[#3D1F1F] text-white font-bold uppercase tracking-wider text-[10px] px-4 py-2.5 rounded-xl flex items-center gap-1.5"
          >
            <Plus size={12} /> Add Coupon
          </button>
        )}
      </div>

      {!showAddForm && (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 text-[#8B1E1E] animate-spin" />
            </div>
          ) : error ? (
            <div className="text-center p-8 text-muted-foreground text-xs">Failed to load coupons.</div>
          ) : !coupons || coupons.length === 0 ? (
            <div className="text-center p-12 text-muted-foreground text-xs">
              No coupons yet. Add one to show on checkout.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#FAF7F2] border-b border-gray-100 font-bold uppercase tracking-wider text-muted-foreground">
                    <th className="p-4">Code</th>
                    <th className="p-4">Offer</th>
                    <th className="p-4">Min Order</th>
                    <th className="p-4">Usage</th>
                    <th className="p-4">Expires</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {coupons.map((c) => (
                    <tr key={c._id} className="hover:bg-gray-50/80">
                      <td className="p-4">
                        <div className="font-bold text-[#8B1E1E]">{c.code}</div>
                        <div className="text-[10px] text-muted-foreground">{c.title || '—'}</div>
                      </td>
                      <td className="p-4 font-semibold">
                        {c.type === 'percent' ? `${c.value}%` : `₹${c.value}`}
                        {c.maxDiscount ? (
                          <span className="text-muted-foreground font-normal"> (max ₹{c.maxDiscount})</span>
                        ) : null}
                      </td>
                      <td className="p-4">₹{c.minOrder}</td>
                      <td className="p-4">
                        {c.usedCount} / {c.maxUses}
                      </td>
                      <td className="p-4 text-muted-foreground">
                        {new Date(c.expiresAt).toLocaleDateString('en-IN')}
                      </td>
                      <td className="p-4">
                        <button
                          type="button"
                          onClick={() => toggleMutation.mutate(c)}
                          className={cn(
                            'inline-flex items-center gap-1 text-[10px] font-bold uppercase',
                            c.isActive ? 'text-green-700' : 'text-muted-foreground',
                          )}
                        >
                          {c.isActive ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                          {c.isActive ? 'Active' : 'Off'}
                        </button>
                      </td>
                      <td className="p-4">
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Delete coupon ${c.code}?`)) deleteMutation.mutate(c._id);
                          }}
                          className="text-muted-foreground hover:text-red-600 p-1"
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

      {showAddForm && (
        <form
          onSubmit={handleFormSubmit}
          className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-5 text-xs text-charcoal"
        >
          <div className="flex justify-between items-center border-b border-gray-100 pb-3">
            <h2 className="font-display font-bold text-lg flex items-center gap-1.5">
              <Tag size={18} className="text-[#8B1E1E]" /> Create Coupon
            </h2>
            <button type="button" onClick={resetForm} className="text-muted-foreground">
              <X size={16} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-muted-foreground">Coupon Code</label>
              <input
                type="text"
                required
                placeholder="FIRST10"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none uppercase"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-muted-foreground">Title (shown on checkout)</label>
              <input
                type="text"
                placeholder="First order discount"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none"
              />
            </div>
            <div className="sm:col-span-2 flex flex-col gap-1.5">
              <label className="font-bold text-muted-foreground">Description</label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Visible to customers on checkout"
                className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none resize-y"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-muted-foreground">Discount Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as 'percent' | 'flat')}
                className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none"
              >
                <option value="percent">Percentage (%)</option>
                <option value="flat">Flat Amount (₹)</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-muted-foreground">Discount Value</label>
              <input
                type="number"
                required
                min={0}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none"
              />
            </div>
            {type === 'percent' && (
              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-muted-foreground">Max Discount Cap (₹, optional)</label>
                <input
                  type="number"
                  min={0}
                  value={maxDiscount}
                  onChange={(e) => setMaxDiscount(e.target.value)}
                  placeholder="e.g. 100"
                  className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none"
                />
              </div>
            )}
            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-muted-foreground">Min Order (₹)</label>
              <input
                type="number"
                required
                min={0}
                value={minOrder}
                onChange={(e) => setMinOrder(e.target.value)}
                className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-muted-foreground">Max Uses</label>
              <input
                type="number"
                required
                min={1}
                value={maxUses}
                onChange={(e) => setMaxUses(e.target.value)}
                className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-muted-foreground">Expiry Date</label>
              <input
                type="date"
                required
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none"
              />
            </div>
            <div className="flex flex-col gap-3 justify-end pb-1">
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
                <span className="font-semibold">Active (show on checkout)</span>
              </label>
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={oncePerUser}
                  onChange={(e) => setOncePerUser(e.target.checked)}
                />
                <span className="font-semibold">One use per customer</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
            <button type="button" onClick={resetForm} className="px-4 py-2.5 text-xs font-semibold text-muted-foreground">
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="bg-[#3D1F1F] text-white font-bold uppercase tracking-wider text-xs py-3 px-8 rounded-xl inline-flex items-center gap-2 disabled:opacity-50"
            >
              {createMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              Save Coupon
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
