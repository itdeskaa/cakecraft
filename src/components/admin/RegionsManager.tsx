"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Plus, Trash2, Pencil, Loader2, Globe, Star, X } from "lucide-react";
import { saveRegion, deleteRegion } from "@/app/admin/actions";
import { Card, Field, Input, Toggle } from "./ui";

export type RegionRow = {
  id: string; name: string; flag: string; currency: string; currencySymbol: string;
  fxRate: number; deliveryFee: number; freeDeliveryAbove: number | null;
  isDefault: boolean; isActive: boolean;
};

const BLANK = {
  id: undefined as string | undefined,
  name: "", flag: "🌍", currency: "", currencySymbol: "",
  fxRate: "1", deliveryFee: "0", freeDeliveryAbove: "",
  isDefault: false, isActive: true,
};

export function RegionsManager({ regions, baseCurrency }: { regions: RegionRow[]; baseCurrency: string }) {
  const [form, setForm] = useState<typeof BLANK>(BLANK);
  const [pending, start] = useTransition();
  const editing = Boolean(form.id);
  const set = (k: keyof typeof BLANK, v: any) => setForm((s) => ({ ...s, [k]: v }));

  function edit(r: RegionRow) {
    setForm({
      id: r.id, name: r.name, flag: r.flag || "🌍", currency: r.currency, currencySymbol: r.currencySymbol,
      fxRate: String(r.fxRate), deliveryFee: String(r.deliveryFee),
      freeDeliveryAbove: r.freeDeliveryAbove != null ? String(r.freeDeliveryAbove) : "",
      isDefault: r.isDefault, isActive: r.isActive,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function save() {
    if (!form.name || !form.currency || !form.currencySymbol) return toast.error("Name, currency code and symbol are required");
    start(async () => {
      await saveRegion({
        id: form.id, name: form.name, flag: form.flag, currency: form.currency.toUpperCase(),
        currencySymbol: form.currencySymbol, fxRate: form.fxRate, deliveryFee: form.deliveryFee,
        freeDeliveryAbove: form.freeDeliveryAbove || null, isDefault: form.isDefault, isActive: form.isActive,
      });
      toast.success(editing ? "Region updated" : "Region added");
      setForm(BLANK);
    });
  }

  function remove(r: RegionRow) {
    if (r.isDefault) return toast.error("Set another region as default before deleting this one");
    if (!confirm(`Delete "${r.name}"?`)) return;
    start(async () => { await deleteRegion(r.id); toast.success("Region deleted"); });
  }

  const sample = 100; // base amount preview
  const preview = (Number(form.fxRate) || 1) * sample;

  return (
    <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
      {/* Form */}
      <Card className="h-fit lg:sticky lg:top-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">{editing ? "Edit region" : "Add region"}</h2>
          {editing && <button onClick={() => setForm(BLANK)} className="grid h-8 w-8 place-items-center rounded-lg text-muted hover:bg-cream"><X className="h-4 w-4" /></button>}
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-[64px_1fr] gap-3">
            <Field label="Flag"><Input value={form.flag} onChange={(e) => set("flag", e.target.value)} placeholder="🇦🇪" className="text-center text-lg" /></Field>
            <Field label="Region name"><Input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="United Arab Emirates" /></Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Currency code"><Input value={form.currency} onChange={(e) => set("currency", e.target.value)} placeholder="AED" /></Field>
            <Field label="Symbol"><Input value={form.currencySymbol} onChange={(e) => set("currencySymbol", e.target.value)} placeholder="AED / $ / ₹" /></Field>
          </div>
          <Field label={`Exchange rate (1 ${baseCurrency} = ? ${form.currency || "—"})`} hint={`Preview: ${baseCurrency} ${sample} → ${form.currencySymbol || "?"} ${preview.toLocaleString()}`}>
            <Input value={form.fxRate} onChange={(e) => set("fxRate", e.target.value)} placeholder="1" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Delivery fee" hint="in this currency"><Input value={form.deliveryFee} onChange={(e) => set("deliveryFee", e.target.value)} /></Field>
            <Field label="Free delivery above" hint="optional"><Input value={form.freeDeliveryAbove} onChange={(e) => set("freeDeliveryAbove", e.target.value)} placeholder="—" /></Field>
          </div>
          <Toggle checked={form.isActive} onChange={(v) => set("isActive", v)} label="Active" desc="Show in the region switcher" />
          <Toggle checked={form.isDefault} onChange={(v) => set("isDefault", v)} label="Default region" desc="Pre-selected for new visitors" />
          <button onClick={save} disabled={pending} className="btn-primary w-full">
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : editing ? <Pencil className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {editing ? "Update region" : "Add region"}
          </button>
        </div>
      </Card>

      {/* List */}
      <div className="space-y-3">
        {regions.length === 0 ? (
          <Card><p className="py-8 text-center text-sm text-muted">No regions yet. Add your first one.</p></Card>
        ) : regions.map((r) => (
          <Card key={r.id} className="flex items-center gap-4 !py-4">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-brand-soft text-xl">{r.flag || <Globe className="h-5 w-5 text-brand" />}</span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="truncate font-bold">{r.name}</p>
                {r.isDefault && <span className="inline-flex items-center gap-1 rounded-full bg-accent/15 px-2 py-0.5 text-[11px] font-semibold text-accent-fg"><Star className="h-3 w-3 fill-accent text-accent" /> Default</span>}
                {!r.isActive && <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-500">Hidden</span>}
              </div>
              <p className="text-xs text-muted">{r.currency} ({r.currencySymbol}) · rate {r.fxRate} · delivery {r.currencySymbol} {r.deliveryFee}{r.freeDeliveryAbove ? ` · free above ${r.currencySymbol} ${r.freeDeliveryAbove}` : ""}</p>
            </div>
            <button onClick={() => edit(r)} className="grid h-9 w-9 place-items-center rounded-lg text-muted hover:bg-brand-soft hover:text-brand"><Pencil className="h-4 w-4" /></button>
            <button onClick={() => remove(r)} className="grid h-9 w-9 place-items-center rounded-lg text-muted hover:bg-red-50 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
          </Card>
        ))}
      </div>
    </div>
  );
}
