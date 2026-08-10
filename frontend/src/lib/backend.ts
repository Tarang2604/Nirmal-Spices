/** Server-side backend base URL (no trailing slash after /api) */
export function getBackendApiUrl(): string {
  const raw =
    process.env.API_URL ||
    process.env.BACKEND_URL ||
    // Absolute only — relative `/backend-api` is for the browser via Next rewrites
    (process.env.NEXT_PUBLIC_API_URL?.startsWith('http')
      ? process.env.NEXT_PUBLIC_API_URL
      : undefined) ||
    'http://localhost:5000/api';

  // Normalize regardless of whether the source env var already included /api
  // (matches next.config.ts's rewrite, which does the same strip-then-append).
  return raw.replace(/\/$/, '').replace(/\/backend-api$/, '').replace(/\/api$/, '') + '/api';
}
