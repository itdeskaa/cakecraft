import { requireAdmin } from "@/lib/session";
import { PageHeader } from "@/components/admin/ui";
import { PaymentsForm } from "@/components/admin/PaymentsForm";

export const metadata = { title: "Payments" };

export default async function PaymentsPage() {
  const { tenant } = await requireAdmin();
  return (
    <div>
      <PageHeader title="Payments" subtitle="Choose how customers pay. Enable Cash on Delivery and / or online payments." />
      <PaymentsForm
        codEnabled={tenant.codEnabled}
        onlinePayEnabled={tenant.onlinePayEnabled}
        razorpayKeyId={tenant.razorpayKeyId ?? ""}
        hasSecret={Boolean(tenant.razorpayKeySecret)}
      />
    </div>
  );
}
