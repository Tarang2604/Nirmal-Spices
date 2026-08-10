import dynamic from 'next/dynamic';
import HeroSection from '@/components/home/HeroSection';
import BrandTagline from '@/components/home/BrandTagline';
import CategoryGrid from '@/components/home/CategoryGrid';
import FlourCatalog from '@/components/home/FlourCatalog';
import TrendingProducts from '@/components/home/TrendingProducts';
import FeaturesGrid from '@/components/home/FeaturesGrid';

import { getBackendApiUrl } from '@/lib/backend';
import { CATEGORIES } from '@/data/catalog';

const FloatingSpices = dynamic(() => import('@/components/home/FloatingSpices'));
const TestimonialsCarousel = dynamic(() => import('@/components/home/TestimonialsCarousel'));

async function getInitialCategories() {
  try {
    const res = await fetch(`${getBackendApiUrl()}/categories`, { cache: 'no-store' });
    if (res.ok) {
      const json = await res.json();
      if (json.data && Array.isArray(json.data) && json.data.length > 0) {
        return json.data;
      }
    }
  } catch {
    // fallback to catalog data
  }
  return CATEGORIES.filter((c) => c.slug).map((c) => ({
    _id: c.slug,
    name: c.label,
    slug: c.slug,
    count: c.count,
    image: c.image || '/spices_flatlay.png',
  }));
}

export default async function HomePage() {
  const initialCategories = await getInitialCategories();

  return (
    <div className="relative min-h-screen">
      {/* Background Floating Spice Particles */}
      <FloatingSpices />

      {/* Hero Section */}
      <HeroSection />

      {/* Brand Tagline — rendered once, between hero and first product section */}
      <BrandTagline />

      {/* Category Grid Section */}
      <CategoryGrid initialCategories={initialCategories} />

      {/* Flour Catalog Section */}
      <FlourCatalog />

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
