import { requireAdmin } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/ui";
import { CategoriesManager } from "@/components/admin/CategoriesManager";

export const metadata = { title: "Categories" };

export default async function CategoriesPage() {
  const { tenant } = await requireAdmin();
  const cats = await prisma.category.findMany({
    where: { tenantId: tenant.id },
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { products: true } } },
  });

  return (
    <div>
      <PageHeader title="Categories" subtitle="Organise your cakes into categories shown across the store." />
      <CategoriesManager categories={cats.map((c) => ({ id: c.id, name: c.name, sortOrder: c.sortOrder, isActive: c.isActive, count: c._count.products }))} />
    </div>
  );
}
