"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Loader2, Save, Banknote, CreditCard, Info } from "lucide-react";
import { updatePayments } from "@/app/admin/actions";
import { Card, Field, Input, Toggle } from "./ui";

export function PaymentsForm({
  codEnabled, onlinePayEnabled, razorpayKeyId, hasSecret,
}: {
  codEnabled: boolean; onlinePayEnabled: boolean; razorpayKeyId: string; hasSecret: boolean;
}) {
  const [cod, setCod] = useState(codEnabled);
  const [online, setOnline] = useState(onlinePayEnabled);
  const [keyId, setKeyId] = useState(razorpayKeyId);
  const [secret, setSecret] = useState(hasSecret ? "••••••••••••••••" : "");
  const [pending, start] = useTransition();

  function save() {
    if (online && !keyId) return toast.error("Add your Razorpay Key ID to enable online payments");
    start(async () => {
      await updatePayments({ codEnabled: cod, onlinePayEnabled: online, razorpayKeyId: keyId, razorpayKeySecret: secret });
      toast.success("Payment settings saved");
    });
  }

  return (
    <div className="space-y-6">
      <Card>
        <div className="mb-5 flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-emerald-50 text-emerald-600"><Banknote className="h-5 w-5" /></span>
          <div><h2 className="text-lg font-bold">Cash on Delivery</h2><p className="text-sm text-muted">Let customers pay in cash when the cake arrives.</p></div>
        </div>
        <Toggle checked={cod} onChange={setCod} label="Enable Cash on Delivery" desc="Customers can choose COD at checkout" />
      </Card>

      <Card>
        <div className="mb-5 flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-blue-50 text-blue-600"><CreditCard className="h-5 w-5" /></span>
          <div><h2 className="text-lg font-bold">Online Payments — Razorpay</h2><p className="text-sm text-muted">Accept cards & UPI. Get keys from your Razorpay dashboard.</p></div>
        </div>

        <Toggle checked={online} onChange={setOnline} label="Enable online payments" desc="Customers can pay by card / UPI via Razorpay" />

        <div className={`mt-5 grid gap-5 transition ${online ? "opacity-100" : "pointer-events-none opacity-50"}`}>
          <Field label="Razorpay Key ID" hint="Starts with rzp_test_… or rzp_live_…">
            <Input value={keyId} onChange={(e) => setKeyId(e.target.value)} placeholder="rzp_test_xxxxxxxxxxxx" />
          </Field>
          <Field label="Razorpay Key Secret" hint="Stored securely. Leave the dots to keep the current secret.">
            <Input type="password" value={secret} onChange={(e) => setSecret(e.target.value)} placeholder="Your key secret" />
          </Field>
        </div>

        <div className="mt-5 flex gap-2 rounded-2xl bg-blue-50 p-4 text-sm text-blue-800">
          <Info className="h-5 w-5 shrink-0" />
          <p>Per-store keys override the platform defaults. Use <b>test</b> keys while building, switch to <b>live</b> keys when you go live.</p>
        </div>
      </Card>

      <div className="flex justify-end">
        <button onClick={save} disabled={pending} className="btn-primary">
          {pending ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</> : <><Save className="h-4 w-4" /> Save payment settings</>}
        </button>
      </div>
    </div>
  );
}
