import { NextRequest, NextResponse } from "next/server";
import { resolveTenantSlug } from "@/lib/tenant";

/**
 * Reads the host, works out which cake company is being visited,
 * and forwards it to the app via the `x-tenant` request header.
 */
export function middleware(req: NextRequest) {
  const host = req.headers.get("host");
  const slug = resolveTenantSlug(host);

  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-tenant", slug);

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  // run on everything except next internals & static assets
  matcher: ["/((?!_next/static|_next/image|favicon.ico|uploads/|.*\\..*).*)"],
};
