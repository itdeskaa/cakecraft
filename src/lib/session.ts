import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "./auth";
import { getCurrentTenant } from "./tenant";
import type { Tenant } from "@prisma/client";

/**
 * Guard for admin pages. Ensures:
 *  - a valid admin session exists
 *  - the logged-in admin belongs to the tenant of the current host
 * Returns the session user + the current tenant.
 */
export async function requireAdmin(): Promise<{
  user: NonNullable<Awaited<ReturnType<typeof getServerSession>>>["user"] & {
    id: string;
    role: "OWNER" | "MANAGER" | "STAFF";
    tenantId: string;
    tenantSlug: string;
  };
  tenant: Tenant;
}> {
  const session = await getServerSession(authOptions);
  const tenant = await getCurrentTenant();

  if (!session?.user) redirect("/admin/login");

  // An admin of brand A must not manage brand B (different subdomain).
  if (session.user.tenantId !== tenant.id) {
    redirect("/admin/login?switch=1");
  }

  return { user: session.user as any, tenant };
}

export async function getAdminSession() {
  return getServerSession(authOptions);
}
