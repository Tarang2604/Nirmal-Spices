/** Mirrors next.config.ts's images.remotePatterns hostnames. */
const ALLOWED_IMAGE_HOSTS = new Set(['nirmalspices.in', 'res.cloudinary.com', 'localhost']);

/**
 * Guards against next/image's hard runtime crash when a stored image URL
 * points at a host that isn't allow-listed in next.config.ts — e.g. a raw
 * external URL pasted into a CSV bulk-import "image" column. Falls back
 * instead of letting one bad row crash the page for every visitor.
 */
export function getSafeImageUrl(url: string | null | undefined, fallback = '/hero_spices.png'): string {
  if (!url) return fallback;
  if (url.startsWith('/')) return url; // relative — local upload or static asset, always safe

  try {
    const { hostname } = new URL(url);
    return ALLOWED_IMAGE_HOSTS.has(hostname) ? url : fallback;
  } catch {
    return fallback;
  }
}

/**
 * Routes Cloudinary URLs through Cloudinary's own resize/format CDN instead of
 * Next's built-in image optimizer, which was 500ing on cold (uncached) fetches
 * of newly-migrated product images — Cloudinary already does this reliably and
 * is what we pay for. Non-Cloudinary sources (local /public assets, dev-only
 * localhost/nirmalspices.in uploads) fall through to Next's default `/_next/image`
 * behavior, unchanged.
 */
export function imageLoader({ src, width, quality }: { src: string; width: number; quality?: number }): string {
  if (src.includes('res.cloudinary.com') && src.includes('/upload/')) {
    const params = `f_auto,q_${quality ?? 'auto'},w_${width}`;
    return src.replace('/upload/', `/upload/${params}/`);
  }
  return `/_next/image?url=${encodeURIComponent(src)}&w=${width}&q=${quality ?? 75}`;
}
