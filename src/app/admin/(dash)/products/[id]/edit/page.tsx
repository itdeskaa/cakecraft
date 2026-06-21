import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/ui";
import { ProductForm } from "@/components/admin/ProductForm";

export const metadata = { title: "Edit Cake" };

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const { tenant } = await requireAdmin();
  const [product, categories] = await Promise.all([
    prisma.product.findFirst({ where: { id: params.id, tenantId: tenant.id } }),
    prisma.category.findMany({ where: { tenantId: tenant.id }, orderBy: { sortOrder: "asc" }, select: { id: true, name: true } }),
  ]);
  if (!product) notFound();

  // serialise Decimals
  const dto = JSON.parse(JSON.stringify(product));

  return (
    <div>
      <PageHeader title="Edit cake" subtitle={product.name} />
      <ProductForm categories={categories} product={dto} />
    </div>
  );
}
