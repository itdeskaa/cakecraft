import { requireAdmin } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/ui";
import { OrdersClient } from "@/components/admin/OrdersClient";

export const metadata = { title: "Orders" };

export default async function OrdersPage() {
  const { tenant } = await requireAdmin();
  const orders = await prisma.order.findMany({
    where: { tenantId: tenant.id },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { items: true } } },
  });

  return (
    <div>
      <PageHeader title="Orders" subtitle="Track and manage every order." />
      <OrdersClient
        symbol={tenant.currencySymbol}
        orders={orders.map((o) => ({
          id: o.id, orderNo: o.orderNo, customerName: o.customerName,
          total: Number(o.total), status: o.status, paymentMethod: o.paymentMethod,
          paymentStatus: o.paymentStatus, items: o._count.items, createdAt: o.createdAt.toISOString(),
        }))}
      />
    </div>
  );
}
