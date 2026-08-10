import Link from 'next/link';
import { Compass } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4 font-sans px-4 text-center bg-background text-foreground">
      <div className="bg-primary/10 p-3 rounded-full text-primary mb-2">
        <Compass size={28} />
      </div>
      <h1 className="font-display font-bold text-2xl text-charcoal">Page not found</h1>
      <p className="text-muted-foreground text-sm max-w-md leading-normal">
        The page you&apos;re looking for doesn&apos;t exist or may have moved.
      </p>
      <div className="flex items-center gap-3 mt-2">
        <Link
          href="/"
          className="border border-border text-charcoal hover:bg-muted font-semibold font-accent uppercase tracking-wider text-xs px-6 py-3 rounded-full transition-all"
        >
          Home
        </Link>
        <Link
          href="/shop"
          className="bg-primary hover:bg-crimson-dark text-white font-semibold font-accent uppercase tracking-wider text-xs px-8 py-3 rounded-full transition-all"
        >
          Browse Shop
        </Link>
      </div>
    </div>
  );
}
