import React from 'react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Award, 
  ShieldCheck, 
  Sprout, 
  Users, 
  MapPin, 
  Mail, 
  Phone, 
  ExternalLink,
  Calendar,
  Sparkles
} from 'lucide-react';

const YoutubeIcon = ({ size = 18, className }: { size?: number; className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`lucide lucide-youtube ${className || ''}`}>
    <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17z"/>
    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/>
  </svg>
);

const InstagramIcon = ({ size = 18, className }: { size?: number; className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`lucide lucide-instagram ${className || ''}`}>
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
);

export const metadata: Metadata = {
  title: "About Us — Nirmal's Spices",
  description: "Founded in 2017 in Harda, Madhya Pradesh, Nirmal's Spices offers 58 varieties of 100% pure, authentic, and locally sourced spices. Discover our story, automated processing, and quality commitment.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background text-charcoal font-sans animate-fade-in">
      
      {/* Premium Hero Section */}
      <section className="relative h-[450px] flex items-center justify-center overflow-hidden border-b border-bark/10">
        <div className="absolute inset-0 z-0">
          <Image
            src="/spices_flatlay.png"
            alt="Authentic Indian Spices Flatlay"
            fill
            className="object-cover brightness-40"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-black/30" />
        </div>
        
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center flex flex-col items-center gap-4">
          <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider font-accent text-saffron bg-charcoal/85 backdrop-blur-sm px-3.5 py-1.5 rounded-full border border-saffron/20 shadow-md">
            <Sparkles size={12} className="text-saffron-light" /> Established April 16, 2017
          </span>
          <h1 className="font-display font-bold text-4xl sm:text-5xl md:text-6xl text-cream drop-shadow-md">
            Our Spice Legacy
          </h1>
          <p className="text-cream-dark/95 text-sm sm:text-base max-w-xl font-accent leading-relaxed drop-shadow-sm">
            Nirmal’s Spices – Bringing Tradition, Flavor, and Purity to Your Table.
          </p>
        </div>
      </section>

      {/* Main Content Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 flex flex-col gap-20 sm:gap-28">
        
        {/* Section 1: Our Story / Origin */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 flex flex-col gap-6">
            <div className="flex items-center gap-2 text-primary font-semibold text-xs uppercase tracking-wider font-accent">
              <Calendar size={14} /> Our Journey
            </div>
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-charcoal">
              From Harda, Madhya Pradesh to Every Kitchen
            </h2>
            <div className="text-muted-foreground text-sm leading-relaxed flex flex-col gap-4">
              <p>
                Nirmal’s Spices was founded on <strong>April 16, 2017</strong>, in the small yet culturally rich town of Harda, Madhya Pradesh. From the very beginning, our mission has been simple yet impactful – to provide people with pure, authentic, and locally sourced spices that enhance the taste of every dish while supporting the local community.
              </p>
              <p>
                We take pride in offering a wide range of <strong>58 varieties of spices</strong>, including ground spices, blended spices, and unique regional specialties. Every product we create carries not only flavor but also the essence of tradition, purity, and trust.
              </p>
            </div>
          </div>
          
          <div className="lg:col-span-5 relative h-[320px] rounded-2xl overflow-hidden border border-border shadow-md group">
            <Image
              src="/masala_collection.png"
              alt="Premium Masala Collection"
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>
        </section>

        {/* Section: Brand Portfolio & Product Range */}
        <section className="flex flex-col gap-10">
          <div className="text-center max-w-xl mx-auto flex flex-col gap-3">
            <span className="text-xs font-semibold uppercase tracking-wider font-accent text-primary bg-primary/5 self-center px-3 py-1 rounded-full">
              🏷️ Our Brands & Range
            </span>
            <h2 className="font-display font-bold text-3xl text-charcoal">
              A Wide Selection of 58+ Spices
            </h2>
            <p className="text-muted-foreground text-xs leading-relaxed">
              We manufacture and distribute under three major trusted brands, providing premium quality across diverse food categories.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Brands Card */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-border shadow-sm flex flex-col gap-4">
              <h3 className="font-display font-bold text-xl text-charcoal flex items-center gap-2">
                📂 Brand Portfolio
              </h3>
              <p className="text-muted-foreground text-xs leading-relaxed">
                Our operations span multiple brands to cover varying kitchen needs with the same promise of purity:
              </p>
              <ul className="flex flex-col gap-2.5 text-xs font-sans text-muted-foreground mt-2">
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary" />
                  <strong>Nirmal’s Spices (Nirmal Gold)</strong> — Flagship pure and blended spices.
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-accent" />
                  <strong>Karnal</strong> — Fine quality traditional spices.
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-gold" />
                  <strong>N28</strong> — Premium spice and seasoning selections.
                </li>
              </ul>
            </div>

            {/* Product Range Card */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-border shadow-sm md:col-span-2 flex flex-col gap-4">
              <h3 className="font-display font-bold text-xl text-charcoal">
                🍛 58+ Premium Spice Varieties
              </h3>
              <p className="text-muted-foreground text-xs leading-relaxed">
                Meticulously categorised for convenience and traditional flavour consistency:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-2 text-xs text-muted-foreground font-sans">
                <div className="flex flex-col gap-3">
                  <div>
                    <h4 className="font-bold text-charcoal mb-1">🧂 Blend Spices</h4>
                    <p className="text-[11px] leading-relaxed">Achar Masala, Garam Masala, Dal Tadka, Chicken Masala, Biryani Masala, Shahi Paneer, Sambhar, Sabji, Pav Bhaji, Kitchen King.</p>
                  </div>
                  <div>
                    <h4 className="font-bold text-charcoal mb-1">🌿 Whole Spices</h4>
                    <p className="text-[11px] leading-relaxed">Khada Garam Masala, Kasoori Methi (100g), Jeera (Cumin), Rai (Mustard), Ajwain (Carom).</p>
                  </div>
                  <div>
                    <h4 className="font-bold text-charcoal mb-1">🌶️ Ground Spices</h4>
                    <p className="text-[11px] leading-relaxed">Pure Red Chilli Powder, Turmeric, Coriander, Kala Namak.</p>
                  </div>
                </div>
                <div className="flex flex-col gap-3">
                  <div>
                    <h4 className="font-bold text-charcoal mb-1">⚡ Instant Mixes</h4>
                    <p className="text-[11px] leading-relaxed">Gulab Jamun Instant Mix, Idli Mix, Jaljeera Masala, Khaman.</p>
                  </div>
                  <div>
                    <h4 className="font-bold text-charcoal mb-1">🌾 Flours & Salts</h4>
                    <p className="text-[11px] leading-relaxed">Singada Atta, Sendha Namak (Rock Salt).</p>
                  </div>
                  <div className="bg-cream p-3 rounded-xl border border-border-spice/40 flex items-center gap-3">
                    <span className="text-2xl">📱</span>
                    <div>
                      <h4 className="font-bold text-charcoal text-[11px] mb-0.5">Nirmal Spices App</h4>
                      <p className="text-[10px] leading-normal">Download our mobile app on Google Play Store for immediate ordering.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Commitment to Quality & Automation */}
        <section className="bg-white p-8 sm:p-12 rounded-3xl border border-border-spice/50 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-6 flex flex-col gap-6">
            <span className="text-xs font-semibold uppercase tracking-wider font-accent text-primary bg-primary/5 self-start px-3 py-1 rounded-full">
              ⚡ Zero Compromise
            </span>
            <h2 className="font-display font-bold text-3xl text-charcoal">
              Our Commitment to Quality
            </h2>
            <div className="text-muted-foreground text-sm leading-relaxed flex flex-col gap-4">
              <p>
                At Nirmal’s Spices, we believe that quality is non-negotiable. Our raw materials are carefully sourced from trusted farmers and suppliers. Before processing, each ingredient is thoroughly cleaned and sterilized to maintain the highest level of purity. We regularly upgrade and maintain our machines to ensure hygiene and consistency throughout production.
              </p>
              <p>
                Our entire production line is powered by modern automated technology. From grinding to packaging, every step is monitored to deliver products that meet international standards. Importantly, each spice is processed separately in dedicated machines to preserve its natural aroma, flavor, and nutritional value.
              </p>
            </div>
          </div>

          {/* Key Quality Pillars Info cards */}
          <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 bg-background rounded-2xl border border-border-spice/40 flex flex-col gap-3 hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <ShieldCheck size={20} />
              </div>
              <h3 className="font-bold text-sm text-charcoal">Sterilized Purity</h3>
              <p className="text-muted-foreground text-xs leading-relaxed">
                Raw materials are meticulously cleaned and sterilized before grinding to eliminate impurities.
              </p>
            </div>

            <div className="p-5 bg-background rounded-2xl border border-border-spice/40 flex flex-col gap-3 hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                <Sparkles size={20} className="text-saffron" />
              </div>
              <h3 className="font-bold text-sm text-charcoal">Separate Grinding</h3>
              <p className="text-muted-foreground text-xs leading-relaxed">
                Dedicated machinery for each spice type protects cross-contamination and locks in natural aroma.
              </p>
            </div>

            <div className="p-5 bg-background rounded-2xl border border-border-spice/40 flex flex-col gap-3 hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-full bg-saffron-light/10 flex items-center justify-center text-saffron-light">
                <Award size={20} />
              </div>
              <h3 className="font-bold text-sm text-charcoal">Automated Lines</h3>
              <p className="text-muted-foreground text-xs leading-relaxed">
                Hands-free modern packing lines ensure untouched hygiene and airtight long-lasting freshness.
              </p>
            </div>

            <div className="p-5 bg-background rounded-2xl border border-border-spice/40 flex flex-col gap-3 hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-full bg-turmeric/10 flex items-center justify-center text-gold">
                <Sprout size={20} />
              </div>
              <h3 className="font-bold text-sm text-charcoal">Direct Sourcing</h3>
              <p className="text-muted-foreground text-xs leading-relaxed">
                Sourced from ethical local crops to deliver the freshest harvest directly to consumers.
              </p>
            </div>
          </div>
        </section>

        {/* Section 3: Why Choose Us Grid */}
        <section className="flex flex-col gap-10">
          <div className="text-center max-w-xl mx-auto flex flex-col gap-3">
            <h2 className="font-display font-bold text-3xl text-charcoal">
              Why Chefs & Families Choose Us
            </h2>
            <p className="text-muted-foreground text-xs leading-relaxed">
              We stand apart through our devotion to authentic flavours, standard hygiene and rural empowerment.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 font-sans">
            {/* Value 1 */}
            <div className="bg-white p-6 rounded-2xl border border-border shadow-sm hover:scale-[1.02] hover:shadow-md transition-all duration-300 flex flex-col gap-4 text-center items-center">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                <Award size={24} />
              </div>
              <h3 className="font-display font-bold text-base text-charcoal">Authenticity</h3>
              <p className="text-muted-foreground text-xs leading-relaxed">
                Locally sourced spices and traditionally processed grinding retain the exact taste profiles of MP.
              </p>
            </div>

            {/* Value 2 */}
            <div className="bg-white p-6 rounded-2xl border border-border shadow-sm hover:scale-[1.02] hover:shadow-md transition-all duration-300 flex flex-col gap-4 text-center items-center">
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center text-accent shadow-inner">
                <ShieldCheck size={24} />
              </div>
              <h3 className="font-display font-bold text-base text-charcoal">Purity & Hygiene</h3>
              <p className="text-muted-foreground text-xs leading-relaxed">
                Sterilized raw materials, sanitized machinery, and clean packaging.
              </p>
            </div>

            {/* Value 3 */}
            <div className="bg-white p-6 rounded-2xl border border-border shadow-sm hover:scale-[1.02] hover:shadow-md transition-all duration-300 flex flex-col gap-4 text-center items-center">
              <div className="w-12 h-12 rounded-xl bg-gold-light/20 flex items-center justify-center text-gold shadow-inner">
                <Sprout size={24} className="text-saffron-light" />
              </div>
              <h3 className="font-display font-bold text-base text-charcoal">Variety</h3>
              <p className="text-muted-foreground text-xs leading-relaxed">
                A rich, handpicked selection of 58+ staple spices and specialty blends for every kitchen.
              </p>
            </div>

            {/* Value 4 */}
            <div className="bg-white p-6 rounded-2xl border border-border shadow-sm hover:scale-[1.02] hover:shadow-md transition-all duration-300 flex flex-col gap-4 text-center items-center">
              <div className="w-12 h-12 rounded-xl bg-bark/10 flex items-center justify-center text-bark shadow-inner">
                <Users size={24} />
              </div>
              <h3 className="font-display font-bold text-base text-charcoal">Community Support</h3>
              <p className="text-muted-foreground text-xs leading-relaxed">
                By purchasing directly from rural farming families, we foster sustainable local livelihoods.
              </p>
            </div>
          </div>
        </section>

        {/* Section 4: Live Processing Social & Video Hub */}
        <section className="flex flex-col gap-10">
          <div className="text-center max-w-xl mx-auto flex flex-col gap-3">
            <span className="flex items-center gap-1.5 justify-center text-xs font-semibold uppercase tracking-wider font-accent text-primary">
              <YoutubeIcon size={16} className="text-red-600 animate-pulse" /> Factory Processing Showcase
            </span>
            <h2 className="font-display font-bold text-3xl text-charcoal">
              Inside Our Manufacturing Unit
            </h2>
            <p className="text-muted-foreground text-xs leading-relaxed">
              Explore our untouched-by-hand spice processing, grinding machines, and automated packaging lines.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch font-sans">
            {/* Left: Instagram Reel Embed (Factory Tour) */}
            <div className="lg:col-span-5 bg-white p-3 rounded-3xl border border-border shadow-sm flex flex-col items-center justify-center">
              <div className="w-full aspect-[9/16] relative max-h-[480px] min-h-[400px] rounded-2xl overflow-hidden">
                <iframe
                  src="https://www.instagram.com/reel/Da9wCp1hPOY/embed"
                  className="absolute inset-0 w-full h-full border-0"
                  allowFullScreen
                  scrolling="no"
                  allow="encrypted-media"
                />
              </div>
            </div>

            {/* Right: YouTube details and CTA Hub */}
            <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-border shadow-sm flex flex-col justify-between gap-6">
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center shadow-inner shrink-0">
                    <YoutubeIcon size={24} className="text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-lg text-charcoal">Nirmal&apos;s Spices on YouTube</h3>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-accent font-semibold">Official Channel: @nirmalsspices_timarni</p>
                  </div>
                </div>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  Our official YouTube channel documents the detailed processing mechanics of our spice manufacturing unit in Timarni, Harda. We share complete transparency on how your spices are sourced, cleaned, ground, and packed:
                </p>
                
                {/* List of YouTube Video Topics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2 text-xs">
                  <div className="p-3 bg-background rounded-xl border border-border-spice/40 flex flex-col gap-0.5">
                    <h4 className="font-bold text-charcoal">🌿 Haldi Grinding & Cleanse</h4>
                    <p className="text-muted-foreground text-[10px] leading-relaxed">Meticulous cleaning and grinding process of premium grade whole turmeric.</p>
                  </div>
                  <div className="p-3 bg-background rounded-xl border border-border-spice/40 flex flex-col gap-0.5">
                    <h4 className="font-bold text-charcoal">🌶️ Red Chilli Pulverizer</h4>
                    <p className="text-muted-foreground text-[10px] leading-relaxed">Heavy milling preserving natural capsaicin and color of whole red chillies.</p>
                  </div>
                  <div className="p-3 bg-background rounded-xl border border-border-spice/40 flex flex-col gap-0.5">
                    <h4 className="font-bold text-charcoal">🤖 Automated Packing</h4>
                    <p className="text-muted-foreground text-[10px] leading-relaxed">Tours showing hands-free packaging maintaining airtight freshness.</p>
                  </div>
                  <div className="p-3 bg-background rounded-xl border border-border-spice/40 flex flex-col gap-0.5">
                    <h4 className="font-bold text-charcoal">🤝 Swadeshi Mela & Events</h4>
                    <p className="text-muted-foreground text-[10px] leading-relaxed">Highlights from local trade exhibitions, fairs, and farmer meets.</p>
                  </div>
                </div>
              </div>

              <div className="mt-2">
                <a
                  href="https://youtube.com/@nirmalsspices_timarni?feature=shared"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold font-accent uppercase tracking-wider text-[10px] px-5 py-3 rounded-xl shadow-md transition-all hover:-translate-y-0.5"
                >
                  <YoutubeIcon size={14} /> Subscribe & Watch Factory Videos
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Section 5: Vision Banner */}
        <section className="bg-charcoal text-cream p-8 sm:p-16 rounded-3xl relative overflow-hidden border border-bark/20 shadow-xl text-center flex flex-col items-center gap-6">
          <div className="absolute top-0 left-0 w-24 h-24 bg-primary/10 rounded-full -translate-x-6 -translate-y-6" />
          <div className="absolute bottom-0 right-0 w-36 h-36 bg-saffron/10 rounded-full translate-x-12 translate-y-12" />
          
          <span className="text-xs font-semibold uppercase tracking-wider font-accent text-saffron bg-saffron/10 px-3.5 py-1.5 rounded-full border border-saffron/20">
            Our Vision
          </span>
          <h2 className="font-display font-bold text-3xl md:text-4xl text-cream max-w-2xl leading-tight">
            Bringing the True Taste of India to Every Kitchen Globally
          </h2>
          <p className="text-muted-foreground text-xs sm:text-sm max-w-xl leading-relaxed">
            We aspire to bring the true taste of India to every kitchen, not just in our region but across the globe. With every pack of Nirmal’s Spices, we deliver freshness, purity, and the promise of unmatched quality.
          </p>
        </section>

        {/* Section: Instagram Feed */}
        <section className="flex flex-col gap-10">
          <div className="text-center max-w-xl mx-auto flex flex-col gap-3">
            <span className="flex items-center gap-1.5 justify-center text-xs font-semibold uppercase tracking-wider font-accent text-pink-600">
              <InstagramIcon size={16} className="text-pink-600" /> Instagram Highlights
            </span>
            <h2 className="font-display font-bold text-3xl text-charcoal">
              Join Our Social Community
            </h2>
            <p className="text-muted-foreground text-xs leading-relaxed">
              Check out our latest recipes, factory insights, and product launches directly from our Instagram feed.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-sans">
            {/* Reel 1 */}
            <div className="bg-white rounded-2xl overflow-hidden border border-border shadow-sm flex flex-col items-center p-2">
              <div className="w-full aspect-[9/16] relative min-h-[480px] rounded-xl overflow-hidden">
                <iframe
                  src="https://www.instagram.com/reel/Da9wCp1hPOY/embed"
                  className="absolute inset-0 w-full h-full border-0"
                  allowFullScreen
                  scrolling="no"
                  allow="encrypted-media"
                />
              </div>
            </div>

            {/* Reel 2 */}
            <div className="bg-white rounded-2xl overflow-hidden border border-border shadow-sm flex flex-col items-center p-2">
              <div className="w-full aspect-[9/16] relative min-h-[480px] rounded-xl overflow-hidden">
                <iframe
                  src="https://www.instagram.com/reel/DafMqsjN3mP/embed"
                  className="absolute inset-0 w-full h-full border-0"
                  allowFullScreen
                  scrolling="no"
                  allow="encrypted-media"
                />
              </div>
            </div>

            {/* Reel 3 */}
            <div className="bg-white rounded-2xl overflow-hidden border border-border shadow-sm flex flex-col items-center p-2">
              <div className="w-full aspect-[9/16] relative min-h-[480px] rounded-xl overflow-hidden">
                <iframe
                  src="https://www.instagram.com/reel/DXZUfyQDeNm/embed"
                  className="absolute inset-0 w-full h-full border-0"
                  allowFullScreen
                  scrolling="no"
                  allow="encrypted-media"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Section 6: Contact details & Interactive Google Map */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch font-sans">
          
          {/* Contact Details Card */}
          <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-3xl border border-border shadow-sm flex flex-col justify-between gap-8">
            <div className="flex flex-col gap-4">
              <h2 className="font-display font-bold text-2xl text-charcoal">Get In Touch</h2>
              <p className="text-muted-foreground text-xs leading-relaxed">
                Connect with our customer care team or visit us at our factory in Harda, Madhya Pradesh.
              </p>
            </div>

            <div className="flex flex-col gap-5 text-xs">
              <div className="flex items-start gap-3">
                <MapPin size={18} className="text-primary mt-0.5 shrink-0" />
                <div className="flex flex-col gap-0.5 text-muted-foreground">
                  <strong className="text-charcoal font-semibold">Registered Address</strong>
                  <span>204, Rajarajeshwari Parisar, Samardha Chouki,</span>
                  <span>Hoshangabad Road, Samardha Tehsil - Timarni,</span>
                  <span>Dist.- Harda, Madhya Pradesh 461228</span>
                  <a 
                    href="https://maps.app.goo.gl/XgzgNBmQqby2hYVs9?g_st=awb"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary font-semibold hover:underline inline-flex items-center gap-1 mt-1 text-[10px] uppercase font-accent tracking-wider"
                  >
                    View on Google Maps <ExternalLink size={10} />
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail size={18} className="text-primary mt-0.5 shrink-0" />
                <div className="flex flex-col gap-0.5 text-muted-foreground">
                  <strong className="text-charcoal font-semibold">Email Support</strong>
                  <a href="mailto:info.nirmalspices@gmail.com" className="hover:text-primary transition-colors">
                    info.nirmalspices@gmail.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone size={18} className="text-primary mt-0.5 shrink-0" />
                <div className="flex flex-col gap-0.5 text-muted-foreground">
                  <strong className="text-charcoal font-semibold">Phone & Support</strong>
                  <a href="tel:+919770057005" className="hover:text-primary transition-colors">
                    +91 97700 57005
                  </a>
                  <a href="tel:+919098200666" className="hover:text-primary transition-colors">
                    +91 90982 00666
                  </a>
                </div>
              </div>
            </div>

            {/* Social channels */}
            <div className="flex gap-3 mt-4">
              <a 
                href="https://www.instagram.com/nirmals_spices/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-gradient-to-tr from-yellow-500 via-red-500 to-purple-600 hover:brightness-110 text-white font-semibold font-accent uppercase tracking-wider text-[10px] py-3 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-sm"
              >
                <InstagramIcon size={14} /> Instagram
              </a>
              <a 
                href="https://youtube.com/@nirmalsspices_timarni?feature=shared"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold font-accent uppercase tracking-wider text-[10px] py-3 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-sm"
              >
                <YoutubeIcon size={14} /> YouTube
              </a>
            </div>

          </div>

          {/* Google Maps Iframe */}
          <div className="lg:col-span-7 rounded-3xl overflow-hidden border border-border shadow-sm h-[380px] lg:h-auto min-h-[300px]">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d118023.76672322363!2d76.99268393529329!3d22.34444558525049!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x397d9e4854580bfb%3A0xe54d310e53a3c2fe!2sTimarni%2C%20Madhya%20Pradesh%20461228!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
              className="w-full h-full border-0"
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Nirmal's Spices Location Map"
            />
          </div>

        </section>

      </div>

    </div>
  );
}
