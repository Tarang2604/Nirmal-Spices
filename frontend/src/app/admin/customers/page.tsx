"use client";

import React, { Suspense, useEffect, useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import {
  Loader2,
  Search,
  ShieldBan,
  ShieldCheck,
  Users,
  Mail,
  Phone,
  MapPin,
  ChevronDown,
  Eye,
  X,
  Calendar,
  ShoppingBag,
  IndianRupee,
  BadgeCheck,
  UserRound,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';

type CustomerStatus = 'active' | 'blocked';

type Address = {
  label?: string;
  fullName?: string;
  phone?: string;
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  pincode?: string;
  isDefault?: boolean;
};

type Customer = {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  isVerified: boolean;
  isBlocked: boolean;
  addresses?: Address[];
  createdAt: string;
  updatedAt?: string;
  avatar?: string;
  stats?: { orderCount: number; totalSpent: number };
};

function extractCustomers(payload: unknown): {
  customers: Customer[];
  counts: { active: number; blocked: number; all: number };
  total: number;
} {
  const body = payload as {
    data?: Customer[] | { data?: Customer[] };
    meta?: { total?: number; counts?: { active: number; blocked: number; all: number } };
  };

  const raw = Array.isArray(body?.data)
    ? body.data
    : Array.isArray((body?.data as { data?: Customer[] })?.data)
      ? (body.data as { data: Customer[] }).data
      : [];

  return {
    customers: raw,
    total: body?.meta?.total ?? raw.length,
    counts: body?.meta?.counts || { active: raw.length, blocked: 0, all: raw.length },
  };
}

export default function AdminCustomersPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 text-[#8B1E1E] animate-spin" />
        </div>
      }
    >
      <AdminCustomersInner />
    </Suspense>
  );
}

function AdminCustomersInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const status = (searchParams.get('status') === 'blocked' ? 'blocked' : 'active') as CustomerStatus;
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput.trim()), 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  const setStatusAndUrl = (next: CustomerStatus) => {
    setMenuOpen(false);
    setSelectedId(null);
    router.replace(`/admin/customers?status=${next}`);
  };

  const { data, isLoading, isFetching, error, refetch, isSuccess } = useQuery({
    queryKey: ['admin-customers', status, search],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set('status', status);
      params.set('limit', '100');
      if (search) params.set('search', search);
      const res = await api.get(`/admin/users?${params.toString()}`);
      return extractCustomers(res.data);
    },
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const {
    data: detail,
    isLoading: detailLoading,
    error: detailError,
  } = useQuery({
    queryKey: ['admin-customer-detail', selectedId],
    enabled: Boolean(selectedId),
    queryFn: async () => {
      const res = await api.get(`/admin/users/${selectedId}`);
      const payload = res.data?.data ?? res.data;
      return payload as Customer;
    },
  });

  const customers = data?.customers || [];
  const counts = data?.counts || { active: 0, blocked: 0, all: 0 };
  const errorMessage =
    (error as any)?.response?.data?.message ||
    (error as Error | null)?.message ||
    null;

  const blockMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.put(`/admin/users/${id}/block`);
      return res.data;
    },
    onSuccess: (res) => {
      toast.success(res.message || 'Customer status updated');
      queryClient.invalidateQueries({ queryKey: ['admin-customers'] });
      queryClient.invalidateQueries({ queryKey: ['admin-customer-detail'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update customer');
    },
  });

  const statusLabel = status === 'active' ? 'Active Customers' : 'Blocked Customers';

  const rows = useMemo(() => customers, [customers]);

  return (
    <div className="max-w-7xl mx-auto space-y-6 font-sans">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display font-bold text-2xl text-charcoal">Customers</h1>
          <p className="text-[13px] text-muted-foreground mt-1">
            Live from database · {counts.all} registered customer{counts.all === 1 ? '' : 's'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => void refetch()}
            className="inline-flex items-center gap-2 border border-gray-200 bg-white text-charcoal text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-xl hover:bg-gray-50"
          >
            {isFetching ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
            Refresh
          </button>
          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              className="inline-flex items-center gap-2 bg-[#3D1F1F] text-white text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-xl"
            >
              <Users size={14} />
              {statusLabel}
              <ChevronDown size={14} />
            </button>
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-100 rounded-xl shadow-lg z-20 overflow-hidden">
                <button
                  type="button"
                  className={cn(
                    'w-full text-left px-4 py-2.5 text-xs font-semibold hover:bg-gray-50 flex justify-between',
                    status === 'active' && 'bg-[#FAF7F2] text-[#8B1E1E]',
                  )}
                  onClick={() => setStatusAndUrl('active')}
                >
                  Active Customers
                  <span className="text-muted-foreground">{counts.active}</span>
                </button>
                <button
                  type="button"
                  className={cn(
                    'w-full text-left px-4 py-2.5 text-xs font-semibold hover:bg-gray-50 flex justify-between',
                    status === 'blocked' && 'bg-[#FAF7F2] text-[#8B1E1E]',
                  )}
                  onClick={() => setStatusAndUrl('blocked')}
                >
                  Blocked Customers
                  <span className="text-muted-foreground">{counts.blocked}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[220px] max-w-md">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by name, email, phone..."
            className="w-full bg-white border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 text-sm outline-none focus:border-[#8B1E1E]"
          />
        </div>
        <div className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">
          Showing {rows.length}
          {isSuccess ? ` of ${data?.total ?? rows.length}` : ''}
          {isFetching ? ' · refreshing…' : ''}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 text-[#8B1E1E] animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center p-8 space-y-3">
            <p className="text-muted-foreground text-xs">
              {errorMessage || 'Failed to load customers from database.'}
            </p>
            <button
              type="button"
              onClick={() => void refetch()}
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#8B1E1E] hover:underline"
            >
              <RefreshCw size={12} /> Try again
            </button>
          </div>
        ) : rows.length === 0 ? (
          <div className="text-center p-12 text-muted-foreground text-xs">
            No {status} customers found. New registrations will appear here after Create Account.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#FAF7F2] border-b border-gray-100 font-bold uppercase tracking-wider text-muted-foreground">
                  <th className="p-4">Customer</th>
                  <th className="p-4">Contact</th>
                  <th className="p-4">Orders</th>
                  <th className="p-4">Joined</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {rows.map((u) => {
                  const addr = u.addresses?.find((a) => a.isDefault) || u.addresses?.[0];
                  return (
                    <tr key={u._id} className="hover:bg-gray-50/80">
                      <td className="p-4">
                        <div className="font-bold text-charcoal">{u.name || '—'}</div>
                        <div className="text-[10px] text-muted-foreground">
                          ID: {String(u._id).slice(-6).toUpperCase()}
                          {u.isVerified ? ' · Verified' : ' · Unverified'}
                        </div>
                        {addr && (
                          <div className="text-[10px] text-muted-foreground mt-1 inline-flex items-center gap-1">
                            <MapPin size={10} />
                            {[addr.city, addr.state].filter(Boolean).join(', ') || 'Address saved'}
                          </div>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1.5 text-charcoal">
                          <Mail size={12} className="text-muted-foreground shrink-0" />
                          <span className="break-all">{u.email || '—'}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-muted-foreground mt-1">
                          <Phone size={12} className="shrink-0" />
                          {u.phone || 'Not provided'}
                        </div>
                      </td>
                      <td className="p-4 text-muted-foreground">
                        <div className="font-semibold text-charcoal">
                          {u.stats?.orderCount ?? 0} order{(u.stats?.orderCount ?? 0) === 1 ? '' : 's'}
                        </div>
                        <div className="text-[10px]">
                          ₹{Number(u.stats?.totalSpent || 0).toLocaleString('en-IN')}
                        </div>
                      </td>
                      <td className="p-4 text-muted-foreground">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-IN') : '—'}
                      </td>
                      <td className="p-4">
                        <span
                          className={cn(
                            'inline-block text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full',
                            u.isBlocked ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700',
                          )}
                        >
                          {u.isBlocked ? 'Blocked' : 'Active'}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedId(u._id)}
                            className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg border border-gray-200 text-charcoal hover:bg-gray-50"
                            title="View details"
                          >
                            <Eye size={12} /> View
                          </button>
                          <button
                            type="button"
                            disabled={blockMutation.isPending}
                            onClick={() => {
                              const action = u.isBlocked ? 'unblock' : 'block';
                              if (confirm(`${action === 'block' ? 'Block' : 'Unblock'} ${u.name}?`)) {
                                blockMutation.mutate(u._id);
                              }
                            }}
                            className={cn(
                              'inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg border',
                              u.isBlocked
                                ? 'border-green-200 text-green-700 hover:bg-green-50'
                                : 'border-red-200 text-red-600 hover:bg-red-50',
                            )}
                          >
                            {u.isBlocked ? <ShieldCheck size={12} /> : <ShieldBan size={12} />}
                            {u.isBlocked ? 'Unblock' : 'Block'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedId && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            aria-label="Close details"
            onClick={() => setSelectedId(null)}
          />
          <aside className="relative w-full max-w-md h-full bg-white shadow-2xl overflow-y-auto p-6 space-y-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-display font-bold text-xl text-charcoal">Customer Details</h2>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Registration profile from database
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedId(null)}
                className="p-2 rounded-lg hover:bg-gray-100 text-muted-foreground"
              >
                <X size={16} />
              </button>
            </div>

            {detailLoading ? (
              <div className="flex justify-center py-16">
                <Loader2 className="w-7 h-7 text-[#8B1E1E] animate-spin" />
              </div>
            ) : detailError || !detail ? (
              <div className="text-center text-xs text-muted-foreground py-10">
                {(detailError as any)?.response?.data?.message ||
                  'Failed to load customer details.'}
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 bg-[#FAF7F2] rounded-2xl p-4">
                  <div className="w-12 h-12 rounded-full bg-[#8B1E1E] text-white flex items-center justify-center font-bold">
                    {(detail.name || 'C')
                      .split(' ')
                      .map((p) => p[0])
                      .join('')
                      .slice(0, 2)
                      .toUpperCase()}
                  </div>
                  <div>
                    <div className="font-bold text-charcoal text-sm">{detail.name}</div>
                    <div className="text-[11px] text-muted-foreground">{detail.email}</div>
                    <span
                      className={cn(
                        'inline-block mt-1 text-[9px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full',
                        detail.isBlocked ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700',
                      )}
                    >
                      {detail.isBlocked ? 'Blocked' : 'Active'}
                    </span>
                  </div>
                </div>

                <section className="space-y-3">
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Registration details
                  </h3>
                  <DetailRow icon={<UserRound size={14} />} label="Full name" value={detail.name} />
                  <DetailRow icon={<Mail size={14} />} label="Email" value={detail.email} />
                  <DetailRow
                    icon={<Phone size={14} />}
                    label="Mobile"
                    value={detail.phone || 'Not provided'}
                  />
                  <DetailRow
                    icon={<BadgeCheck size={14} />}
                    label="Email verified"
                    value={detail.isVerified ? 'Yes' : 'No'}
                  />
                  <DetailRow
                    icon={<Calendar size={14} />}
                    label="Registered on"
                    value={
                      detail.createdAt
                        ? new Date(detail.createdAt).toLocaleString('en-IN')
                        : '—'
                    }
                  />
                  <DetailRow
                    icon={<UserRound size={14} />}
                    label="Customer ID"
                    value={String(detail._id)}
                  />
                </section>

                <section className="space-y-3">
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Orders summary
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl border border-gray-100 p-3">
                      <div className="flex items-center gap-1.5 text-muted-foreground text-[10px] uppercase font-bold">
                        <ShoppingBag size={12} /> Orders
                      </div>
                      <div className="text-lg font-bold text-charcoal mt-1">
                        {detail.stats?.orderCount ?? 0}
                      </div>
                    </div>
                    <div className="rounded-xl border border-gray-100 p-3">
                      <div className="flex items-center gap-1.5 text-muted-foreground text-[10px] uppercase font-bold">
                        <IndianRupee size={12} /> Spent
                      </div>
                      <div className="text-lg font-bold text-charcoal mt-1">
                        ₹{Number(detail.stats?.totalSpent || 0).toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>
                </section>

                <section className="space-y-3">
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Saved addresses ({detail.addresses?.length || 0})
                  </h3>
                  {!detail.addresses?.length ? (
                    <p className="text-xs text-muted-foreground">No addresses saved yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {detail.addresses.map((a, idx) => (
                        <div
                          key={idx}
                          className="rounded-xl border border-gray-100 p-3 text-xs space-y-1"
                        >
                          <div className="font-bold text-charcoal flex items-center gap-2">
                            <MapPin size={12} className="text-[#8B1E1E]" />
                            {(a.label || 'Address').toUpperCase()}
                            {a.isDefault && (
                              <span className="text-[9px] bg-green-50 text-green-700 px-1.5 py-0.5 rounded-full">
                                Default
                              </span>
                            )}
                          </div>
                          <div className="text-muted-foreground leading-relaxed">
                            {[a.fullName, a.phone, a.line1, a.line2, a.city, a.state, a.pincode]
                              .filter(Boolean)
                              .join(', ')}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>

                <button
                  type="button"
                  disabled={blockMutation.isPending}
                  onClick={() => {
                    if (confirm(`${detail.isBlocked ? 'Unblock' : 'Block'} ${detail.name}?`)) {
                      blockMutation.mutate(detail._id);
                    }
                  }}
                  className={cn(
                    'w-full py-3 rounded-xl text-xs font-bold uppercase tracking-wider inline-flex items-center justify-center gap-2',
                    detail.isBlocked
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-red-600 text-white hover:bg-red-700',
                  )}
                >
                  {detail.isBlocked ? <ShieldCheck size={14} /> : <ShieldBan size={14} />}
                  {detail.isBlocked ? 'Unblock Customer' : 'Block Customer'}
                </button>
              </>
            )}
          </aside>
        </div>
      )}
    </div>
  );
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 py-2 border-b border-gray-50 last:border-0">
      <span className="text-muted-foreground mt-0.5">{icon}</span>
      <div className="min-w-0">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
          {label}
        </div>
        <div className="text-sm text-charcoal break-all">{value}</div>
      </div>
    </div>
  );
}
