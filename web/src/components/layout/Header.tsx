"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { useUIStore } from '@/store/uiStore';
import { cn } from '@/lib/utils';
import { 
  ShoppingBag, 
  User as UserIcon, 
  Search, 
  Menu, 
  X, 
  ChevronDown, 
  LogOut,
  MapPin,
  ClipboardList
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { api } from '@/lib/api';

export default function Header() {
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { user, isLoggedIn, clearUser } = useAuthStore();
  const { items, fetchCart } = useCartStore();
  const { toggleCart } = useUIStore();

  const totalItems = items.reduce((acc, item) => acc + item.qty, 0);

  // Monitor scroll for header background opacity change
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch cart on mount
  useEffect(() => {
    fetchCart();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
      clearUser();
      router.push('/');
    } catch {
      // fallback clear user
      clearUser();
    }
  };

  return (
    <header 
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300 border-b",
        isScrolled 
          ? "bg-white/95 backdrop-blur-md shadow-sm border-border" 
          : "bg-background border-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2 text-foreground hover:bg-muted/50 rounded-full"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          {/* Logo Brand */}
          <Link href="/" className="flex items-center gap-1 group shrink-0">
            <Image
              src="/nirmal_logo.png"
              alt="Nirmal's Spices"
              width={52}
              height={52}
              className="object-contain drop-shadow-sm"
              priority
            />
            <div className="flex flex-col">
              <span className="font-display font-bold text-lg leading-tight tracking-tight text-primary">
                Nirmal&apos;s Spices
              </span>
              <span className="text-[9px] text-muted-foreground uppercase tracking-widest font-semibold font-accent">
                Harda, Madhya Pradesh
              </span>
            </div>
          </Link>

          {/* Desktop Search Bar */}
          <form 
            onSubmit={handleSearchSubmit} 
            className="hidden md:flex items-center relative max-w-sm w-full"
          >
            <input
              type="search"
              placeholder="Search spices..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-cream-dark/30 border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-full px-4 py-1.5 pl-10 text-sm outline-none transition-all duration-200"
            />
            <Search className="absolute left-3.5 text-muted-foreground" size={16} />
          </form>

          {/* Header Navigation Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            
            {/* Account / User Dropdown */}
            {isLoggedIn && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-1 p-2 text-foreground hover:bg-muted/50 rounded-full outline-none">
                  <UserIcon size={20} />
                  <ChevronDown size={14} className="text-muted-foreground" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 mt-2 rounded-xl">
                  <div className="px-4 py-2 text-xs">
                    <span className="font-semibold text-foreground block">{user.name}</span>
                    <span className="text-muted-foreground truncate block">{user.email}</span>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push('/account')}>
                    <ClipboardList className="mr-2 h-4 w-4" /> Account Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push('/account/orders')}>
                    <ShoppingBag className="mr-2 h-4 w-4" /> My Orders
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push('/account/addresses')}>
                    <MapPin className="mr-2 h-4 w-4" /> Saved Addresses
                  </DropdownMenuItem>
                  {user.role === 'admin' && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => router.push('/admin')}>
                        🔧 Admin Console
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:bg-destructive/10">
                    <LogOut className="mr-2 h-4 w-4" /> Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link 
                href="/login" 
                className="flex items-center gap-2 p-2 hover:bg-muted/50 rounded-full text-foreground"
                aria-label="Login Account"
              >
                <UserIcon size={20} />
                <span className="hidden sm:inline text-xs font-semibold uppercase tracking-wider font-accent">Login</span>
              </Link>
            )}

            {/* Shopping Cart Button */}
            <button 
              onClick={toggleCart}
              className="flex items-center gap-2 p-2 hover:bg-muted/50 rounded-full relative text-foreground outline-none"
              aria-label="Open Cart"
            >
              <ShoppingBag size={20} />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-sm animate-pulse">
                  {totalItems}
                </span>
              )}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-background border-b border-border p-4 animate-fade-down duration-200">
          <form onSubmit={handleSearchSubmit} className="mb-4 relative w-full">
            <input
              type="search"
              placeholder="Search spices..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-cream-dark/30 border border-border focus:border-primary rounded-full px-4 py-2 pl-10 text-sm outline-none"
            />
            <Search className="absolute left-3.5 top-3.5 text-muted-foreground" size={16} />
          </form>
          <nav className="flex flex-col gap-3 font-sans font-semibold tracking-wide uppercase text-sm">
            <Link href="/" className="hover:text-primary py-1 border-b border-border/40" onClick={() => setMobileMenuOpen(false)}>🏠 Home</Link>
            <Link href="/shop" className="hover:text-primary py-1 border-b border-border/40" onClick={() => setMobileMenuOpen(false)}>All Products</Link>
            <Link href="/shop?cat=blend-spices" className="hover:text-primary py-1 border-b border-border/40" onClick={() => setMobileMenuOpen(false)}>🧂 Blend Spices</Link>
            <Link href="/shop?cat=ground-spices" className="hover:text-primary py-1 border-b border-border/40" onClick={() => setMobileMenuOpen(false)}>🌶️ Ground Spices</Link>
            <Link href="/shop?cat=whole-spices" className="hover:text-primary py-1 border-b border-border/40" onClick={() => setMobileMenuOpen(false)}>🌿 Whole Spices</Link>
            <Link href="/contact" className="hover:text-primary py-1" onClick={() => setMobileMenuOpen(false)}>📞 Contact Us</Link>
          </nav>
        </div>
      )}
    </header>
  );
}
