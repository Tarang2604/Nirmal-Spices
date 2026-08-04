"use client";

import React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Tag, Copy, Check } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export type StoreCoupon = {
  _id?: string;
  code: string;
  title?: string;
  description?: string;
  type: 'percent' | 'flat';
  value: number;
  maxDiscount?: number | null;
  minOrder: number;
  expiresAt?: string;
};

export function useAvailableCoupons() {
  return useQuery({
    queryKey: ['available-coupons'],
    queryFn: async () => {
      const res = await api.get('/coupons/available');
      return (res.data.data || []) as StoreCoupon[];
    },
    staleTime: 15_000,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  });
}

function offerLabel(c: StoreCoupon) {
  if (c.type === 'percent') return `${c.value}% OFF`;
  return `₹${c.value} OFF`;
}

interface AvailableCouponsStripProps {
  /** product = promo banners; pick = clickable apply (parent handles) */
  mode?: 'product' | 'pick';
  selectedCode?: string | null;
  onSelect?: (code: string) => void;
  className?: string;
  compact?: boolean;
}

export default function AvailableCouponsStrip({
  mode = 'product',
  selectedCode,
  onSelect,
  className,
  compact = false,
}: AvailableCouponsStripProps) {
  const { data: coupons = [], isLoading } = useAvailableCoupons();
  const [copied, setCopied] = React.useState<string | null>(null);

  if (isLoading) {
    return (
      <div className={cn('animate-pulse h-16 rounded-xl bg-muted/40', className)} aria-hidden />
    );
  }

  if (coupons.length === 0) return null;

  const copyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(code);
      toast.success(`Copied ${code}`);
      window.setTimeout(() => setCopied(null), 1500);
    } catch {
      toast.message(code);
    }
  };

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-[10px] font-bold uppercase tracking-wider font-accent text-muted-foreground flex items-center gap-1.5">
          <Tag size={12} className="text-primary" />
          Available offers
        </p>
        {mode === 'product' && (
          <Link
            href="/checkout"
            className="text-[10px] font-semibold text-primary hover:underline"
          >
            Apply at checkout
          </Link>
        )}
      </div>

      <div
        className={cn(
          'flex gap-2 overflow-x-auto pb-1 scrollbar-none',
          compact ? 'flex-col overflow-visible' : '',
        )}
      >
        {coupons.map((c) => {
          const selected = selectedCode === c.code;
          const body = (
            <>
              <span className="text-[10px] font-bold uppercase tracking-wider text-green-700 bg-green-100 px-1.5 py-0.5 rounded">
                {offerLabel(c)}
              </span>
              <div className="min-w-0">
                <div className="font-bold text-xs text-charcoal tracking-wide">{c.code}</div>
                <div className="text-[10px] text-muted-foreground truncate">
                  {c.title ||
                    (c.type === 'percent' ? `${c.value}% off` : `Flat ₹${c.value} off`)}
                  {c.minOrder > 0 ? ` · Min ₹${c.minOrder}` : ''}
                </div>
              </div>
            </>
          );

          if (mode === 'pick' && onSelect) {
            return (
              <button
                key={c.code}
                type="button"
                onClick={() => onSelect(c.code)}
                className={cn(
                  'flex items-center gap-2 text-left rounded-xl border px-3 py-2.5 transition-colors outline-none shrink-0 min-w-[200px]',
                  compact && 'min-w-0 w-full',
                  selected
                    ? 'border-green-500 bg-green-50'
                    : 'border-dashed border-primary/40 bg-primary/5 hover:border-primary',
                )}
              >
                {body}
                <span className="ml-auto text-[9px] font-bold uppercase text-primary shrink-0">
                  {selected ? 'Applied' : 'Apply'}
                </span>
              </button>
            );
          }

          return (
            <div
              key={c.code}
              className={cn(
                'flex items-center gap-2 rounded-xl border border-dashed border-primary/40 bg-primary/5 px-3 py-2.5 shrink-0 min-w-[220px]',
                compact && 'min-w-0 w-full',
              )}
            >
              {body}
              <button
                type="button"
                onClick={() => void copyCode(c.code)}
                className="ml-auto p-1.5 rounded-lg text-primary hover:bg-primary/10 outline-none shrink-0"
                aria-label={`Copy ${c.code}`}
                title="Copy code"
              >
                {copied === c.code ? <Check size={14} /> : <Copy size={14} />}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
