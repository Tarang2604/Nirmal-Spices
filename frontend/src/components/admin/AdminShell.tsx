"use client";

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { logoutNow } from '@/lib/authActions';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  ShoppingBag,
  Layers,
  Tag,
  ShieldAlert,
  Loader2,
  Percent,
  LogOut,
  FolderTree,
  Search,
  Bell,
  Menu,
  X,
  Users,
  ChevronDown,
} from 'lucide-react';
import { toast } from 'sonner';

const NAV_ITEMS = [
  { label: 'Overview', href: '/admin', icon: LayoutDashboard },
  { label: 'Categories', href: '/admin/categories', icon: FolderTree },
  { label: 'Products', href: '/admin/products', icon: Layers },
  {
    label: 'Customers',
    href: '/admin/customers',
    icon: Users,
    children: [
      { label: 'Active Customers', href: '/admin/customers?status=active' },
      { label: 'Blocked Customers', href: '/admin/customers?status=blocked' },
    ],
  },
  { label: 'Orders', href: '/admin/orders', icon: ShoppingBag },
  { label: 'Coupons', href: '/admin/coupons', icon: Tag },
  { label: 'Fees & Delivery', href: '/admin/settings', icon: Percent },
  { label: 'Audit Logs', href: '/admin/logs', icon: ShieldAlert },
] as const;

function isNavActive(pathname: string, href: string) {
  if (href === '/admin') return pathname === '/admin';
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Hard navigation — guarantees admin UI remounts (soft nav was fetching APIs but not painting). */
function goAdmin(href: string) {
  if (typeof window === 'undefined') return;
  const current = `${window.location.pathname}${window.location.search}`;
  if (current === href) {
    window.location.reload();
    return;
  }
  window.location.assign(href);
}

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const routeKey = `${pathname}?${searchParams.toString()}`;
  const { user, isLoggedIn, isInitialized } = useAuthStore();
  const isLoginPage = pathname === '/admin/login';
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [customersOpen, setCustomersOpen] = useState(false);

  useEffect(() => {
    if (pathname.startsWith('/admin/customers')) setCustomersOpen(true);
  }, [pathname]);

  useEffect(() => {
    if (!isInitialized || isLoginPage) return;
    if (!isLoggedIn || user?.role !== 'admin') {
      toast.error('Please sign in with your admin account');
      router.replace('/admin/login');
    }
  }, [isLoggedIn, user, isInitialized, isLoginPage, router]);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  }, [pathname]);

  if (isLoginPage) return <>{children}</>;

  if (!isInitialized) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-[#FAF7F2]">
        <Loader2 className="w-8 h-8 text-[#8B1E1E] animate-spin" />
        <span className="text-xs uppercase tracking-widest font-semibold text-muted-foreground">
          Verifying credentials...
        </span>
      </div>
    );
  }

  if (!isLoggedIn || user?.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-[#FAF7F2]">
        <Loader2 className="w-8 h-8 text-[#8B1E1E] animate-spin" />
        <span className="text-xs uppercase tracking-widest font-semibold text-muted-foreground">
          Redirecting to admin login...
        </span>
      </div>
    );
  }

  const handleLogout = () => {
    void logoutNow();
    window.location.assign('/admin/login');
  };

  const initials = (user.name || 'AD')
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen bg-[#F8F6F1] flex font-sans">
      {sidebarOpen && (
        <button
          type="button"
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          aria-label="Close sidebar"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={cn(
          'fixed lg:sticky top-0 left-0 z-40 h-screen w-64 bg-[#3D1F1F] text-white flex flex-col transition-transform duration-100',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        )}
      >
        <div className="h-16 px-5 flex items-center gap-3 border-b border-white/10 shrink-0">
          <Image src="/nirmal_logo.png" alt="Nirmal" width={32} height={32} className="rounded-full bg-white p-0.5" />
          <div className="leading-tight">
            <div className="font-display font-bold text-sm tracking-wide">NIRMAL&apos;S SPICES</div>
            <div className="text-[9px] uppercase tracking-widest text-white/50">Admin Console</div>
          </div>
          <button type="button" className="ml-auto lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const hasChildren = 'children' in item && Array.isArray(item.children);
            const active = isNavActive(pathname, item.href);

            if (hasChildren) {
              return (
                <div key={item.href} className="space-y-1">
                  <button
                    type="button"
                    onClick={() => setCustomersOpen((v) => !v)}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                      active || pathname.startsWith('/admin/customers')
                        ? 'bg-white/15 text-white'
                        : 'text-white/70 hover:bg-white/10 hover:text-white',
                    )}
                  >
                    <Icon size={16} />
                    <span className="flex-1 text-left">{item.label}</span>
                    <ChevronDown
                      size={14}
                      className={cn('transition-transform', customersOpen && 'rotate-180')}
                    />
                  </button>
                  {customersOpen &&
                    item.children.map((child) => (
                      <a
                        key={child.href}
                        href={child.href}
                        onClick={(e) => {
                          e.preventDefault();
                          goAdmin(child.href);
                        }}
                        className="flex items-center gap-3 pl-10 pr-3 py-2 rounded-lg text-xs font-medium text-white/65 hover:bg-white/10 hover:text-white"
                      >
                        {child.label}
                      </a>
                    ))}
                </div>
              );
            }

            return (
              <a
                key={item.href}
                href={item.href}
                onClick={(e) => {
                  e.preventDefault();
                  goAdmin(item.href);
                }}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  active ? 'bg-white/15 text-white' : 'text-white/70 hover:bg-white/10 hover:text-white',
                )}
              >
                <Icon size={16} />
                {item.label}
              </a>
            );
          })}
        </nav>

        <button
          type="button"
          onClick={() => void handleLogout()}
          className="m-3 flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/70 hover:bg-white/10 hover:text-white"
        >
          <LogOut size={16} /> Logout
        </button>
      </aside>

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-20 h-16 bg-white border-b border-gray-100 px-4 md:px-6 flex items-center gap-4">
          <button type="button" className="lg:hidden p-2 rounded-lg hover:bg-gray-50" onClick={() => setSidebarOpen(true)}>
            <Menu size={18} />
          </button>
          <span className="hidden sm:inline text-xs font-bold uppercase tracking-widest text-gray-400">
            Admin Panel
          </span>
          <div className="flex-1 max-w-xl mx-auto relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              placeholder="Search products, orders..."
              className="w-full bg-gray-50 border border-gray-100 rounded-full pl-9 pr-4 py-2 text-xs outline-none focus:border-[#8B1E1E]/40"
            />
          </div>
          <button type="button" className="relative p-2 rounded-full hover:bg-gray-50 text-gray-500">
            <Bell size={16} />
          </button>
          <div className="flex items-center gap-2">
            <div className="hidden sm:block text-right leading-tight">
              <div className="text-xs font-bold text-charcoal">{user.name}</div>
              <div className="text-[10px] text-muted-foreground lowercase">{user.role}</div>
            </div>
            <div className="w-9 h-9 rounded-full bg-[#8B1E1E] text-white text-xs font-bold flex items-center justify-center">
              {initials}
            </div>
          </div>
        </header>

        {/* key forces a fresh page tree whenever the admin URL changes */}
        <main key={routeKey} className="flex-1 p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
