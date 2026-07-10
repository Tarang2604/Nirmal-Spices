"use client";

export const dynamic = 'force-dynamic';

import React, { useState } from 'react';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Mail, Phone, MapPin, Loader2, Send } from 'lucide-react';

export default function ContactPage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('General Inquiry');
  const [orderId, setOrderId] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !email || !subject || message.length < 20) {
      toast.error("Please fill in all required fields. Message must be at least 20 characters.");
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/contact', {
        firstName,
        lastName,
        email,
        phone,
        subject,
        orderId: orderId || undefined,
        message
      });
      toast.success("Enquiry submitted successfully! We will contact you soon.");
      setFirstName('');
      setLastName('');
      setEmail('');
      setPhone('');
      setOrderId('');
      setMessage('');
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to submit message");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16 font-sans">
      
      {/* Header */}
      <div className="text-center max-w-xl mx-auto mb-16">
        <h1 className="font-display font-bold text-3xl md:text-4xl text-charcoal mb-4">
          Contact & Support
        </h1>
        <p className="text-muted-foreground text-xs leading-relaxed">
          Have questions about our FSSAI certifications, bulk spice orders, or a recent doorstep delivery? 
          Drop us a line and we will get back to you within 24 hours.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
        {/* Left Column: Direct Info Card */}
        <div className="lg:col-span-4 bg-charcoal text-cream p-6 sm:p-8 rounded-2xl border border-bark/20 shadow-lg flex flex-col gap-8 shrink-0">
          <div>
            <h2 className="font-display font-bold text-lg mb-2">Spice Manufactory</h2>
            <p className="text-muted-foreground text-[10px] leading-normal uppercase tracking-wider font-accent">Harda, Madhya Pradesh</p>
          </div>

          <div className="flex flex-col gap-6 text-xs font-sans text-muted-foreground">
            <div className="flex items-start gap-3">
              <MapPin size={18} className="text-primary mt-0.5 shrink-0" />
              <div className="flex flex-col">
                <strong className="text-cream mb-0.5">Corporate Address</strong>
                <span>Nirmal&apos;s Spices Industrial Zone,</span>
                <span>Harda, Madhya Pradesh - 461331, India</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Phone size={18} className="text-primary mt-0.5 shrink-0" />
              <div className="flex flex-col">
                <strong className="text-cream mb-0.5">WhatsApp / Phone</strong>
                <span>+91 9770057005</span>
                <span className="text-[10px] italic mt-0.5">Mon-Sat: 9 AM - 6 PM IST</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Mail size={18} className="text-primary mt-0.5 shrink-0" />
              <div className="flex flex-col">
                <strong className="text-cream mb-0.5">Official Emails</strong>
                <span>info@nirmalspices.in</span>
                <span>support@nirmalspices.in</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Form */}
        <form 
          onSubmit={handleSubmit}
          className="lg:col-span-8 bg-white p-6 sm:p-8 rounded-2xl border border-border-spice/40 shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans text-charcoal"
        >
          
          <div className="flex flex-col gap-1.5">
            <label className="font-bold text-muted-foreground">First Name *</label>
            <input
              type="text"
              required
              placeholder="John"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="bg-cream-dark/25 border border-border focus:border-primary rounded-xl px-3 py-2 text-xs outline-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-bold text-muted-foreground">Last Name</label>
            <input
              type="text"
              placeholder="Doe"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="bg-cream-dark/25 border border-border focus:border-primary rounded-xl px-3 py-2 text-xs outline-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-bold text-muted-foreground">Email Address *</label>
            <input
              type="email"
              required
              placeholder="john@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-cream-dark/25 border border-border focus:border-primary rounded-xl px-3 py-2 text-xs outline-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-bold text-muted-foreground">Phone Number</label>
            <input
              type="tel"
              placeholder="9876543210"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
              className="bg-cream-dark/25 border border-border focus:border-primary rounded-xl px-3 py-2 text-xs outline-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-bold text-muted-foreground">Subject *</label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="bg-cream-dark/25 border border-border focus:border-primary rounded-xl px-3 py-2 text-xs outline-none"
            >
              <option value="General Inquiry">General Inquiry</option>
              <option value="Order Tracking">Order Support</option>
              <option value="Bulk B2B Orders">Bulk / Export Orders</option>
              <option value="FSSAI Certificates">Certifications</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-bold text-muted-foreground">Order ID (Optional)</label>
            <input
              type="text"
              placeholder="E.g. #65b8f2..."
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              className="bg-cream-dark/25 border border-border focus:border-primary rounded-xl px-3 py-2 text-xs outline-none"
            />
          </div>

          <div className="sm:col-span-2 flex flex-col gap-1.5">
            <label className="font-bold text-muted-foreground">Message * (Min 20 characters)</label>
            <textarea
              rows={5}
              required
              placeholder="Detail your inquiry here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="bg-cream-dark/25 border border-border focus:border-primary rounded-xl px-3 py-2 text-xs outline-none resize-y"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="sm:col-span-2 bg-primary hover:bg-crimson-dark text-white font-semibold font-accent uppercase tracking-wider text-xs py-3.5 rounded-xl flex items-center justify-center gap-2 mt-4 transition-colors outline-none disabled:opacity-50"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send size={14} />}
            Send Message
          </button>

        </form>

      </div>
    </div>
  );
}

