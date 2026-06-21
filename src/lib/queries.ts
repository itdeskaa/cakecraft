import { cache } from "./cache";
import { prisma } from "./prisma";

/** Serialise Prisma Decimal/Date into plain JSON-safe objects for client components. */
function plain<T>(v: T): T {
  return JSON.parse(JSON.stringify(v));
}

export const getCategories = cache(async (tenantId: string) => {
  const cats = await prisma.category.findMany({
    where: { tenantId, isActive: true },
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { products: true } } },
  });
  return plain(cats);
});

export const getProducts = cache(
  async (tenantId: string, opts?: { categorySlug?: string; featured?: boolean; take?: number }) => {
    const products = await prisma.product.findMany({
      where: {
        tenantId,
        isAvailable: true,
        ...(opts?.featured ? { isFeatured: true } : {}),
        ...(opts?.categorySlug ? { category: { slug: opts.categorySlug } } : {}),
      },
      include: { category: true },
      orderBy: [{ isFeatured: "desc" }, { sortOrder: "asc" }],
      take: opts?.take,
    });
    return plain(products);
  }
);

export const getProductBySlug = cache(async (tenantId: string, slug: string) => {
  const product = await prisma.product.findFirst({
    where: { tenantId, slug, isAvailable: true },
    include: { category: true },
  });
  return product ? plain(product) : null;
});

export type ProductDTO = Awaited<ReturnType<typeof getProducts>>[number];
export type CategoryDTO = Awaited<ReturnType<typeof getCategories>>[number];
