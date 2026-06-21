import Link from "next/link";
import { requireAdmin } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/utils";
import { StatusBadge } from "@/components/admin/ui";
import { ShoppingBag, Banknote, Clock, Cake, ArrowUpRight, TrendingUp } from "lucide-react";

export default async function DashboardPage() {
  const { tenant } = await requireAdmin();
  const sym = tenant.currencySymbol;

  const [orderCount, paidAgg, pending, productCount, recent] = await Promise.all([
    prisma.order.count({ where: { tenantId: tenant.id } }),
    prisma.order.aggregate({
      where: { tenantId: tenant.id, status: { not: "CANCELLED" } },
      _sum: { total: true },
    }),
    prisma.order.count({ where: { tenantId: tenant.id, status: "PLACED" } }),
    prisma.product.count({ where: { tenantId: tenant.id } }),
    prisma.order.findMany({
      where: { tenantId: tenant.id },
      orderBy: { createdAt: "desc" },
      take: 6,
      include: { _count: { select: { items: true } } },
    }),
  ]);

  const revenue = Number(paidAgg._sum.total ?? 0);

  const stats = [
    { label: "Total Orders", value: orderCount.toString(), icon: ShoppingBag, tint: "bg-blue-50 text-blue-600" },
    { label: "Revenue", value: formatMoney(revenue, sym), icon: Banknote, tint: "bg-emerald-50 text-emerald-600" },
    { label: "New Orders", value: pending.toString(), icon: Clock, tint: "bg-amber-50 text-amber-600" },
    { label: "Cakes on Menu", value: productCount.toString(), icon: Cake, tint: "bg-brand-soft text-brand" },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-3xl font-black">Welcome back 👋</h1>
        <p className="mt-1 text-sm text-muted">Here’s what’s happening at {tenant.name} today.</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-3xl border border-line bg-surface p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className={`grid h-11 w-11 place-items-center rounded-2xl ${s.tint}`}><s.icon className="h-5 w-5" /></span>
              <TrendingUp className="h-4 w-4 text-emerald-500" />
            </div>
            <p className="num mt-4 text-3xl font-bold">{s.value}</p>
            <p className="text-xs text-muted">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Recent orders */}
      <div className="mt-8 rounded-3xl border border-line bg-surface shadow-sm">
        <div className="flex items-center justify-between border-b border-line px-6 py-4">
          <h2 className="font-bold">Recent Orders</h2>
          <Link href="/admin/orders" className="flex items-center gap-1 text-sm font-semibold text-brand hover:underline">
            View all <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        {recent.length === 0 ? (
          <div className="grid place-items-center py-16 text-center text-muted">
            <Cake className="h-10 w-10 opacity-40" />
            <p className="mt-3 text-sm">No orders yet. They’ll show up here.</p>
          </div>
        ) : (
          <div className="divide-y divide-line">
            {recent.map((o) => (
              <Link key={o.id} href={`/admin/orders/${o.id}`} className="flex items-center justify-between gap-4 px-6 py-4 transition hover:bg-cream">
                <div className="min-w-0">
                  <p className="font-semibold">{o.orderNo} · {o.customerName}</p>
                  <p className="truncate text-xs text-muted">{o._count.items} item{o._count.items !== 1 ? "s" : ""} · {o.paymentMethod} · {new Date(o.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <StatusBadge status={o.status} />
                  <span className="font-bold">{formatMoney(Number(o.total), sym)}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
