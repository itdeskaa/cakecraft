import { formatMoney } from "./utils";

type OrderLike = {
  orderNo: string;
  customerName: string;
  total: number | string;
  items: { name: string; quantity: number; size?: string | null; flavor?: string | null }[];
};

/** Build a wa.me link (no API needed) that opens WhatsApp with a prefilled message. */
export function waLink(phone: string | null | undefined, message: string) {
  const num = (phone ?? "").replace(/[^0-9]/g, "");
  return `https://wa.me/${num}?text=${encodeURIComponent(message)}`;
}

/** Customer → store: "here is my order" message. */
export function orderToStoreMessage(order: OrderLike, storeName: string, symbol: string) {
  const lines = order.items
    .map((i) => `• ${i.quantity}× ${i.name}${i.size ? ` (${i.size})` : ""}`)
    .join("\n");
  return [
    `Hi ${storeName}! 👋`,
    `I just placed order *${order.orderNo}*.`,
    ``,
    lines,
    ``,
    `Total: ${formatMoney(order.total, symbol)}`,
    `Name: ${order.customerName}`,
    ``,
    `Please confirm my order. Thank you! 🎂`,
  ].join("\n");
}

/** Store → customer: status update message (used from admin order detail). */
export function statusToCustomerMessage(orderNo: string, storeName: string, statusLabel: string, trackUrl: string) {
  return [
    `Hi! This is ${storeName} 🎂`,
    `Your order *${orderNo}* is now: *${statusLabel}*`,
    ``,
    `Track it here: ${trackUrl}`,
  ].join("\n");
}
