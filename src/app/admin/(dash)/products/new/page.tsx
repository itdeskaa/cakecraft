import { requireAdmin } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/ui";
import { ProductForm } from "@/components/admin/ProductForm";

export const metadata = { title: "Add Cake" };

export default async function NewProductPage() {
  const { tenant } = await requireAdmin();
  const categories = await prisma.category.findMany({
    where: { tenantId: tenant.id },
    orderBy: { sortOrder: "asc" },
    select: { id: true, name: true },
  });

  return (
    <div>
      <PageHeader title="Add a cake" subtitle="Create a new cake for your menu." />
      <ProductForm categories={categories} />
    </div>
  );
}
