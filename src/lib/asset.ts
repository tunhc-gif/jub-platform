// Prefix a public asset path (e.g. "/vessel-photos/…") with the deploy basePath.
// next.config's `basePath` auto-prefixes next/link + router, but NOT hardcoded
// string URLs like <img src>. This helper covers those. Set NEXT_PUBLIC_BASE_PATH
// at build time for a GitHub project page; empty for root/custom-domain hosting.
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";

export function asset(path: string): string {
  if (!path) return path;
  if (/^https?:\/\//i.test(path)) return path; // already absolute (external)
  return BASE_PATH + (path.startsWith("/") ? path : `/${path}`);
}
