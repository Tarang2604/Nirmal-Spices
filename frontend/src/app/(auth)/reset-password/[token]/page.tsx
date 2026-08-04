"use client";

import React, { useState } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Lock, Loader2, ArrowLeft } from 'lucide-react';

export default function ResetPasswordPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const token = params.token as string;
  const email = searchParams.get('email') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await api.post(`/auth/reset-password/${token}?email=${encodeURIComponent(email)}`, {
        password
      });
      toast.success("Password reset successfully! Please sign in.");
      router.push('/login');
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Invalid or expired password reset link");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 font-sans">
      
      {/* Title */}
      <div className="text-center">
        <h2 className="font-display font-bold text-2xl text-charcoal">Set New Password</h2>
        <p className="text-muted-foreground text-xs mt-1">
          Choose a secure, strong password for email <strong>{email}</strong>
        </p>
      </div>

      <form onSubmit={handleResetSubmit} className="flex flex-col gap-4">
        
        {/* New Password */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
            <Lock size={14} /> New Password
          </label>
          <input
            type="password"
            required
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-cream-dark/25 border border-border focus:border-primary rounded-xl px-4 py-2.5 text-xs outline-none"
          />
        </div>

        {/* Confirm Password */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
            <Lock size={14} /> Confirm Password
          </label>
          <input
            type="password"
            required
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="bg-cream-dark/25 border border-border focus:border-primary rounded-xl px-4 py-2.5 text-xs outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={loading || !password || !confirmPassword}
          className="bg-primary hover:bg-crimson-dark text-white font-semibold font-accent uppercase tracking-wider text-xs py-3.5 rounded-xl flex items-center justify-center gap-2 mt-2 transition-colors outline-none disabled:opacity-50"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          Reset Password
        </button>

      </form>

      {/* Return link */}
      <div className="border-t border-border-spice/40 pt-4 text-center text-xs text-muted-foreground">
        <Link href="/login" className="text-primary hover:underline font-bold font-accent flex items-center gap-1.5 justify-center">
          <ArrowLeft size={14} /> Back to Sign In
        </Link>
      </div>

    </div>
  );
}
