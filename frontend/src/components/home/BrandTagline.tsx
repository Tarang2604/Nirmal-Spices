"use client";

import React from "react";
import { motion } from "framer-motion";

/**
 * BrandTagline — rendered exactly once on the homepage,
 * positioned between HeroSection and CategoryGrid.
 *
 * Design intent:
 *  • Full-width spice-palette gradient band (terracotta → chilli → crimson)
 *  • Centred Hindi tagline in Devanagari, set in Playfair Display (+ Noto fallback)
 *  • CSS-only ornamental dividers — no image assets needed
 *  • One-shot fade-up + shimmer text reveal via Framer Motion (viewport once)
 *  • Fully responsive; WCAG AA contrast compliant
 */
export default function BrandTagline() {
  return (
    <section
      aria-label="Brand tagline – Nirmal's Spices"
      className="relative overflow-hidden"
    >
      {/* ── Spice-palette gradient band ── */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-r from-[#7B2D10] via-[#B8460D] to-[#C0392B]"
      />

      {/* ── Warm saffron glow at top-centre ── */}
      <div
        aria-hidden="true"
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[260px]
                   bg-[#E67E22]/25 rounded-full blur-[90px] pointer-events-none"
      />

      {/* ── Cinnamon-gold bottom edge accent ── */}
      <div
        aria-hidden="true"
        className="absolute bottom-0 inset-x-0 h-px
                   bg-gradient-to-r from-transparent via-[#F39C12]/40 to-transparent"
      />

      {/* ── Grain texture overlay (matches HeroSection) ── */}
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.04]
                   bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJub2lzZSI+PGZlVHVyYnVsZW5jZSB0eXBlPSJmcmFjdGFsTm9pc2UiIGJhc2VGcmVxdWVuY3k9IjAuOCIgc3RpdGNoVGlsZXM9InN0aXRjaCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbHRlcj0idXJsKCNub2lzZSkiIG9wYWNpdHk9IjEiLz48L3N2Zz4=')]
                   pointer-events-none"
      />

      {/* ── Content ── */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16 md:py-20 flex flex-col items-center text-center gap-6">

        {/* Top ornamental rule */}
        <motion.div
          aria-hidden="true"
          initial={{ scaleX: 0, opacity: 0 }}
          whileInView={{ scaleX: 1, opacity: 1 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="w-24 h-px origin-center bg-gradient-to-r from-transparent via-[#F39C12]/70 to-transparent"
        />

        {/* Spice icon row */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5, delay: 0.1 }}
          aria-hidden="true"
          className="flex items-center gap-2 select-none"
        >
          <span className="text-base">🌶️</span>
          <span className="w-12 h-px bg-[#F39C12]/40" />
          <span className="text-base">🫚</span>
          <span className="w-12 h-px bg-[#F39C12]/40" />
          <span className="text-base">🧄</span>
        </motion.div>

        {/* ── Primary Hindi tagline ── */}
        <motion.p
          role="doc-subtitle"
          lang="hi"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1], delay: 0.18 }}
          className="font-bold leading-snug tracking-wide text-white
                     text-2xl sm:text-3xl md:text-[2.15rem] lg:text-[2.5rem]
                     drop-shadow-[0_2px_12px_rgba(0,0,0,0.35)]"
          style={{
            fontFamily:
              "'Playfair Display', 'Noto Serif Devanagari', Georgia, serif",
            textShadow: "0 1px 18px rgba(0,0,0,0.40)",
          }}
        >
          {/* First clause */}
          हम बनाते हैं मसाले{" "}
          {/* Highlighted "दिल से" */}
          <span className="relative inline-block" style={{ color: "#F9E79F" }}>
            दिल से
            {/* Shimmer underline – plays once */}
            <motion.span
              aria-hidden="true"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.55 }}
              className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full origin-left
                         bg-gradient-to-r from-[#F39C12]/60 via-[#F9E79F] to-[#F39C12]/60"
            />
          </span>

          {/* Ellipsis bridge */}
          {"… "}

          {/* Second clause */}
          क्योंकि हम बसते हैं हिंदुस्तान के{" "}

          {/* Highlighted "दिल में" */}
          <span className="relative inline-block" style={{ color: "#F9E79F" }}>
            दिल में
            <motion.span
              aria-hidden="true"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.72 }}
              className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full origin-left
                         bg-gradient-to-r from-[#F39C12]/60 via-[#F9E79F] to-[#F39C12]/60"
            />
          </span>

          {" "}

          {/* Spring-pop heart */}
          <motion.span
            aria-hidden="true"
            initial={{ scale: 0.5, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 220, damping: 14, delay: 0.8 }}
            className="inline-block"
          >
            ❤️
          </motion.span>
        </motion.p>

        {/* English translation – subtly visible for non-Hindi readers & screen readers */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, delay: 0.45 }}
          className="text-white/55 text-xs sm:text-sm font-sans italic leading-relaxed max-w-md"
        >
          &ldquo;We make spices with heart… because we live in the heart of India.&rdquo;
        </motion.p>

        {/* Bottom ornamental rule */}
        <motion.div
          aria-hidden="true"
          initial={{ scaleX: 0, opacity: 0 }}
          whileInView={{ scaleX: 1, opacity: 1 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.3 }}
          className="w-24 h-px origin-center bg-gradient-to-r from-transparent via-[#F39C12]/70 to-transparent"
        />

        {/* Origin badge */}
        <motion.span
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="inline-flex items-center gap-1.5
                     bg-white/10 border border-white/20 backdrop-blur-sm
                     text-white/80 text-[10px] font-accent font-semibold
                     uppercase tracking-widest px-4 py-1.5 rounded-full"
        >
          <span aria-hidden="true">📍</span>
          Harda, Madhya Pradesh — Heart of India
        </motion.span>
      </div>
    </section>
  );
}
