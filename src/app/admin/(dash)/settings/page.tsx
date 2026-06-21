import { requireAdmin } from "@/lib/session";
import { PageHeader } from "@/components/admin/ui";
import { SettingsForm } from "@/components/admin/SettingsForm";

export const metadata = { title: "Delivery & Store" };

export default async function SettingsPage() {
  const { tenant } = await requireAdmin();
  return (
    <div>
      <PageHeader title="Delivery & Store" subtitle="Contact info, currency, delivery fee and tax." />
      <SettingsForm
        initial={{
          email: tenant.email ?? "",
          phone: tenant.phone ?? "",
          whatsapp: tenant.whatsapp ?? "",
          address: tenant.address ?? "",
          city: tenant.city ?? "",
          currency: tenant.currency,
          currencySymbol: tenant.currencySymbol,
          deliveryFee: String(Number(tenant.deliveryFee)),
          freeDeliveryAbove: tenant.freeDeliveryAbove != null ? String(Number(tenant.freeDeliveryAbove)) : "",
          minOrderValue: String(Number(tenant.minOrderValue)),
          taxPercent: String(Number(tenant.taxPercent)),
        }}
      />
    </div>
  );
}
