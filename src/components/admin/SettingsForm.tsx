"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Loader2, Save, Truck, Store } from "lucide-react";
import { updateStoreSettings } from "@/app/admin/actions";
import { Card, Field, Input } from "./ui";

type T = {
  email: string; phone: string; whatsapp: string; address: string; city: string;
  currency: string; currencySymbol: string;
  deliveryFee: string; freeDeliveryAbove: string; minOrderValue: string; taxPercent: string;
};

export function SettingsForm({ initial }: { initial: T }) {
  const [f, setF] = useState(initial);
  const [pending, start] = useTransition();
  const set = (k: keyof T) => (e: React.ChangeEvent<HTMLInputElement>) => setF((s) => ({ ...s, [k]: e.target.value }));

  function save() {
    start(async () => {
      await updateStoreSettings({
        email: f.email, phone: f.phone, whatsapp: f.whatsapp, address: f.address, city: f.city,
        currency: f.currency, currencySymbol: f.currencySymbol,
        deliveryFee: f.deliveryFee, freeDeliveryAbove: f.freeDeliveryAbove || null,
        minOrderValue: f.minOrderValue, taxPercent: f.taxPercent,
      });
      toast.success("Store settings saved");
    });
  }

  return (
    <div className="space-y-6">
      <Card>
        <div className="mb-5 flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-soft text-brand"><Store className="h-5 w-5" /></span>
          <h2 className="text-lg font-bold">Contact details</h2>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Email"><Input value={f.email} onChange={set("email")} placeholder="hello@store.ae" /></Field>
          <Field label="Phone"><Input value={f.phone} onChange={set("phone")} placeholder="+971 …" /></Field>
          <Field label="WhatsApp number"><Input value={f.whatsapp} onChange={set("whatsapp")} placeholder="9715…" /></Field>
          <Field label="City"><Input value={f.city} onChange={set("city")} placeholder="Dubai" /></Field>
          <Field label="Address" className="sm:col-span-2"><Input value={f.address} onChange={set("address")} placeholder="Street, area, city" /></Field>
        </div>
      </Card>

      <Card>
        <div className="mb-5 flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-amber-50 text-amber-600"><Truck className="h-5 w-5" /></span>
          <h2 className="text-lg font-bold">Delivery & pricing</h2>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Currency code"><Input value={f.currency} onChange={set("currency")} placeholder="INR" /></Field>
          <Field label="Currency symbol"><Input value={f.currencySymbol} onChange={set("currencySymbol")} placeholder="₹" /></Field>
          <Field label="Delivery fee" hint="Flat fee per order"><Input type="number" value={f.deliveryFee} onChange={set("deliveryFee")} /></Field>
          <Field label="Free delivery above" hint="Leave empty to disable"><Input type="number" value={f.freeDeliveryAbove} onChange={set("freeDeliveryAbove")} placeholder="200" /></Field>
          <Field label="Minimum order value"><Input type="number" value={f.minOrderValue} onChange={set("minOrderValue")} /></Field>
          <Field label="Tax / VAT (%)"><Input type="number" value={f.taxPercent} onChange={set("taxPercent")} placeholder="0" /></Field>
        </div>
      </Card>

      <div className="flex justify-end">
        <button onClick={save} disabled={pending} className="btn-primary">
          {pending ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</> : <><Save className="h-4 w-4" /> Save settings</>}
        </button>
      </div>
    </div>
  );
}
