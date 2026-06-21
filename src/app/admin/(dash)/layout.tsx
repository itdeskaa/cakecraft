import { requireAdmin } from "@/lib/session";
import { Sidebar } from "@/components/admin/Sidebar";

export const metadata = { title: "Admin" };

export default async function DashLayout({ children }: { children: React.ReactNode }) {
  const { user, tenant } = await requireAdmin();

  return (
    <div className="flex min-h-screen bg-cream">
      <Sidebar storeName={tenant.name} adminName={user.name} />
      <div className="min-w-0 flex-1">
        <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8">{children}</div>
      </div>
    </div>
  );
}
