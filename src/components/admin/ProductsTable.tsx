"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Pencil, Trash2, Star } from "lucide-react";
import { deleteProduct, toggleProductAvailability } from "@/app/admin/actions";
import { formatMoney } from "@/lib/utils";
import { Toggle } from "./ui";

type Row = {
  id: string; name: string; image?: string; category?: string;
  basePrice: number; isFeatured: boolean; isAvailable: boolean; rating: number;
};

export function ProductsTable({ products, symbol }: { products: Row[]; symbol: string }) {
  const [, start] = useTransition();
  const [q, setQ] = useState("");
  const filtered = products.filter((p) => p.name.toLowerCase().includes(q.toLowerCase()));

  function remove(id: string, name: string) {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    start(async () => { await deleteProduct(id); toast.success("Cake deleted"); });
  }
  function toggle(id: string, val: boolean) {
    start(async () => { await toggleProductAvailability(id, val); });
  }

  return (
    <div>
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search cakes…" className="mb-4 w-full max-w-xs rounded-xl border border-line bg-surface px-4 py-2.5 text-sm outline-none focus:border-brand/50" />

      <div className="overflow-hidden rounded-3xl border border-line bg-surface shadow-sm">
        {filtered.length === 0 ? (
          <p className="p-10 text-center text-sm text-muted">No cakes found. Add your first cake.</p>
        ) : (
          <div className="divide-y divide-line">
            {filtered.map((p) => (
              <div key={p.id} className="flex items-center gap-4 px-4 py-3 sm:px-5">
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-brand-soft">
                  {p.image ? <Image src={p.image} alt={p.name} fill sizes="56px" className="object-cover" /> : <div className="grid h-full place-items-center text-2xl">🎂</div>}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate font-semibold">{p.name}</p>
                    {p.isFeatured && <Star className="h-3.5 w-3.5 shrink-0 fill-accent text-accent" />}
                  </div>
                  <p className="text-xs text-muted">{p.category ?? "Uncategorised"} · {formatMoney(p.basePrice, symbol)}</p>
                </div>
                <div className="hidden w-40 shrink-0 sm:block">
                  <Toggle checked={p.isAvailable} onChange={(v) => toggle(p.id, v)} label={p.isAvailable ? "Available" : "Hidden"} />
                </div>
                <Link href={`/admin/products/${p.id}/edit`} className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-muted hover:bg-brand-soft hover:text-brand"><Pencil className="h-4 w-4" /></Link>
                <button onClick={() => remove(p.id, p.name)} className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-muted hover:bg-red-50 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
