import { requireAdmin } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/ui";
import { RegionsManager } from "@/components/admin/RegionsManager";

export const metadata = { title: "Regions & Currency" };

export default async function RegionsPage() {
  const { tenant } = await requireAdmin();
  const regions = await prisma.region.findMany({
    where: { tenantId: tenant.id },
    orderBy: [{ isDefault: "desc" }, { sortOrder: "asc" }],
  });

  return (
    <div>
      <PageHeader
        title="Regions & Currency"
        subtitle="Add the countries you serve. Customers pick their region and prices, currency and delivery update live."
      />
      <RegionsManager
        baseCurrency={tenant.currency}
        regions={regions.map((r) => ({
          id: r.id, name: r.name, flag: r.flag ?? "", currency: r.currency, currencySymbol: r.currencySymbol,
          fxRate: Number(r.fxRate), deliveryFee: Number(r.deliveryFee),
          freeDeliveryAbove: r.freeDeliveryAbove != null ? Number(r.freeDeliveryAbove) : null,
          isDefault: r.isDefault, isActive: r.isActive,
        }))}
      />
    </div>
  );
}
