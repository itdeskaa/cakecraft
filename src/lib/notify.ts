import type { Tenant } from "@prisma/client";
import { sendMail, customerOrderHtml, ownerAlertHtml, statusUpdateHtml } from "./email";

function appUrl() {
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}
export function trackUrl(orderNo: string) {
  return `${appUrl()}/track?no=${encodeURIComponent(orderNo)}`;
}

type FullOrder = {
  orderNo: string;
  customerName: string;
  customerEmail: string | null;
  address: string | null;
  total: any;
  paymentMethod: string;
  deliveryDate: Date | null;
  deliverySlot: string | null;
  items: { name: string; quantity: number; size: string | null; flavor: string | null; lineTotal: any }[];
};

/** Fire on new order: confirm to customer (if email given) + alert the store owner. */
export async function notifyNewOrder(tenant: Tenant, order: FullOrder) {
  const brand = { name: tenant.name, primaryColor: tenant.primaryColor, currencySymbol: tenant.currencySymbol };
  const o = {
    orderNo: order.orderNo, customerName: order.customerName, total: order.total,
    items: order.items, deliveryDate: order.deliveryDate, deliverySlot: order.deliverySlot, address: order.address,
  };

  const ownerTo = tenant.notifyEmail || tenant.email;
  const jobs: Promise<unknown>[] = [];
  if (order.customerEmail) {
    jobs.push(sendMail(tenant, {
      to: order.customerEmail,
      subject: `Order ${order.orderNo} confirmed — ${tenant.name}`,
      html: customerOrderHtml(brand, o, trackUrl(order.orderNo)),
      replyTo: ownerTo ?? undefined,
    }));
  }
  if (ownerTo) {
    jobs.push(sendMail(tenant, {
      to: ownerTo,
      subject: `🔔 New order ${order.orderNo} — ${order.customerName}`,
      html: ownerAlertHtml(brand, o, order.paymentMethod),
      replyTo: order.customerEmail ?? undefined,
    }));
  }
  await Promise.allSettled(jobs);
}

/** Fire on status change: notify the customer by email. */
export async function notifyStatusChange(
  tenant: Tenant,
  order: { orderNo: string; customerEmail: string | null },
  status: string
) {
  if (!order.customerEmail) return;
  const brand = { name: tenant.name, primaryColor: tenant.primaryColor, currencySymbol: tenant.currencySymbol };
  await sendMail(tenant, {
    to: order.customerEmail,
    subject: `Order ${order.orderNo} update — ${tenant.name}`,
    html: statusUpdateHtml(brand, { orderNo: order.orderNo }, status, trackUrl(order.orderNo)),
    replyTo: (tenant.notifyEmail || tenant.email) ?? undefined,
  }).catch(() => {});
}
