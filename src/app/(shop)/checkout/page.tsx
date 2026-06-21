import type { Metadata } from "next";
import { getCurrentTenant } from "@/lib/tenant";
import { CheckoutView } from "@/components/storefront/CheckoutView";

export const metadata: Metadata = { title: "Checkout" };

export default async function CheckoutPage() {
  const t = await getCurrentTenant();
  return (
    <CheckoutView
      settings={{
        symbol: t.currencySymbol,
        currency: t.currency,
        deliveryFee: Number(t.deliveryFee),
        freeDeliveryAbove: t.freeDeliveryAbove ? Number(t.freeDeliveryAbove) : null,
        taxPercent: Number(t.taxPercent),
        codEnabled: t.codEnabled,
        onlinePayEnabled: t.onlinePayEnabled,
        storeName: t.name,
      }}
    />
  );
}
