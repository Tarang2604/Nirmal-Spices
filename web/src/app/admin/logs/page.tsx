"use client";

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Loader2, ShieldCheck, Clock, User } from 'lucide-react';

export default function AdminAuditLogsPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-audit-logs'],
    queryFn: async () => {
      const res = await api.get('/admin/audit-logs');
      return res.data;
    },
  });

  const logs = data?.data || [];

  return (
    <div className="flex flex-col gap-6 font-sans">
      
      {/* Header */}
      <div>
        <h1 className="font-display font-bold text-2xl text-charcoal">Security Audit Logs</h1>
        <p className="text-muted-foreground text-xs mt-1">Real-time log of administrative activities and webhooks.</p>
      </div>

      <div className="bg-white rounded-2xl border border-border-spice/40 overflow-hidden shadow-sm">
        
        {isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>
        ) : error ? (
          <div className="text-center p-8 text-muted-foreground text-xs">Failed to load audit logs.</div>
        ) : logs.length === 0 ? (
          <div className="text-center p-12 text-muted-foreground text-xs">No admin activity logged yet.</div>
        ) : (
          /* Logs list */
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-cream/45 border-b border-border-spice/55 font-bold uppercase tracking-wider text-muted-foreground">
                  <th className="p-4">Timestamp</th>
                  <th className="p-4">Action</th>
                  <th className="p-4">Entity</th>
                  <th className="p-4">Admin User</th>
                  <th className="p-4">IP / User Agent</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-spice/45 text-charcoal">
                {logs.map((log: any) => (
                  <tr key={log._id} className="hover:bg-cream-dark/5">
                    <td className="p-4 text-muted-foreground whitespace-nowrap">
                      <span className="flex items-center gap-1"><Clock size={12} /> {new Date(log.createdAt).toLocaleString()}</span>
                    </td>
                    <td className="p-4 font-bold text-primary">{log.action}</td>
                    <td className="p-4 capitalize">
                      {log.entity} {log.entityId && `(#${log.entityId.substring(log.entityId.length - 6)})`}
                    </td>
                    <td className="p-4">
                      <span className="flex items-center gap-1"><User size={12} className="text-muted-foreground" /> {log.adminUser?.name || 'System / Webhook'}</span>
                    </td>
                    <td className="p-4 text-muted-foreground max-w-xs truncate">
                      {log.ip}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>

    </div>
  );
}
