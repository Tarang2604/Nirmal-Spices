import Link from 'next/link';
import { SearchX } from 'lucide-react';

export default function ProductNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 font-sans px-4 text-center">
      <div className="bg-primary/10 p-3 rounded-full text-primary mb-2">
        <SearchX size={28} />
      </div>
      <h1 className="font-display font-bold text-2xl text-charcoal">Product not available</h1>
      <p className="text-muted-foreground text-sm max-w-md leading-normal">
        This product isn&apos;t available anymore — it may have been removed or is temporarily out of listing.
      </p>
      <Link
        href="/shop"
        className="bg-primary hover:bg-crimson-dark text-white font-semibold font-accent uppercase tracking-wider text-xs px-8 py-3.5 rounded-full mt-2 transition-all duration-200"
      >
        Browse All Products
      </Link>
    </div>
  );
}
