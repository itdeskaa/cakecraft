import Link from "next/link";
import { Plus } from "lucide-react";
import { requireAdmin } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/ui";
import { ProductsTable } from "@/components/admin/ProductsTable";

export const metadata = { title: "Cakes / Menu" };

export default async function ProductsPage() {
  const { tenant } = await requireAdmin();
  const products = await prisma.product.findMany({
    where: { tenantId: tenant.id },
    orderBy: [{ isFeatured: "desc" }, { sortOrder: "asc" }],
    include: { category: true },
  });

  return (
    <div>
      <PageHeader
        title="Cakes / Menu"
        subtitle={`${products.length} cake${products.length !== 1 ? "s" : ""} on your menu`}
        action={<Link href="/admin/products/new" className="btn-primary"><Plus className="h-4 w-4" /> Add cake</Link>}
      />
      <ProductsTable
        symbol={tenant.currencySymbol}
        products={products.map((p) => ({
          id: p.id,
          name: p.name,
          image: (p.images as string[])?.[0],
          category: p.category?.name,
          basePrice: Number(p.basePrice),
          isFeatured: p.isFeatured,
          isAvailable: p.isAvailable,
          rating: Number(p.rating),
        }))}
      />
    </div>
  );
}
