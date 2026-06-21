import { requireAdmin } from "@/lib/session";
import { PageHeader } from "@/components/admin/ui";
import { NotificationsForm } from "@/components/admin/NotificationsForm";

export const metadata = { title: "Notifications" };

export default async function NotificationsPage() {
  const { tenant } = await requireAdmin();
  return (
    <div>
      <PageHeader title="Notifications" subtitle="Set up your email (SMTP) so customers get automatic order confirmations and live status updates." />
      <NotificationsForm
        initial={{
          emailEnabled: tenant.emailEnabled,
          smtpHost: tenant.smtpHost ?? "",
          smtpPort: String(tenant.smtpPort ?? 587),
          smtpSecure: tenant.smtpSecure,
          smtpUser: tenant.smtpUser ?? "",
          hasPass: Boolean(tenant.smtpPass),
          smtpFromName: tenant.smtpFromName ?? "",
          smtpFromEmail: tenant.smtpFromEmail ?? "",
          notifyEmail: tenant.notifyEmail ?? tenant.email ?? "",
        }}
      />
    </div>
  );
}
