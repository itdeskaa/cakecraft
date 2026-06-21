"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Check, Loader2 } from "lucide-react";
import { updateOrderStatus, markOrderPaid } from "@/app/admin/actions";

const FLOW = ["PLACED", "CONFIRMED", "BAKING", "OUT_FOR_DELIVERY", "DELIVERED"] as const;
const LABELS: Record<string, string> = {
  PLACED: "Placed", CONFIRMED: "Confirmed", BAKING: "Baking",
  OUT_FOR_DELIVERY: "Out for delivery", DELIVERED: "Delivered",
};

export function OrderStatusControl({
  id, status, paymentStatus,
}: {
  id: string; status: string; paymentStatus: string;
}) {
  const [pending, start] = useTransition();
  const currentIdx = FLOW.indexOf(status as any);

  function setStatus(s: (typeof FLOW)[number] | "CANCELLED") {
    start(async () => { await updateOrderStatus(id, s); toast.success(`Order marked ${LABELS[s] ?? s}`); });
  }
  function paid() {
    start(async () => { await markOrderPaid(id); toast.success("Payment marked as received"); });
  }

  return (
    <div>
      {/* Stepper */}
      <ol className="relative space-y-1">
        {FLOW.map((s, i) => {
          const done = i <= currentIdx && status !== "CANCELLED";
          const isNext = i === currentIdx + 1 && status !== "CANCELLED";
          return (
            <li key={s} className="flex items-center gap-3">
              <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-bold ${done ? "bg-brand text-brand-fg" : "bg-cream text-muted ring-1 ring-line"}`}>
                {done ? <Check className="h-4 w-4" /> : i + 1}
              </span>
              <span className={`flex-1 text-sm font-medium ${done ? "" : "text-muted"}`}>{LABELS[s]}</span>
              {isNext && (
                <button onClick={() => setStatus(s)} disabled={pending} className="btn-primary !px-3 !py-1.5 text-xs">
                  {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Mark"}
                </button>
              )}
            </li>
          );
        })}
      </ol>

      <div className="mt-5 flex flex-wrap gap-2 border-t border-line pt-5">
        {paymentStatus !== "PAID" && (
          <button onClick={paid} disabled={pending} className="btn-ghost !py-2 text-sm">Mark as paid</button>
        )}
        {status !== "CANCELLED" && status !== "DELIVERED" && (
          <button onClick={() => setStatus("CANCELLED")} disabled={pending} className="rounded-full px-4 py-2 text-sm font-semibold text-red-600 ring-1 ring-red-200 transition hover:bg-red-50">
            Cancel order
          </button>
        )}
      </div>
    </div>
  );
}
