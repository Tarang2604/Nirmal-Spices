import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Shipping & Delivery Policy",
  description: "Learn about shipping rates, courier partners, and doorstep delivery timelines for Nirmal's Spices.",
};

export default function ShippingPolicyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 sm:py-16 font-sans text-xs text-charcoal leading-relaxed">
      
      <h1 className="font-display font-bold text-3xl mb-8 text-center">
        Shipping & Delivery Policy
      </h1>

      <div className="bg-white p-6 md:p-8 rounded-2xl border border-border-spice/40 shadow-sm flex flex-col gap-6">
        
        <section className="flex flex-col gap-2">
          <h2 className="font-bold text-sm text-charcoal">Delivery Locations</h2>
          <p className="text-muted-foreground">
            We deliver to almost all locations across India through reliable courier networks (Delhivery, BlueDart, Professional Couriers).
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="font-bold text-sm text-charcoal">Shipping Charges</h2>
          <ul className="list-disc list-inside text-muted-foreground flex flex-col gap-1">
            <li>Orders above ₹499: <strong>FREE Delivery</strong></li>
            <li>Orders below ₹499: Flat <strong>₹40 Shipping Fee</strong> applies</li>
            <li>Cash on Delivery (COD): Additional <strong>₹20 COD fee</strong> applies</li>
          </ul>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="font-bold text-sm text-charcoal">Delivery Timelines</h2>
          <p className="text-muted-foreground">
            Orders are processed and dispatched within 24 hours of placement. Standard transit time takes 3 to 5 business days depending on the state destination.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="font-bold text-sm text-charcoal">Package Tracking</h2>
          <p className="text-muted-foreground">
            A tracking number link will be sent to your email as soon as the package is dispatched. You can track your courier shipment online.
          </p>
        </section>

      </div>
    </div>
  );
}

