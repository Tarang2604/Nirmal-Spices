import React from 'react';
import { Leaf, Award, Recycle, ShieldCheck, Truck } from 'lucide-react';

export default function FeaturesGrid() {
  const features = [
    {
      icon: <Leaf className="w-8 h-8 text-primary" />,
      title: "100% Pure & Natural",
      desc: "Zero fillers, artificial colors, or chemical preservatives. Pure aromatic spices in their natural form."
    },
    {
      icon: <Award className="w-8 h-8 text-primary" />,
      title: "Locally Sourced from MP",
      desc: "Sourced directly from the fertile agricultural fields of Harda, Madhya Pradesh, supporting local farmers."
    },
    {
      icon: <ShieldCheck className="w-8 h-8 text-primary" />,
      title: "Hygienically Processed",
      desc: "Cleaned, dried, and stone-ground under strict laboratory conditions to retain maximum flavor and oils."
    },
    {
      icon: <Recycle className="w-8 h-8 text-primary" />,
      title: "Eco-Friendly Packaging",
      desc: "Packed in premium, reusable, and biodegradable containers to minimize environmental impact."
    },
    {
      icon: <Truck className="w-8 h-8 text-primary" />,
      title: "Doorstep Delivery",
      desc: "Fast, reliable shipping all across India. Fresh, freshly packed spices delivered straight to your home."
    }
  ];

  return (
    <section className="py-16 md:py-24 bg-cream-dark/20 border-y border-border-spice/50" aria-labelledby="features-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-xl mx-auto mb-16">
          <h2 id="features-heading" className="font-display font-bold text-3xl text-charcoal mb-4">
            The Nirmal Spices Promise
          </h2>
          <p className="text-muted-foreground text-sm font-sans">
            We are dedicated to maintaining the highest standards of culinary quality, safety, 
            and sustainability for your kitchen.
          </p>
        </div>

        {/* Features grid list */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {features.map((feat, idx) => (
            <div 
              key={idx} 
              className="bg-white p-6 rounded-2xl border border-border-spice/40 flex flex-col items-center text-center shadow-sm"
            >
              <div className="mb-4 bg-cream p-3 rounded-full flex items-center justify-center">
                {feat.icon}
              </div>
              <h3 className="font-sans font-bold text-sm text-charcoal mb-2">
                {feat.title}
              </h3>
              <p className="text-muted-foreground text-xs leading-relaxed font-sans">
                {feat.desc}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
