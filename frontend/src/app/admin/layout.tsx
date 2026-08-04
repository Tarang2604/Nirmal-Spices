import AdminShell from '@/components/admin/AdminShell';
import { Suspense } from 'react';

/**
 * Server layout — children swap on navigation.
 * AdminShell (client) provides chrome; Suspense required for useSearchParams inside shell.
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#FAF7F2] text-xs text-muted-foreground">
          Loading admin…
        </div>
      }
    >
      <AdminShell>{children}</AdminShell>
    </Suspense>
  );
}
