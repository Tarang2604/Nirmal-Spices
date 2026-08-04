import React, { Suspense } from 'react';
import RegisterForm from '@/components/auth/RegisterForm';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Create Account",
  description: "Register a new account on Nirmal's Spices to manage your purchases, addresses, and wishlist.",
};

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-muted-foreground text-xs">Loading...</div>}>
      <RegisterForm />
    </Suspense>
  );
}
