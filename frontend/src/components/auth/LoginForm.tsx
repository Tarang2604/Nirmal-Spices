"use client";

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { api, withGuestSession } from '@/lib/api';
import { toast } from 'sonner';
import { Mail, Smartphone, Loader2, KeyRound, RefreshCw } from 'lucide-react';
import Link from 'next/link';

const loginOtpSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Email is required')
    .email('Enter a valid email address'),
  phone: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number'),
  otp: z
    .string()
    .trim()
    .length(6, 'OTP must be 6 digits')
    .regex(/^\d{6}$/, 'OTP must contain only digits')
    .optional()
    .or(z.literal('')),
});

type LoginOtpForm = z.infer<typeof loginOtpSchema>;

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/';

  const { setUser } = useAuthStore();
  const { fetchCart, initializeSession } = useCartStore();

  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [needsRegister, setNeedsRegister] = useState(false);

  const {
    register,
    handleSubmit,
    getValues,
    setValue,
    setError,
    clearErrors,
    watch,
    formState: { errors },
  } = useForm<LoginOtpForm>({
    resolver: zodResolver(loginOtpSchema),
    defaultValues: {
      email: '',
      phone: '',
      otp: '',
    },
    mode: 'onBlur',
  });

  const otpValue = watch('otp') || '';

  const sendOtp = async () => {
    clearErrors();
    const email = getValues('email')?.trim();
    const phone = getValues('phone')?.trim();

    const emailCheck = z.string().email().safeParse(email);
    const phoneCheck = z.string().regex(/^[6-9]\d{9}$/).safeParse(phone);

    if (!emailCheck.success) {
      setError('email', { message: 'Enter a valid email address' });
      return;
    }
    if (!phoneCheck.success) {
      setError('phone', { message: 'Enter a valid 10-digit Indian mobile number' });
      return;
    }

    setLoading(true);
    setNeedsRegister(false);
    try {
      await api.post('/auth/send-otp', {
        identifier: email.toLowerCase(),
        phone,
        type: 'login',
      });

      setOtpSent(true);
      setValue('otp', '');
      clearErrors('otp');
      toast.success(`OTP sent to ${email} and +91${phone}`);
    } catch (err: any) {
      const apiMsg = err.response?.data?.message;
      const fieldMsg = err.response?.data?.errors?.[0]?.message;
      const msg = fieldMsg || apiMsg || 'Failed to send OTP';
      toast.error(msg);
      if (String(msg).toLowerCase().includes('register')) {
        setNeedsRegister(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const onVerifyLogin = async (data: LoginOtpForm) => {
    if (!otpSent) {
      toast.error('Please send OTP first');
      return;
    }
    if (!data.otp || data.otp.length !== 6) {
      setError('otp', { message: 'Enter the 6-digit OTP' });
      return;
    }

    setLoading(true);
    try {
      const sid = initializeSession();
      const res = await api.post(
        '/auth/verify-otp',
        {
          identifier: data.email.trim().toLowerCase(),
          phone: data.phone.trim(),
          code: data.otp,
          type: 'login',
        },
        withGuestSession(sid),
      );
      setUser(res.data.data);
      await fetchCart();
      toast.success('Logged in successfully');
      router.push(redirectUrl);
      router.refresh();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Invalid OTP';
      toast.error(msg);
      if (String(msg).toLowerCase().includes('register')) {
        setNeedsRegister(true);
        setOtpSent(false);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 font-sans">
      <div className="text-center">
        <h2 className="font-display font-bold text-2xl text-charcoal">Sign In</h2>
        <p className="text-muted-foreground text-xs mt-1">
          Login with your email, mobile number, and OTP.
        </p>
      </div>

      {needsRegister && (
        <div className="rounded-xl border border-primary/25 bg-primary/5 px-4 py-3 text-xs text-charcoal">
          <p className="font-semibold">Please register first</p>
          <p className="text-muted-foreground mt-1">
            No account found for these details. Create an account to continue.
          </p>
          <Link
            href={`/register?redirect=${encodeURIComponent(redirectUrl)}&email=${encodeURIComponent(getValues('email')?.trim() || '')}&phone=${encodeURIComponent(getValues('phone')?.trim() || '')}`}
            className="inline-block mt-2 text-primary font-bold font-accent hover:underline"
          >
            Go to Register →
          </Link>
        </div>
      )}

      <form onSubmit={handleSubmit(onVerifyLogin)} className="flex flex-col gap-4" suppressHydrationWarning>
        <div className="flex flex-col gap-1.5 w-full">
          <label className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
            <Mail size={14} /> Email Address
          </label>
          <input
            type="email"
            autoComplete="email"
            placeholder="name@email.com"
            disabled={otpSent}
            suppressHydrationWarning
            {...register('email')}
            className="w-full bg-cream-dark/25 border border-border focus:border-primary rounded-xl px-4 py-2.5 text-xs outline-none disabled:opacity-60"
          />
          {errors.email && (
            <span className="text-[10px] text-destructive">{errors.email.message}</span>
          )}
        </div>

        <div className="flex flex-col gap-1.5 w-full">
          <label className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
            <Smartphone size={14} /> Mobile Number
          </label>
          <div className="w-full flex items-center bg-cream-dark/25 border border-border focus-within:border-primary rounded-xl overflow-hidden">
            <span className="shrink-0 pl-4 pr-2 text-xs font-semibold text-muted-foreground select-none">
              +91
            </span>
            <input
              type="tel"
              inputMode="numeric"
              autoComplete="tel"
              maxLength={10}
              placeholder="9876543210"
              disabled={otpSent}
              suppressHydrationWarning
              {...register('phone', {
                onChange: (e) => {
                  e.target.value = e.target.value.replace(/\D/g, '').slice(0, 10);
                },
              })}
              className="w-full min-w-0 bg-transparent border-0 px-2 py-2.5 text-xs outline-none disabled:opacity-60"
            />
          </div>
          {errors.phone && (
            <span className="text-[10px] text-destructive">{errors.phone.message}</span>
          )}
        </div>

        {!otpSent ? (
          <button
            type="button"
            onClick={() => void sendOtp()}
            disabled={loading}
            suppressHydrationWarning
            className="bg-primary hover:bg-crimson-dark text-white font-semibold font-accent uppercase tracking-wider text-xs py-3.5 rounded-xl flex items-center justify-center gap-2 mt-1 transition-colors outline-none disabled:opacity-50"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Send OTP
          </button>
        ) : (
          <>
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
                  <KeyRound size={14} /> Enter OTP
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setOtpSent(false);
                    setValue('otp', '');
                    clearErrors('otp');
                  }}
                  suppressHydrationWarning
                  className="text-[10px] text-primary hover:underline font-semibold font-accent flex items-center gap-1 outline-none"
                >
                  <RefreshCw size={10} /> Change details
                </button>
              </div>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="000000"
                suppressHydrationWarning
                {...register('otp', {
                  onChange: (e) => {
                    const digits = e.target.value.replace(/\D/g, '').slice(0, 6);
                    e.target.value = digits;
                    setValue('otp', digits, { shouldValidate: true });
                  },
                })}
                className="bg-cream-dark/25 border border-border focus:border-primary rounded-xl px-4 py-3 text-center text-lg font-bold tracking-[0.4em] outline-none"
              />
              {errors.otp && (
                <span className="text-[10px] text-destructive">{errors.otp.message}</span>
              )}
              <p className="text-[10px] text-muted-foreground text-center mt-1">
                Enter the 6-digit code sent to your email and mobile.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || otpValue.length !== 6}
              suppressHydrationWarning
              className="bg-primary hover:bg-crimson-dark text-white font-semibold font-accent uppercase tracking-wider text-xs py-3.5 rounded-xl flex items-center justify-center gap-2 mt-1 transition-colors outline-none disabled:opacity-50"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Verify OTP & Sign In
            </button>

            <button
              type="button"
              onClick={() => void sendOtp()}
              disabled={loading}
              suppressHydrationWarning
              className="text-[11px] text-primary hover:underline font-semibold outline-none disabled:opacity-50"
            >
              Resend OTP
            </button>
          </>
        )}
      </form>

      <div className="border-t border-border-spice/40 pt-4 text-center text-xs text-muted-foreground">
        New here?{' '}
        <Link href="/register" className="text-primary hover:underline font-bold font-accent">
          Create an account
        </Link>
        <div className="mt-2">
          <Link href="/" className="text-primary hover:underline font-bold font-accent">
            Back to store
          </Link>
        </div>
      </div>
    </div>
  );
}
