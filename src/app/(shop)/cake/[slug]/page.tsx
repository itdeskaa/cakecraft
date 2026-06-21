import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCurrentTenant } from "@/lib/tenant";
import { getProductBySlug } from "@/lib/queries";
import { ProductDetail } from "@/components/storefront/ProductDetail";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const tenant = await getCurrentTenant();
  const product = await getProductBySlug(tenant.id, params.slug);
  return { title: product?.name ?? "Cake", description: product?.shortDesc ?? undefined };
}

export default async function CakePage({ params }: { params: { slug: string } }) {
  const tenant = await getCurrentTenant();
  const product = await getProductBySlug(tenant.id, params.slug);
  if (!product) notFound();

  return <ProductDetail product={product} symbol={tenant.currencySymbol} />;
}
