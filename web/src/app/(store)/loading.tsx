import React from 'react';
import { Loader2 } from 'lucide-react';

export default function StoreLoading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 font-sans text-muted-foreground">
      <Loader2 className="w-8 h-8 text-primary animate-spin" />
      <span className="text-xs uppercase tracking-widest font-semibold font-accent">Loading Spices...</span>
    </div>
  );
}
