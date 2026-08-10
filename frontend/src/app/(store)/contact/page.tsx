"use client";

import React, { useState } from 'react';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Mail, Phone, MapPin, Loader2, Send, ExternalLink, Clock } from 'lucide-react';

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
      <div className="text-center max-w-xl mx-auto mb-12 sm:mb-16">
        <h1 className="font-display font-bold text-3xl md:text-4xl text-charcoal mb-3">
          Contact &amp; Support
        </h1>
        <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
          Have questions about our FSSAI certified spices, bulk orders, or a recent delivery? 
          Reach out to our Harda factory team and we will get back to you within 24 hours.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        
        {/* Left Column: Direct Info & Clickable Address Card */}
        <div className="lg:col-span-5 flex flex-col gap-6 shrink-0">
          
          {/* Main Clickable Address Card */}
          <a
            href="https://maps.app.goo.gl/XgzgNBmQqby2hYVs9?g_st=awb"
            target="_blank"
            rel="noopener noreferrer"
            className="group bg-charcoal text-cream p-6 sm:p-8 rounded-3xl border border-bark/20 shadow-lg flex flex-col gap-6 transition-all duration-300 hover:shadow-xl hover:border-primary/50 relative overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-accent uppercase tracking-widest text-primary font-bold">Registered Office &amp; Factory</span>
                <h2 className="font-display font-bold text-xl text-cream mt-0.5">Nirmal&apos;s Spices</h2>
              </div>
              <span className="w-9 h-9 bg-primary/20 text-primary border border-primary/30 rounded-full flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all duration-300">
                <MapPin size={18} />
              </span>
            </div>

            <div className="flex items-start gap-3.5 text-xs text-cream-dark">
              <MapPin size={20} className="text-primary mt-1 shrink-0 group-hover:scale-110 transition-transform" />
              <div className="flex flex-col gap-1 leading-relaxed">
                <strong className="text-cream font-semibold text-sm">Official Business Address</strong>
                <span>204, Rajarajeshwari Parisar, Samardha Chouki,</span>
                <span>Hoshangabad Road, Samardha Tehsil - Timarni,</span>
                <span>Dist.- Harda, Madhya Pradesh 461228</span>
              </div>
            </div>

            <div className="pt-3 border-t border-bark/30 flex items-center justify-between text-xs text-primary font-accent font-bold uppercase tracking-wider">
              <span className="inline-flex items-center gap-1.5 group-hover:underline">
                Open in Google Maps <ExternalLink size={13} />
              </span>
              <span className="text-[10px] text-muted-foreground font-normal normal-case">Harda, MP</span>
            </div>
          </a>

          {/* Quick Contact & Hours Card */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-border shadow-xs flex flex-col gap-5 text-xs">
            <h3 className="font-display font-bold text-base text-charcoal">Quick Communications</h3>

            <div className="flex items-start gap-3">
              <Phone size={18} className="text-primary mt-0.5 shrink-0" />
              <div className="flex flex-col gap-0.5 text-muted-foreground">
                <strong className="text-charcoal font-semibold">Phone &amp; WhatsApp Support</strong>
                <a href="tel:+919770057005" className="hover:text-primary transition-colors text-charcoal font-medium">
                  +91 97700 57005
                </a>
                <a href="tel:+919098200666" className="hover:text-primary transition-colors text-charcoal font-medium">
                  +91 90982 00666
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Mail size={18} className="text-primary mt-0.5 shrink-0" />
              <div className="flex flex-col gap-0.5 text-muted-foreground">
                <strong className="text-charcoal font-semibold">Email Enquiries</strong>
                <a href="mailto:info.nirmalspices@gmail.com" className="hover:text-primary transition-colors text-charcoal font-medium">
                  info.nirmalspices@gmail.com
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock size={18} className="text-primary mt-0.5 shrink-0" />
              <div className="flex flex-col gap-0.5 text-muted-foreground">
                <strong className="text-charcoal font-semibold">Business Hours</strong>
                <span>Monday – Saturday: 9:00 AM – 6:00 PM IST</span>
                <span className="text-[10px] text-muted-foreground italic">Closed on Sundays &amp; Public Holidays</span>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Interactive Form */}
        <form 
          onSubmit={handleSubmit}
          className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-border shadow-xs grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans text-charcoal"
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

      {/* Embedded location map */}
      <div className="mt-8 lg:mt-12 rounded-3xl overflow-hidden border border-border shadow-xs">
        <iframe
          title="Nirmal's Spices location on Google Maps"
          src="https://www.google.com/maps?cid=7688581438700374253&output=embed"
          width="100%"
          height="360"
          style={{ border: 0 }}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
    </div>
  );
}

