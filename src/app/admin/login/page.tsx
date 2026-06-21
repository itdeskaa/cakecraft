import { redirect } from "next/navigation";
import { getCurrentTenant } from "@/lib/tenant";
import { getAdminSession } from "@/lib/session";
import { LoginForm } from "@/components/admin/LoginForm";

export const metadata = { title: "Admin Login" };

export default async function AdminLoginPage() {
  const tenant = await getCurrentTenant();
  const session = await getAdminSession();
  if (session?.user && (session.user as any).tenantId === tenant.id) {
    redirect("/admin");
  }

  return (
    <LoginForm
      tenantId={tenant.id}
      tenantName={tenant.name}
      primaryColor={tenant.primaryColor}
      demoEmail={`admin@${tenant.slug}.ae`}
    />
  );
}
