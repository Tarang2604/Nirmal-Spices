/**
 * Template remounts on each navigation between admin segments.
 * Keep this a simple server component (no client hooks) so Next can swap cleanly.
 */
export default function AdminTemplate({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
