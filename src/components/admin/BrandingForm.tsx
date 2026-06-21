"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";
import { updateBranding } from "@/app/admin/actions";
import { ImageUploader } from "./ImageUploader";
import { Card, Field, Input, Textarea, Select } from "./ui";

type T = {
  name: string; tagline: string | null; about: string | null;
  logoUrl: string | null; heroImageUrl: string | null; faviconUrl: string | null;
  primaryColor: string; accentColor: string; fontTheme: string;
};

const FONTS = [
  { value: "classic", label: "Classic — elegant serif (Playfair)" },
  { value: "modern", label: "Modern — refined serif (Fraunces)" },
  { value: "playful", label: "Playful — rounded sans (Poppins)" },
];

const PALETTES = [
  { name: "Rose & Gold", primary: "#b91c5c", accent: "#e0a92e" },
  { name: "Chocolate", primary: "#3f2a1d", accent: "#c9962f" },
  { name: "Berry Purple", primary: "#7c3aed", accent: "#f59e0b" },
  { name: "Emerald", primary: "#0f766e", accent: "#eab308" },
  { name: "Midnight", primary: "#1e293b", accent: "#f43f5e" },
  { name: "Coral", primary: "#e11d48", accent: "#fb923c" },
];

export function BrandingForm({ tenant }: { tenant: T }) {
  const [f, setF] = useState(tenant);
  const [pending, start] = useTransition();
  const set = (k: keyof T, v: any) => setF((s) => ({ ...s, [k]: v }));

  function save() {
    start(async () => {
      await updateBranding({
        name: f.name, tagline: f.tagline ?? "", about: f.about ?? "",
        logoUrl: f.logoUrl, heroImageUrl: f.heroImageUrl, faviconUrl: f.faviconUrl,
        primaryColor: f.primaryColor, accentColor: f.accentColor, fontTheme: f.fontTheme,
      });
      toast.success("Branding saved — refresh the store to see changes");
    });
  }

  return (
    <div className="space-y-6">
      <Card>
        <h2 className="mb-5 text-lg font-bold">Brand identity</h2>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Store name"><Input value={f.name} onChange={(e) => set("name", e.target.value)} /></Field>
          <Field label="Tagline"><Input value={f.tagline ?? ""} onChange={(e) => set("tagline", e.target.value)} placeholder="Where every cake blossoms…" /></Field>
          <Field label="About / story" className="sm:col-span-2">
            <Textarea rows={3} value={f.about ?? ""} onChange={(e) => set("about", e.target.value)} />
          </Field>
        </div>
      </Card>

      <Card>
        <h2 className="mb-1 text-lg font-bold">Logo & imagery</h2>
        <p className="mb-5 text-sm text-muted">Upload your own logo and hero photo. PNG, JPG, WEBP or SVG up to 6 MB.</p>
        <div className="flex flex-wrap gap-8">
          <ImageUploader label="Logo" value={f.logoUrl} onChange={(u) => set("logoUrl", u)} aspect="round" hint="Square works best" />
          <ImageUploader label="Favicon" value={f.faviconUrl} onChange={(u) => set("faviconUrl", u)} aspect="square" hint="32×32 icon" />
          <ImageUploader label="Hero image" value={f.heroImageUrl} onChange={(u) => set("heroImageUrl", u)} aspect="wide" hint="Shown on homepage" />
        </div>
      </Card>

      <Card>
        <h2 className="mb-1 text-lg font-bold">Theme colours</h2>
        <p className="mb-5 text-sm text-muted">These drive the entire storefront theme.</p>

        <div className="mb-6 flex flex-wrap gap-2.5">
          {PALETTES.map((p) => (
            <button
              key={p.name}
              type="button"
              onClick={() => { set("primaryColor", p.primary); set("accentColor", p.accent); }}
              className="flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1.5 text-xs font-semibold transition hover:border-brand/40"
            >
              <span className="flex">
                <span className="h-4 w-4 rounded-full" style={{ background: p.primary }} />
                <span className="-ml-1 h-4 w-4 rounded-full ring-2 ring-surface" style={{ background: p.accent }} />
              </span>
              {p.name}
            </button>
          ))}
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Primary colour">
            <div className="flex items-center gap-3">
              <input type="color" value={f.primaryColor} onChange={(e) => set("primaryColor", e.target.value)} className="h-11 w-14 cursor-pointer rounded-lg border border-line bg-surface" />
              <Input value={f.primaryColor} onChange={(e) => set("primaryColor", e.target.value)} />
            </div>
          </Field>
          <Field label="Accent colour">
            <div className="flex items-center gap-3">
              <input type="color" value={f.accentColor} onChange={(e) => set("accentColor", e.target.value)} className="h-11 w-14 cursor-pointer rounded-lg border border-line bg-surface" />
              <Input value={f.accentColor} onChange={(e) => set("accentColor", e.target.value)} />
            </div>
          </Field>
          <Field label="Font theme" className="sm:col-span-2">
            <Select value={f.fontTheme} onChange={(e) => set("fontTheme", e.target.value)}>
              {FONTS.map((x) => <option key={x.value} value={x.value}>{x.label}</option>)}
            </Select>
          </Field>
        </div>

        {/* live preview */}
        <div className="mt-6 overflow-hidden rounded-2xl border border-line">
          <div className="flex items-center gap-3 p-5" style={{ background: f.primaryColor }}>
            <span className="grid h-10 w-10 place-items-center rounded-full text-lg" style={{ background: f.accentColor, color: "#1a1a1a" }}>🎂</span>
            <div>
              <p className="font-display text-lg font-bold text-white">{f.name || "Your Store"}</p>
              <p className="text-xs text-white/80">{f.tagline || "Your tagline here"}</p>
            </div>
            <button type="button" className="ml-auto rounded-full px-4 py-2 text-sm font-semibold" style={{ background: f.accentColor, color: "#1a1a1a" }}>Order Now</button>
          </div>
        </div>
      </Card>

      <div className="sticky bottom-4 z-10 flex justify-end">
        <button onClick={save} disabled={pending} className="btn-primary shadow-glow">
          {pending ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</> : <><Save className="h-4 w-4" /> Save branding</>}
        </button>
      </div>
    </div>
  );
}
