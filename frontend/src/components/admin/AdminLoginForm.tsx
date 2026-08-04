"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';
import { Mail, Lock, Loader2, ArrowRight } from 'lucide-react';

const adminLoginSchema = z.object({
  email: z.string().trim().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

type AdminLoginFormValues = z.infer<typeof adminLoginSchema>;

export default function AdminLoginForm() {
  const router = useRouter();
  const { setUser, user, isLoggedIn, isInitialized } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AdminLoginFormValues>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: { email: '', password: '' },
  });

  useEffect(() => {
    if (isInitialized && isLoggedIn && user?.role === 'admin') {
      router.replace('/admin');
    }
  }, [isInitialized, isLoggedIn, user, router]);

  const onSubmit = async (data: AdminLoginFormValues) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/admin/login', {
        email: data.email.trim().toLowerCase(),
        password: data.password,
      });

      if (res.data?.data?.role !== 'admin') {
        toast.error('Invalid admin credentials');
        return;
      }

      setUser(res.data.data);
      toast.success('Welcome to Admin Portal');
      router.replace('/admin');
      router.refresh();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Admin login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex flex-col justify-center py-12 px-4 relative overflow-hidden font-sans">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[40%] h-[40%] rounded-full bg-saffron/10 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-md flex flex-col items-center">
        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg border border-border mb-6 p-2">
          <Image
            src="/nirmal_logo.png"
            alt="Nirmal's Spices"
            width={48}
            height={48}
            className="object-contain"
          />
        </div>
        <h1 className="font-display font-bold text-3xl text-charcoal tracking-wide text-center">
          Admin Portal
        </h1>
        <p className="mt-2 text-[10px] uppercase tracking-[0.2em] font-semibold text-muted-foreground font-accent">
          Authorized Access Only
        </p>
      </div>

      <div className="relative z-10 mt-8 mx-auto w-full max-w-md">
        <div className="bg-white py-10 px-6 sm:px-10 rounded-[20px] shadow-sm border border-border">
          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                Administrator Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                <input
                  type="email"
                  autoComplete="username"
                  placeholder="admin@gmail.com"
                  {...register('email')}
                  className="w-full bg-cream-dark/25 border border-border focus:border-primary rounded-xl pl-11 pr-4 py-3 text-sm outline-none"
                />
              </div>
              {errors.email && (
                <span className="text-[10px] text-destructive">{errors.email.message}</span>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                <input
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  {...register('password')}
                  className="w-full bg-cream-dark/25 border border-border focus:border-primary rounded-xl pl-11 pr-4 py-3 text-sm outline-none"
                />
              </div>
              {errors.password && (
                <span className="text-[10px] text-destructive">{errors.password.message}</span>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-crimson-dark text-white font-semibold font-accent uppercase tracking-wider text-xs py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight size={16} />}
              Secure Login
            </button>
          </form>

          <p className="mt-6 text-center text-[11px] text-muted-foreground">
            Store customers use{' '}
            <Link href="/login" className="text-primary font-semibold hover:underline">
              customer login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
