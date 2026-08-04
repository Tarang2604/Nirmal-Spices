"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface ProductGalleryProps {
  images: string[];
}

export default function ProductGallery({ images }: ProductGalleryProps) {
  const [activeIdx, setActiveIdx] = useState(0);

  const displayImages = images.length > 0 ? images : ['/hero_spices.png'];
  const activeImage = displayImages[activeIdx];

  return (
    <div className="flex flex-col gap-4 w-full">
      
      {/* Main Image Screen */}
      <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-white border border-border-spice/40 shadow-sm">
        <Image
          src={activeImage}
          alt="Product main gallery image"
          fill
          priority
          className="object-cover"
          sizes="(max-w-768px) 100vw, 500px"
        />
      </div>

      {/* Thumbnail Strips */}
      {displayImages.length > 1 && (
        <div className="flex items-center gap-3 overflow-x-auto py-1">
          {displayImages.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIdx(idx)}
              className={cn(
                "relative w-20 h-20 rounded-xl overflow-hidden bg-white border outline-none cursor-pointer transition-all shrink-0",
                activeIdx === idx 
                  ? "border-primary ring-2 ring-primary/20 scale-95" 
                  : "border-border-spice/60 hover:border-primary/50"
              )}
            >
              <Image
                src={img}
                alt={`Product thumbnail ${idx + 1}`}
                fill
                className="object-cover"
                sizes="80px"
              />
            </button>
          ))}
        </div>
      )}

    </div>
  );
}
