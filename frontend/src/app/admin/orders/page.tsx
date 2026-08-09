"use client";

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { formatStatusLabel, statusBadgeClass } from '@/components/orders/OrderTracker';

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'processing', label: 'Processing' },
  { value: 'dispatched', label: 'Dispatched' },
  { value: 'out-for-delivery', label: 'Out for Delivery' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'refunded', label: 'Refunded' },
] as const;

export default function AdminOrdersPage() {
  const queryClient = useQueryClient();
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [draftStatus, setDraftStatus] = useState<Record<string, string>>({});
  const [trackingByOrder, setTrackingByOrder] = useState<Record<string, string>>({});
  const [noteByOrder, setNoteByOrder] = useState<Record<string, string>>({});

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-orders-list'],
    queryFn: async () => {
      const res = await api.get('/admin/orders?limit=100');
      return res.data;
    },
    staleTime: 30_000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchInterval: 30_000,
  });

  const orders = data?.data || [];

  const updateMutation = useMutation({
    mutationFn: async ({
      orderId,
      status,
      tracking,
      notes,
    }: {
      orderId: string;
      status: string;
      tracking?: string;
      notes?: string;
    }) => {
      const res = await api.put(`/admin/orders/${orderId}/status`, {
        status,
        trackingNumber: tracking,
        note: notes,
      });
      return res.data;
    },
    onSuccess: () => {
      toast.success('Order status updated — visible on customer Track Order');
      setUpdatingOrderId(null);
      queryClient.invalidateQueries({ queryKey: ['admin-orders-list'] });
      queryClient.invalidateQueries({ queryKey: ['my-orders'] });
      queryClient.invalidateQueries({ queryKey: ['order-detail'] });
      queryClient.invalidateQueries({ queryKey: ['order-confirmation'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update order status');
    },
  });

  const markPaidMutation = useMutation({
    mutationFn: async (orderId: string) => {
      const res = await api.put(`/orders/${orderId}/mark-paid-test`);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Order marked as paid (test mode) — no real payment occurred');
      queryClient.invalidateQueries({ queryKey: ['admin-orders-list'] });
      queryClient.invalidateQueries({ queryKey: ['my-orders'] });
      queryClient.invalidateQueries({ queryKey: ['order-detail'] });
      queryClient.invalidateQueries({ queryKey: ['order-confirmation'] });
    },
    onError: (err: any) => {
      toast.error(
        err.response?.data?.message ||
          'Failed to mark order as paid — is PAYMENT_TEST_MODE enabled on the backend?',
      );
    },
  });

  const applyStatus = (order: any, nextStatus: string) => {
    setDraftStatus((prev) => ({ ...prev, [order._id]: nextStatus }));
    updateMutation.mutate({
      orderId: order._id,
      status: nextStatus,
      tracking: trackingByOrder[order._id] ?? order.trackingNumber ?? '',
      notes: noteByOrder[order._id] || undefined,
    });
  };

  return (
    <div className="flex flex-col gap-6 font-sans">
      <div>
        <h1 className="font-display font-bold text-2xl text-charcoal">Manage Orders</h1>
        <p className="text-muted-foreground text-xs mt-1">
          Change status from the dropdown — customers see it on Track Order in real time.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-border-spice/40 overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center p-8 text-muted-foreground text-xs">Failed to load orders.</div>
        ) : orders.length === 0 ? (
          <div className="text-center p-12 text-muted-foreground text-xs">
            No orders registered in the system yet.
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-cream/45 border-b border-border-spice/55 font-bold uppercase tracking-wider text-muted-foreground">
                  <th className="p-4">Order ID</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Total</th>
                  <th className="p-4">Current Status</th>
                  <th className="p-4 min-w-[200px]">Update Status</th>
                  <th className="p-4">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-spice/45">
                {orders.map((order: any) => {
                  const currentDraft = draftStatus[order._id] ?? order.status;
                  const busy = updateMutation.isPending && updateMutation.variables?.orderId === order._id;
                  return (
                    <React.Fragment key={order._id}>
                      <tr className="hover:bg-cream-dark/5">
                        <td className="p-4 font-bold text-charcoal">
                          #{order._id.substring(order._id.length - 8)}
                        </td>
                        <td className="p-4">
                          <div className="flex flex-col">
                            <span className="font-semibold">
                              {order.address?.fullName || order.guestEmail || '—'}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              {order.address?.phone || order.guestPhone || ''}
                            </span>
                          </div>
                        </td>
                        <td className="p-4 font-bold text-charcoal">
                          ₹{order.total.toLocaleString('en-IN')}
                        </td>
                        <td className="p-4">
                          <span className={statusBadgeClass(order.status)}>
                            {formatStatusLabel(order.status)}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <select
                              value={currentDraft}
                              disabled={busy}
                              onChange={(e) => applyStatus(order, e.target.value)}
                              className="bg-cream-dark/25 border border-border rounded-lg px-2.5 py-2 text-xs outline-none min-w-[160px] disabled:opacity-50"
                              aria-label="Change order status"
                            >
                              {STATUS_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                  {opt.label}
                                </option>
                              ))}
                            </select>
                            {busy && <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex flex-col items-start gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                if (updatingOrderId === order._id) {
                                  setUpdatingOrderId(null);
                                } else {
                                  setUpdatingOrderId(order._id);
                                  setTrackingByOrder((p) => ({
                                    ...p,
                                    [order._id]: order.trackingNumber || '',
                                  }));
                                }
                              }}
                              className="text-primary hover:underline font-bold text-[10px] font-accent uppercase"
                            >
                              {updatingOrderId === order._id ? 'Close' : 'Tracking / Notes'}
                            </button>
                            {order.paymentMethod === 'razorpay' && order.paymentStatus !== 'paid' && (
                              <button
                                type="button"
                                title="TEST ONLY — manually confirms payment without a real Razorpay transaction. Requires PAYMENT_TEST_MODE=true on the backend."
                                disabled={
                                  markPaidMutation.isPending &&
                                  markPaidMutation.variables === order._id
                                }
                                onClick={() => markPaidMutation.mutate(order._id)}
                                className="text-amber-700 hover:underline font-bold text-[10px] font-accent uppercase disabled:opacity-50"
                              >
                                {markPaidMutation.isPending && markPaidMutation.variables === order._id
                                  ? 'Marking…'
                                  : 'Mark as Paid (Test)'}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>

                      {updatingOrderId === order._id && (
                        <tr className="bg-cream-dark/5">
                          <td colSpan={6} className="p-6">
                            <div className="max-w-lg flex flex-col gap-3 text-xs bg-white p-4 rounded-xl border border-border-spice/40">
                              <div className="grid grid-cols-2 gap-2 bg-cream/40 rounded-lg p-3 text-[10px]">
                                <span>Subtotal: ₹{order.subtotal?.toLocaleString('en-IN')}</span>
                                <span>Shipping: ₹{order.shipping}</span>
                                <span>Commission: ₹{(order.commission || 0).toLocaleString('en-IN')}</span>
                                <span>Platform: ₹{(order.platformFee || 0).toLocaleString('en-IN')}</span>
                                <span className="col-span-2 font-bold text-primary">
                                  Total: ₹{order.total?.toLocaleString('en-IN')} · {order.paymentMethod} ·{' '}
                                  {order.paymentStatus}
                                </span>
                              </div>

                              {Array.isArray(order.timeline) && order.timeline.length > 0 && (
                                <div className="border border-border-spice/40 rounded-lg p-3 max-h-36 overflow-y-auto">
                                  <p className="font-bold text-muted-foreground mb-2 uppercase tracking-wider text-[9px]">
                                    Timeline
                                  </p>
                                  <ul className="space-y-2">
                                    {[...order.timeline]
                                      .sort(
                                        (a: any, b: any) =>
                                          new Date(a.timestamp).getTime() -
                                          new Date(b.timestamp).getTime(),
                                      )
                                      .map((t: any, i: number) => (
                                        <li key={i} className="text-[10px]">
                                          <strong>{formatStatusLabel(t.status)}</strong>
                                          <span className="text-muted-foreground">
                                            {' '}
                                            · {new Date(t.timestamp).toLocaleString('en-IN')}
                                          </span>
                                          {t.note && (
                                            <div className="text-muted-foreground">{t.note}</div>
                                          )}
                                        </li>
                                      ))}
                                  </ul>
                                </div>
                              )}

                              <label className="font-bold text-muted-foreground">Tracking number</label>
                              <input
                                type="text"
                                value={trackingByOrder[order._id] ?? order.trackingNumber ?? ''}
                                onChange={(e) =>
                                  setTrackingByOrder((p) => ({ ...p, [order._id]: e.target.value }))
                                }
                                placeholder="Courier AWB / tracking ID"
                                className="bg-cream-dark/25 border border-border rounded-lg px-3 py-2 text-xs outline-none"
                              />

                              <label className="font-bold text-muted-foreground">Note (optional)</label>
                              <input
                                type="text"
                                value={noteByOrder[order._id] ?? ''}
                                onChange={(e) =>
                                  setNoteByOrder((p) => ({ ...p, [order._id]: e.target.value }))
                                }
                                placeholder="Packed / handed to courier…"
                                className="bg-cream-dark/25 border border-border rounded-lg px-3 py-2 text-xs outline-none"
                              />

                              <button
                                type="button"
                                disabled={busy}
                                onClick={() =>
                                  updateMutation.mutate({
                                    orderId: order._id,
                                    status: currentDraft,
                                    tracking: trackingByOrder[order._id] ?? '',
                                    notes: noteByOrder[order._id],
                                  })
                                }
                                className="bg-primary text-white font-semibold font-accent uppercase tracking-wider text-[10px] py-2.5 rounded-lg disabled:opacity-50"
                              >
                                {busy ? 'Saving…' : 'Save tracking & note'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
