"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Mail, Loader2, ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      toast.success("If the email is registered, a reset link was sent!");
      setSubmitted(true);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to request password reset");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 font-sans">
      
      {/* Title */}
      <div className="text-center">
        <h2 className="font-display font-bold text-2xl text-charcoal">Reset Password</h2>
        <p className="text-muted-foreground text-xs mt-1">
          Enter your registered email address below, and we will send you a password reset link.
        </p>
      </div>

      {submitted ? (
        <div className="bg-green-50 text-green-800 border border-green-200 p-4 rounded-xl text-center text-xs leading-normal">
          📩 A password reset link has been dispatched to <strong>{email}</strong>. Please check your spam folder if it doesn&apos;t arrive in 5 minutes.
        </div>
      ) : (
        <form onSubmit={handleForgotSubmit} className="flex flex-col gap-4">
          
          {/* Email input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
              <Mail size={14} /> Email Address
            </label>
            <input
              type="email"
              required
              placeholder="name@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-cream-dark/25 border border-border focus:border-primary rounded-xl px-4 py-2.5 text-xs outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !email}
            className="bg-primary hover:bg-crimson-dark text-white font-semibold font-accent uppercase tracking-wider text-xs py-3.5 rounded-xl flex items-center justify-center gap-2 mt-2 transition-colors outline-none disabled:opacity-50"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Send Reset Link
          </button>

        </form>
      )}

      {/* Return to Login */}
      <div className="border-t border-border-spice/40 pt-4 text-center text-xs text-muted-foreground">
        <Link href="/login" className="text-primary hover:underline font-bold font-accent flex items-center gap-1.5 justify-center">
          <ArrowLeft size={14} /> Back to Sign In
        </Link>
      </div>

    </div>
  );
}
