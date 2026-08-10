"use client";

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
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
  Menu,
  X,
  Users,
  ChevronDown,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { toast } from 'sonner';

const NAV_ITEMS = [
  { label: 'Dashboard Overview', href: '/admin', icon: LayoutDashboard },
  { label: 'Categories Management', href: '/admin/categories', icon: FolderTree },
  { label: 'Products Inventory', href: '/admin/products', icon: Layers },
  {
    label: 'Customers List',
    href: '/admin/customers',
    icon: Users,
    children: [
      { label: 'Active Customers', href: '/admin/customers?status=active' },
      { label: 'Blocked Customers', href: '/admin/customers?status=blocked' },
    ],
  },
  { label: 'Orders & Sales', href: '/admin/orders', icon: ShoppingBag },
  { label: 'Coupons & Offers', href: '/admin/coupons', icon: Tag },
  { label: 'Delivery & Fees', href: '/admin/settings', icon: Percent },
  { label: 'Audit Logs', href: '/admin/logs', icon: ShieldAlert },
] as const;

function isNavActive(pathname: string, href: string) {
  if (href === '/admin') return pathname === '/admin';
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoggedIn, isInitialized } = useAuthStore();
  const isLoginPage = pathname === '/admin/login';
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [customersOpen, setCustomersOpen] = useState(false);

  useEffect(() => {
    if (pathname.startsWith('/admin/customers')) setCustomersOpen(true);
  }, [pathname]);

  useEffect(() => {
    if (!isInitialized || isLoginPage) return;
    if (!isLoggedIn || user?.role !== 'admin') {
      toast.error('Please sign in with an administrator account');
      router.replace('/admin/login');
    }
  }, [isLoggedIn, user, isInitialized, isLoginPage, router]);

  if (isLoginPage) return <>{children}</>;

  if (!isInitialized) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-[#FAF7F2]">
        <Loader2 className="w-8 h-8 text-[#8B1E1E] animate-spin" />
        <span className="text-xs font-accent uppercase tracking-widest font-bold text-muted-foreground">
          Authenticating Admin Access…
        </span>
      </div>
    );
  }

  if (!isLoggedIn || user?.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-[#FAF7F2]">
        <Loader2 className="w-8 h-8 text-[#8B1E1E] animate-spin" />
        <span className="text-xs font-accent uppercase tracking-widest font-bold text-muted-foreground">
          Redirecting to login portal…
        </span>
      </div>
    );
  }

  const handleLogout = async () => {
    await logoutNow();
    router.replace('/admin/login');
  };

  const initials = (user.name || 'AD')
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen bg-[#F8F6F0] flex font-sans antialiased">
      
      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-xs z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={cn(
          'fixed lg:sticky top-0 left-0 z-50 h-screen bg-[#2A1212] text-cream flex flex-col transition-all duration-300 shadow-xl border-r border-white/10 shrink-0',
          collapsed ? 'lg:w-20' : 'lg:w-64',
          mobileMenuOpen ? 'w-64 translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Sidebar Header Branding */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-white/10 shrink-0">
          <Link href="/admin" className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-white p-1 shrink-0 flex items-center justify-center shadow-md">
              <Image
                src="/nirmal_logo (2).png"
                alt="Nirmal Spices"
                width={36}
                height={36}
                className="object-contain"
                priority
              />
            </div>
            {!collapsed && (
              <div className="leading-tight overflow-hidden">
                <div className="font-display font-bold text-sm tracking-wide text-white truncate">
                  NIRMAL&apos;S SPICES
                </div>
                <div className="text-[9px] uppercase tracking-widest text-primary font-accent font-bold">
                  Admin Panel
                </div>
              </div>
            )}
          </Link>

          {/* Desktop Collapse Toggle */}
          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex w-7 h-7 rounded-lg bg-white/10 text-white/80 hover:bg-white/20 items-center justify-center transition-colors"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>

          {/* Mobile Close Button */}
          <button
            type="button"
            className="lg:hidden text-white/70 hover:text-white"
            onClick={() => setMobileMenuOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1.5 scrollbar-none">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const hasChildren = 'children' in item && Array.isArray(item.children);
            const active = isNavActive(pathname, item.href);

            if (hasChildren) {
              return (
                <div key={item.href} className="space-y-1">
                  <button
                    type="button"
                    onClick={() => {
                      if (collapsed) setCollapsed(false);
                      setCustomersOpen((v) => !v);
                    }}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200',
                      active || pathname.startsWith('/admin/customers')
                        ? 'bg-primary text-white font-bold shadow-sm'
                        : 'text-cream/70 hover:bg-white/10 hover:text-white'
                    )}
                    title={collapsed ? item.label : undefined}
                  >
                    <Icon size={18} className="shrink-0" />
                    {!collapsed && <span className="flex-1 text-left">{item.label}</span>}
                    {!collapsed && (
                      <ChevronDown
                        size={14}
                        className={cn('transition-transform duration-200', customersOpen && 'rotate-180')}
                      />
                    )}
                  </button>
                  {!collapsed && customersOpen && (
                    <div className="ml-3 pl-3 border-l border-white/15 space-y-1 my-1">
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className={cn(
                            'block py-1.5 px-3 rounded-lg text-[11px] font-medium transition-all',
                            pathname === child.href
                              ? 'text-primary font-bold bg-white/10'
                              : 'text-cream/65 hover:text-white hover:bg-white/5'
                          )}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200',
                  active
                    ? 'bg-primary text-white font-bold shadow-sm'
                    : 'text-cream/70 hover:bg-white/10 hover:text-white'
                )}
                title={collapsed ? item.label : undefined}
              >
                <Icon size={18} className="shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-white/10 shrink-0 space-y-1">
          <Link
            href="/"
            target="_blank"
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-cream/70 hover:bg-white/10 hover:text-white transition-colors',
              collapsed && 'justify-center px-0'
            )}
            title={collapsed ? "View Live Store" : undefined}
          >
            <ExternalLink size={16} className="shrink-0 text-primary" />
            {!collapsed && <span>View Live Store</span>}
          </Link>

          <button
            type="button"
            onClick={() => void handleLogout()}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-rose-300 hover:bg-rose-950/40 hover:text-rose-200 transition-colors outline-none',
              collapsed && 'justify-center px-0'
            )}
            title={collapsed ? "Logout Admin" : undefined}
          >
            <LogOut size={16} className="shrink-0" />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col">
        
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-md border-b border-border/60 px-4 md:px-6 flex items-center justify-between gap-4 shadow-xs">
          
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="lg:hidden p-2 rounded-xl text-charcoal hover:bg-cream"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open mobile menu"
            >
              <Menu size={20} />
            </button>

            <div className="flex items-center gap-2">
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-accent font-bold uppercase tracking-wider">
                <ShieldCheck size={13} /> Official Admin Panel
              </span>
            </div>
          </div>

          {/* User Profile Info */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col text-right leading-tight">
              <span className="text-xs font-bold text-charcoal">{user.name}</span>
              <span className="text-[10px] text-muted-foreground uppercase font-accent font-semibold tracking-wider">
                {user.role}
              </span>
            </div>
            
            <div className="w-9 h-9 rounded-full bg-primary text-white text-xs font-bold font-accent flex items-center justify-center shadow-xs border border-primary/30">
              {initials}
            </div>
          </div>
        </header>

        {/* Dynamic Page Content without forced unmounting keys */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>

    </div>
  );
}
