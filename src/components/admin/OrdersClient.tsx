"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { formatMoney } from "@/lib/utils";
import { StatusBadge } from "./ui";
import { ChevronRight, Trash2, Loader2 } from "lucide-react";
import { deleteOrder } from "@/app/admin/actions";

type Row = {
  id: string; orderNo: string; customerName: string; total: number;
  status: string; paymentMethod: string; paymentStatus: string; items: number; createdAt: string;
};

const FILTERS = ["ALL", "PLACED", "CONFIRMED", "BAKING", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"];

export function OrdersClient({ orders, symbol }: { orders: Row[]; symbol: string }) {
  const [filter, setFilter] = useState("ALL");
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [, start] = useTransition();
  const list = filter === "ALL" ? orders : orders.filter((o) => o.status === filter);

  function remove(e: React.MouseEvent, id: string, orderNo: string) {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm(`Delete order ${orderNo}? This cannot be undone.`)) return;
    setPendingId(id);
    start(async () => {
      await deleteOrder(id);
      toast.success(`Order ${orderNo} deleted`);
      setPendingId(null);
    });
  }

  return (
    <div>
      <div className="mb-5 flex flex-wrap gap-2">
        {FILTERS.map((f) => {
          const n = f === "ALL" ? orders.length : orders.filter((o) => o.status === f).length;
          return (
            <button key={f} onClick={() => setFilter(f)} className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${filter === f ? "bg-brand text-brand-fg" : "bg-surface text-ink/70 ring-1 ring-line hover:text-brand"}`}>
              {f.replace(/_/g, " ")} <span className="opacity-70">({n})</span>
            </button>
          );
        })}
      </div>

      <div className="overflow-hidden rounded-3xl border border-line bg-surface shadow-sm">
        {list.length === 0 ? (
          <p className="p-10 text-center text-sm text-muted">No orders in this view.</p>
        ) : (
          <div className="divide-y divide-line">
            {list.map((o) => (
              <Link key={o.id} href={`/admin/orders/${o.id}`} className="flex items-center gap-4 px-5 py-4 transition hover:bg-cream">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{o.orderNo} · {o.customerName}</p>
                  <p className="text-xs text-muted">{o.items} item{o.items !== 1 ? "s" : ""} · {o.paymentMethod} · {new Date(o.createdAt).toLocaleString()}</p>
                </div>
                <StatusBadge status={o.paymentStatus} />
                <StatusBadge status={o.status} />
                <span className="num w-24 text-right font-bold">{formatMoney(o.total, symbol)}</span>
                <button
                  onClick={(e) => remove(e, o.id, o.orderNo)}
                  disabled={pendingId === o.id}
                  aria-label="Delete order"
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-muted transition hover:bg-red-50 hover:text-red-500"
                >
                  {pendingId === o.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                </button>
                <ChevronRight className="h-4 w-4 text-muted" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
