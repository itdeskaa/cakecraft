import { prisma } from "./prisma";
import { makeOrderNo } from "./utils";
import type { CheckoutInput } from "./validators";
import type { Tenant } from "@prisma/client";

/**
 * Build an order from trusted server data. Prices, delivery fee, discount and
 * tax are ALL recomputed here from the DB — never trusted from the client.
 */
export async function buildOrderTotals(tenant: Tenant, input: CheckoutInput) {
  const productIds = input.items.map((i) => i.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds }, tenantId: tenant.id, isAvailable: true },
  });
  const byId = new Map(products.map((p) => [p.id, p]));

  const lines = input.items.map((item) => {
    const product = byId.get(item.productId);
    if (!product) throw new Error("A cake in your cart is no longer available.");

    const sizes = (product.sizes as { label: string; price: number }[] | null) ?? [];
    const chosen = item.size ? sizes.find((s) => s.label === item.size) : null;
    const unitPrice = chosen ? chosen.price : Number(product.basePrice);
    const images = (product.images as string[]) ?? [];

    return {
      productId: product.id,
      name: product.name,
      imageUrl: images[0] ?? null,
      flavor: item.flavor ?? null,
      size: item.size ?? null,
      message: item.message ?? null,
      unitPrice,
      quantity: item.quantity,
      lineTotal: unitPrice * item.quantity,
    };
  });

  const subtotal = lines.reduce((s, l) => s + l.lineTotal, 0);

  // Coupon
  let discount = 0;
  if (input.couponCode) {
    const coupon = await prisma.coupon.findFirst({
      where: { tenantId: tenant.id, code: input.couponCode.toUpperCase(), isActive: true },
    });
    if (coupon && subtotal >= Number(coupon.minOrder)) {
      const notExpired = !coupon.expiresAt || coupon.expiresAt > new Date();
      if (notExpired) {
        discount =
          coupon.type === "PERCENT"
            ? (subtotal * Number(coupon.value)) / 100
            : Number(coupon.value);
        if (coupon.maxDiscount) discount = Math.min(discount, Number(coupon.maxDiscount));
      }
    }
  }

  // Resolve the region the customer ordered from (currency + delivery in that
  // region's own currency). Falls back to the tenant's default region/base.
  const region =
    (await prisma.region.findFirst({
      where: { id: input.regionId ?? undefined, tenantId: tenant.id, isActive: true },
    })) ??
    (await prisma.region.findFirst({
      where: { tenantId: tenant.id, isActive: true },
      orderBy: { isDefault: "desc" },
    }));

  const fxRate = region ? Number(region.fxRate) : 1;
  const regionDeliveryFee = region ? Number(region.deliveryFee) : Number(tenant.deliveryFee);
  const regionFreeAbove = region
    ? region.freeDeliveryAbove != null
      ? Number(region.freeDeliveryAbove)
      : null
    : tenant.freeDeliveryAbove != null
    ? Number(tenant.freeDeliveryAbove)
    : null;

  // `subtotal` is in BASE currency; region thresholds/fees are in region currency.
  const subtotalRegion = subtotal * fxRate;
  const freeQualified = regionFreeAbove != null && subtotalRegion >= regionFreeAbove;
  const deliveryFee = freeQualified ? 0 : regionDeliveryFee / fxRate; // store in base
  const taxAmount = ((subtotal - discount) * Number(tenant.taxPercent)) / 100;
  const total = Math.max(0, subtotal - discount) + deliveryFee + taxAmount;

  return {
    lines,
    subtotal,
    discount,
    deliveryFee,
    taxAmount,
    total,
    region: {
      name: region?.name ?? null,
      currency: region?.currency ?? tenant.currency,
      currencySymbol: region?.currencySymbol ?? tenant.currencySymbol,
      fxRate,
    },
  };
}

export async function createOrder(tenant: Tenant, input: CheckoutInput) {
  // enforce payment method availability
  if (input.paymentMethod === "COD" && !tenant.codEnabled) {
    throw new Error("Cash on delivery is not available right now.");
  }
  if (input.paymentMethod === "RAZORPAY" && !tenant.onlinePayEnabled) {
    throw new Error("Online payment is not available right now.");
  }

  const totals = await buildOrderTotals(tenant, input);

  if (totals.total < Number(tenant.minOrderValue)) {
    throw new Error(`Minimum order value is ${tenant.currencySymbol} ${tenant.minOrderValue}.`);
  }

  const count = await prisma.order.count({ where: { tenantId: tenant.id } });
  const orderNo = makeOrderNo(count + 1);

  const order = await prisma.order.create({
    data: {
      tenantId: tenant.id,
      orderNo,
      customerName: input.customerName,
      customerPhone: input.customerPhone,
      customerEmail: input.customerEmail || null,
      address: input.address,
      city: input.city || null,
      deliveryDate: input.deliveryDate ? new Date(input.deliveryDate) : null,
      deliverySlot: input.deliverySlot || null,
      notes: input.notes || null,
      subtotal: totals.subtotal,
      deliveryFee: totals.deliveryFee,
      taxAmount: totals.taxAmount,
      discount: totals.discount,
      total: totals.total,
      regionName: totals.region.name,
      currency: totals.region.currency,
      currencySymbol: totals.region.currencySymbol,
      fxRate: totals.region.fxRate,
      paymentMethod: input.paymentMethod,
      paymentStatus: input.paymentMethod === "COD" ? "PENDING" : "PENDING",
      status: "PLACED",
      items: { create: totals.lines },
    },
    include: { items: true },
  });

  return order;
}
