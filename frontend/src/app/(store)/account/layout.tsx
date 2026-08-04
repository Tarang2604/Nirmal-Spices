"use client";

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';
import { User, ShoppingBag, MapPin, Loader2 } from 'lucide-react';

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { isLoggedIn, isInitialized } = useAuthStore();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (isInitialized && !isLoggedIn) {
      router.push('/login?redirect=/account');
    }
  }, [isLoggedIn, isInitialized]);

  if (!isInitialized) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 font-sans text-muted-foreground">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <span className="text-xs uppercase tracking-widest font-semibold font-accent">Loading Account...</span>
      </div>
    );
  }

  const menuItems = [
    { label: "Profile Details", href: "/account", icon: <User size={16} /> },
    { label: "My Orders", href: "/account/orders", icon: <ShoppingBag size={16} /> },
    { label: "Saved Addresses", href: "/account/addresses", icon: <MapPin size={16} /> },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16 font-sans">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Sidebar Nav */}
        <aside className="lg:col-span-3 bg-white p-6 rounded-2xl border border-border-spice/40 flex flex-col gap-6 shadow-sm select-none">
          <h2 className="text-sm font-bold uppercase tracking-wider text-charcoal">My Dashboard</h2>
          <nav className="flex flex-col gap-1">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2.5 text-xs font-semibold py-2.5 px-4 rounded-xl transition-colors outline-none",
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

        {/* Content Box */}
        <div className="lg:col-span-9 bg-white p-6 md:p-8 rounded-2xl border border-border-spice/40 shadow-sm min-h-[400px]">
          {children}
        </div>

      </div>
    </div>
  );
}
