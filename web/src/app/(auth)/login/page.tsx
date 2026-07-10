import React, { Suspense } from 'react';
import LoginForm from '@/components/auth/LoginForm';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your Nirmal's Spices account to manage orders, addresses, and wishlist.",
};

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-muted-foreground text-xs">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
