"use client";

export const dynamic = 'force-dynamic';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { addressSchema } from '@/validators/auth.validator';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Trash2, MapPin, Loader2, ArrowLeft, Plus, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AddressesPage() {
  const { user, setUser } = useAuthStore();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      label: 'home' as const,
      fullName: '',
      phone: '',
      line1: '',
      line2: '',
      city: '',
      state: '',
      pincode: '',
      isDefault: false
    }
  });

  const handleEditClick = (address: any) => {
    setEditingId(address._id);
    setShowForm(true);
    // prefill values
    setValue('label', address.label);
    setValue('fullName', address.fullName);
    setValue('phone', address.phone);
    setValue('line1', address.line1);
    setValue('line2', address.line2 || '');
    setValue('city', address.city);
    setValue('state', address.state);
    setValue('pincode', address.pincode);
    setValue('isDefault', address.isDefault || false);
  };

  const handleAddNewClick = () => {
    setEditingId(null);
    setShowForm(true);
    reset();
  };

  const handleFormSubmit = async (data: any) => {
    setSaving(true);
    try {
      let res;
      if (editingId) {
        // Edit address
        res = await api.put(`/auth/addresses/${editingId}`, data);
        toast.success("Address updated successfully!");
      } else {
        // Create address
        res = await api.post('/auth/addresses', data);
        toast.success("Address saved successfully!");
      }

      // update store user addresses
      if (user) {
        setUser({ ...user, addresses: res.data.data });
      }
      setShowForm(false);
      reset();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to save address");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this address?");
    if (!confirmDelete) return;

    try {
      const res = await api.delete(`/auth/addresses/${addressId}`);
      toast.success("Address deleted successfully!");
      if (user) {
        setUser({ ...user, addresses: res.data.data });
      }
    } catch {
      toast.error("Failed to delete address");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      
      {/* Title */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-display font-bold text-2xl text-charcoal">Saved Addresses</h1>
          <p className="text-muted-foreground text-xs mt-1">Manage your saved delivery address templates.</p>
        </div>
        {!showForm && (
          <button
            onClick={handleAddNewClick}
            className="bg-primary hover:bg-crimson-dark text-white font-semibold font-accent uppercase tracking-wider text-[10px] px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-colors outline-none"
          >
            <Plus size={12} /> Add New
          </button>
        )}
      </div>

      {/* Grid List View */}
      {!showForm && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {(!user?.addresses || user.addresses.length === 0) ? (
            <div className="sm:col-span-2 text-center p-12 border border-dashed rounded-2xl text-muted-foreground text-xs leading-normal font-sans">
              No saved addresses found. Add an address to make your next checkout faster!
            </div>
          ) : (
            user.addresses.map((addr) => (
              <div 
                key={addr._id} 
                className="p-4 rounded-xl border border-border-spice/40 bg-white flex flex-col gap-1.5 text-xs font-sans text-charcoal hover:border-primary/30 transition-colors relative group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[10px] capitalize text-primary bg-secondary/5 px-2 py-0.5 rounded-full">{addr.label}</span>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => handleEditClick(addr)}
                      className="text-primary hover:underline font-bold text-[10px] font-accent uppercase"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDeleteAddress(addr._id)}
                      className="text-muted-foreground hover:text-destructive"
                      aria-label="Delete address"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                <strong className="text-sm font-semibold text-charcoal mt-1 block">{addr.fullName}</strong>
                <span>{addr.line1}, {addr.line2}</span>
                <span>{addr.city}, {addr.state} - {addr.pincode}</span>
                <span className="font-medium mt-1">📞 {addr.phone}</span>

                {addr.isDefault && (
                  <span className="flex items-center gap-1 text-[10px] text-green-600 font-bold mt-2"><CheckCircle2 size={12} /> Default Address</span>
                )}

              </div>
            ))
          )}
        </div>
      )}

      {/* Add / Edit Form */}
      {showForm && (
        <form onSubmit={handleSubmit(handleFormSubmit)} className="grid grid-cols-1 sm:grid-cols-12 gap-4">
          
          {/* Address label */}
          <div className="sm:col-span-12 flex flex-col gap-1.5">
            <label className="text-xs font-bold text-muted-foreground">Address Label</label>
            <div className="flex gap-2">
              {['home', 'work', 'other'].map((lbl) => (
                <label key={lbl} className="flex items-center gap-1.5 text-xs text-charcoal cursor-pointer">
                  <input
                    type="radio"
                    value={lbl}
                    {...register('label')}
                    className="text-primary focus:ring-primary focus:ring-offset-0"
                  />
                  <span className="capitalize">{lbl}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="sm:col-span-6 flex flex-col gap-1.5">
            <label className="text-xs font-bold text-muted-foreground">Receiver Full Name</label>
            <input
              type="text"
              placeholder="John Doe"
              {...register('fullName')}
              className="bg-cream-dark/25 border border-border focus:border-primary rounded-xl px-3 py-2.5 text-xs outline-none"
            />
            {errors.fullName && <span className="text-[10px] text-destructive">{errors.fullName.message as string}</span>}
          </div>

          <div className="sm:col-span-6 flex flex-col gap-1.5">
            <label className="text-xs font-bold text-muted-foreground">Mobile Number</label>
            <input
              type="tel"
              placeholder="9876543210"
              {...register('phone')}
              className="bg-cream-dark/25 border border-border focus:border-primary rounded-xl px-3 py-2.5 text-xs outline-none"
            />
            {errors.phone && <span className="text-[10px] text-destructive">{errors.phone.message as string}</span>}
          </div>

          <div className="sm:col-span-12 flex flex-col gap-1.5">
            <label className="text-xs font-bold text-muted-foreground">Address Line 1</label>
            <input
              type="text"
              placeholder="Flat/House No., Building Name, Street..."
              {...register('line1')}
              className="bg-cream-dark/25 border border-border focus:border-primary rounded-xl px-3 py-2.5 text-xs outline-none"
            />
            {errors.line1 && <span className="text-[10px] text-destructive">{errors.line1.message as string}</span>}
          </div>

          <div className="sm:col-span-12 flex flex-col gap-1.5">
            <label className="text-xs font-bold text-muted-foreground">Address Line 2 (Optional)</label>
            <input
              type="text"
              placeholder="Landmark, Area, Sector..."
              {...register('line2')}
              className="bg-cream-dark/25 border border-border focus:border-primary rounded-xl px-3 py-2.5 text-xs outline-none"
            />
          </div>

          <div className="sm:col-span-4 flex flex-col gap-1.5">
            <label className="text-xs font-bold text-muted-foreground">City</label>
            <input
              type="text"
              placeholder="Harda"
              {...register('city')}
              className="bg-cream-dark/25 border border-border focus:border-primary rounded-xl px-3 py-2.5 text-xs outline-none"
            />
            {errors.city && <span className="text-[10px] text-destructive">{errors.city.message as string}</span>}
          </div>

          <div className="sm:col-span-4 flex flex-col gap-1.5">
            <label className="text-xs font-bold text-muted-foreground">State</label>
            <input
              type="text"
              placeholder="Madhya Pradesh"
              {...register('state')}
              className="bg-cream-dark/25 border border-border focus:border-primary rounded-xl px-3 py-2.5 text-xs outline-none"
            />
            {errors.state && <span className="text-[10px] text-destructive">{errors.state.message as string}</span>}
          </div>

          <div className="sm:col-span-4 flex flex-col gap-1.5">
            <label className="text-xs font-bold text-muted-foreground">PIN Code</label>
            <input
              type="text"
              placeholder="461331"
              {...register('pincode')}
              className="bg-cream-dark/25 border border-border focus:border-primary rounded-xl px-3 py-2.5 text-xs outline-none"
            />
            {errors.pincode && <span className="text-[10px] text-destructive">{errors.pincode.message as string}</span>}
          </div>

          <div className="sm:col-span-12 flex items-center gap-2 mt-2">
            <input
              type="checkbox"
              id="isDefault"
              {...register('isDefault')}
              className="rounded border-border text-primary focus:ring-0"
            />
            <label htmlFor="isDefault" className="text-xs text-muted-foreground font-semibold cursor-pointer">Set as Default Address</label>
          </div>

          {/* Actions */}
          <div className="sm:col-span-12 flex justify-between items-center mt-6 pt-4 border-t border-border-spice/40">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-xs text-muted-foreground font-semibold flex items-center gap-1.5 outline-none hover:underline"
            >
              <ArrowLeft size={12} /> Back to List
            </button>
            <button
              type="submit"
              disabled={saving}
              className="bg-primary hover:bg-crimson-dark text-white font-semibold font-accent uppercase tracking-wider text-xs py-3.5 rounded-xl flex items-center justify-center gap-1.5 px-8 outline-none disabled:opacity-50"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              Save Address
            </button>
          </div>

        </form>
      )}

    </div>
  );
}

