import nodemailer from "nodemailer";
import { formatMoney } from "./utils";

/** The subset of Tenant fields needed to send mail via that store's own SMTP. */
export type MailTenant = {
  name: string;
  emailEnabled: boolean;
  smtpHost: string | null;
  smtpPort: number | null;
  smtpSecure: boolean;
  smtpUser: string | null;
  smtpPass: string | null;
  smtpFromName: string | null;
  smtpFromEmail: string | null;
};

export function smtpConfigured(t: MailTenant) {
  return Boolean(t.emailEnabled && t.smtpHost && t.smtpUser && t.smtpPass);
}

function transportFor(t: MailTenant) {
  return nodemailer.createTransport({
    host: t.smtpHost!,
    port: t.smtpPort ?? 587,
    secure: t.smtpSecure, // true → port 465 (implicit TLS); false → STARTTLS on 587
    auth: { user: t.smtpUser!, pass: t.smtpPass! },
  });
}

function fromAddress(t: MailTenant) {
  const name = t.smtpFromName || t.name;
  const email = t.smtpFromEmail || t.smtpUser!;
  return `"${name.replace(/"/g, "")}" <${email}>`;
}

/**
 * Send an email using the tenant's own SMTP settings (configured in
 * Admin → Notifications). If SMTP isn't set up, it logs and no-ops so that
 * placing an order never fails because email isn't configured yet.
 */
export async function sendMail(
  t: MailTenant,
  opts: { to: string; subject: string; html: string; replyTo?: string }
) {
  if (!smtpConfigured(t)) {
    console.log(`📧 [email skipped — SMTP not configured] to=${opts.to} subject="${opts.subject}"`);
    return { ok: false, skipped: true as const };
  }
  try {
    const info = await transportFor(t).sendMail({
      from: fromAddress(t),
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
      replyTo: opts.replyTo,
    });
    return { ok: true as const, id: info.messageId };
  } catch (e: any) {
    console.error("📧 email send failed:", e?.message ?? e);
    return { ok: false as const, error: e?.message ?? "send failed" };
  }
}

/** Verify SMTP credentials without sending (used by the admin "test" button). */
export async function verifySmtp(t: MailTenant) {
  if (!t.smtpHost || !t.smtpUser || !t.smtpPass) return { ok: false, error: "Missing SMTP host / user / password" };
  try {
    await transportFor(t).verify();
    return { ok: true as const };
  } catch (e: any) {
    return { ok: false as const, error: e?.message ?? "Verification failed" };
  }
}

// ─────────────── Templates ───────────────

type OrderEmail = {
  orderNo: string;
  customerName: string;
  total: number | string;
  items: { name: string; quantity: number; size?: string | null; flavor?: string | null; lineTotal: number | string }[];
  deliveryDate?: Date | string | null;
  deliverySlot?: string | null;
  address?: string | null;
};
type Brand = { name: string; primaryColor: string; currencySymbol: string };

const STATUS_LABEL: Record<string, string> = {
  PLACED: "Order Placed", CONFIRMED: "Confirmed", BAKING: "Baking your cake",
  OUT_FOR_DELIVERY: "Out for delivery", DELIVERED: "Delivered", CANCELLED: "Cancelled",
};

function shell(brand: Brand, heading: string, intro: string, body: string, trackUrl?: string) {
  return `
  <div style="background:#faf7f2;padding:32px 0;font-family:Segoe UI,Helvetica,Arial,sans-serif">
    <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:20px;overflow:hidden;border:1px solid #eee">
      <div style="background:${brand.primaryColor};padding:24px 28px;color:#fff">
        <div style="font-size:20px;font-weight:800">${brand.name}</div>
      </div>
      <div style="padding:28px">
        <h1 style="margin:0 0 6px;font-size:22px;color:#1c161a">${heading}</h1>
        <p style="margin:0 0 20px;color:#6b6168;font-size:15px">${intro}</p>
        ${body}
        ${trackUrl ? `<a href="${trackUrl}" style="display:inline-block;margin-top:22px;background:${brand.primaryColor};color:#fff;text-decoration:none;padding:12px 22px;border-radius:999px;font-weight:700;font-size:14px">Track your order →</a>` : ""}
      </div>
      <div style="padding:18px 28px;border-top:1px solid #eee;color:#9a9098;font-size:12px">
        Thank you for choosing ${brand.name}. 🎂
      </div>
    </div>
  </div>`;
}

function itemsTable(o: OrderEmail, brand: Brand) {
  const rows = o.items
    .map(
      (i) => `<tr>
        <td style="padding:8px 0;color:#1c161a;font-size:14px">${i.quantity}× ${i.name}${i.size ? ` <span style="color:#9a9098">(${i.size})</span>` : ""}</td>
        <td style="padding:8px 0;text-align:right;color:#1c161a;font-size:14px">${formatMoney(i.lineTotal, brand.currencySymbol)}</td>
      </tr>`
    )
    .join("");
  return `
    <table style="width:100%;border-collapse:collapse;border-top:1px solid #eee;border-bottom:1px solid #eee">
      ${rows}
    </table>
    <div style="display:flex;justify-content:space-between;margin-top:14px;font-weight:800;font-size:16px;color:#1c161a">
      <span>Total</span><span style="color:${brand.primaryColor}">${formatMoney(o.total, brand.currencySymbol)}</span>
    </div>`;
}

export function customerOrderHtml(brand: Brand, o: OrderEmail, trackUrl: string) {
  const delivery = o.deliveryDate
    ? `<p style="margin:14px 0 0;color:#6b6168;font-size:14px">📅 Delivery: ${new Date(o.deliveryDate).toLocaleDateString()} ${o.deliverySlot ?? ""}</p>`
    : "";
  return shell(
    brand,
    "Thank you for your order! 🎉",
    `Order <b>${o.orderNo}</b> has been received. We're already preheating the oven!`,
    itemsTable(o, brand) + delivery,
    trackUrl
  );
}

export function ownerAlertHtml(brand: Brand, o: OrderEmail, paymentMethod: string) {
  return shell(
    brand,
    "🔔 New order received",
    `<b>${o.orderNo}</b> from <b>${o.customerName}</b> · ${paymentMethod}`,
    itemsTable(o, brand) +
      (o.address ? `<p style="margin:14px 0 0;color:#6b6168;font-size:14px">📍 ${o.address}</p>` : "")
  );
}

export function statusUpdateHtml(brand: Brand, o: { orderNo: string }, status: string, trackUrl: string) {
  const label = STATUS_LABEL[status] ?? status;
  return shell(
    brand,
    `Your order is ${label.toLowerCase()} 🎂`,
    `Order <b>${o.orderNo}</b> status has been updated to <b>${label}</b>.`,
    `<div style="padding:16px;background:#faf7f2;border-radius:12px;font-size:15px;color:#1c161a">Current status: <b>${label}</b></div>`,
    trackUrl
  );
}
