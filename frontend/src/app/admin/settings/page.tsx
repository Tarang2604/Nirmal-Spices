"use client";

import React, { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Loader2, Percent, IndianRupee, Save, Truck } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminSettingsPage() {
  const queryClient = useQueryClient();
  const [commissionType, setCommissionType] = useState<'percent' | 'flat'>('percent');
  const [commissionValue, setCommissionValue] = useState('5');
  const [platformFeeType, setPlatformFeeType] = useState<'percent' | 'flat'>('flat');
  const [platformFeeValue, setPlatformFeeValue] = useState('10');
  const [deliveryCharge, setDeliveryCharge] = useState('40');
  const [freeDeliveryMin, setFreeDeliveryMin] = useState('499');

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: async () => {
      const res = await api.get('/admin/settings');
      return res.data.data;
    },
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (data) {
      setCommissionType(data.commissionType);
      setCommissionValue(String(data.commissionValue ?? 0));
      setPlatformFeeType(data.platformFeeType);
      setPlatformFeeValue(String(data.platformFeeValue ?? 0));
      setDeliveryCharge(String(data.deliveryCharge ?? 40));
      setFreeDeliveryMin(String(data.freeDeliveryMin ?? 499));
    }
  }, [data]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const res = await api.put('/admin/settings', {
        commissionType,
        commissionValue: Number(commissionValue),
        platformFeeType,
        platformFeeValue: Number(platformFeeValue),
        deliveryCharge: Number(deliveryCharge),
        freeDeliveryMin: Number(freeDeliveryMin),
      });
      return res.data;
    },
    onSuccess: () => {
      toast.success('Fees updated — applied on checkout & new orders');
      queryClient.invalidateQueries({ queryKey: ['admin-settings'] });
      queryClient.invalidateQueries({ queryKey: ['checkout-fees'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to save settings');
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8 text-muted-foreground text-sm">
        Failed to load settings.
      </div>
    );
  }

  const merchExample = 500;
  const exampleCommission =
    commissionType === 'percent'
      ? Math.floor((merchExample * Number(commissionValue || 0)) / 100)
      : Number(commissionValue || 0);
  const examplePlatform =
    platformFeeType === 'percent'
      ? Math.floor((merchExample * Number(platformFeeValue || 0)) / 100)
      : Number(platformFeeValue || 0);
  const exampleShipping =
    merchExample >= Number(freeDeliveryMin || 0) ? 0 : Number(deliveryCharge || 0);

  return (
    <div className="flex flex-col gap-6 font-sans max-w-2xl">
      <div>
        <h1 className="font-display font-bold text-2xl text-charcoal">Fees & Delivery</h1>
        <p className="text-muted-foreground text-xs mt-1">
          Commission, platform fee, and delivery charge are stored in MongoDB and applied on every checkout.
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          saveMutation.mutate();
        }}
        className="bg-white rounded-2xl border border-border-spice/40 p-6 shadow-sm flex flex-col gap-6"
      >
        <div className="flex flex-col gap-3">
          <h3 className="font-bold text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Percent size={14} className="text-primary" /> Commission
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-muted-foreground">Type</label>
              <select
                value={commissionType}
                onChange={(e) => setCommissionType(e.target.value as 'percent' | 'flat')}
                className="bg-cream-dark/25 border border-border rounded-xl px-3 py-2 text-xs outline-none"
              >
                <option value="percent">Percent (%)</option>
                <option value="flat">Flat (₹)</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-muted-foreground">Value</label>
              <input
                type="number"
                min={0}
                step="0.01"
                required
                value={commissionValue}
                onChange={(e) => setCommissionValue(e.target.value)}
                className="bg-cream-dark/25 border border-border rounded-xl px-3 py-2 text-xs outline-none"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-border-spice/40 pt-6">
          <h3 className="font-bold text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <IndianRupee size={14} className="text-primary" /> Platform Fee
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-muted-foreground">Type</label>
              <select
                value={platformFeeType}
                onChange={(e) => setPlatformFeeType(e.target.value as 'percent' | 'flat')}
                className="bg-cream-dark/25 border border-border rounded-xl px-3 py-2 text-xs outline-none"
              >
                <option value="percent">Percent (%)</option>
                <option value="flat">Flat (₹)</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-muted-foreground">Value</label>
              <input
                type="number"
                min={0}
                step="0.01"
                required
                value={platformFeeValue}
                onChange={(e) => setPlatformFeeValue(e.target.value)}
                className="bg-cream-dark/25 border border-border rounded-xl px-3 py-2 text-xs outline-none"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-border-spice/40 pt-6">
          <h3 className="font-bold text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Truck size={14} className="text-primary" /> Delivery Charge
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-muted-foreground">Delivery charge (₹)</label>
              <input
                type="number"
                min={0}
                step="1"
                required
                value={deliveryCharge}
                onChange={(e) => setDeliveryCharge(e.target.value)}
                className="bg-cream-dark/25 border border-border rounded-xl px-3 py-2 text-xs outline-none"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-muted-foreground">Free delivery above (₹)</label>
              <input
                type="number"
                min={0}
                step="1"
                required
                value={freeDeliveryMin}
                onChange={(e) => setFreeDeliveryMin(e.target.value)}
                className="bg-cream-dark/25 border border-border rounded-xl px-3 py-2 text-xs outline-none"
              />
            </div>
          </div>
          <p className="text-[10px] text-muted-foreground">
            Orders with merchandise (after discount) ≥ free-delivery amount pay ₹0 shipping.
          </p>
        </div>

        <div className="bg-cream/50 rounded-xl p-4 text-[11px] text-muted-foreground leading-relaxed">
          Example on ₹{merchExample} merchandise: commission ₹{exampleCommission}, platform fee ₹
          {examplePlatform}, delivery {exampleShipping === 0 ? 'FREE' : `₹${exampleShipping}`}. Total
          extras: ₹{exampleCommission + examplePlatform + exampleShipping}.
        </div>

        <button
          type="submit"
          disabled={saveMutation.isPending}
          className="bg-primary hover:bg-crimson-dark text-white font-semibold font-accent uppercase tracking-wider text-xs py-3 px-6 rounded-xl flex items-center justify-center gap-2 self-start disabled:opacity-50"
        >
          {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save size={14} />}
          Save Settings
        </button>
      </form>
    </div>
  );
}
