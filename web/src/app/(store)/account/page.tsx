"use client";

export const dynamic = 'force-dynamic';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { updateProfileSchema } from '@/validators/auth.validator';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { User, Phone, Mail, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ProfilePage() {
  const { user, setUser } = useAuthStore();
  const [updating, setUpdating] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: user?.name || '',
      phone: user?.phone || '',
    }
  });

  const onUpdateProfile = async (data: any) => {
    setUpdating(true);
    try {
      const res = await api.put('/auth/me', data);
      setUser(res.data.data);
      toast.success("Profile updated successfully!");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      
      {/* Title */}
      <div>
        <h1 className="font-display font-bold text-2xl text-charcoal">Profile Details</h1>
        <p className="text-muted-foreground text-xs mt-1">Manage your account profile details and verification status.</p>
      </div>

      {/* Profile status box */}
      <div className="flex items-center gap-3 bg-cream/35 p-4 rounded-xl border border-border-spice/30 font-sans text-xs">
        {user?.isVerified ? (
          <>
            <CheckCircle2 className="text-green-600 shrink-0" size={18} />
            <span className="text-slate font-medium">Your email address <strong>{user?.email}</strong> is verified.</span>
          </>
        ) : (
          <>
            <AlertCircle className="text-primary shrink-0" size={18} />
            <span className="text-slate font-medium">Your account is pending verification. Check your email for OTP verification.</span>
          </>
        )}
      </div>

      {/* Edit form */}
      <form onSubmit={handleSubmit(onUpdateProfile)} className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
        
        {/* Full Name */}
        <div className="flex flex-col gap-1.5 font-sans">
          <label className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
            <User size={14} /> Full Name
          </label>
          <input
            type="text"
            placeholder="John Doe"
            {...register('name')}
            className="bg-cream-dark/25 border border-border focus:border-primary rounded-xl px-4 py-2.5 text-xs outline-none"
          />
          {errors.name && <span className="text-[10px] text-destructive">{errors.name.message as string}</span>}
        </div>

        {/* Phone number */}
        <div className="flex flex-col gap-1.5 font-sans">
          <label className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
            <Phone size={14} /> Mobile Number
          </label>
          <input
            type="tel"
            placeholder="9876543210"
            {...register('phone')}
            className="bg-cream-dark/25 border border-border focus:border-primary rounded-xl px-4 py-2.5 text-xs outline-none"
          />
          {errors.phone && <span className="text-[10px] text-destructive">{errors.phone.message as string}</span>}
        </div>

        {/* Email read only */}
        <div className="flex flex-col gap-1.5 font-sans sm:col-span-2 opacity-65">
          <label className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
            <Mail size={14} /> Email Address (Unchangeable)
          </label>
          <input
            type="email"
            readOnly
            value={user?.email || ''}
            className="bg-muted border border-border rounded-xl px-4 py-2.5 text-xs outline-none cursor-not-allowed select-none"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={updating}
          className="bg-primary hover:bg-crimson-dark text-white font-semibold font-accent uppercase tracking-wider text-xs py-3.5 rounded-xl flex items-center justify-center gap-2 mt-4 sm:col-span-2 transition-colors outline-none disabled:opacity-50"
        >
          {updating && <Loader2 className="w-4 h-4 animate-spin" />}
          Save Changes
        </button>

      </form>

    </div>
  );
}

