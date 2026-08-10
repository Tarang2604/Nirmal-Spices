"use client";

import React from 'react';

/**
 * Optimized page content container enabling instant client-side route transitions
 * without unmounting parent layout components.
 */
export default function RouteKeyedContent({ children }: { children: React.ReactNode }) {
  return <div className="w-full min-h-[60vh]">{children}</div>;
}
