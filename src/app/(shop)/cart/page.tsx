import type { Metadata } from "next";
import { getCurrentTenant } from "@/lib/tenant";
import { CartView } from "@/components/storefront/CartView";

export const metadata: Metadata = { title: "Your Cart" };

export default async function CartPage() {
  const t = await getCurrentTenant();
  return (
    <CartView
      settings={{
        symbol: t.currencySymbol,
        deliveryFee: Number(t.deliveryFee),
        freeDeliveryAbove: t.freeDeliveryAbove ? Number(t.freeDeliveryAbove) : null,
        minOrderValue: Number(t.minOrderValue),
        taxPercent: Number(t.taxPercent),
      }}
    />
  );
}
