import { cache } from "./cache";
import { headers } from "next/headers";
import { prisma } from "./prisma";
import type { Tenant } from "@prisma/client";

/**
 * Resolve which cake company (tenant) this request belongs to.
 *
 * Resolution order:
 *   1. `x-tenant` header injected by middleware (from subdomain or custom domain)
 *   2. DEFAULT_TENANT env var (handy for plain http://localhost:3000)
 *
 * e.g.  sweet-bloom.localhost:3000  →  tenant "sweet-bloom"
 *       cakes.acme.com (custom domain) → matched on Tenant.domain
 */
export function resolveTenantSlug(host: string | null): string {
  const fallback = process.env.DEFAULT_TENANT || "sweet-bloom";
  if (!host) return fallback;

  const hostname = host.split(":")[0]; // strip port
  const parts = hostname.split(".");

  // sub.localhost / sub.domain.tld  → first label is the tenant slug
  const isLocal = hostname.endsWith("localhost") || hostname.endsWith("127.0.0.1");
  if (isLocal && parts.length > 1) return parts[0];
  if (!isLocal && parts.length > 2) return parts[0];

  return fallback;
}

/** Cached per-request so multiple components share one DB hit. */
export const getCurrentTenant = cache(async (): Promise<Tenant> => {
  const h = headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const headerSlug = h.get("x-tenant");
  const slug = headerSlug || resolveTenantSlug(host);

  // Try slug first, then custom domain.
  const tenant =
    (await prisma.tenant.findFirst({
      where: { OR: [{ slug }, { domain: host ?? undefined }], isActive: true },
    })) ??
    (await prisma.tenant.findFirst({ where: { isActive: true } }));

  if (!tenant) {
    throw new Error(
      "No active tenant found. Run `npm run db:seed` to create demo cake companies."
    );
  }
  return tenant;
});

/** Lightweight, theme-only tenant fetch for the root layout. */
export const getTenantTheme = cache(async () => {
  const t = await getCurrentTenant();
  return {
    name: t.name,
    tagline: t.tagline,
    logoUrl: t.logoUrl,
    primaryColor: t.primaryColor,
    accentColor: t.accentColor,
    fontTheme: t.fontTheme,
  };
});
