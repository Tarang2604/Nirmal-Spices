import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Read about how we secure and protect your personal information, address history, and payments.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 sm:py-16 font-sans text-xs text-charcoal leading-relaxed">
      
      <h1 className="font-display font-bold text-3xl mb-8 text-center">
        Privacy Policy
      </h1>

      <div className="bg-white p-6 md:p-8 rounded-2xl border border-border-spice/40 shadow-sm flex flex-col gap-6">
        
        <section className="flex flex-col gap-2">
          <h2 className="font-bold text-sm text-charcoal">Data Collection</h2>
          <p className="text-muted-foreground">
            We collect basic contact details (name, email, phone number, and delivery address) to process orders, verify payments, and deliver spices.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="font-bold text-sm text-charcoal">Payment Security</h2>
          <p className="text-muted-foreground">
            We do not store credit card or bank login credentials on our servers. All online transactions are handled securely by Razorpay using industry-standard SSL encryption.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="font-bold text-sm text-charcoal">Cookies</h2>
          <p className="text-muted-foreground">
            We use secure httpOnly cookies to track user sessions (access and refresh tokens) to keep you logged in safely. Cookies are not shared with third-party trackers.
          </p>
        </section>

      </div>
    </div>
  );
}

