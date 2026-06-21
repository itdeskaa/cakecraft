import { NextRequest, NextResponse } from "next/server";
import { getCurrentTenant } from "@/lib/tenant";
import { verifySignature } from "@/lib/razorpay";
import { prisma } from "@/lib/prisma";
import { notifyNewOrder } from "@/lib/notify";

export async function POST(req: NextRequest) {
  try {
    const tenant = await getCurrentTenant();
    const { orderId, razorpayOrderId, razorpayPaymentId, signature } = await req.json();

    const valid = verifySignature(tenant, razorpayOrderId, razorpayPaymentId, signature);
    if (!valid) {
      await prisma.order.updateMany({
        where: { id: orderId, tenantId: tenant.id },
        data: { paymentStatus: "FAILED" },
      });
      return NextResponse.json({ error: "Payment verification failed" }, { status: 400 });
    }

    const order = await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: "PAID",
        razorpayPaymentId,
        status: "CONFIRMED",
      },
      include: { items: true },
    });

    await notifyNewOrder(tenant, order as any);

    return NextResponse.json({ ok: true, orderNo: order.orderNo });
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? "Verification failed" }, { status: 400 });
  }
}
