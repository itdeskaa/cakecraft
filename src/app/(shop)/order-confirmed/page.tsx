import Link from "next/link";
import QRCode from "qrcode";
import { CheckCircle2, Home, Package, MessageCircle } from "lucide-react";
import { getCurrentTenant } from "@/lib/tenant";
import { prisma } from "@/lib/prisma";
import { waLink, orderToStoreMessage } from "@/lib/whatsapp";
import { OrderQR } from "@/components/storefront/OrderQR";

export const metadata = { title: "Order Confirmed" };

export default async function OrderConfirmed({ searchParams }: { searchParams: { no?: string } }) {
  const tenant = await getCurrentTenant();
  const no = searchParams.no;

  const order = no
    ? await prisma.order.findFirst({ where: { tenantId: tenant.id, orderNo: no }, include: { items: true } })
    : null;

  // Build a QR that opens the tracking page directly (order no + phone last-4 for verification).
  let qr: string | null = null;
  if (order) {
    const base = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const last4 = (order.customerPhone || "").replace(/[^0-9]/g, "").slice(-4);
    const trackingUrl = `${base}/track?no=${encodeURIComponent(order.orderNo)}&phone=${last4}`;
    qr = await QRCode.toDataURL(trackingUrl, {
      width: 240,
      margin: 1,
      color: { dark: tenant.primaryColor, light: "#ffffff" },
    });
  }

  const whatsapp =
    order && tenant.whatsapp
      ? waLink(
          tenant.whatsapp,
          orderToStoreMessage(
            {
              orderNo: order.orderNo,
              customerName: order.customerName,
              total: Number(order.total),
              items: order.items.map((i) => ({ name: i.name, quantity: i.quantity, size: i.size, flavor: i.flavor })),
            },
            tenant.name,
            tenant.currencySymbol
          )
        )
      : null;

  return (
    <div className="container-x grid min-h-screen place-items-center pt-28 pb-20">
      <div className="relative w-full max-w-lg overflow-hidden rounded-[2.5rem] border border-line bg-surface p-10 text-center shadow-card">
        <div className="pointer-events-none absolute -top-16 left-1/2 h-48 w-48 -translate-x-1/2 animate-float rounded-full bg-brand/15 blur-2xl" />
        <span className="relative mx-auto grid h-24 w-24 animate-[fade-up_0.6s_both] place-items-center rounded-full bg-emerald-50 text-emerald-500">
          <CheckCircle2 className="h-14 w-14" />
        </span>
        <h1 className="relative mt-6 text-4xl font-black">Thank you! 🎉</h1>
        <p className="relative mt-3 text-muted">
          Your order has been placed successfully. We’re already preheating the oven!
        </p>
        {no && (
          <div className="relative mt-6 inline-flex items-center gap-2 rounded-full bg-brand-soft px-5 py-2.5 font-semibold text-brand">
            Order No: <span className="font-black">{no}</span>
          </div>
        )}
        <p className="relative mt-4 text-sm text-muted">
          {order?.customerEmail
            ? "A confirmation email is on its way. "
            : ""}
          For Cash on Delivery, please keep the exact amount ready.
        </p>

        {qr && order && <OrderQR qr={qr} orderNo={order.orderNo} />}

        <div className="relative mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          {no && (
            <Link href={`/track?no=${encodeURIComponent(no)}`} className="btn-primary">
              <Package className="h-4 w-4" /> Track your order
            </Link>
          )}
          {whatsapp && (
            <a href={whatsapp} target="_blank" rel="noopener" className="btn-accent">
              <MessageCircle className="h-4 w-4" /> Message us on WhatsApp
            </a>
          )}
        </div>
        <Link href="/menu" className="relative mt-4 inline-flex items-center justify-center gap-2 text-sm font-semibold text-muted hover:text-brand">
          <Home className="h-4 w-4" /> Continue shopping
        </Link>
      </div>
    </div>
  );
}
