"use client";

import React, { useState } from 'react';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import {
  Building2,
  PackageCheck,
  Truck,
  ShieldCheck,
  Send,
  Loader2,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';

const BUSINESS_TYPES = [
  'Retailer',
  'Wholesaler',
  'Distributor',
  'Hotel / Restaurant',
  'Caterer',
  'Manufacturer',
  'Exporter',
  'Other',
];

export default function BulkOrderPage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [businessType, setBusinessType] = useState('Wholesaler');
  const [products, setProducts] = useState('');
  const [quantity, setQuantity] = useState('');
  const [packaging, setPackaging] = useState('');
  const [location, setLocation] = useState('');
  const [message, setMessage] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!firstName.trim() || !companyName.trim() || !email.trim() || !phone.trim() || !products.trim() || !quantity.trim() || !location.trim()) {
      toast.error('Please fill in all required fields marked with *');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/b2b', {
        firstName: firstName.trim(),
        lastName: lastName.trim() || undefined,
        companyName: companyName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        businessType,
        products: products.trim(),
        quantity: quantity.trim(),
        packaging: packaging.trim() || undefined,
        location: location.trim(),
        message: message.trim() || undefined,
      });

      toast.success('Bulk order enquiry submitted successfully!');
      setSubmitted(true);
      resetForm();
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || 'Something went wrong. Please try again or contact us directly.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFirstName('');
    setLastName('');
    setCompanyName('');
    setEmail('');
    setPhone('');
    setBusinessType('Wholesaler');
    setProducts('');
    setQuantity('');
    setPackaging('');
    setLocation('');
    setMessage('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16 font-sans">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
        <span className="text-[10px] font-accent uppercase tracking-widest text-primary font-bold bg-primary/10 px-3 py-1 rounded-full inline-block mb-3">
          Wholesale &amp; Business Orders
        </span>
        <h1 className="font-display font-bold text-3xl md:text-4xl text-charcoal mb-3">
          B2B &amp; Bulk Orders
        </h1>
        <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
          Looking for quality spices in bulk? Partner with Nirmal&apos;s Spices for wholesale quantities,
          competitive pricing, and custom business requirements.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Left Column: Business Benefits & Value Props */}
        <div className="lg:col-span-5 flex flex-col gap-6 shrink-0">
          <div className="bg-charcoal text-cream p-6 sm:p-8 rounded-3xl border border-bark/20 shadow-lg flex flex-col gap-6 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-primary/10 blur-2xl pointer-events-none" />

            <div>
              <span className="text-[10px] font-accent uppercase tracking-widest text-primary font-bold">
                Direct From Manufacturer
              </span>
              <h2 className="font-display font-bold text-xl text-cream mt-1">
                Why Partner With Nirmal&apos;s Spices?
              </h2>
            </div>

            <div className="flex flex-col gap-5 text-xs text-cream-dark">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-primary/20 text-primary flex items-center justify-center shrink-0 border border-primary/30 mt-0.5">
                  <Building2 size={16} />
                </div>
                <div>
                  <strong className="text-cream font-semibold block text-sm mb-0.5">
                    Farmer Sourced &amp; Factory Processed
                  </strong>
                  <span>Sourced directly from local farmers in Harda, MP with strict quality control.</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-primary/20 text-primary flex items-center justify-center shrink-0 border border-primary/30 mt-0.5">
                  <PackageCheck size={16} />
                </div>
                <div>
                  <strong className="text-cream font-semibold block text-sm mb-0.5">
                    Custom &amp; Bulk Packaging
                  </strong>
                  <span>Available in 1 kg, 5 kg, 25 kg, and bulk commercial packing options.</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-primary/20 text-primary flex items-center justify-center shrink-0 border border-primary/30 mt-0.5">
                  <ShieldCheck size={16} />
                </div>
                <div>
                  <strong className="text-cream font-semibold block text-sm mb-0.5">
                    100% Pure &amp; Hygienic
                  </strong>
                  <span>Processed without synthetic colors, adulterants, or artificial additives.</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-primary/20 text-primary flex items-center justify-center shrink-0 border border-primary/30 mt-0.5">
                  <Truck size={16} />
                </div>
                <div>
                  <strong className="text-cream font-semibold block text-sm mb-0.5">
                    Reliable Logistics
                  </strong>
                  <span>Timely delivery across Madhya Pradesh and nationwide transport assistance.</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-border shadow-xs flex flex-col gap-4 text-xs">
            <h3 className="font-display font-bold text-base text-charcoal flex items-center gap-2">
              <HelpCircle size={18} className="text-primary" /> Who We Supply To
            </h3>
            <div className="grid grid-cols-2 gap-2 text-muted-foreground font-medium">
              <span className="bg-cream/50 px-3 py-1.5 rounded-lg border border-border/40">• Retail Stores</span>
              <span className="bg-cream/50 px-3 py-1.5 rounded-lg border border-border/40">• Spice Wholesalers</span>
              <span className="bg-cream/50 px-3 py-1.5 rounded-lg border border-border/40">• Hotels &amp; Restaurants</span>
              <span className="bg-cream/50 px-3 py-1.5 rounded-lg border border-border/40">• Commercial Caterers</span>
              <span className="bg-cream/50 px-3 py-1.5 rounded-lg border border-border/40">• Food Manufacturers</span>
              <span className="bg-cream/50 px-3 py-1.5 rounded-lg border border-border/40">• Export Houses</span>
            </div>
          </div>
        </div>

        {/* Right Column: Form or Success Card */}
        <div className="lg:col-span-7">
          {submitted ? (
            <div className="bg-white p-8 sm:p-12 rounded-3xl border border-border shadow-xs text-center flex flex-col items-center gap-5">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center border border-emerald-200">
                <CheckCircle2 size={32} />
              </div>
              <h2 className="font-display font-bold text-2xl text-charcoal">
                Enquiry Submitted Successfully!
              </h2>
              <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed max-w-md">
                Thank you for reaching out to Nirmal&apos;s Spices. Our bulk order team will review your
                requirements and get back to you with pricing details shortly.
              </p>
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="mt-4 bg-primary hover:bg-crimson-dark text-white font-semibold font-accent uppercase tracking-wider text-xs px-6 py-3 rounded-xl transition-colors"
              >
                Submit Another Request
              </button>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="bg-white p-6 sm:p-8 rounded-3xl border border-border shadow-xs grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans text-charcoal"
            >
              <div className="sm:col-span-2 pb-2 border-b border-border/40 mb-1">
                <h2 className="font-display font-bold text-lg text-charcoal">Request a Bulk Quote</h2>
                <p className="text-[11px] text-muted-foreground">
                  Please fill out the form below with your requirements. Fields marked with * are required.
                </p>
              </div>

              {/* First Name */}
              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-muted-foreground">First Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Rahul"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="bg-cream-dark/25 border border-border focus:border-primary rounded-xl px-3 py-2.5 text-xs outline-none"
                />
              </div>

              {/* Last Name */}
              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-muted-foreground">Last Name</label>
                <input
                  type="text"
                  placeholder="Sharma"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="bg-cream-dark/25 border border-border focus:border-primary rounded-xl px-3 py-2.5 text-xs outline-none"
                />
              </div>

              {/* Company / Business Name */}
              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-muted-foreground">Company / Business Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Sharma Foods &amp; Traders"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="bg-cream-dark/25 border border-border focus:border-primary rounded-xl px-3 py-2.5 text-xs outline-none"
                />
              </div>

              {/* Business Type */}
              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-muted-foreground">Business Type *</label>
                <select
                  value={businessType}
                  onChange={(e) => setBusinessType(e.target.value)}
                  className="bg-cream-dark/25 border border-border focus:border-primary rounded-xl px-3 py-2.5 text-xs outline-none"
                >
                  {BUSINESS_TYPES.map((bt) => (
                    <option key={bt} value={bt}>
                      {bt}
                    </option>
                  ))}
                </select>
              </div>

              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-muted-foreground">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="rahul@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-cream-dark/25 border border-border focus:border-primary rounded-xl px-3 py-2.5 text-xs outline-none"
                />
              </div>

              {/* Phone / WhatsApp */}
              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-muted-foreground">Phone / WhatsApp Number *</label>
                <input
                  type="tel"
                  required
                  placeholder="9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="bg-cream-dark/25 border border-border focus:border-primary rounded-xl px-3 py-2.5 text-xs outline-none"
                />
              </div>

              {/* Products Required */}
              <div className="sm:col-span-2 flex flex-col gap-1.5">
                <label className="font-bold text-muted-foreground">Products Required *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="E.g. Turmeric Powder - 100 kg, Red Chilli Powder - 150 kg, Garam Masala - 50 kg"
                  value={products}
                  onChange={(e) => setProducts(e.target.value)}
                  className="bg-cream-dark/25 border border-border focus:border-primary rounded-xl px-3 py-2.5 text-xs outline-none resize-y"
                />
              </div>

              {/* Required Quantity */}
              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-muted-foreground">Estimated Total Quantity *</label>
                <input
                  type="text"
                  required
                  placeholder="E.g. Approx 300 kg"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="bg-cream-dark/25 border border-border focus:border-primary rounded-xl px-3 py-2.5 text-xs outline-none"
                />
              </div>

              {/* Preferred Packaging */}
              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-muted-foreground">Preferred Packaging (Optional)</label>
                <input
                  type="text"
                  placeholder="E.g. 25 kg bags / 1 kg pouches"
                  value={packaging}
                  onChange={(e) => setPackaging(e.target.value)}
                  className="bg-cream-dark/25 border border-border focus:border-primary rounded-xl px-3 py-2.5 text-xs outline-none"
                />
              </div>

              {/* Delivery Location */}
              <div className="sm:col-span-2 flex flex-col gap-1.5">
                <label className="font-bold text-muted-foreground">Delivery Location *</label>
                <input
                  type="text"
                  required
                  placeholder="E.g. Indore, Madhya Pradesh"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="bg-cream-dark/25 border border-border focus:border-primary rounded-xl px-3 py-2.5 text-xs outline-none"
                />
              </div>

              {/* Message */}
              <div className="sm:col-span-2 flex flex-col gap-1.5">
                <label className="font-bold text-muted-foreground">Additional Requirements / Message</label>
                <textarea
                  rows={3}
                  placeholder="Share any special instructions, delivery timeline, or questions..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="bg-cream-dark/25 border border-border focus:border-primary rounded-xl px-3 py-2.5 text-xs outline-none resize-y"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="sm:col-span-2 bg-primary hover:bg-crimson-dark text-white font-semibold font-accent uppercase tracking-wider text-xs py-3.5 rounded-xl flex items-center justify-center gap-2 mt-2 transition-colors outline-none disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Submitting Request...
                  </>
                ) : (
                  <>
                    <Send size={14} /> Request Bulk Quote
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
