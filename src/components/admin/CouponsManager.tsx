"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Plus, Trash2, Loader2, Ticket } from "lucide-react";
import { saveCoupon, deleteCoupon } from "@/app/admin/actions";
import { Card, Field, Input, Select, Toggle } from "./ui";

type Coupon = {
  id: string; code: string; type: "PERCENT" | "FLAT"; value: number;
  minOrder: number; maxDiscount: number | null; isActive: boolean;
};

export function CouponsManager({ coupons, symbol }: { coupons: Coupon[]; symbol: string }) {
  const [pending, start] = useTransition();
  const [code, setCode] = useState("");
  const [type, setType] = useState<"PERCENT" | "FLAT">("PERCENT");
  const [value, setValue] = useState("10");
  const [minOrder, setMinOrder] = useState("100");
  const [maxDiscount, setMaxDiscount] = useState("");
  const [isActive, setIsActive] = useState(true);

  function create() {
    if (!code.trim()) return toast.error("Enter a coupon code");
    start(async () => {
      await saveCoupon({ code, type, value, minOrder, maxDiscount: maxDiscount || null, isActive });
      setCode("");
      toast.success("Coupon saved");
    });
  }
  function remove(id: string) {
    start(async () => { await deleteCoupon(id); toast.success("Coupon deleted"); });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
      <Card className="h-fit">
        <h2 className="mb-4 text-lg font-bold">New coupon</h2>
        <div className="space-y-4">
          <Field label="Code"><Input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="WELCOME10" /></Field>
          <Field label="Type">
            <Select value={type} onChange={(e) => setType(e.target.value as any)}>
              <option value="PERCENT">Percentage (%)</option>
              <option value="FLAT">Flat amount</option>
            </Select>
          </Field>
          <Field label={type === "PERCENT" ? "Discount %" : `Discount (${symbol})`}><Input type="number" value={value} onChange={(e) => setValue(e.target.value)} /></Field>
          <Field label="Minimum order"><Input type="number" value={minOrder} onChange={(e) => setMinOrder(e.target.value)} /></Field>
          {type === "PERCENT" && <Field label="Max discount" hint="Optional cap"><Input type="number" value={maxDiscount} onChange={(e) => setMaxDiscount(e.target.value)} placeholder="50" /></Field>}
          <Toggle checked={isActive} onChange={setIsActive} label="Active" />
          <button onClick={create} disabled={pending} className="btn-primary w-full">
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Save coupon
          </button>
        </div>
      </Card>

      <div className="space-y-3">
        {coupons.length === 0 ? (
          <Card><p className="py-8 text-center text-sm text-muted">No coupons yet.</p></Card>
        ) : coupons.map((c) => (
          <Card key={c.id} className="flex items-center gap-4 !py-4">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-soft text-brand"><Ticket className="h-5 w-5" /></span>
            <div className="flex-1">
              <p className="font-display text-lg font-bold">{c.code}</p>
              <p className="text-xs text-muted">
                {c.type === "PERCENT" ? `${c.value}% off` : `${symbol} ${c.value} off`} · min {symbol} {c.minOrder}
                {c.maxDiscount ? ` · max ${symbol} ${c.maxDiscount}` : ""}
              </p>
            </div>
            <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${c.isActive ? "bg-emerald-50 text-emerald-700 ring-emerald-200" : "bg-slate-50 text-slate-500 ring-slate-200"}`}>
              {c.isActive ? "Active" : "Inactive"}
            </span>
            <button onClick={() => remove(c.id)} className="grid h-9 w-9 place-items-center rounded-lg text-muted hover:bg-red-50 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
          </Card>
        ))}
      </div>
    </div>
  );
}
