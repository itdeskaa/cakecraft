import Razorpay from "razorpay";
import crypto from "crypto";
import type { Tenant } from "@prisma/client";

/** Resolve Razorpay credentials: tenant-specific first, then platform env fallback. */
export function getRazorpayCreds(tenant: Tenant) {
  const keyId = tenant.razorpayKeyId || process.env.RAZORPAY_KEY_ID || "";
  const keySecret = tenant.razorpayKeySecret || process.env.RAZORPAY_KEY_SECRET || "";
  return { keyId, keySecret, configured: Boolean(keyId && keySecret) };
}

export function razorpayClient(tenant: Tenant) {
  const { keyId, keySecret, configured } = getRazorpayCreds(tenant);
  if (!configured) throw new Error("Razorpay is not configured for this store.");
  return new Razorpay({ key_id: keyId, key_secret: keySecret });
}

/** Verify the payment signature returned by Razorpay checkout. */
export function verifySignature(
  tenant: Tenant,
  orderId: string,
  paymentId: string,
  signature: string
) {
  const { keySecret } = getRazorpayCreds(tenant);
  const expected = crypto
    .createHmac("sha256", keySecret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");
  return expected === signature;
}
