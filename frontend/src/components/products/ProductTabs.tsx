"use client";

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Star, MessageSquare, Package, Lightbulb, BookOpen, Leaf, ShieldCheck, Loader2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { createReviewSchema } from '@/validators/review.validator';
import { toast } from 'sonner';
import Link from 'next/link';

interface ProductTabsProps {
  productId: string;
  description: string;
  ingredients: string;
  usageTips: string;
  shelfLife?: string;
  storageInstructions?: string;
  nutritionalNotes?: string;
}

interface ReviewItem {
  _id: string;
  user?: { name?: string; avatar?: string };
  rating: number;
  title: string;
  body: string;
  createdAt: string;
  isVerifiedPurchase?: boolean;
}

export default function ProductTabs({
  productId,
  description,
  ingredients,
  usageTips,
  shelfLife,
  storageInstructions,
  nutritionalNotes,
}: ProductTabsProps) {
  const [activeTab, setActiveTab] = useState<'desc' | 'ingredients' | 'usage' | 'storage' | 'reviews'>('reviews');
  const { isLoggedIn } = useAuthStore();
  const queryClient = useQueryClient();

  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');

  const visibleTabs = [
    { label: 'Description', value: 'desc' as const, icon: <BookOpen size={13} />, show: Boolean(description) },
    {
      label: 'Ingredients',
      value: 'ingredients' as const,
      icon: <Leaf size={13} />,
      show: Boolean(ingredients?.trim()),
    },
    {
      label: 'Usage Tips',
      value: 'usage' as const,
      icon: <Lightbulb size={13} />,
      show: Boolean(usageTips?.trim()),
    },
    {
      label: 'Storage',
      value: 'storage' as const,
      icon: <Package size={13} />,
      show: Boolean(storageInstructions?.trim() || shelfLife?.trim()),
    },
    { label: 'Reviews', value: 'reviews' as const, icon: <MessageSquare size={13} />, show: true },
  ].filter((t) => t.show);

  React.useEffect(() => {
    if (!visibleTabs.some((t) => t.value === activeTab) && visibleTabs[0]) {
      setActiveTab(visibleTabs[0].value);
    }
  }, [description, ingredients, usageTips, storageInstructions, shelfLife]); // eslint-disable-line react-hooks/exhaustive-deps

  const { data: reviewsData, isLoading: reviewsLoading } = useQuery({
    queryKey: ['product-reviews', productId],
    queryFn: async () => {
      const res = await api.get(`/reviews/${productId}?limit=20`);
      return res.data;
    },
    enabled: !!productId && activeTab === 'reviews',
  });

  const reviews: ReviewItem[] = reviewsData?.data || [];
  const reviewTotal = reviewsData?.meta?.total ?? reviews.length;
  const avgRating =
    reviews.length > 0
      ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10
      : 0;

  const submitMutation = useMutation({
    mutationFn: async () => {
      const parsed = createReviewSchema.parse({ rating, title, body });
      const res = await api.post(`/reviews/${productId}`, parsed);
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || 'Review submitted for approval');
      setTitle('');
      setBody('');
      setRating(5);
      queryClient.invalidateQueries({ queryKey: ['product-reviews', productId] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    },
  });

  const ingredientList = ingredients
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <div className="bg-white border border-border/60 rounded-2xl overflow-hidden shadow-sm">
      <div className="flex overflow-x-auto border-b border-border/60 scrollbar-none">
        {visibleTabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={cn(
              'flex items-center gap-1.5 whitespace-nowrap px-5 py-3.5 text-xs font-semibold font-accent uppercase tracking-wider transition-all duration-200 border-b-2 flex-shrink-0',
              activeTab === tab.value
                ? 'border-primary text-primary bg-primary/5'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/40',
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      <div className="p-6 sm:p-8">
        {activeTab === 'desc' && (
          <div className="prose prose-sm max-w-none">
            <p className="text-foreground/85 leading-relaxed text-sm sm:text-base font-sans">{description}</p>
            {nutritionalNotes && (
              <div className="mt-6 flex items-start gap-3 bg-green-50 border border-green-200 rounded-xl p-4">
                <ShieldCheck size={18} className="text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-green-800 text-xs font-accent uppercase tracking-wider mb-1">
                    Nutritional Notes
                  </p>
                  <p className="text-green-700 text-sm font-sans">{nutritionalNotes}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'ingredients' && (
          <div>
            {ingredientList.length === 0 ? (
              <p className="text-sm text-muted-foreground">No ingredients listed for this product.</p>
            ) : (
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
            )}
          </div>
        )}

        {activeTab === 'usage' && (
          <div>
            <div className="flex items-start gap-3 mb-4">
              <Lightbulb size={18} className="text-saffron mt-0.5 flex-shrink-0" />
              <p className="text-sm font-semibold text-charcoal font-accent uppercase tracking-wider">How to Use</p>
            </div>
            <p className="text-foreground/85 leading-relaxed text-sm sm:text-base font-sans whitespace-pre-line">{usageTips}</p>
          </div>
        )}

        {activeTab === 'storage' && (
          <div className="space-y-5">
            {storageInstructions && (
              <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-xl p-4">
                <Package size={18} className="text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-blue-800 text-xs font-accent uppercase tracking-wider mb-1">
                    Storage Instructions
                  </p>
                  <p className="text-blue-700 text-sm font-sans">{storageInstructions}</p>
                </div>
              </div>
            )}
            {shelfLife && (
              <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
                <ShieldCheck size={18} className="text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-amber-800 text-xs font-accent uppercase tracking-wider mb-1">
                    Shelf Life
                  </p>
                  <p className="text-amber-700 text-sm font-sans">{shelfLife}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="space-y-6">
            <div className="flex items-center gap-6 border-b border-border/50 pb-6">
              <div className="text-center">
                <p className="text-5xl font-extrabold text-charcoal font-display leading-none">
                  {avgRating || '—'}
                </p>
                <div className="flex items-center justify-center gap-0.5 mt-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      className={i < Math.round(avgRating) ? 'text-saffron fill-saffron' : 'text-border'}
                    />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-1 font-sans">
                  Based on {reviewTotal} review{reviewTotal === 1 ? '' : 's'}
                </p>
              </div>
            </div>

            {reviewsLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 text-primary animate-spin" />
              </div>
            ) : reviews.length === 0 ? (
              <p className="text-sm text-muted-foreground font-sans text-center py-4">
                No approved reviews yet. Be the first to share your experience.
              </p>
            ) : (
              <div className="space-y-5">
                {reviews.map((review) => (
                  <div key={review._id} className="border border-border/50 rounded-xl p-5">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm font-display">
                          {(review.user?.name || 'U').charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-charcoal font-sans">
                            {review.user?.name || 'Customer'}
                          </p>
                          <p className="text-[11px] text-muted-foreground font-sans">
                            {new Date(review.createdAt).toLocaleDateString('en-IN')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={12}
                            className={i < review.rating ? 'text-saffron fill-saffron' : 'text-border'}
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
            )}

            {isLoggedIn ? (
              <form
                className="bg-cream/60 border border-border/50 rounded-xl p-5 space-y-3"
                onSubmit={(e) => {
                  e.preventDefault();
                  submitMutation.mutate();
                }}
              >
                <p className="font-semibold text-charcoal text-sm font-sans">Write a review</p>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button key={n} type="button" onClick={() => setRating(n)} className="outline-none">
                      <Star
                        size={18}
                        className={n <= rating ? 'text-saffron fill-saffron' : 'text-border'}
                      />
                    </button>
                  ))}
                </div>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Review title"
                  className="w-full bg-white border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-primary"
                  required
                />
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Share your experience (min 10 characters)"
                  rows={3}
                  className="w-full bg-white border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-primary resize-y"
                  required
                />
                <button
                  type="submit"
                  disabled={submitMutation.isPending}
                  className="inline-flex items-center gap-1.5 bg-primary text-white text-xs font-bold font-accent uppercase tracking-wider px-5 py-2.5 rounded-full hover:bg-crimson-dark transition-colors disabled:opacity-50"
                >
                  {submitMutation.isPending && <Loader2 size={12} className="animate-spin" />}
                  Submit Review
                </button>
              </form>
            ) : (
              <div className="bg-cream/60 border border-border/50 rounded-xl p-5 text-center">
                <p className="font-semibold text-charcoal mb-1 text-sm font-sans">Tried this product?</p>
                <p className="text-xs text-muted-foreground font-sans mb-3">
                  Sign in to share your experience and help other customers.
                </p>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 bg-primary text-white text-xs font-bold font-accent uppercase tracking-wider px-5 py-2.5 rounded-full hover:bg-crimson-dark transition-colors"
                >
                  <MessageSquare size={12} /> Write a Review
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
