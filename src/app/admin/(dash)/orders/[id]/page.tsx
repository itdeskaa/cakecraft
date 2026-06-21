import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, MapPin, Phone, Mail, Calendar, Clock, StickyNote, MessageCircle } from "lucide-react";
import { requireAdmin } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/utils";
import { waLink, statusToCustomerMessage } from "@/lib/whatsapp";
import { trackUrl } from "@/lib/notify";
import { Card, StatusBadge } from "@/components/admin/ui";
import { OrderStatusControl } from "@/components/admin/OrderStatusControl";
import { DeleteOrderButton } from "@/components/admin/DeleteOrderButton";

export const metadata = { title: "Order" };

export default async function OrderDetailPage({ params }: { params: { id: string } }) {
  const { tenant } = await requireAdmin();
  const order = await prisma.order.findFirst({
    where: { id: params.id, tenantId: tenant.id },
    include: { items: true },
  });
  if (!order) notFound();
  const sym = tenant.currencySymbol;

  return (
    <div>
      <Link href="/admin/orders" className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-muted hover:text-brand">
        <ArrowLeft className="h-4 w-4" /> Back to orders
      </Link>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="num text-3xl font-bold">{order.orderNo}</h1>
          <p className="mt-1 text-sm text-muted">Placed {new Date(order.createdAt).toLocaleString()}</p>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={order.paymentStatus} />
          <StatusBadge status={order.status} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          {/* Items */}
          <Card className="!p-0">
            <h2 className="border-b border-line px-6 py-4 font-bold">Items</h2>
            <div className="divide-y divide-line">
              {order.items.map((it) => (
                <div key={it.id} className="flex items-center gap-4 px-6 py-4">
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-brand-soft">
                    {it.imageUrl ? <Image src={it.imageUrl} alt={it.name} fill sizes="56px" className="object-cover" /> : <div className="grid h-full place-items-center">🎂</div>}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">{it.name}</p>
                    <p className="text-xs text-muted">{[it.size, it.flavor].filter(Boolean).join(" · ")}</p>
                    {it.message && <p className="text-xs italic text-brand">“{it.message}”</p>}
                  </div>
                  <span className="text-sm text-muted">×{it.quantity}</span>
                  <span className="w-24 text-right font-semibold">{formatMoney(Number(it.lineTotal), sym)}</span>
                </div>
              ))}
            </div>
            <dl className="space-y-2 border-t border-line px-6 py-4 text-sm">
              <Row label="Subtotal" value={formatMoney(Number(order.subtotal), sym)} />
              {Number(order.discount) > 0 && <Row label="Discount" value={`− ${formatMoney(Number(order.discount), sym)}`} />}
              <Row label="Delivery" value={Number(order.deliveryFee) === 0 ? "FREE" : formatMoney(Number(order.deliveryFee), sym)} />
              {Number(order.taxAmount) > 0 && <Row label="Tax" value={formatMoney(Number(order.taxAmount), sym)} />}
              <div className="flex justify-between border-t border-line pt-2 text-base font-black"><dt>Total</dt><dd className="num text-brand">{formatMoney(Number(order.total), sym)}</dd></div>
            </dl>
          </Card>

          {/* Customer */}
          <Card>
            <h2 className="mb-4 font-bold">Customer & delivery</h2>
            <div className="grid gap-3 text-sm sm:grid-cols-2">
              <Info icon={Phone} label="Phone" value={order.customerPhone} />
              {order.customerEmail && <Info icon={Mail} label="Email" value={order.customerEmail} />}
              <Info icon={MapPin} label="Address" value={`${order.address}${order.city ? `, ${order.city}` : ""}`} />
              {order.deliveryDate && <Info icon={Calendar} label="Delivery date" value={new Date(order.deliveryDate).toLocaleDateString()} />}
              {order.deliverySlot && <Info icon={Clock} label="Time slot" value={order.deliverySlot} />}
              {order.notes && <Info icon={StickyNote} label="Notes" value={order.notes} />}
            </div>
          </Card>
        </div>

        {/* Status control */}
        <div className="space-y-4 lg:sticky lg:top-8 lg:h-fit">
          <Card>
            <h2 className="mb-1 font-bold">{order.customerName}</h2>
            <p className="mb-4 text-sm text-muted">{order.paymentMethod === "COD" ? "Cash on Delivery" : "Paid online (Razorpay)"}</p>
            <OrderStatusControl id={order.id} status={order.status} paymentStatus={order.paymentStatus} />
            <a
              href={waLink(order.customerPhone, statusToCustomerMessage(order.orderNo, tenant.name, order.status.replace(/_/g, " "), trackUrl(order.orderNo)))}
              target="_blank"
              rel="noopener"
              className="mt-4 flex items-center justify-center gap-2 rounded-full bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-600"
            >
              <MessageCircle className="h-4 w-4" /> WhatsApp customer
            </a>
            <DeleteOrderButton id={order.id} orderNo={order.orderNo} />
          </Card>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between"><dt className="text-muted">{label}</dt><dd className="num font-semibold">{value}</dd></div>;
}
function Info({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex gap-2.5">
      <Icon className="h-4 w-4 shrink-0 text-brand" />
      <div><p className="text-xs text-muted">{label}</p><p className="font-medium">{value}</p></div>
    </div>
  );
}
