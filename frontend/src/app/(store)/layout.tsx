import React, { Suspense } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import AnnouncementBar from '@/components/layout/AnnouncementBar';
import CategoryNav from '@/components/layout/CategoryNav';
import CartSheet from '@/components/cart/CartSheet';
import RouteKeyedContent from '@/components/providers/RouteKeyedContent';
import WhatsAppButton from '@/components/common/WhatsAppButton';

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <AnnouncementBar />
      <Header />
      <Suspense fallback={null}>
        <CategoryNav />
      </Suspense>
      <main className="flex-grow">
        <RouteKeyedContent>{children}</RouteKeyedContent>
      </main>
      <Footer />
      <CartSheet />
      <WhatsAppButton />
    </div>
  );
}
