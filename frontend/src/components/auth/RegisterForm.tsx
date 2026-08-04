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
import { Mail, User as UserIcon, Phone, Lock, Loader2 } from 'lucide-react';
import Link from 'next/link';

/** Register requires phone so the account matches OTP login + shows fully in admin */
const registerFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().trim().email('Invalid email address'),
  phone: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type RegisterFormValues = z.infer<typeof registerFormSchema>;

export default function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/';
  const prefillEmail = searchParams.get('email') || '';
  const prefillPhone = searchParams.get('phone') || '';

  const { setUser } = useAuthStore();
  const { fetchCart, initializeSession } = useCartStore();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      name: '',
      email: prefillEmail,
      phone: prefillPhone,
      password: '',
    },
  });

  const onRegister = async (data: RegisterFormValues) => {
    setLoading(true);
    try {
      const sid = initializeSession();
      const payload = {
        name: data.name.trim(),
        email: data.email.trim().toLowerCase(),
        phone: data.phone.trim(),
        password: data.password,
      };
      const res = await api.post('/auth/register', payload, withGuestSession(sid));
      setUser(res.data.data);
      await fetchCart();
      toast.success("Welcome to Nirmal's Spices! Your account was created.");
      router.push(redirectUrl);
      router.refresh();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 font-sans">
      <div className="text-center">
        <h2 className="font-display font-bold text-2xl text-charcoal font-accent">Create Account</h2>
        <p className="text-muted-foreground text-xs mt-1">
          Join us to explore authentic Indian spices. Your details are saved securely.
        </p>
      </div>

      <form onSubmit={handleSubmit(onRegister)} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
            <UserIcon size={14} /> Full Name
          </label>
          <input
            type="text"
            placeholder="John Doe"
            autoComplete="name"
            {...register('name')}
            className="bg-cream-dark/25 border border-border focus:border-primary rounded-xl px-4 py-2.5 text-xs outline-none"
          />
          {errors.name && (
            <span className="text-[10px] text-destructive">{errors.name.message}</span>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
            <Mail size={14} /> Email Address
          </label>
          <input
            type="email"
            placeholder="name@email.com"
            autoComplete="email"
            {...register('email')}
            className="bg-cream-dark/25 border border-border focus:border-primary rounded-xl px-4 py-2.5 text-xs outline-none"
          />
          {errors.email && (
            <span className="text-[10px] text-destructive">{errors.email.message}</span>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
            <Phone size={14} /> Mobile Number
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
              {...register('phone', {
                onChange: (e) => {
                  e.target.value = e.target.value.replace(/\D/g, '').slice(0, 10);
                },
              })}
              className="w-full min-w-0 bg-transparent border-0 px-2 py-2.5 text-xs outline-none"
            />
          </div>
          {errors.phone && (
            <span className="text-[10px] text-destructive">{errors.phone.message}</span>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
            <Lock size={14} /> Password
          </label>
          <input
            type="password"
            placeholder="•••••••• (Min 8 chars)"
            autoComplete="new-password"
            {...register('password')}
            className="bg-cream-dark/25 border border-border focus:border-primary rounded-xl px-4 py-2.5 text-xs outline-none"
          />
          {errors.password && (
            <span className="text-[10px] text-destructive">{errors.password.message}</span>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-primary hover:bg-crimson-dark text-white font-semibold font-accent uppercase tracking-wider text-xs py-3.5 rounded-xl flex items-center justify-center gap-2 mt-2 transition-colors outline-none disabled:opacity-50"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          Create Account
        </button>
      </form>

      <div className="border-t border-border-spice/40 pt-4 text-center text-xs text-muted-foreground">
        Already have an account?{' '}
        <Link
          href={`/login?redirect=${encodeURIComponent(redirectUrl)}`}
          className="text-primary hover:underline font-bold font-accent"
        >
          Sign In
        </Link>
      </div>
    </div>
  );
}
