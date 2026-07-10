"use client";

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { 
  ShoppingBag, 
  Loader2, 
  ChevronRight, 
  ArrowRight,
  ClipboardList
} from 'lucide-react';
import { toast } from 'sonner';

export default function AdminOrdersPage() {
  const queryClient = useQueryClient();
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [note, setNote] = useState('');

  // Fetch all orders
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-orders-list'],
    queryFn: async () => {
      // Fetch orders via admin endpoint or generic list (since admin has middleware authorization)
      const res = await api.get('/orders?limit=100'); // generic orders list, or we can use admin specific if needed
      return res.data;
    },
  });

  const orders = data?.data || [];

  // Update order status mutation
  const updateMutation = useMutation({
    mutationFn: async ({ orderId, status, tracking, notes }: { orderId: string, status: string, tracking?: string, notes?: string }) => {
      const res = await api.put(`/admin/orders/${orderId}/status`, {
        status,
        trackingNumber: tracking,
        note: notes
      });
      return res.data;
    },
    onSuccess: () => {
      toast.success("Order status updated successfully!");
      setUpdatingOrderId(null);
      setSelectedStatus('');
      setTrackingNumber('');
      setNote('');
      queryClient.invalidateQueries({ queryKey: ['admin-orders-list'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to update order status");
    }
  });

  const handleUpdateSubmit = (e: React.FormEvent, orderId: string) => {
    e.preventDefault();
    if (!selectedStatus) return;
    updateMutation.mutate({
      orderId,
      status: selectedStatus,
      tracking: trackingNumber,
      notes: note
    });
  };

  return (
    <div className="flex flex-col gap-6 font-sans">
      
      {/* Header */}
      <div>
        <h1 className="font-display font-bold text-2xl text-charcoal">Manage Orders</h1>
        <p className="text-muted-foreground text-xs mt-1">Reconcile payments and update courier delivery timelines.</p>
      </div>

      <div className="bg-white rounded-2xl border border-border-spice/40 overflow-hidden shadow-sm">
        
        {isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>
        ) : error ? (
          <div className="text-center p-8 text-muted-foreground text-xs">Failed to load orders.</div>
        ) : orders.length === 0 ? (
          <div className="text-center p-12 text-muted-foreground text-xs">No orders registered in the system yet.</div>
        ) : (
          /* Orders Table list */
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-cream/45 border-b border-border-spice/55 font-bold uppercase tracking-wider text-muted-foreground">
                  <th className="p-4">Order ID</th>
                  <th className="p-4">Customer Details</th>
                  <th className="p-4">Price Total</th>
                  <th className="p-4">Order Status</th>
                  <th className="p-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-spice/45">
                {orders.map((order: any) => (
                  <React.Fragment key={order._id}>
                    <tr className="hover:bg-cream-dark/5">
                      <td className="p-4 font-bold text-charcoal">
                        #{order._id.substring(order._id.length - 8)}
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col">
                          <span className="font-semibold">{order.address?.fullName || order.guestEmail}</span>
                          <span className="text-[10px] text-muted-foreground">{order.address?.phone || order.guestPhone}</span>
                        </div>
                      </td>
                      <td className="p-4 font-bold text-charcoal">
                        ₹{order.total.toLocaleString('en-IN')}
                      </td>
                      <td className="p-4">
                        <span className={cn(
                          "text-[9px] font-bold uppercase px-2.5 py-1 rounded-full",
                          order.status === 'delivered' && "bg-green-50 text-green-700 border border-green-200",
                          order.status === 'pending' && "bg-yellow-50 text-yellow-700 border border-yellow-200",
                          order.status === 'cancelled' && "bg-red-50 text-red-700 border border-red-200",
                          order.status === 'confirmed' && "bg-blue-50 text-blue-700 border border-blue-200",
                          order.status === 'processing' && "bg-indigo-50 text-indigo-700 border border-indigo-200",
                          order.status === 'dispatched' && "bg-purple-50 text-purple-700 border border-purple-200"
                        )}>
                          {order.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => {
                            if (updatingOrderId === order._id) {
                              setUpdatingOrderId(null);
                            } else {
                              setUpdatingOrderId(order._id);
                              setSelectedStatus(order.status);
                              setTrackingNumber(order.trackingNumber || '');
                            }
                          }}
                          className="text-primary hover:underline font-bold text-[10px] font-accent uppercase"
                        >
                          Manage
                        </button>
                      </td>
                    </tr>

                    {/* Expandable Manage panel */}
                    {updatingOrderId === order._id && (
                      <tr className="bg-cream-dark/5">
                        <td colSpan={5} className="p-6">
                          <form 
                            onSubmit={(e) => handleUpdateSubmit(e, order._id)}
                            className="max-w-md flex flex-col gap-4 text-xs font-sans text-charcoal bg-white p-4 rounded-xl border border-border-spice/40 shadow-inner"
                          >
                            <h4 className="font-bold text-sm mb-1">Update Status Order #{order._id.substring(order._id.length - 8)}</h4>
                            
                            {/* Status selection */}
                            <div className="flex flex-col gap-1.5">
                              <label className="font-bold text-muted-foreground">Select Status</label>
                              <select
                                value={selectedStatus}
                                onChange={(e) => setSelectedStatus(e.target.value)}
                                className="bg-cream-dark/25 border border-border rounded-lg px-3 py-2 text-xs outline-none"
                              >
                                <option value="pending">Pending</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="processing">Processing</option>
                                <option value="dispatched">Dispatched</option>
                                <option value="out-for-delivery">Out for Delivery</option>
                                <option value="delivered">Delivered</option>
                                <option value="cancelled">Cancelled</option>
                              </select>
                            </div>

                            {/* Tracking ID */}
                            <div className="flex flex-col gap-1.5">
                              <label className="font-bold text-muted-foreground">Tracking Number (Required for Dispatched)</label>
                              <input
                                type="text"
                                placeholder="E.g. Delhivery_12345..."
                                value={trackingNumber}
                                onChange={(e) => setTrackingNumber(e.target.value)}
                                className="bg-cream-dark/25 border border-border rounded-lg px-3 py-2 text-xs outline-none"
                              />
                            </div>

                            {/* Status Notes */}
                            <div className="flex flex-col gap-1.5">
                              <label className="font-bold text-muted-foreground">Internal Notes / Update Reason</label>
                              <input
                                type="text"
                                placeholder="Order verified, dispatched via Delhivery..."
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                className="bg-cream-dark/25 border border-border rounded-lg px-3 py-2 text-xs outline-none"
                              />
                            </div>

                            {/* Submit */}
                            <button
                              type="submit"
                              disabled={updateMutation.isPending}
                              className="bg-primary hover:bg-crimson-dark text-white font-semibold font-accent uppercase tracking-wider text-[10px] py-2.5 rounded-lg flex items-center justify-center gap-1.5 mt-2 outline-none"
                            >
                              {updateMutation.isPending && <Loader2 className="w-3 h-3 animate-spin" />}
                              Update Status
                            </button>

                          </form>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>

    </div>
  );
}
