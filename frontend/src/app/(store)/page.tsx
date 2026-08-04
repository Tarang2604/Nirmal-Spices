import React from 'react';
import HeroSection from '@/components/home/HeroSection';
import CategoryGrid from '@/components/home/CategoryGrid';
import TrendingProducts from '@/components/home/TrendingProducts';
import FeaturesGrid from '@/components/home/FeaturesGrid';
import TestimonialsCarousel from '@/components/home/TestimonialsCarousel';
import FloatingSpices from '@/components/home/FloatingSpices';

export default function HomePage() {
  return (
    <div className="relative min-h-screen">
      {/* Background Floating Spice Particles */}
      <FloatingSpices />

      {/* Hero Section */}
      <HeroSection />

      {/* Category Grid Section */}
      <CategoryGrid />

      {/* Trending / Bestseller tabbed items */}
      <TrendingProducts />

      {/* Features Grid Promises */}
      <FeaturesGrid />

      {/* Testimonials Slide Carousel */}
      <TestimonialsCarousel />

      {/* Promotional / Callout banner */}
      <section className="bg-primary text-cream py-16 text-center relative overflow-hidden font-sans border-t border-bark/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10 flex flex-col items-center gap-4">
          <span className="text-xs font-semibold uppercase tracking-wider font-accent bg-white/20 px-3 py-1 rounded-full">
            🔥 Festive Season Offer
          </span>
          <h2 className="font-display font-bold text-3xl md:text-4xl leading-tight">
            Get 15% Off Your First Order
          </h2>
          <p className="text-cream/80 text-sm max-w-md leading-normal">
            Use code <strong className="text-white border-b-2 border-white pb-0.5 font-accent text-base">FIRST10</strong> at checkout. Free shipping on all orders above ₹499.
          </p>
        </div>
        {/* Abstract shapes */}
        <div className="absolute top-0 left-0 w-32 h-32 bg-white/5 rounded-full -translate-x-12 -translate-y-12" />
        <div className="absolute bottom-0 right-0 w-48 h-48 bg-white/5 rounded-full translate-x-16 translate-y-16" />
      </section>

    </div>
  );
}
