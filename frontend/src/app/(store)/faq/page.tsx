import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Frequently Asked Questions (FAQ)",
  description: "Get answers to questions about Nirmal's Spices quality certifications, shipping, returns, and organic farming.",
};

export default function FAQPage() {
  const faqs = [
    {
      q: "Are Nirmal's Spices FSSAI certified?",
      a: "Yes. All our manufacturing, cleaning, grinding, and packing facilities are FSSAI certified. We follow stringent quality and hygiene control measures in our kitchen."
    },
    {
      q: "Where are these spices sourced from?",
      a: "We source our crops directly from local farmers in Harda, Madhya Pradesh, India. This supports sustainable local agriculture and ensures we get the freshest ingredients."
    },
    {
      q: "Do you add any artificial colors or preservatives?",
      a: "Absolutely not! Nirmal's Spices guarantees 100% purity. We do not use fillers, synthetic preservatives, starch, MSG, or artificial coloring agents. All spices are 100% natural."
    },
    {
      q: "How long does doorstep delivery take?",
      a: "Standard delivery takes between 3 to 5 business days across India. Once dispatched, tracking details will be sent to your email and accessible inside your user dashboard."
    },
    {
      q: "What is your return policy?",
      a: "If you receive a damaged jar or are unsatisfied with the quality, you can request a refund or exchange within 7 days of receiving the package, provided the jar seal is unbroken."
    }
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 sm:py-16 font-sans">
      <h1 className="font-display font-bold text-3xl text-charcoal mb-10 text-center">
        Frequently Asked Questions
      </h1>

      <div className="flex flex-col gap-6">
        {faqs.map((faq, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl border border-border-spice/40 shadow-sm flex flex-col gap-2">
            <h3 className="font-sans font-bold text-sm text-charcoal flex items-start gap-2">
              <span className="text-primary text-base">Q.</span>
              {faq.q}
            </h3>
            <p className="text-muted-foreground text-xs leading-relaxed pl-5">
              {faq.a}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

