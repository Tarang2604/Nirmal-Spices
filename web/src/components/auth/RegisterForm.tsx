"use client";

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema } from '@/validators/auth.validator';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Mail, User as UserIcon, Phone, Lock, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/';

  const { setUser } = useAuthStore();
  const { fetchCart } = useCartStore();
  const [loading, setLoading] = useState(false);

  const { 
    register, 
    handleSubmit, 
    formState: { errors } 
  } = useForm({
    resolver: zodResolver(registerSchema)
  });

  const onRegister = async (data: any) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/register', data);
      setUser(res.data.data);
      // Sync guest cart to user cart
      await fetchCart();
      toast.success("Welcome to Nirmal's Spices! 🎉 Registration successful.");
      router.push(redirectUrl);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Registration failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 font-sans">
      
      {/* Title */}
      <div className="text-center">
        <h2 className="font-display font-bold text-2xl text-charcoal font-accent">Create Account</h2>
        <p className="text-muted-foreground text-xs mt-1">
          Join us to explore 43 varieties of authentic Indian spices.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onRegister)} className="flex flex-col gap-4">
        
        {/* Full Name */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
            <UserIcon size={14} /> Full Name
          </label>
          <input
            type="text"
            placeholder="John Doe"
            {...register('name')}
            className="bg-cream-dark/25 border border-border focus:border-primary rounded-xl px-4 py-2.5 text-xs outline-none"
          />
          {errors.name && <span className="text-[10px] text-destructive">{errors.name.message as string}</span>}
        </div>

        {/* Email Address */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
            <Mail size={14} /> Email Address
          </label>
          <input
            type="email"
            placeholder="name@email.com"
            {...register('email')}
            className="bg-cream-dark/25 border border-border focus:border-primary rounded-xl px-4 py-2.5 text-xs outline-none"
          />
          {errors.email && <span className="text-[10px] text-destructive">{errors.email.message as string}</span>}
        </div>

        {/* Phone Number */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
            <Phone size={14} /> Mobile Number (Optional)
          </label>
          <input
            type="tel"
            placeholder="9876543210"
            {...register('phone')}
            className="bg-cream-dark/25 border border-border focus:border-primary rounded-xl px-4 py-2.5 text-xs outline-none"
          />
          {errors.phone && <span className="text-[10px] text-destructive">{errors.phone.message as string}</span>}
        </div>

        {/* Password */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
            <Lock size={14} /> Password
          </label>
          <input
            type="password"
            placeholder="•••••••• (Min 8 chars)"
            {...register('password')}
            className="bg-cream-dark/25 border border-border focus:border-primary rounded-xl px-4 py-2.5 text-xs outline-none"
          />
          {errors.password && <span className="text-[10px] text-destructive">{errors.password.message as string}</span>}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="bg-primary hover:bg-crimson-dark text-white font-semibold font-accent uppercase tracking-wider text-xs py-3.5 rounded-xl flex items-center justify-center gap-2 mt-2 transition-colors outline-none disabled:opacity-50"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          Register
        </button>

      </form>

      {/* Redirect Sign in */}
      <div className="border-t border-border-spice/40 pt-4 text-center text-xs text-muted-foreground">
        Already have an account? <Link href={`/login?redirect=${encodeURIComponent(redirectUrl)}`} className="text-primary hover:underline font-bold font-accent">Sign In</Link>
      </div>

    </div>
  );
}
