import type { Metadata } from "next";
import { Playfair_Display, Inter, Poppins, Fraunces, Space_Grotesk } from "next/font/google";
import { Toaster } from "sonner";
import { getCurrentTenant } from "@/lib/tenant";
import { hexToRgb, readableOn } from "@/lib/utils";
import "./globals.css";

const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair", display: "swap" });
const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces", display: "swap" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const poppins = Poppins({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-poppins", display: "swap" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-num", display: "swap" });

export async function generateMetadata(): Promise<Metadata> {
  const t = await getCurrentTenant();
  return {
    title: { default: `${t.name} — ${t.tagline ?? "Artisan Cakes"}`, template: `%s · ${t.name}` },
    description: t.about ?? "Freshly baked artisan cakes delivered to your door.",
    icons: t.faviconUrl ? { icon: t.faviconUrl } : undefined,
  };
}

const FONT_THEMES: Record<string, { display: string; sans: string }> = {
  classic: { display: "var(--font-playfair)", sans: "var(--font-inter)" },
  modern: { display: "var(--font-fraunces)", sans: "var(--font-inter)" },
  playful: { display: "var(--font-poppins)", sans: "var(--font-poppins)" },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const t = await getCurrentTenant();
  const fonts = FONT_THEMES[t.fontTheme] ?? FONT_THEMES.classic;

  // Build the per-tenant CSS variable theme.
  const themeVars = `
    :root {
      --brand: ${hexToRgb(t.primaryColor)};
      --brand-fg: ${readableOn(t.primaryColor)};
      --accent: ${hexToRgb(t.accentColor)};
      --accent-fg: ${readableOn(t.accentColor)};
      --font-display: ${fonts.display};
      --font-sans: ${fonts.sans};
    }
  `;

  return (
    <html
      lang="en"
      className={`${playfair.variable} ${fraunces.variable} ${inter.variable} ${poppins.variable} ${spaceGrotesk.variable}`}
    >
      <head>
        <style dangerouslySetInnerHTML={{ __html: themeVars }} />
      </head>
      <body>
        {children}
        <Toaster position="top-center" richColors closeButton />
      </body>
    </html>
  );
}
