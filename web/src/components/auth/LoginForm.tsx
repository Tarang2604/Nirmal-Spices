"use client";

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, sendOtpSchema, verifyOtpSchema } from '@/validators/auth.validator';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { KeyRound, Mail, Smartphone, Loader2, Lock, ArrowRight, RefreshCw } from 'lucide-react';
import Link from 'next/link';

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/';

  const { setUser } = useAuthStore();
  const { fetchCart } = useCartStore();

  const [loginMode, setLoginMode] = useState<'password' | 'otp'>('password');
  const [otpStep, setOtpStep] = useState<'send' | 'verify'>('send');
  const [otpIdentifier, setOtpIdentifier] = useState('');
  const [loading, setLoading] = useState(false);

  // 1. Password login form
  const { 
    register: registerPass, 
    handleSubmit: handlePassSubmit, 
    formState: { errors: passErrors } 
  } = useForm({
    resolver: zodResolver(loginSchema)
  });

  const onPasswordLogin = async (data: any) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/login', data);
      setUser(res.data.data);
      // Fetch cart to sync guest/user items
      await fetchCart();
      toast.success("Welcome back! 🌶️ Logged in successfully.");
      router.push(redirectUrl);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  // 2. OTP send code
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpIdentifier) return;

    setLoading(true);
    try {
      await api.post('/auth/send-otp', {
        identifier: otpIdentifier,
        type: 'login'
      });
      toast.success(`OTP code sent successfully to ${otpIdentifier}`);
      setOtpStep('verify');
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to deliver OTP");
    } finally {
      setLoading(false);
    }
  };

  // 3. OTP verification form
  const [otpCode, setOtpCode] = useState('');
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.length !== 6) return;

    setLoading(true);
    try {
      const res = await api.post('/auth/verify-otp', {
        identifier: otpIdentifier,
        code: otpCode,
        type: 'login'
      });
      setUser(res.data.data);
      await fetchCart();
      toast.success("Welcome back! Logged in successfully.");
      router.push(redirectUrl);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Invalid OTP code");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 font-sans">
      
      {/* Title */}
      <div className="text-center">
        <h2 className="font-display font-bold text-2xl text-charcoal">Sign In</h2>
        <p className="text-muted-foreground text-xs mt-1">
          Welcome back to Nirmal&apos;s Spices. Fill in your details below.
        </p>
      </div>

      {/* Login Mode Toggle Tabs */}
      <div className="grid grid-cols-2 gap-1.5 bg-cream p-1 rounded-xl">
        <button
          onClick={() => { setLoginMode('password'); setOtpStep('send'); }}
          className={`py-2 text-xs font-bold uppercase tracking-wider font-accent rounded-lg transition-colors outline-none ${loginMode === 'password' ? 'bg-white text-primary shadow-sm' : 'text-muted-foreground'}`}
        >
          Password
        </button>
        <button
          onClick={() => setLoginMode('otp')}
          className={`py-2 text-xs font-bold uppercase tracking-wider font-accent rounded-lg transition-colors outline-none ${loginMode === 'otp' ? 'bg-white text-primary shadow-sm' : 'text-muted-foreground'}`}
        >
          OTP Code
        </button>
      </div>

      {/* Password Mode Form */}
      {loginMode === 'password' && (
        <form onSubmit={handlePassSubmit(onPasswordLogin)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-muted-foreground flex items-center gap-1.5"><Mail size={14} /> Email Address</label>
            <input
              type="email"
              placeholder="name@email.com"
              {...registerPass('email')}
              className="bg-cream-dark/25 border border-border focus:border-primary rounded-xl px-4 py-2.5 text-xs outline-none"
            />
            {passErrors.email && <span className="text-[10px] text-destructive">{passErrors.email.message as string}</span>}
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-muted-foreground flex items-center gap-1.5"><Lock size={14} /> Password</label>
              <Link href="/forgot-password" className="text-[10px] text-primary hover:underline font-semibold font-accent">Forgot?</Link>
            </div>
            <input
              type="password"
              placeholder="••••••••"
              {...registerPass('password')}
              className="bg-cream-dark/25 border border-border focus:border-primary rounded-xl px-4 py-2.5 text-xs outline-none"
            />
            {passErrors.password && <span className="text-[10px] text-destructive">{passErrors.password.message as string}</span>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-primary hover:bg-crimson-dark text-white font-semibold font-accent uppercase tracking-wider text-xs py-3.5 rounded-xl flex items-center justify-center gap-2 mt-2 transition-colors outline-none disabled:opacity-50"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Sign In
          </button>
        </form>
      )}

      {/* OTP Mode Forms */}
      {loginMode === 'otp' && (
        <div className="flex flex-col gap-4">
          {otpStep === 'send' ? (
            /* Send OTP panel */
            <form onSubmit={handleSendOtp} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-muted-foreground flex items-center gap-1.5"><Smartphone size={14} /> Mobile / Email</label>
                <input
                  type="text"
                  placeholder="9876543210 or name@email.com"
                  value={otpIdentifier}
                  onChange={(e) => setOtpIdentifier(e.target.value)}
                  className="bg-cream-dark/25 border border-border focus:border-primary rounded-xl px-4 py-2.5 text-xs outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={loading || !otpIdentifier}
                className="bg-primary hover:bg-crimson-dark text-white font-semibold font-accent uppercase tracking-wider text-xs py-3.5 rounded-xl flex items-center justify-center gap-2 mt-2 transition-colors outline-none disabled:opacity-50"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                Send OTP Code
              </button>
            </form>
          ) : (
            /* Verify OTP panel */
            <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5 text-center">
                <span className="text-xs text-muted-foreground">OTP code sent to <strong>{otpIdentifier}</strong></span>
                <button 
                  onClick={() => setOtpStep('send')} 
                  className="text-[10px] text-primary hover:underline font-semibold font-accent flex items-center gap-1 justify-center mt-1 outline-none"
                >
                  <RefreshCw size={10} /> Change mobile / email
                </button>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-muted-foreground">Enter 6-Digit OTP</label>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="000000"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  className="bg-cream-dark/25 border border-border focus:border-primary rounded-xl px-4 py-3 text-center text-lg font-bold letter-spacing-8 tracking-widest outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading || otpCode.length !== 6}
                className="bg-primary hover:bg-crimson-dark text-white font-semibold font-accent uppercase tracking-wider text-xs py-3.5 rounded-xl flex items-center justify-center gap-2 mt-2 transition-colors outline-none disabled:opacity-50"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                Verify OTP & Login
              </button>
            </form>
          )}
        </div>
      )}

      {/* Redirect Register Switch */}
      <div className="border-t border-border-spice/40 pt-4 text-center text-xs text-muted-foreground">
        Don&apos;t have an account? <Link href={`/register?redirect=${encodeURIComponent(redirectUrl)}`} className="text-primary hover:underline font-bold font-accent">Sign Up</Link>
      </div>

    </div>
  );
}
