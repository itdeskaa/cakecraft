"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2, Loader2 } from "lucide-react";
import { deleteOrder } from "@/app/admin/actions";

export function DeleteOrderButton({ id, orderNo }: { id: string; orderNo: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  function remove() {
    if (!confirm(`Delete order ${orderNo}? This permanently removes it and cannot be undone.`)) return;
    start(async () => {
      await deleteOrder(id);
      toast.success(`Order ${orderNo} deleted`);
      router.push("/admin/orders");
      router.refresh();
    });
  }

  return (
    <button
      onClick={remove}
      disabled={pending}
      className="mt-3 flex w-full items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold text-red-600 ring-1 ring-red-200 transition hover:bg-red-50 disabled:opacity-50"
    >
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />} Delete order
    </button>
  );
}
