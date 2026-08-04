"use client";

import React, { Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

/**
 * Forces a remount when the URL changes so page UI always matches the latest
 * route / query — fixes soft-nav cases where APIs run but the old screen stays.
 */
function KeyedInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const routeKey = `${pathname}?${searchParams.toString()}`;
  return <div key={routeKey} className="contents">{children}</div>;
}

export default function RouteKeyedContent({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="contents">{children}</div>}>
      <KeyedInner>{children}</KeyedInner>
    </Suspense>
  );
}
