"use client";

import React from 'react';
import { cn } from '@/lib/utils';
import { Truck, Package, CheckCircle2, Clock, MapPin, XCircle } from 'lucide-react';

export const ORDER_TRACK_STEPS = [
  { value: 'pending', label: 'Ordered', icon: Clock },
  { value: 'confirmed', label: 'Confirmed', icon: CheckCircle2 },
  { value: 'processing', label: 'Processing', icon: Package },
  { value: 'dispatched', label: 'Dispatched', icon: Truck },
  { value: 'out-for-delivery', label: 'Out for delivery', icon: MapPin },
  { value: 'delivered', label: 'Delivered', icon: CheckCircle2 },
] as const;

export function statusStepIndex(status: string): number {
  if (status === 'cancelled' || status === 'payment-failed' || status === 'refunded') return -1;
  if (status === 'pending') return 0;
  if (status === 'confirmed') return 1;
  if (status === 'processing') return 2;
  if (status === 'dispatched') return 3;
  if (status === 'out-for-delivery') return 4;
  if (status === 'delivered') return 5;
  return 0;
}

export function statusBadgeClass(status: string) {
  return cn(
    'text-[9px] font-bold uppercase px-2.5 py-1 rounded-full border',
    status === 'delivered' && 'bg-green-50 text-green-700 border-green-200',
    status === 'pending' && 'bg-yellow-50 text-yellow-700 border-yellow-200',
    status === 'cancelled' && 'bg-red-50 text-red-700 border-red-200',
    status === 'confirmed' && 'bg-blue-50 text-blue-700 border-blue-200',
    status === 'processing' && 'bg-indigo-50 text-indigo-700 border-indigo-200',
    status === 'dispatched' && 'bg-purple-50 text-purple-700 border-purple-200',
    status === 'out-for-delivery' && 'bg-orange-50 text-orange-700 border-orange-200',
    status === 'refunded' && 'bg-slate-50 text-slate-700 border-slate-200',
    status === 'payment-failed' && 'bg-red-50 text-red-700 border-red-200',
  );
}

export function formatStatusLabel(status: string) {
  return String(status || '')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

type TimelineEntry = {
  status: string;
  timestamp: string | Date;
  note?: string;
};

interface OrderTrackerProps {
  status: string;
  timeline?: TimelineEntry[];
  trackingNumber?: string;
  compact?: boolean;
  className?: string;
}

export default function OrderTracker({
  status,
  timeline = [],
  trackingNumber,
  compact = false,
  className,
}: OrderTrackerProps) {
  const activeStepIdx = statusStepIndex(status);
  const isTerminalBad =
    status === 'cancelled' || status === 'payment-failed' || status === 'refunded';

  const sortedTimeline = [...(timeline || [])].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
  );

  return (
    <div
      id="track"
      className={cn(
        'bg-white border border-border-spice/40 rounded-2xl shadow-sm flex flex-col gap-5',
        compact ? 'p-4' : 'p-6',
        className,
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-bold text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          <Truck size={14} className="text-primary" /> Track Order
        </h3>
        <span className={statusBadgeClass(status)}>{formatStatusLabel(status)}</span>
      </div>

      {isTerminalBad ? (
        <div
          className={cn(
            'p-3 rounded-xl text-center text-xs font-semibold border flex items-center justify-center gap-2',
            status === 'cancelled' || status === 'payment-failed'
              ? 'bg-red-50 text-red-700 border-red-200'
              : 'bg-slate-50 text-slate-700 border-slate-200',
          )}
        >
          <XCircle size={14} />
          {status === 'cancelled' && 'This order was cancelled.'}
          {status === 'payment-failed' && 'Payment failed for this order.'}
          {status === 'refunded' && 'This order was refunded.'}
        </div>
      ) : (
        <div className="overflow-x-auto pb-1">
          <div className="flex items-start justify-between relative min-w-[520px] select-none px-1">
            {ORDER_TRACK_STEPS.map((stepItem, idx) => {
              const Icon = stepItem.icon;
              const isActive = activeStepIdx === idx;
              const isDone = activeStepIdx > idx;
              return (
                <div key={stepItem.value} className="flex flex-col items-center gap-2 relative z-10 flex-1">
                  <span
                    className={cn(
                      'w-8 h-8 flex items-center justify-center rounded-full border transition-colors',
                      isActive && 'bg-primary border-primary text-white scale-110 shadow-sm',
                      isDone && 'bg-green-600 border-green-600 text-white',
                      !isActive && !isDone && 'bg-white border-border text-muted-foreground',
                    )}
                  >
                    {isDone ? '✓' : <Icon size={14} />}
                  </span>
                  <span
                    className={cn(
                      'text-[9px] font-bold uppercase tracking-wider font-accent text-center leading-tight px-0.5',
                      isActive ? 'text-primary' : 'text-muted-foreground',
                    )}
                  >
                    {stepItem.label}
                  </span>
                </div>
              );
            })}
            <div className="absolute top-4 left-[8%] right-[8%] h-0.5 bg-border-spice/50 -z-0" />
            {activeStepIdx > 0 && (
              <div
                className="absolute top-4 left-[8%] h-0.5 bg-green-500 -z-0 transition-all"
                style={{
                  width: `${Math.min(100, (activeStepIdx / (ORDER_TRACK_STEPS.length - 1)) * 84)}%`,
                }}
              />
            )}
          </div>
        </div>
      )}

      {trackingNumber ? (
        <div className="bg-cream/50 border border-border-spice/55 p-3 rounded-xl flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <Truck size={14} className="text-primary" /> Courier tracking
          </span>
          <strong className="text-charcoal font-semibold tracking-wide">{trackingNumber}</strong>
        </div>
      ) : null}

      {sortedTimeline.length > 0 && (
        <div className="flex flex-col gap-3 border-t border-border-spice/40 pt-4">
          <p className="font-bold text-[10px] uppercase tracking-wider text-muted-foreground">
            Status history
          </p>
          <ol className="relative border-l border-border-spice/60 ml-2 space-y-4">
            {sortedTimeline.map((entry, idx) => (
              <li key={`${entry.status}-${idx}-${entry.timestamp}`} className="ml-4">
                <span
                  className={cn(
                    'absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full border-2 border-white',
                    idx === sortedTimeline.length - 1 ? 'bg-primary' : 'bg-green-600',
                  )}
                />
                <p className="text-xs font-bold text-charcoal">{formatStatusLabel(entry.status)}</p>
                <p className="text-[10px] text-muted-foreground">
                  {new Date(entry.timestamp).toLocaleString('en-IN')}
                </p>
                {entry.note ? (
                  <p className="text-[11px] text-foreground/70 mt-0.5">{entry.note}</p>
                ) : null}
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
