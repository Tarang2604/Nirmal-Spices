"use client";

import { useEffect } from "react";
import "./globals.css";

export default function GlobalError({
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
    <html lang="en" className="h-full antialiased">
      <body className="bg-background text-foreground min-h-full flex flex-col font-sans">
        <div className="flex flex-col items-center justify-center min-h-screen gap-4 px-4 text-center">
          <h2 className="font-bold text-2xl text-charcoal">Something went wrong!</h2>
          <p className="text-muted-foreground text-sm max-w-md leading-normal">
            We hit an unexpected error loading the page. Please try again or come back later.
          </p>
          <button
            onClick={() => reset()}
            className="bg-primary hover:bg-crimson-dark text-white font-semibold uppercase tracking-wider text-xs px-8 py-3.5 rounded-full mt-2 transition-all duration-200 outline-none"
          >
            Try Again
          </button>
        </div>
      </body>
    </html>
  );
}
