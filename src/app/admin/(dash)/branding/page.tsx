import { requireAdmin } from "@/lib/session";
import { PageHeader } from "@/components/admin/ui";
import { BrandingForm } from "@/components/admin/BrandingForm";

export const metadata = { title: "Branding & Logo" };

export default async function BrandingPage() {
  const { tenant } = await requireAdmin();
  return (
    <div>
      <PageHeader title="Branding & Logo" subtitle="Make this store look like your company. Upload a logo, pick your colours and fonts." />
      <BrandingForm
        tenant={{
          name: tenant.name,
          tagline: tenant.tagline,
          about: tenant.about,
          logoUrl: tenant.logoUrl,
          heroImageUrl: tenant.heroImageUrl,
          faviconUrl: tenant.faviconUrl,
          primaryColor: tenant.primaryColor,
          accentColor: tenant.accentColor,
          fontTheme: tenant.fontTheme,
        }}
      />
    </div>
  );
}
