import { Navbar } from "@/components/storefront/Navbar";
import { Footer } from "@/components/storefront/Footer";
import { RegionProvider } from "@/components/storefront/RegionProvider";
import { getCurrentTenant } from "@/lib/tenant";
import { getCategories } from "@/lib/queries";
import { getActiveRegions } from "@/lib/region";

export default async function ShopLayout({ children }: { children: React.ReactNode }) {
  const tenant = await getCurrentTenant();
  const [categories, regions] = await Promise.all([
    getCategories(tenant.id),
    getActiveRegions(tenant.id),
  ]);
  const navCats = categories.map((c) => ({ name: c.name, slug: c.slug }));

  return (
    <>
      <RegionProvider regions={regions} />
      <Navbar name={tenant.name} logoUrl={tenant.logoUrl} phone={tenant.phone} categories={navCats} />
      <main className="min-h-screen">{children}</main>
      <Footer tenant={tenant} categories={navCats} />
    </>
  );
}
