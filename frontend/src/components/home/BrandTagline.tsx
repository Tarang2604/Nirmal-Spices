"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";

/**
 * BrandTagline — Rendered between HeroSection and CategoryGrid.
 *
 * Visual composition:
 *  • Background: Rich terracotta-to-deep-brown warm gradient with realistic lighting & grain.
 *  • Right Side Composition: Realistic food photography featuring bowls of vibrant yellow
 *    turmeric & red chilli powder, whole dried red chillies, black peppercorns, coriander seeds,
 *    and fresh green leaves entering from the top-right corner.
 *  • Center: Uncluttered focus on typography.
 *  • Hindi Font: Noto Serif Devanagari Bold (with warm cream text & golden yellow highlights on key words).
 *  • English Font: Cormorant Garamond Italic.
 *  • Accents: Golden horizontal divider, top ornamental motif, and Harda origin pill badge.
 */
export default function BrandTagline() {
  return (
    <section
      aria-label="Brand tagline – Nirmal's Spices"
      className="relative overflow-hidden bg-[#431407] py-16 sm:py-20 md:py-24 border-y border-[#FFC83B]/20"
    >
      {/* ── Base Terracotta Gradient ── */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-r from-[#381005] via-[#5C1A08] to-[#7D240A]"
      />

      {/* ── Realistic Right-Side Spice Composition (Food Photography) ── */}
      <div
        aria-hidden="true"
        className="absolute top-0 right-0 bottom-0 w-full sm:w-[65%] md:w-[50%] lg:w-[45%] xl:w-[40%] pointer-events-none select-none z-0 overflow-hidden"
        style={{
          maskImage: "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.5) 25%, black 50%)",
          WebkitMaskImage: "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.5) 25%, black 50%)",
        }}
      >
        <Image
          src="/brand_tagline_spices.png"
          alt="Authentic Indian Spices - Turmeric, Chilli, Whole Spices, Fresh Leaves"
          fill
          priority
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 40vw"
          className="object-cover object-right opacity-90 transition-opacity duration-700"
        />
        {/* Soft shadow & edge blend overlays */}
        <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-[#5C1A08]/80 mix-blend-multiply pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#381005]/60 via-transparent to-[#381005]/40 pointer-events-none" />
      </div>

      {/* ── Warm saffron/amber radial glow in center ── */}
      <div
        aria-hidden="true"
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] max-w-full h-[300px]
                   bg-gradient-to-r from-[#E67E22]/20 via-[#F39C12]/25 to-[#D35400]/20 rounded-full blur-[90px] pointer-events-none z-[1]"
      />

      {/* ── Top & bottom golden edge lines ── */}
      <div
        aria-hidden="true"
        className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#FFC83B]/40 to-transparent z-[2]"
      />
      <div
        aria-hidden="true"
        className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#FFC83B]/40 to-transparent z-[2]"
      />

      {/* ── Film grain texture overlay for tactile depth ── */}
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.035]
                   bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJub2lzZSI+PGZlVHVyYnVsZW5jZSB0eXBlPSJmcmFjdGFsTm9pc2UiIGJhc2VGcmVxdWVuY3k9IjAuOCIgc3RpdGNoVGlsZXM9InN0aXRjaCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbHRlcj0idXJsKCNub2lzZSkiIG9wYWNpdHk9IjEiLz48L3N2Zz4=')]
                   pointer-events-none z-[2]"
      />

      {/* ── Main Content (Centered & Clean) ── */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">

        {/* ── Top ornamental spice flourish ── */}
        <motion.div
          aria-hidden="true"
          initial={{ opacity: 0, y: -8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex items-center justify-center gap-2 sm:gap-3 select-none mb-4 sm:mb-5 opacity-90"
        >
          <span className="w-10 sm:w-16 md:w-24 h-[1px] bg-gradient-to-r from-transparent via-[#FFC83B]/60 to-[#FFC83B]/30" />
          <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
            <span className="inline-block w-2 h-2 rotate-45 border border-[#FFC83B]/70 bg-transparent" />
            <span className="w-3 sm:w-5 h-[1px] bg-[#FFC83B]/40" />
            <span className="text-xs sm:text-sm drop-shadow-sm select-none">🌶️</span>
            <span className="w-2.5 h-[1px] bg-[#FFC83B]/40" />
            <span className="text-xs sm:text-sm drop-shadow-sm select-none">🧄</span>
            <span className="w-3 sm:w-5 h-[1px] bg-[#FFC83B]/40" />
            <span className="inline-block w-2 h-2 rotate-45 border border-[#FFC83B]/70 bg-transparent" />
          </div>
          <span className="w-10 sm:w-16 md:w-24 h-[1px] bg-gradient-to-l from-transparent via-[#FFC83B]/60 to-[#FFC83B]/30" />
        </motion.div>

        {/* ── Primary Hindi Tagline (Noto Serif Devanagari Bold) ── */}
        <motion.h2
          lang="hi"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
          className="font-bold text-[#FFFDF9]
                     text-2xl sm:text-3xl md:text-4xl lg:text-[2.75rem]
                     leading-[1.3] sm:leading-[1.35] md:leading-[1.35] tracking-normal
                     drop-shadow-[0_2px_14px_rgba(0,0,0,0.6)]
                     max-w-4xl"
          style={{
            fontFamily: "var(--font-noto-serif-devanagari), 'Noto Serif Devanagari', serif",
            textShadow: "0 2px 18px rgba(0, 0, 0, 0.65)",
          }}
        >
          {/* First line: "हम बनाते हैं मसाले दिल से…" */}
          <span className="block mb-1 sm:mb-1.5">
            हम बनाते हैं मसाले{" "}
            <span
              className="font-bold inline-block"
              style={{ color: "#FFC83B" }}
            >
              दिल से…
            </span>
          </span>

          {/* Second line: "क्योंकि हम बसते हैं हिंदुस्तान के दिल में ❤️" */}
          <span className="block">
            क्योंकि हम बसते हैं{" "}
            <span
              className="font-bold inline-block"
              style={{ color: "#FFC83B" }}
            >
              हिंदुस्तान
            </span>{" "}
            के{" "}
            <span
              className="font-bold inline-block"
              style={{ color: "#FFC83B" }}
            >
              दिल में
            </span>{" "}
            <motion.span
              aria-hidden="true"
              initial={{ scale: 0.6, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ type: "spring", stiffness: 260, damping: 15, delay: 0.55 }}
              className="inline-block text-[#E74C3C] text-[0.95em] align-baseline ml-0.5 drop-shadow-[0_0_10px_rgba(231,76,60,0.5)]"
            >
              ❤️
            </motion.span>
          </span>
        </motion.h2>

        {/* ── Subtle Golden Horizontal Divider below Hindi tagline ── */}
        <motion.div
          aria-hidden="true"
          initial={{ scaleX: 0, opacity: 0 }}
          whileInView={{ scaleX: 1, opacity: 1 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.65, ease: "easeOut", delay: 0.25 }}
          className="w-24 sm:w-36 md:w-52 h-[1.5px] origin-center bg-gradient-to-r from-transparent via-[#FFC83B]/80 to-transparent my-3.5 sm:my-4"
        />

        {/* ── English Tagline (Cormorant Garamond Italic) ── */}
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="text-[#FAF3E0]/95 text-sm sm:text-base md:text-lg lg:text-[1.25rem]
                     italic font-normal leading-relaxed max-w-2xl px-2"
          style={{
            fontFamily: "var(--font-cormorant), 'Cormorant Garamond', Georgia, serif",
            letterSpacing: "0.015em",
            textShadow: "0 1px 10px rgba(0, 0, 0, 0.45)",
          }}
        >
          &ldquo;We make spices with heart... because we live in the heart of India.&rdquo;
        </motion.p>

        {/* ── Origin Location Pill Badge ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5, delay: 0.45 }}
          className="mt-6 sm:mt-7 inline-flex items-center gap-2
                     bg-black/30 border border-[#FFC83B]/45 hover:border-[#FFC83B]/75
                     backdrop-blur-md text-[#FFFDF9]/95 text-[10px] sm:text-[11px] md:text-xs
                     font-medium uppercase tracking-[0.16em] sm:tracking-[0.2em]
                     px-4 sm:px-5 py-1.5 sm:py-2 rounded-full shadow-sm transition-all duration-300"
        >
          <span aria-hidden="true" className="text-[#FFC83B] text-xs">📍</span>
          <span>HARDA, MADHYA PRADESH – HEART OF INDIA</span>
        </motion.div>

      </div>
    </section>
  );
}
