"use client";

import { useEffect } from "react";
import { AlertCircle } from "lucide-react";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-4 text-center">
      <div className="bg-destructive/10 p-3 rounded-full text-destructive mb-2">
        <AlertCircle size={28} />
      </div>
      <h2 className="font-bold text-2xl text-charcoal">Something went wrong</h2>
      <p className="text-muted-foreground text-sm max-w-md leading-normal">
        This admin section hit an unexpected error. Try again, or reload the page if it persists.
      </p>
      <button
        onClick={() => reset()}
        className="bg-primary hover:bg-crimson-dark text-white font-semibold uppercase tracking-wider text-xs px-8 py-3.5 rounded-full mt-2 transition-all duration-200 outline-none"
      >
        Try Again
      </button>
    </div>
  );
}
