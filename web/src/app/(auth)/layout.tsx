import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-cream to-cream-dark/50 flex flex-col justify-between py-12 px-4 sm:px-6 lg:px-8 font-sans">
      
      {/* Header Logo */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md flex justify-center mb-6">
        <Link href="/" className="flex items-center gap-2 group">
          <Image
            src="/nirmal_logo (2).png"
            alt="Nirmal's Spices"
            width={72}
            height={72}
            className="object-contain drop-shadow"
          />
          <div className="flex flex-col text-left">
            <span className="font-display font-bold text-xl leading-tight tracking-tight text-primary">
              Nirmal&apos;s Spices
            </span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold font-accent">
              Pure • Authentic • Natural
            </span>
          </div>
        </Link>
      </div>

      {/* Auth Box Container */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md bg-white py-8 px-6 sm:px-10 rounded-2xl border border-border-spice/50 shadow-xl shadow-bark/5 mb-12">
        {children}
      </div>

      {/* Footer Copy */}
      <div className="text-center text-xs text-muted-foreground mt-auto">
        <Link href="/privacy-policy" className="hover:underline">Privacy Policy</Link>
        <span className="mx-2">&bull;</span>
        <Link href="/contact" className="hover:underline">Support</Link>
      </div>

    </div>
  );
}
