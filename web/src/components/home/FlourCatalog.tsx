"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowUpRight, Wheat, ShieldCheck, Leaf, Star } from 'lucide-react';

const flourProducts = [
  {
    name: "Singhada Atta",
    nameHindi: "सिंघाड़ा आटा",
    description: "Pure water chestnut flour – ideal for fasting rotis & pakoras",
    badge: "Upvas Special",
    badgeColor: "bg-green-600",
    slug: "singhada-atta",
  },
  {
    name: "Rajgira Atta",
    nameHindi: "राजगीरा आटा",
    description: "Amaranth flour packed with protein & iron for festive fasting",
    badge: "Protein Rich",
    badgeColor: "bg-orange-500",
    slug: "rajgira-atta",
  },
  {
    name: "Fariyali Atta",
    nameHindi: "फरियाली आटा",
    description: "Blend of fasting flours for soft, delicious fariyali chapatis",
    badge: "Bestseller",
    badgeColor: "bg-crimson",
    slug: "fariyali-atta",
  },
  {
    name: "Singhada Atta (Karnal)",
    nameHindi: "सिंघाड़ा आटा – कर्नाल",
    description: "Premium quality water chestnut flour from Karnal – extra fine grind",
    badge: "Premium",
    badgeColor: "bg-pink-600",
    slug: "singhada-atta-karnal",
  },
];

const features = [
  { icon: Leaf,       label: "100% Natural"         },
  { icon: ShieldCheck, label: "ISO Certified"        },
  { icon: Star,       label: "No Preservatives"      },
  { icon: Wheat,      label: "Fasting Friendly"      },
];

export default function FlourCatalog() {
  return (
    <section
      className="py-20 md:py-28 bg-gradient-to-br from-amber-50 via-cream to-orange-50 relative overflow-hidden"
      aria-labelledby="flour-catalog-heading"
    >
      {/* Decorative background blobs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-saffron/5 rounded-full translate-x-32 -translate-y-32 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-crimson/5 rounded-full -translate-x-20 translate-y-20 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <motion.span
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest font-accent bg-saffron/15 text-saffron px-4 py-1.5 rounded-full mb-4"
          >
            <Wheat size={13} />
            Fasting Flours
          </motion.span>
          <motion.h2
            id="flour-catalog-heading"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, delay: 0.05 }}
            className="font-display font-bold text-3xl md:text-4xl text-charcoal mb-4"
          >
            Nirmal's Flour Catalog
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, delay: 0.1 }}
            className="text-muted-foreground text-sm font-sans leading-relaxed"
          >
            Shudh aur Satvik – crafted for fasting days. 100% Natural, ISO certified,
            no preservatives. The taste of tradition in every meal.
          </motion.p>
        </div>

        {/* Main 2-column layout: catalog image + product cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">

          {/* Left – Catalog Poster Image */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.65, type: "spring", stiffness: 80 }}
            className="relative"
          >
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-amber-200/60">
              <Image
                src="/flour_catalog.jpg"
                alt="Nirmal's Flour Catalog – Singhada Atta, Rajgira Atta, Fariyali Atta, Karnal Singhada Atta"
                width={600}
                height={800}
                className="w-full object-cover"
                priority
              />
              {/* Overlay badge */}
              <div className="absolute top-4 left-4 bg-green-700 text-white text-xs font-bold font-accent px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5">
                <ShieldCheck size={12} />
                100% Natural
              </div>
            </div>

            {/* Floating tag below image */}
            <div className="mt-4 flex flex-wrap gap-2 justify-center">
              {features.map(({ icon: Icon, label }) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-1.5 text-xs font-medium font-accent text-bark bg-amber-100 border border-amber-200 px-3 py-1 rounded-full"
                >
                  <Icon size={11} className="text-saffron" />
                  {label}
                </span>
              ))}
            </div>
          </motion.div>

          {/* Right – Product Cards */}
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 gap-5"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.12 } },
            }}
          >
            {flourProducts.map((product) => (
              <motion.div
                key={product.slug}
                variants={{
                  hidden: { opacity: 0, y: 24 },
                  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 90 } },
                }}
                whileHover={{ y: -5, scale: 1.02 }}
                className="group bg-white rounded-2xl border border-amber-200/60 p-5 flex flex-col gap-3 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer"
              >
                {/* Badge */}
                <span className={`self-start text-[10px] font-bold uppercase tracking-wider text-white px-2.5 py-0.5 rounded-full font-accent ${product.badgeColor}`}>
                  {product.badge}
                </span>

                {/* Product name */}
                <div>
                  <h3 className="font-display font-bold text-lg text-charcoal leading-tight">
                    {product.name}
                  </h3>
                  <p className="text-saffron text-xs font-accent mt-0.5">{product.nameHindi}</p>
                </div>

                {/* Description */}
                <p className="text-muted-foreground text-xs font-sans leading-relaxed flex-1">
                  {product.description}
                </p>

                {/* Shop Now CTA */}
                <Link
                  href={`/shop?cat=flour`}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider font-accent text-crimson hover:text-crimson-dark group-hover:underline transition-colors mt-auto"
                >
                  Shop Now
                  <ArrowUpRight
                    size={13}
                    className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
                  />
                </Link>
              </motion.div>
            ))}

            {/* View All Flours CTA card */}
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 24 },
                visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 90 } },
              }}
              className="sm:col-span-2"
            >
              <Link
                href="/shop?cat=flour"
                className="group flex items-center justify-between w-full bg-gradient-to-r from-saffron to-amber-500 hover:from-saffron-light hover:to-amber-400 text-white rounded-2xl px-6 py-4 font-accent font-bold text-sm uppercase tracking-wider shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <span className="flex items-center gap-2">
                  <Wheat size={16} />
                  View All Fasting Flours
                </span>
                <ArrowUpRight
                  size={18}
                  className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform"
                />
              </Link>
            </motion.div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
