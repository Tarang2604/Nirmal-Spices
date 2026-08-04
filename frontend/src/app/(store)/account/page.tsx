"use client";

export const dynamic = 'force-dynamic';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { updateProfileSchema } from '@/validators/auth.validator';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { User, Phone, Mail, Loader2, CheckCircle2, AlertCircle, Trash2 } from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const { user, setUser } = useAuthStore();
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: user?.name || '',
      phone: user?.phone || '',
    },
  });

  const onUpdateProfile = async (data: any) => {
    setUpdating(true);
    try {
      const res = await api.put('/auth/me', data);
      setUser(res.data.data);
      toast.success('Profile updated successfully!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setUpdating(false);
    }
  };

  const onDeleteAccount = async () => {
    const confirmed = window.confirm(
      'Delete your account permanently? This removes your profile and cart from our database and cannot be undone.',
    );
    if (!confirmed) return;
    const typed = window.prompt('Type DELETE to confirm account deletion');
    if (typed !== 'DELETE') {
      toast.message('Account deletion cancelled');
      return;
    }

    setDeleting(true);
    try {
      await api.delete('/auth/me');
      const { logoutNow } = await import('@/lib/authActions');
      await logoutNow();
      toast.success('Your account has been deleted');
      router.replace('/');
      router.refresh();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete account');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display font-bold text-2xl text-charcoal">Profile Details</h1>
        <p className="text-muted-foreground text-xs mt-1">
          Manage your account profile details and verification status.
        </p>
      </div>

      <div className="flex items-center gap-3 bg-cream/35 p-4 rounded-xl border border-border-spice/30 font-sans text-xs">
        {user?.isVerified ? (
          <>
            <CheckCircle2 className="text-green-600 shrink-0" size={18} />
            <span className="text-slate font-medium">
              Your email address <strong>{user?.email}</strong> is verified.
            </span>
          </>
        ) : (
          <>
            <AlertCircle className="text-primary shrink-0" size={18} />
            <span className="text-slate font-medium">
              Your account is pending verification. Check your email for OTP verification.
            </span>
          </>
        )}
      </div>

      <form onSubmit={handleSubmit(onUpdateProfile)} className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
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
          {errors.name && (
            <span className="text-[10px] text-destructive">{errors.name.message as string}</span>
          )}
        </div>

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
          {errors.phone && (
            <span className="text-[10px] text-destructive">{errors.phone.message as string}</span>
          )}
        </div>

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

        <button
          type="submit"
          disabled={updating}
          className="bg-primary hover:bg-crimson-dark text-white font-semibold font-accent uppercase tracking-wider text-xs py-3.5 rounded-xl flex items-center justify-center gap-2 mt-4 sm:col-span-2 transition-colors outline-none disabled:opacity-50"
        >
          {updating && <Loader2 className="w-4 h-4 animate-spin" />}
          Save Changes
        </button>
      </form>

      <div className="border border-red-100 bg-red-50/50 rounded-2xl p-5 mt-4 space-y-3">
        <h2 className="font-display font-bold text-base text-red-700">Danger zone</h2>
        <p className="text-xs text-red-800/80">
          Deleting your account permanently removes your registration details from our database.
          Past orders may remain for legal/accounting records.
        </p>
        <button
          type="button"
          onClick={() => void onDeleteAccount()}
          disabled={deleting}
          className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-xl disabled:opacity-50"
        >
          {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 size={14} />}
          Delete My Account
        </button>
      </div>
    </div>
  );
}
