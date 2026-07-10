"use client";

import React from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';

export default function TestimonialsCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });

  const testimonials = [
    {
      name: "Aarav Sharma",
      location: "Bhopal, MP",
      quote: "The Garam Masala is a game changer! You can tell it's stone-ground and doesn't contain any artificial colors. The aroma fills the entire house.",
      rating: 5,
    },
    {
      name: "Priyanka Patel",
      location: "Mumbai, Maharashtra",
      quote: "Exceptional quality. The whole coriander seeds and cumin are so clean, dust-free and full of natural oils. I will never buy spices from supermarkets again.",
      rating: 5,
    },
    {
      name: "Rajesh Nair",
      location: "Bengaluru, Karnataka",
      quote: "Hygienic packaging and fast delivery to South India. I love their reusable glass jars and the doorstep service is very reliable.",
      rating: 5,
    },
    {
      name: "Meera Deshmukh",
      location: "Indore, MP",
      quote: "Excellent, authentic taste! Being from Madhya Pradesh, I know local spice flavors, and Nirmal's captures the true taste of Harda crops.",
      rating: 5,
    }
  ];

  const scrollPrev = () => emblaApi && emblaApi.scrollPrev();
  const scrollNext = () => emblaApi && emblaApi.scrollNext();

  return (
    <section className="py-16 md:py-24 bg-cream" aria-labelledby="testimonials-heading">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        
        {/* Quote Icon */}
        <div className="flex justify-center mb-8">
          <Quote className="w-12 h-12 text-primary/30" />
        </div>

        {/* Carousel Viewport */}
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex">
            {testimonials.map((t, idx) => (
              <div key={idx} className="flex-[0_0_100%] min-w-0 px-4 flex flex-col items-center text-center">
                
                {/* Rating stars */}
                <div className="flex items-center gap-1 mb-6">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-turmeric text-turmeric" />
                  ))}
                </div>

                {/* Quote Text */}
                <p className="font-display font-medium text-lg md:text-2xl text-charcoal leading-relaxed italic mb-8 max-w-2xl">
                  &ldquo;{t.quote}&rdquo;
                </p>

                {/* Author Name */}
                <span className="font-sans font-bold text-sm text-charcoal block">
                  {t.name}
                </span>
                <span className="font-sans text-xs text-muted-foreground">
                  {t.location}
                </span>

              </div>
            ))}
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-center gap-4 mt-8">
          <button 
            onClick={scrollPrev}
            className="p-2 border border-bark/20 hover:bg-cream-dark rounded-full text-charcoal transition-colors outline-none"
            aria-label="Previous testimonial"
          >
            <ChevronLeft size={16} />
          </button>
          <button 
            onClick={scrollNext}
            className="p-2 border border-bark/20 hover:bg-cream-dark rounded-full text-charcoal transition-colors outline-none"
            aria-label="Next testimonial"
          >
            <ChevronRight size={16} />
          </button>
        </div>

      </div>
    </section>
  );
}
