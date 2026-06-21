import { requireAdmin } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/ui";
import { CouponsManager } from "@/components/admin/CouponsManager";

export const metadata = { title: "Coupons" };

export default async function CouponsPage() {
  const { tenant } = await requireAdmin();
  const coupons = await prisma.coupon.findMany({
    where: { tenantId: tenant.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <PageHeader title="Coupons" subtitle="Create discount codes customers can apply at checkout." />
      <CouponsManager
        symbol={tenant.currencySymbol}
        coupons={coupons.map((c) => ({
          id: c.id, code: c.code, type: c.type, value: Number(c.value),
          minOrder: Number(c.minOrder), maxDiscount: c.maxDiscount ? Number(c.maxDiscount) : null, isActive: c.isActive,
        }))}
      />
    </div>
  );
}
