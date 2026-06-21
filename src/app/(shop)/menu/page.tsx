import type { Metadata } from "next";
import { getCurrentTenant } from "@/lib/tenant";
import { getCategories, getProducts } from "@/lib/queries";
import { MenuClient } from "@/components/storefront/MenuClient";

export const metadata: Metadata = { title: "Our Cakes" };

export default async function MenuPage({
  searchParams,
}: {
  searchParams: { cat?: string };
}) {
  const tenant = await getCurrentTenant();
  const [categories, products] = await Promise.all([
    getCategories(tenant.id),
    getProducts(tenant.id),
  ]);

  return (
    <div className="container-x pt-28 pb-20">
      <header className="mb-8 text-center">
        <span className="eyebrow">The full collection</span>
        <h1 className="mt-3 text-5xl font-black sm:text-6xl">Our Cakes</h1>
        <p className="mx-auto mt-3 max-w-xl text-muted">
          Every cake is baked fresh to order. Choose a size, pick your flavour and add a personal message at checkout.
        </p>
      </header>

      <MenuClient
        products={products}
        categories={categories}
        symbol={tenant.currencySymbol}
        initialCat={searchParams.cat}
      />
    </div>
  );
}
