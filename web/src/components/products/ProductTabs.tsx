"use client";

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Star, MessageSquare, Package, Lightbulb, BookOpen, Leaf, ShieldCheck } from 'lucide-react';

interface ProductTabsProps {
  productId: string;
  description: string;
  ingredients: string;
  usageTips: string;
  shelfLife?: string;
  storageInstructions?: string;
  nutritionalNotes?: string;
}

// Mock reviews — these would come from the backend when available
const MOCK_REVIEWS = [
  {
    _id: 'r1',
    user: { name: 'Priya Sharma', avatar: '' },
    rating: 5,
    title: 'Absolutely authentic!',
    body: 'The aroma is incredible — just like my grandmother used to buy from the local market. Highly recommend to everyone who loves pure spices.',
    createdAt: '2025-11-12',
  },
  {
    _id: 'r2',
    user: { name: 'Rajan Mehta', avatar: '' },
    rating: 5,
    title: 'Best quality I\'ve found online',
    body: 'I\'ve tried many brands but Nirmal\'s spices are the most authentic. The flavor is deep and the aroma is unmatched. Will definitely order again.',
    createdAt: '2025-10-28',
  },
  {
    _id: 'r3',
    user: { name: 'Anita Verma', avatar: '' },
    rating: 4,
    title: 'Great product, fast delivery',
    body: 'Very happy with the purchase. The packaging is clean and the spice is very fresh. Will recommend to friends and family.',
    createdAt: '2025-10-05',
  },
];

export default function ProductTabs({
  productId: _productId,
  description,
  ingredients,
  usageTips,
  shelfLife,
  storageInstructions,
  nutritionalNotes,
}: ProductTabsProps) {
  const [activeTab, setActiveTab] = useState<'desc' | 'ingredients' | 'usage' | 'storage' | 'reviews'>('desc');

  const tabs = [
    { label: 'Description', value: 'desc' as const, icon: <BookOpen size={13} /> },
    { label: 'Ingredients', value: 'ingredients' as const, icon: <Leaf size={13} /> },
    { label: 'Usage Tips', value: 'usage' as const, icon: <Lightbulb size={13} /> },
    { label: 'Storage', value: 'storage' as const, icon: <Package size={13} /> },
    { label: 'Reviews', value: 'reviews' as const, icon: <MessageSquare size={13} /> },
  ];

  // Split comma-separated ingredient string into list
  const ingredientList = ingredients
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);

  return (
    <div className="bg-white border border-border/60 rounded-2xl overflow-hidden shadow-sm">

      {/* Tab Headers */}
      <div className="flex overflow-x-auto border-b border-border/60 scrollbar-none">
        {tabs.map(tab => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={cn(
              "flex items-center gap-1.5 whitespace-nowrap px-5 py-3.5 text-xs font-semibold font-accent uppercase tracking-wider transition-all duration-200 border-b-2 flex-shrink-0",
              activeTab === tab.value
                ? "border-primary text-primary bg-primary/5"
                : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/40"
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="p-6 sm:p-8">

        {/* Description */}
        {activeTab === 'desc' && (
          <div className="prose prose-sm max-w-none">
            <p className="text-foreground/85 leading-relaxed text-sm sm:text-base font-sans">{description}</p>
            {nutritionalNotes && (
              <div className="mt-6 flex items-start gap-3 bg-green-50 border border-green-200 rounded-xl p-4">
                <ShieldCheck size={18} className="text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-green-800 text-xs font-accent uppercase tracking-wider mb-1">Nutritional Notes</p>
                  <p className="text-green-700 text-sm font-sans">{nutritionalNotes}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Ingredients */}
        {activeTab === 'ingredients' && (
          <div>
            <p className="text-muted-foreground text-xs font-accent uppercase tracking-wider mb-4">
              All ingredients are 100% natural — no artificial colors, flavors, or preservatives.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {ingredientList.map((ing, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 bg-cream/60 border border-border/50 rounded-lg px-3 py-2"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                  <span className="text-sm text-charcoal font-sans">{ing}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Usage Tips */}
        {activeTab === 'usage' && (
          <div>
            <div className="flex items-start gap-3 mb-4">
              <Lightbulb size={18} className="text-saffron mt-0.5 flex-shrink-0" />
              <p className="text-sm font-semibold text-charcoal font-accent uppercase tracking-wider">How to Use</p>
            </div>
            <p className="text-foreground/85 leading-relaxed text-sm sm:text-base font-sans">{usageTips}</p>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="bg-saffron/8 border border-saffron/20 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-saffron font-display">1–2 tsp</p>
                <p className="text-xs text-muted-foreground mt-1 font-sans">Typical serving</p>
              </div>
              <div className="bg-crimson/8 border border-crimson/20 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-crimson font-display">100%</p>
                <p className="text-xs text-muted-foreground mt-1 font-sans">Natural ingredients</p>
              </div>
            </div>
          </div>
        )}

        {/* Storage */}
        {activeTab === 'storage' && (
          <div className="space-y-5">
            {storageInstructions && (
              <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-xl p-4">
                <Package size={18} className="text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-blue-800 text-xs font-accent uppercase tracking-wider mb-1">Storage Instructions</p>
                  <p className="text-blue-700 text-sm font-sans">{storageInstructions}</p>
                </div>
              </div>
            )}
            {shelfLife && (
              <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
                <ShieldCheck size={18} className="text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-amber-800 text-xs font-accent uppercase tracking-wider mb-1">Shelf Life</p>
                  <p className="text-amber-700 text-sm font-sans">{shelfLife}</p>
                </div>
              </div>
            )}
            <div className="flex items-start gap-3 bg-green-50 border border-green-200 rounded-xl p-4">
              <ShieldCheck size={18} className="text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-green-800 text-xs font-accent uppercase tracking-wider mb-1">Quality Promise</p>
                <p className="text-green-700 text-sm font-sans">
                  All Nirmal&apos;s Spices products are FSSAI certified, hygienically processed, and free from artificial additives.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Reviews */}
        {activeTab === 'reviews' && (
          <div className="space-y-6">
            {/* Rating summary */}
            <div className="flex items-center gap-6 border-b border-border/50 pb-6">
              <div className="text-center">
                <p className="text-5xl font-extrabold text-charcoal font-display leading-none">4.8</p>
                <div className="flex items-center justify-center gap-0.5 mt-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} className="text-saffron fill-saffron" />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-1 font-sans">Based on {MOCK_REVIEWS.length}+ reviews</p>
              </div>
              <div className="flex-1 space-y-1.5">
                {[5, 4, 3, 2, 1].map(star => (
                  <div key={star} className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground w-4 text-right font-sans">{star}</span>
                    <Star size={10} className="text-saffron fill-saffron flex-shrink-0" />
                    <div className="flex-1 h-1.5 bg-border/40 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-saffron rounded-full"
                        style={{ width: star === 5 ? '72%' : star === 4 ? '20%' : star === 3 ? '6%' : '1%' }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground w-6 font-sans">
                      {star === 5 ? '72%' : star === 4 ? '20%' : star === 3 ? '6%' : '1%'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Review list */}
            <div className="space-y-5">
              {MOCK_REVIEWS.map(review => (
                <div key={review._id} className="border border-border/50 rounded-xl p-5">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm font-display">
                        {review.user.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-charcoal font-sans">{review.user.name}</p>
                        <p className="text-[11px] text-muted-foreground font-sans">{review.createdAt}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={12}
                          className={i < review.rating ? "text-saffron fill-saffron" : "text-border"}
                          fill={i < review.rating ? 'currentColor' : 'none'}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="font-semibold text-sm text-charcoal mb-1 font-sans">{review.title}</p>
                  <p className="text-sm text-foreground/75 leading-relaxed font-sans">{review.body}</p>
                </div>
              ))}
            </div>

            {/* Write a review prompt */}
            <div className="bg-cream/60 border border-border/50 rounded-xl p-5 text-center">
              <p className="font-semibold text-charcoal mb-1 text-sm font-sans">Tried this product?</p>
              <p className="text-xs text-muted-foreground font-sans mb-3">Sign in to share your experience and help other customers.</p>
              <a
                href="/login"
                className="inline-flex items-center gap-1.5 bg-primary text-white text-xs font-bold font-accent uppercase tracking-wider px-5 py-2.5 rounded-full hover:bg-crimson-dark transition-colors"
              >
                <MessageSquare size={12} /> Write a Review
              </a>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
