"use client";

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Layers, 
  Tag, 
  Star, 
  ShieldAlert, 
  ArrowLeft,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoggedIn, isInitialized } = useAuthStore();

  // Strict route security: only admin allowed
  useEffect(() => {
    if (isInitialized) {
      if (!isLoggedIn || user?.role !== 'admin') {
        toast.error("Unauthorized access — administrators only");
        router.push('/');
      }
    }
  }, [isLoggedIn, user, isInitialized]);

  if (!isInitialized || !isLoggedIn || user?.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 font-sans text-muted-foreground bg-cream/10">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <span className="text-xs uppercase tracking-widest font-semibold font-accent">Verifying credentials...</span>
      </div>
    );
  }

  const navItems = [
    { label: "Overview", href: "/admin", icon: <LayoutDashboard size={16} /> },
    { label: "Products", href: "/admin/products", icon: <Layers size={16} /> },
    { label: "Orders", href: "/admin/orders", icon: <ShoppingBag size={16} /> },
    { label: "Coupons", href: "/admin/coupons", icon: <Tag size={16} /> },
    { label: "Audit Logs", href: "/admin/logs", icon: <ShieldAlert size={16} /> },
  ];

  return (
    <div className="min-h-screen bg-cream-dark/15 flex flex-col font-sans">
      
      {/* Admin header */}
      <header className="bg-charcoal text-cream h-16 px-6 flex items-center justify-between shrink-0 select-none">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-muted-foreground hover:text-white flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider font-accent">
            <ArrowLeft size={14} /> Storefront
          </Link>
          <span className="text-muted-foreground">|</span>
          <span className="font-display font-bold text-base text-white tracking-wide">🌶️ Admin Portal</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="bg-primary px-2 py-0.5 rounded-full font-bold uppercase text-[9px]">Admin</span>
          <strong className="text-white font-semibold">{user.name}</strong>
        </div>
      </header>

      <div className="flex-grow flex flex-col lg:flex-row items-stretch">
        
        {/* Sidebar Nav */}
        <aside className="w-full lg:w-64 bg-white border-r border-border-spice/40 flex flex-col p-6 shrink-0 gap-6">
          <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold font-accent">Console Menu</span>
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 text-xs font-semibold py-2.5 px-4 rounded-xl transition-colors outline-none",
                    isActive
                      ? "bg-secondary text-primary font-bold shadow-sm"
                      : "text-muted-foreground hover:bg-muted hover:text-charcoal"
                  )}
                >
                  {item.icon}
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Content Viewport */}
        <main className="flex-grow p-6 md:p-8 bg-cream/10">
          {children}
        </main>

      </div>
    </div>
  );
}
