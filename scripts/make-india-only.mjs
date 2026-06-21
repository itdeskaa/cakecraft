// Converts the whole platform to India-only (INR). Idempotent-ish:
//  - sets every tenant currency to INR (₹)
//  - converts product & delivery prices from AED to INR (×FX, rounded to ₹10)
//  - keeps a single India region (fxRate = 1, default) and deletes the rest
//
// Run once:  node scripts/make-india-only.mjs
import { PrismaClient, Prisma } from "@prisma/client";
const prisma = new PrismaClient();

const FX = 22.7;                 // AED → INR
const r10 = (n) => Math.round((Number(n) * FX) / 10) * 10; // convert + round to ₹10
const D = (n) => new Prisma.Decimal(n);

async function main() {
  const tenants = await prisma.tenant.findMany();
  for (const t of tenants) {
    const already = t.currency === "INR";
    const conv = (n) => (already ? Math.round(Number(n)) : r10(n)); // don't double-convert

    const deliveryFee = conv(t.deliveryFee);
    const freeAbove = t.freeDeliveryAbove != null ? conv(t.freeDeliveryAbove) : null;
    const minOrder = conv(t.minOrderValue);

    await prisma.tenant.update({
      where: { id: t.id },
      data: {
        currency: "INR",
        currencySymbol: "₹",
        deliveryFee: D(deliveryFee),
        freeDeliveryAbove: freeAbove != null ? D(freeAbove) : null,
        minOrderValue: D(minOrder),
      },
    });

    // Products
    if (!already) {
      const products = await prisma.product.findMany({ where: { tenantId: t.id } });
      for (const p of products) {
        const sizes = Array.isArray(p.sizes)
          ? p.sizes.map((s) => ({ label: s.label, price: r10(s.price) }))
          : p.sizes;
        await prisma.product.update({
          where: { id: p.id },
          data: {
            basePrice: D(r10(p.basePrice)),
            compareAt: p.compareAt != null ? D(r10(p.compareAt)) : null,
            sizes,
          },
        });
      }
    }

    // Regions → keep only India, fxRate 1, default
    let india = await prisma.region.findFirst({ where: { tenantId: t.id, currency: "INR" } });
    await prisma.region.deleteMany({ where: { tenantId: t.id, ...(india ? { NOT: { id: india.id } } : {}) } });
    if (india) {
      await prisma.region.update({
        where: { id: india.id },
        data: {
          name: "India", flag: "🇮🇳", currency: "INR", currencySymbol: "₹",
          fxRate: D(1), deliveryFee: D(deliveryFee),
          freeDeliveryAbove: freeAbove != null ? D(freeAbove) : null,
          isDefault: true, isActive: true, sortOrder: 0,
        },
      });
    } else {
      await prisma.region.create({
        data: {
          tenantId: t.id, name: "India", flag: "🇮🇳", currency: "INR", currencySymbol: "₹",
          fxRate: D(1), deliveryFee: D(deliveryFee),
          freeDeliveryAbove: freeAbove != null ? D(freeAbove) : null,
          isDefault: true, isActive: true, sortOrder: 0,
        },
      });
    }

    console.log(`✓ ${t.name}: INR set, delivery ₹${deliveryFee}, single India region`);
  }
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
