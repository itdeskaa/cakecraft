import { Search, Package, CheckCircle2, Clock } from "lucide-react";
import { getCurrentTenant } from "@/lib/tenant";
import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/utils";
import { StatusBadge } from "@/components/admin/ui";

export const metadata = { title: "Track Your Order" };

const FLOW = ["PLACED", "CONFIRMED", "BAKING", "OUT_FOR_DELIVERY", "DELIVERED"] as const;
const LABELS: Record<string, string> = {
  PLACED: "Order Placed", CONFIRMED: "Confirmed", BAKING: "Baking your cake",
  OUT_FOR_DELIVERY: "Out for delivery", DELIVERED: "Delivered",
};

function digits(s: string) {
  return s.replace(/[^0-9]/g, "");
}

export default async function TrackPage({ searchParams }: { searchParams: { no?: string; phone?: string } }) {
  const tenant = await getCurrentTenant();
  const no = searchParams.no?.trim();
  const phone = searchParams.phone?.trim();

  let order = null as Awaited<ReturnType<typeof prisma.order.findFirst>> & { items: any[] } | null;
  let error: string | null = null;

  if (no && phone) {
    const found = await prisma.order.findFirst({
      where: { tenantId: tenant.id, orderNo: no },
      include: { items: true },
    });
    const pin = digits(phone);
    if (found && pin.length >= 4 && digits(found.customerPhone).endsWith(pin)) {
      order = found as any;
    } else {
      error = "No order found with that number and phone. Please check and try again.";
    }
  }

  const sym = tenant.currencySymbol;
  const currentIdx = order ? FLOW.indexOf(order.status as any) : -1;
  const cancelled = order?.status === "CANCELLED";

  return (
    <div className="container-x pt-28 pb-24">
      <div className="mx-auto max-w-2xl">
        <header className="text-center">
          <span className="eyebrow"><Package className="h-4 w-4" /> Order tracking</span>
          <h1 className="mt-3 text-4xl font-black sm:text-5xl">Track Your Order</h1>
          <p className="mx-auto mt-3 max-w-md text-muted">Enter your order number and the phone number you ordered with.</p>
        </header>

        {/* Lookup form (GET) */}
        <form method="GET" className="card mx-auto mt-8 flex flex-col gap-3 p-5 sm:flex-row">
          <input name="no" defaultValue={no} required placeholder="Order no (e.g. CK-2606-0001)" className="flex-1 rounded-xl border border-line bg-surface px-4 py-3 text-sm outline-none focus:border-brand/50" />
          <input name="phone" defaultValue={phone} required placeholder="Phone number" className="flex-1 rounded-xl border border-line bg-surface px-4 py-3 text-sm outline-none focus:border-brand/50" />
          <button type="submit" className="btn-primary shrink-0"><Search className="h-4 w-4" /> Track</button>
        </form>

        {error && (
          <div className="mt-6 rounded-2xl bg-red-50 px-5 py-4 text-center text-sm text-red-600">{error}</div>
        )}

        {order && (
          <div className="mt-8 space-y-6">
            <div className="card flex flex-wrap items-center justify-between gap-3 p-6">
              <div>
                <p className="text-sm text-muted">Order</p>
                <p className="font-display text-2xl font-black">{order.orderNo}</p>
                <p className="mt-1 text-sm text-muted">Placed {new Date(order.createdAt).toLocaleDateString()}</p>
              </div>
              <StatusBadge status={order.status} />
            </div>

            {/* Timeline */}
            <div className="card p-6">
              <h2 className="mb-5 font-bold">{cancelled ? "Order cancelled" : "Order progress"}</h2>
              {cancelled ? (
                <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">This order has been cancelled. Please contact us if this is unexpected.</p>
              ) : (
                <ol className="relative ml-3 border-l-2 border-line">
                  {FLOW.map((s, i) => {
                    const done = i <= currentIdx;
                    const active = i === currentIdx;
                    return (
                      <li key={s} className="relative mb-6 pl-6 last:mb-0">
                        <span className={`absolute -left-[11px] grid h-5 w-5 place-items-center rounded-full ring-4 ring-cream ${done ? "bg-brand text-brand-fg" : "bg-line"}`}>
                          {done && <CheckCircle2 className="h-3.5 w-3.5" />}
                        </span>
                        <p className={`text-sm font-semibold ${done ? "" : "text-muted"} ${active ? "text-brand" : ""}`}>{LABELS[s]}</p>
                        {active && <p className="text-xs text-muted">Your order is here right now</p>}
                      </li>
                    );
                  })}
                </ol>
              )}
            </div>

            {/* Items */}
            <div className="card p-6">
              <h2 className="mb-4 font-bold">Items</h2>
              <div className="divide-y divide-line">
                {order.items.map((it) => (
                  <div key={it.id} className="flex items-center justify-between gap-3 py-3">
                    <div>
                      <p className="font-medium">{it.quantity}× {it.name}</p>
                      <p className="text-xs text-muted">{[it.size, it.flavor].filter(Boolean).join(" · ")}</p>
                    </div>
                    <span className="font-semibold">{formatMoney(Number(it.lineTotal), sym)}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex justify-between border-t border-line pt-4 text-lg font-black">
                <span>Total</span><span className="text-brand">{formatMoney(Number(order.total), sym)}</span>
              </div>
              {order.deliveryDate && (
                <p className="mt-4 flex items-center gap-2 text-sm text-muted"><Clock className="h-4 w-4 text-brand" /> Delivery: {new Date(order.deliveryDate).toLocaleDateString()} {order.deliverySlot}</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
