"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { ArrowRight, Mail, Phone, MapPin } from 'lucide-react';

const YoutubeIcon = ({ size = 18 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-youtube">
    <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17z"/>
    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/>
  </svg>
);

const InstagramIcon = ({ size = 18 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-instagram">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
);

// Evaluated once at module load — same value on server and client
const CURRENT_YEAR = new Date().getFullYear();

export default function Footer() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      await api.post('/contact/newsletter/subscribe', { email });
      toast.success("Subscribed successfully! 🌶️ Check your inbox.");
      setEmail('');
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Subscription failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="bg-charcoal text-cream pt-16 pb-8 border-t border-bark/20 mt-auto" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">Footer</h2>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          
          {/* Brand Info */}
          <div className="flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/nirmal_logo (2).png"
                alt="Nirmal's Spices"
                width={60}
                height={60}
                className="object-contain"
              />
              <span className="font-display font-bold text-xl tracking-tight text-cream">
                Nirmal&apos;s Spices
              </span>
            </Link>
            <p className="text-muted-foreground text-xs leading-relaxed max-w-xs font-sans">
              Supplying, manufacturing, and exporting 58+ varieties of authentic Indian spices 
              from Harda, Madhya Pradesh. Committed to 100% purity, local sourcing, hygienic 
              processing, and eco-friendly packaging.
            </p>
            <div className="flex flex-col gap-2 mt-2 text-xs font-sans text-muted-foreground">
              <span className="flex items-center gap-2"><MapPin size={14} className="text-primary" /> Harda, Madhya Pradesh, India</span>
              <span className="flex items-center gap-2"><Phone size={14} className="text-primary" /> +91 9770057005</span>
              <span className="flex items-center gap-2"><Mail size={14} className="text-primary" /> info.nirmalspices@gmail.com</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col gap-3 font-sans">
            <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Explore</h3>
            <ul className="flex flex-col gap-2 text-xs text-muted-foreground">
              <li><Link href="/" className="hover:text-primary transition-colors">🏠 Home</Link></li>
              <li><Link href="/shop" className="hover:text-primary transition-colors">🌶️ Shop Spices</Link></li>
              <li><Link href="/about" className="hover:text-primary transition-colors">✨ About Us</Link></li>
              <li><Link href="/contact" className="hover:text-primary transition-colors">📞 Contact & Support</Link></li>
            </ul>
          </div>

          {/* Customer Policy Pages */}
          <div className="flex flex-col gap-3 font-sans">
            <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Policies</h3>
            <ul className="flex flex-col gap-2 text-xs text-muted-foreground">
              <li><Link href="/faq" className="hover:text-primary transition-colors">❓ FAQ</Link></li>
              <li><Link href="/shipping-policy" className="hover:text-primary transition-colors">🚚 Shipping & Delivery</Link></li>
              <li><Link href="/return-policy" className="hover:text-primary transition-colors">🔄 Returns & Refunds</Link></li>
              <li><Link href="/privacy-policy" className="hover:text-primary transition-colors">🔒 Privacy Policy</Link></li>
            </ul>
          </div>

          {/* Newsletter Form */}
          <div className="flex flex-col gap-3 font-sans">
            <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Subscribe</h3>
            <p className="text-xs text-muted-foreground leading-normal">
              Sign up to receive updates on new harvest arrivals, recipes, and exclusive discount coupons.
            </p>
            <form onSubmit={handleSubscribe} className="flex flex-col gap-2 mt-2">
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="Enter your email..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  className="w-full bg-charcoal-mid border border-bark/30 text-cream px-4 py-2 pr-10 text-xs rounded-lg outline-none focus:border-primary transition-colors"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="absolute right-2.5 top-2 text-primary hover:text-white transition-colors"
                  aria-label="Submit Email"
                >
                  <ArrowRight size={16} />
                </button>
              </div>
            </form>
          </div>

        </div>

        {/* Footer Bottom Bar */}
        <div className="border-t border-bark/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-sans text-muted-foreground">
          <span>&copy; {CURRENT_YEAR} Nirmal Spices. All Rights Reserved.</span>
          <div className="flex items-center gap-4">
            <a 
              href="https://youtube.com/@nirmalsspices_timarni?feature=shared" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="hover:text-red-500 transition-colors" 
              aria-label="YouTube Channel"
            >
              <YoutubeIcon size={18} />
            </a>
            <a 
              href="https://www.instagram.com/nirmals_spices/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="hover:text-pink-500 transition-colors" 
              aria-label="Instagram Page"
            >
              <InstagramIcon size={18} />
            </a>
            <span className="flex items-center gap-1 border-l border-bark/20 pl-4">🌐 Designed for Luxury &amp; Purity</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
