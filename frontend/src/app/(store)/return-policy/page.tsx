import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Return & Refund Policy",
  description: "Read about our easy returns, refunds, and replacements for spice orders.",
};

export default function ReturnPolicyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 sm:py-16 font-sans text-xs text-charcoal leading-relaxed">
      
      <h1 className="font-display font-bold text-3xl mb-8 text-center">
        Return & Refund Policy
      </h1>

      <div className="bg-white p-6 md:p-8 rounded-2xl border border-border-spice/40 shadow-sm flex flex-col gap-6">
        
        <section className="flex flex-col gap-2">
          <h2 className="font-bold text-sm text-charcoal">Returns Eligibility</h2>
          <p className="text-muted-foreground">
            Spices are perishable food items. To protect customer safety, we only accept returns if you receive a damaged package, incorrect items, or if the product jar seal remains unbroken within 7 days of delivery.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="font-bold text-sm text-charcoal">Refund Process</h2>
          <p className="text-muted-foreground">
            Once we receive the returned packet and verify its seal status, a refund will be processed to your original payment account (or bank transfer for COD) within 5 to 7 business days.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="font-bold text-sm text-charcoal">Replacement / Exchange</h2>
          <p className="text-muted-foreground">
            We will gladly exchange or replace damaged packages at zero extra cost to you. Email support@nirmalspices.in with order photos to trigger exchanges.
          </p>
        </section>

      </div>
    </div>
  );
}

