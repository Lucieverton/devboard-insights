/**
 * Extracts the tenant slug from the current URL.
 * Supports: slug.devstores.com.br and /vitrine/:slug for development.
 */
export function getTenantSlug(): string | null {
  const hostname = window.location.hostname;

  // Production: slug.devstores.com.br
  if (hostname.endsWith(".devstores.com.br")) {
    const slug = hostname.replace(".devstores.com.br", "");
    if (slug && slug !== "www") return slug;
  }

  // Development fallback: extract from path /vitrine/:slug
  const match = window.location.pathname.match(/^\/vitrine\/([a-zA-Z0-9_-]+)/);
  if (match) return match[1];

  return null;
}

export function buildVitrineUrl(slug: string): string {
  // In production, use subdomain
  if (window.location.hostname.endsWith(".devstores.com.br") || window.location.hostname === "devstores.com.br") {
    return `https://${slug}.devstores.com.br`;
  }
  // In dev, use path-based
  return `${window.location.origin}/vitrine/${slug}`;
}
