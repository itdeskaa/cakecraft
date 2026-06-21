"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { slugify } from "@/lib/utils";
import { Prisma } from "@prisma/client";
import { notifyStatusChange } from "@/lib/notify";

function dec(v: unknown, fallback = 0) {
  const n = typeof v === "string" ? parseFloat(v) : Number(v);
  return new Prisma.Decimal(isNaN(n) ? fallback : n);
}

// ─────────────── BRANDING ───────────────
export async function updateBranding(input: {
  name: string;
  tagline?: string;
  about?: string;
  logoUrl?: string | null;
  heroImageUrl?: string | null;
  faviconUrl?: string | null;
  primaryColor: string;
  accentColor: string;
  fontTheme: string;
}) {
  const { tenant } = await requireAdmin();
  await prisma.tenant.update({
    where: { id: tenant.id },
    data: {
      name: input.name,
      tagline: input.tagline || null,
      about: input.about || null,
      logoUrl: input.logoUrl || null,
      heroImageUrl: input.heroImageUrl || null,
      faviconUrl: input.faviconUrl || null,
      primaryColor: input.primaryColor,
      accentColor: input.accentColor,
      fontTheme: input.fontTheme,
    },
  });
  revalidatePath("/", "layout");
  revalidatePath("/admin/branding");
  return { ok: true };
}

// ─────────────── STORE SETTINGS (contact + delivery) ───────────────
export async function updateStoreSettings(input: {
  email?: string;
  phone?: string;
  whatsapp?: string;
  address?: string;
  city?: string;
  currency: string;
  currencySymbol: string;
  deliveryFee: string | number;
  freeDeliveryAbove?: string | number | null;
  minOrderValue: string | number;
  taxPercent: string | number;
}) {
  const { tenant } = await requireAdmin();
  await prisma.tenant.update({
    where: { id: tenant.id },
    data: {
      email: input.email || null,
      phone: input.phone || null,
      whatsapp: input.whatsapp || null,
      address: input.address || null,
      city: input.city || null,
      currency: input.currency,
      currencySymbol: input.currencySymbol,
      deliveryFee: dec(input.deliveryFee),
      freeDeliveryAbove:
        input.freeDeliveryAbove === "" || input.freeDeliveryAbove == null
          ? null
          : dec(input.freeDeliveryAbove),
      minOrderValue: dec(input.minOrderValue),
      taxPercent: dec(input.taxPercent),
    },
  });
  revalidatePath("/", "layout");
  revalidatePath("/admin/settings");
  return { ok: true };
}

// ─────────────── PAYMENTS ───────────────
export async function updatePayments(input: {
  codEnabled: boolean;
  onlinePayEnabled: boolean;
  razorpayKeyId?: string;
  razorpayKeySecret?: string;
}) {
  const { tenant } = await requireAdmin();
  await prisma.tenant.update({
    where: { id: tenant.id },
    data: {
      codEnabled: input.codEnabled,
      onlinePayEnabled: input.onlinePayEnabled,
      razorpayKeyId: input.razorpayKeyId || null,
      // keep existing secret if a masked placeholder is submitted
      ...(input.razorpayKeySecret && !input.razorpayKeySecret.includes("•")
        ? { razorpayKeySecret: input.razorpayKeySecret }
        : {}),
    },
  });
  revalidatePath("/admin/payments");
  return { ok: true };
}

// ─────────────── NOTIFICATIONS (SMTP) ───────────────
export async function updateNotifications(input: {
  emailEnabled: boolean;
  smtpHost?: string;
  smtpPort?: string | number;
  smtpSecure: boolean;
  smtpUser?: string;
  smtpPass?: string;
  smtpFromName?: string;
  smtpFromEmail?: string;
  notifyEmail?: string;
}) {
  const { tenant } = await requireAdmin();
  await prisma.tenant.update({
    where: { id: tenant.id },
    data: {
      emailEnabled: input.emailEnabled,
      smtpHost: input.smtpHost || null,
      smtpPort: input.smtpPort ? Number(input.smtpPort) : 587,
      smtpSecure: input.smtpSecure,
      smtpUser: input.smtpUser || null,
      smtpFromName: input.smtpFromName || null,
      smtpFromEmail: input.smtpFromEmail || null,
      notifyEmail: input.notifyEmail || null,
      // keep existing password if the masked placeholder is submitted
      ...(input.smtpPass && !input.smtpPass.includes("•") ? { smtpPass: input.smtpPass } : {}),
    },
  });
  revalidatePath("/admin/notifications");
  return { ok: true };
}

// ─────────────── REGIONS ───────────────
export async function saveRegion(input: {
  id?: string;
  name: string;
  flag?: string;
  currency: string;
  currencySymbol: string;
  fxRate: string | number;
  deliveryFee: string | number;
  freeDeliveryAbove?: string | number | null;
  isDefault: boolean;
  isActive: boolean;
}) {
  const { tenant } = await requireAdmin();
  const data = {
    name: input.name,
    flag: input.flag || null,
    currency: input.currency,
    currencySymbol: input.currencySymbol,
    fxRate: dec(input.fxRate, 1),
    deliveryFee: dec(input.deliveryFee),
    freeDeliveryAbove:
      input.freeDeliveryAbove === "" || input.freeDeliveryAbove == null ? null : dec(input.freeDeliveryAbove),
    isActive: input.isActive,
    isDefault: input.isDefault,
  };

  // Only one default region per tenant.
  if (input.isDefault) {
    await prisma.region.updateMany({ where: { tenantId: tenant.id }, data: { isDefault: false } });
  }

  if (input.id) {
    await prisma.region.update({ where: { id: input.id }, data });
  } else {
    const count = await prisma.region.count({ where: { tenantId: tenant.id } });
    await prisma.region.create({ data: { ...data, tenantId: tenant.id, sortOrder: count } });
  }
  revalidatePath("/admin/regions");
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function deleteRegion(id: string) {
  const { tenant } = await requireAdmin();
  await prisma.region.deleteMany({ where: { id, tenantId: tenant.id } });
  // Make sure a default still exists.
  const def = await prisma.region.findFirst({ where: { tenantId: tenant.id, isDefault: true } });
  if (!def) {
    const first = await prisma.region.findFirst({ where: { tenantId: tenant.id }, orderBy: { sortOrder: "asc" } });
    if (first) await prisma.region.update({ where: { id: first.id }, data: { isDefault: true } });
  }
  revalidatePath("/admin/regions");
  revalidatePath("/", "layout");
  return { ok: true };
}

// ─────────────── CATEGORIES ───────────────
export async function saveCategory(input: { id?: string; name: string; sortOrder?: number; isActive?: boolean }) {
  const { tenant } = await requireAdmin();
  const slug = slugify(input.name);
  if (input.id) {
    await prisma.category.update({
      where: { id: input.id },
      data: { name: input.name, slug, sortOrder: input.sortOrder ?? 0, isActive: input.isActive ?? true },
    });
  } else {
    await prisma.category.create({
      data: { tenantId: tenant.id, name: input.name, slug, sortOrder: input.sortOrder ?? 0 },
    });
  }
  revalidatePath("/admin/categories");
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function deleteCategory(id: string) {
  const { tenant } = await requireAdmin();
  await prisma.category.deleteMany({ where: { id, tenantId: tenant.id } });
  revalidatePath("/admin/categories");
  return { ok: true };
}

// ─────────────── PRODUCTS ───────────────
export type ProductInput = {
  id?: string;
  name: string;
  categoryId?: string | null;
  shortDesc?: string;
  description?: string;
  basePrice: string | number;
  compareAt?: string | number | null;
  images: string[];
  flavors: string[];
  sizes: { label: string; price: number }[];
  eggless: boolean;
  servesUpTo?: number | null;
  isFeatured: boolean;
  isAvailable: boolean;
};

export async function saveProduct(input: ProductInput) {
  const { tenant } = await requireAdmin();
  const data = {
    name: input.name,
    slug: slugify(input.name),
    categoryId: input.categoryId || null,
    shortDesc: input.shortDesc || null,
    description: input.description || null,
    basePrice: dec(input.basePrice),
    compareAt:
      input.compareAt === "" || input.compareAt == null ? null : dec(input.compareAt),
    images: input.images,
    flavors: input.flavors,
    sizes: input.sizes,
    eggless: input.eggless,
    servesUpTo: input.servesUpTo ?? null,
    isFeatured: input.isFeatured,
    isAvailable: input.isAvailable,
  };

  if (input.id) {
    await prisma.product.update({ where: { id: input.id }, data });
  } else {
    await prisma.product.create({ data: { ...data, tenantId: tenant.id } });
  }
  revalidatePath("/admin/products");
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function deleteProduct(id: string) {
  const { tenant } = await requireAdmin();
  await prisma.product.deleteMany({ where: { id, tenantId: tenant.id } });
  revalidatePath("/admin/products");
  return { ok: true };
}

export async function toggleProductAvailability(id: string, isAvailable: boolean) {
  const { tenant } = await requireAdmin();
  await prisma.product.updateMany({ where: { id, tenantId: tenant.id }, data: { isAvailable } });
  revalidatePath("/admin/products");
  revalidatePath("/", "layout");
  return { ok: true };
}

// ─────────────── ORDERS ───────────────
export async function updateOrderStatus(
  id: string,
  status: "PLACED" | "CONFIRMED" | "BAKING" | "OUT_FOR_DELIVERY" | "DELIVERED" | "CANCELLED"
) {
  const { tenant } = await requireAdmin();
  await prisma.order.updateMany({ where: { id, tenantId: tenant.id }, data: { status } });

  // Email the customer about the new status (no-op if email/key missing).
  const order = await prisma.order.findFirst({
    where: { id, tenantId: tenant.id },
    select: { orderNo: true, customerEmail: true },
  });
  if (order) await notifyStatusChange(tenant, order, status);

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${id}`);
  return { ok: true };
}

export async function deleteOrder(id: string) {
  const { tenant } = await requireAdmin();
  // OrderItem rows cascade-delete with the order (see schema).
  await prisma.order.deleteMany({ where: { id, tenantId: tenant.id } });
  revalidatePath("/admin/orders");
  revalidatePath("/admin");
  return { ok: true };
}

export async function markOrderPaid(id: string) {
  const { tenant } = await requireAdmin();
  await prisma.order.updateMany({
    where: { id, tenantId: tenant.id },
    data: { paymentStatus: "PAID" },
  });
  revalidatePath(`/admin/orders/${id}`);
  return { ok: true };
}

// ─────────────── COUPONS ───────────────
export async function saveCoupon(input: {
  id?: string;
  code: string;
  type: "PERCENT" | "FLAT";
  value: string | number;
  minOrder: string | number;
  maxDiscount?: string | number | null;
  isActive: boolean;
}) {
  const { tenant } = await requireAdmin();
  const data = {
    code: input.code.toUpperCase().trim(),
    type: input.type,
    value: dec(input.value),
    minOrder: dec(input.minOrder),
    maxDiscount:
      input.maxDiscount === "" || input.maxDiscount == null ? null : dec(input.maxDiscount),
    isActive: input.isActive,
  };
  if (input.id) {
    await prisma.coupon.update({ where: { id: input.id }, data });
  } else {
    await prisma.coupon.create({ data: { ...data, tenantId: tenant.id } });
  }
  revalidatePath("/admin/coupons");
  return { ok: true };
}

export async function deleteCoupon(id: string) {
  const { tenant } = await requireAdmin();
  await prisma.coupon.deleteMany({ where: { id, tenantId: tenant.id } });
  revalidatePath("/admin/coupons");
  return { ok: true };
}
