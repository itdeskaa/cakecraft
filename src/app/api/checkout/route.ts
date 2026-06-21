import { NextRequest, NextResponse } from "next/server";
import { getCurrentTenant } from "@/lib/tenant";
import { checkoutSchema } from "@/lib/validators";
import { createOrder } from "@/lib/orders";
import { razorpayClient, getRazorpayCreds } from "@/lib/razorpay";
import { prisma } from "@/lib/prisma";
import { notifyNewOrder } from "@/lib/notify";

export async function POST(req: NextRequest) {
  try {
    const tenant = await getCurrentTenant();
    const body = await req.json();
    const parsed = checkoutSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid order" },
        { status: 400 }
      );
    }

    const order = await createOrder(tenant, parsed.data);

    // Cash on delivery → done. Notify customer + owner (don't block the response).
    if (order.paymentMethod === "COD") {
      await notifyNewOrder(tenant, order as any);
      return NextResponse.json({ ok: true, method: "COD", orderNo: order.orderNo, orderId: order.id });
    }

    // Razorpay → create a payment order and return details for client checkout.
    const creds = getRazorpayCreds(tenant);
    const rzp = razorpayClient(tenant);
    // Charge in the customer's region currency (base total × fx rate).
    const chargeCurrency = order.currency ?? tenant.currency;
    const chargeAmount = Math.round(Number(order.total) * Number(order.fxRate) * 100);
    const rzpOrder = await rzp.orders.create({
      amount: chargeAmount, // smallest currency unit
      currency: chargeCurrency,
      receipt: order.orderNo,
      notes: { tenant: tenant.slug, orderId: order.id, region: order.regionName ?? "" },
    });

    await prisma.order.update({
      where: { id: order.id },
      data: { razorpayOrderId: rzpOrder.id },
    });

    return NextResponse.json({
      ok: true,
      method: "RAZORPAY",
      orderNo: order.orderNo,
      orderId: order.id,
      keyId: creds.keyId,
      razorpayOrderId: rzpOrder.id,
      amount: rzpOrder.amount,
      currency: chargeCurrency,
      name: tenant.name,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? "Checkout failed" }, { status: 400 });
  }
}
