"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, ShieldCheck, Sparkles, Star, Award } from 'lucide-react';

export default function HeroSection() {
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 90, damping: 20 } },
  };

  const badges = [
    { icon: <ShieldCheck size={13} />, text: "100% Pure" },
    { icon: <Award size={13} />, text: "FSSAI Certified" },
    { icon: <Star size={13} fill="currentColor" />, text: "4.9 ★ Rated" },
  ];

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#fdf8f3] via-cream to-[#fff4e6] min-h-[85vh] flex items-center">
      {/* Background glow blobs */}
      <div className="absolute top-0 left-0 w-[480px] h-[480px] bg-saffron/8 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-crimson/6 rounded-full blur-[140px] translate-x-1/3 translate-y-1/3 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 w-[300px] h-[300px] bg-turmeric/5 rounded-full blur-[80px] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

      {/* Decorative grain texture overlay */}
      <div className="absolute inset-0 opacity-[0.03] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJub2lzZSI+PGZlVHVyYnVsZW5jZSB0eXBlPSJmcmFjdGFsTm9pc2UiIGJhc2VGcmVxdWVuY3k9IjAuOCIgc3RpdGNoVGlsZXM9InN0aXRjaCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbHRlcj0idXJsKCNub2lzZSkiIG9wYWNpdHk9IjEiLz48L3N2Zz4=')] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          
          {/* LEFT — TEXT CONTENT */}
          <motion.div
            className="flex flex-col items-start"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Top badge pill */}
            <motion.div variants={itemVariants} className="mb-5">
              <span className="inline-flex items-center gap-2 bg-crimson/10 border border-crimson/25 text-crimson px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-widest font-accent shadow-sm">
                <Sparkles size={11} />
                Direct from Harda, Madhya Pradesh
              </span>
            </motion.div>

            {/* Main headline */}
            <motion.h1
              variants={itemVariants}
              className="font-display font-extrabold text-4xl sm:text-5xl lg:text-[3.8rem] xl:text-[4.2rem] leading-[1.08] text-charcoal tracking-tight mb-5"
            >
              <span className="block">Experience the</span>
              <span className="block text-primary italic">Soul of India</span>
              <span className="block">in Every Spice.</span>
            </motion.h1>

            {/* Sub-headline */}
            <motion.p
              variants={itemVariants}
              className="text-slate/80 text-base sm:text-lg leading-relaxed max-w-lg mb-8 font-sans"
            >
              Nirmal&apos;s Spices brings you <strong className="text-charcoal/90 font-semibold">43 varieties</strong> of handpicked, hygienically processed, 
              eco-packed Indian spices — straight from the heartland of MP to your kitchen.
            </motion.p>

            {/* Trust badges row */}
            <motion.div variants={itemVariants} className="flex flex-wrap gap-3 mb-8">
              {badges.map((b) => (
                <span
                  key={b.text}
                  className="inline-flex items-center gap-1.5 bg-white/70 border border-bark/15 text-bark px-3 py-1 rounded-full text-[11px] font-semibold font-accent shadow-sm backdrop-blur-sm"
                >
                  <span className="text-saffron">{b.icon}</span>
                  {b.text}
                </span>
              ))}
            </motion.div>

            {/* CTA buttons */}
            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto"
            >
              <Link
                href="/shop"
                className="group relative bg-primary hover:bg-crimson-dark text-white font-bold font-accent uppercase tracking-wider text-xs px-8 py-4 rounded-full flex items-center justify-center gap-2 shadow-[0_4px_24px_rgba(185,28,28,0.30)] hover:shadow-[0_6px_30px_rgba(185,28,28,0.45)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Shop All Spices
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform duration-200" />
                </span>
                <span className="absolute inset-0 bg-gradient-to-r from-crimson/0 via-white/10 to-crimson/0 -translate-x-full group-hover:translate-x-full transition-transform duration-500 z-0" />
              </Link>

              <Link
                href="/shop?cat=blended-masalas"
                className="border-2 border-bark/20 hover:border-primary/40 hover:bg-primary/5 text-bark font-bold font-accent uppercase tracking-wider text-xs px-8 py-4 rounded-full flex items-center justify-center gap-2 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
              >
                Blended Masalas
              </Link>
            </motion.div>

            {/* Trust line */}
            <motion.p variants={itemVariants} className="mt-6 text-[11px] text-muted-foreground font-sans flex items-center gap-1.5">
              <ShieldCheck size={13} className="text-primary" />
              Free delivery above ₹499 &bull; 10,000+ happy customers &bull; Pan-India shipping
            </motion.p>
          </motion.div>

          {/* RIGHT — VISUAL */}
          <motion.div
            className="relative flex items-center justify-center"
            initial={{ opacity: 0, x: 40, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
          >
            {/* Main image card */}
            <div className="relative w-full max-w-md lg:max-w-full aspect-[4/4.5] rounded-3xl overflow-hidden shadow-[0_30px_80px_rgba(0,0,0,0.14)] border-4 border-white">
              <Image
                src="/hero_spices.png"
                alt="Premium Indian Spices Flatlay - Nirmal's Spices"
                fill
                priority
                className="object-cover object-center"
                sizes="(max-width: 768px) 100vw, 550px"
              />
              {/* Subtle gradient overlay at bottom */}
              <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-charcoal/30 to-transparent" />
            </div>

            {/* Floating product count badge */}
            <motion.div
              className="absolute -bottom-5 -left-5 bg-primary text-white px-4 py-3 rounded-2xl shadow-xl flex flex-col items-center justify-center font-display"
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6, type: "spring" as const, stiffness: 200 }}
            >
              <span className="font-extrabold text-2xl leading-none">43</span>
              <span className="text-[9px] font-accent uppercase tracking-widest opacity-90">Varieties</span>
            </motion.div>

            {/* Floating brand logo badge */}
            <motion.div
              className="absolute -top-4 -right-4 bg-white border-2 border-cream-dark/40 rounded-2xl shadow-xl p-3 flex items-center gap-2"
              initial={{ opacity: 0, y: -15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, type: "spring" as const, stiffness: 180 }}
            >
              <Image
                src="/nirmal_logo.png"
                alt="Nirmal's Spices"
                width={36}
                height={36}
                className="object-contain"
              />
              <div className="flex flex-col leading-tight pr-1">
                <span className="font-display font-bold text-xs text-charcoal">Nirmal&apos;s</span>
                <span className="text-[9px] text-muted-foreground font-accent uppercase tracking-wider">Spices</span>
              </div>
            </motion.div>

            {/* Delivery badge */}
            <motion.div
              className="absolute top-1/2 -right-6 -translate-y-1/2 bg-white border border-cream-dark/30 rounded-xl shadow-lg px-3 py-2 flex items-center gap-1.5"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.85, type: "spring" as const, stiffness: 150 }}
            >
              <span className="text-base">🚚</span>
              <div className="flex flex-col leading-tight">
                <span className="text-[10px] font-bold text-charcoal font-accent">Free Delivery</span>
                <span className="text-[9px] text-muted-foreground">Above ₹499</span>
              </div>
            </motion.div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
