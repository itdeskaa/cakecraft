"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Script from "next/script";
import { motion } from "framer-motion";
import { Banknote, CreditCard, Loader2, Lock, ShieldCheck } from "lucide-react";
import { useCart } from "@/lib/cart-store";
import { useMoney, useCurrentRegion } from "@/lib/region-store";
import { toast } from "sonner";

type Settings = {
  symbol: string;
  currency: string;
  deliveryFee: number;
  freeDeliveryAbove: number | null;
  taxPercent: number;
  codEnabled: boolean;
  onlinePayEnabled: boolean;
  storeName: string;
};

declare global {
  interface Window { Razorpay: any }
}

export function CheckoutView({ settings }: { settings: Settings }) {
  const router = useRouter();
  const items = useCart((s) => s.items);
  const subtotalBase = useCart((s) => s.subtotal());
  const clear = useCart((s) => s.clear);

  const region = useCurrentRegion();
  const money = useMoney(); // base → region currency
  const rate = region?.fxRate ?? 1;
  const symbol = region?.currencySymbol ?? settings.symbol;
  const fmt = (n: number) =>
    `${symbol} ${n.toLocaleString("en-US", { minimumFractionDigits: n % 1 === 0 ? 0 : 2, maximumFractionDigits: 2 })}`;

  const [method, setMethod] = useState<"COD" | "RAZORPAY">(
    settings.codEnabled ? "COD" : "RAZORPAY"
  );
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    customerName: "", customerPhone: "", customerEmail: "",
    address: "", city: "", deliveryDate: "", deliverySlot: "Morning (9am–12pm)", notes: "",
  });

  const deliveryFee = region?.deliveryFee ?? settings.deliveryFee;
  const freeAbove = region?.freeDeliveryAbove ?? settings.freeDeliveryAbove;
  const subtotal = subtotalBase * rate; // region currency
  const freeQualified = freeAbove != null && subtotal >= freeAbove;
  const delivery = freeQualified || items.length === 0 ? 0 : deliveryFee;
  const tax = (subtotal * settings.taxPercent) / 100;
  const total = subtotal + delivery + tax;

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function placeOrder() {
    if (items.length === 0) return toast.error("Your cart is empty");
    if (!form.customerName || !form.customerPhone || !form.address)
      return toast.error("Please fill in name, phone and address");

    setLoading(true);
    try {
      const payload = {
        ...form,
        paymentMethod: method,
        regionId: region?.id,
        items: items.map((i) => ({
          productId: i.productId, flavor: i.flavor, size: i.size, message: i.message, quantity: i.quantity,
        })),
      };
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Checkout failed");

      if (data.method === "COD") {
        clear();
        router.push(`/order-confirmed?no=${data.orderNo}`);
        return;
      }

      // Razorpay flow
      const rzp = new window.Razorpay({
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: data.name,
        description: `Order ${data.orderNo}`,
        order_id: data.razorpayOrderId,
        prefill: { name: form.customerName, email: form.customerEmail, contact: form.customerPhone },
        theme: { color: "#b91c5c" },
        handler: async (resp: any) => {
          const v = await fetch("/api/payment/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              orderId: data.orderId,
              razorpayOrderId: resp.razorpay_order_id,
              razorpayPaymentId: resp.razorpay_payment_id,
              signature: resp.razorpay_signature,
            }),
          });
          const vd = await v.json();
          if (v.ok) {
            clear();
            router.push(`/order-confirmed?no=${vd.orderNo}`);
          } else {
            toast.error("Payment could not be verified");
          }
        },
        modal: { ondismiss: () => setLoading(false) },
      });
      rzp.open();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container-x pt-28 pb-24">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <h1 className="text-4xl font-black sm:text-5xl">Checkout</h1>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_400px]">
        {/* Form */}
        <div className="space-y-6">
          <section className="card p-6">
            <h2 className="text-lg font-bold">Delivery details</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Field label="Full name *"><input className="inp" value={form.customerName} onChange={set("customerName")} placeholder="Your name" /></Field>
              <Field label="Phone *"><input className="inp" value={form.customerPhone} onChange={set("customerPhone")} placeholder="+971 …" /></Field>
              <Field label="Email" full={false}><input className="inp" value={form.customerEmail} onChange={set("customerEmail")} placeholder="you@email.com" /></Field>
              <Field label="City"><input className="inp" value={form.city} onChange={set("city")} placeholder="Dubai" /></Field>
              <Field label="Delivery address *" full><textarea className="inp min-h-[80px]" value={form.address} onChange={set("address")} placeholder="Building, street, area…" /></Field>
              <Field label="Delivery date"><input type="date" className="inp" value={form.deliveryDate} onChange={set("deliveryDate")} /></Field>
              <Field label="Time slot">
                <select className="inp" value={form.deliverySlot} onChange={set("deliverySlot")}>
                  <option>Morning (9am–12pm)</option>
                  <option>Afternoon (12pm–4pm)</option>
                  <option>Evening (4pm–8pm)</option>
                </select>
              </Field>
              <Field label="Notes" full><textarea className="inp min-h-[60px]" value={form.notes} onChange={set("notes")} placeholder="Any special instructions…" /></Field>
            </div>
          </section>

          <section className="card p-6">
            <h2 className="text-lg font-bold">Payment method</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {settings.codEnabled && (
                <PayOption icon={Banknote} title="Cash on Delivery" desc="Pay when your cake arrives" active={method === "COD"} onClick={() => setMethod("COD")} />
              )}
              {settings.onlinePayEnabled && (
                <PayOption icon={CreditCard} title="Pay Online" desc="Card / UPI via Razorpay" active={method === "RAZORPAY"} onClick={() => setMethod("RAZORPAY")} />
              )}
            </div>
            {!settings.codEnabled && !settings.onlinePayEnabled && (
              <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">No payment methods are enabled. Please contact the store.</p>
            )}
            <p className="mt-4 flex items-center gap-2 text-xs text-muted"><ShieldCheck className="h-4 w-4 text-emerald-500" /> Your details are secure and never shared.</p>
          </section>
        </div>

        {/* Summary */}
        <div className="lg:sticky lg:top-24 lg:h-fit">
          <div className="card p-6">
            <h2 className="text-lg font-bold">Your order</h2>
            <div className="mt-4 max-h-64 space-y-3 overflow-auto pr-1">
              {items.map((it) => (
                <div key={it.id} className="flex gap-3">
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-brand-soft">
                    {it.image ? <Image src={it.image} alt={it.name} fill sizes="56px" className="object-cover" /> : <div className="grid h-full place-items-center">🎂</div>}
                    <span className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-brand text-[11px] font-bold text-brand-fg">{it.quantity}</span>
                  </div>
                  <div className="flex-1 text-sm">
                    <p className="font-semibold leading-tight">{it.name}</p>
                    <p className="text-xs text-muted">{[it.size, it.flavor].filter(Boolean).join(" · ")}</p>
                  </div>
                  <span className="num text-sm font-semibold">{money(it.unitPrice * it.quantity)}</span>
                </div>
              ))}
            </div>

            <dl className="mt-5 space-y-2.5 border-t border-line pt-4 text-sm">
              <div className="flex justify-between"><dt className="text-muted">Subtotal</dt><dd className="num">{fmt(subtotal)}</dd></div>
              <div className="flex justify-between"><dt className="text-muted">Delivery</dt><dd className="num">{delivery === 0 ? "FREE" : fmt(delivery)}</dd></div>
              {settings.taxPercent > 0 && <div className="flex justify-between"><dt className="text-muted">Tax</dt><dd className="num">{fmt(tax)}</dd></div>}
              <div className="flex justify-between border-t border-line pt-3 text-lg font-black"><dt>Total</dt><dd className="num text-brand">{fmt(total)}</dd></div>
            </dl>

            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={placeOrder}
              disabled={loading}
              className="btn-primary mt-6 w-full !py-4"
            >
              {loading ? <><Loader2 className="h-5 w-5 animate-spin" /> Processing…</> : <><Lock className="h-4 w-4" /> Place Order · {fmt(total)}</>}
            </motion.button>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .inp { width: 100%; border-radius: 1rem; border: 1px solid rgb(var(--line)); background: rgb(var(--surface)); padding: 0.7rem 1rem; font-size: 0.875rem; outline: none; }
        .inp:focus { border-color: rgb(var(--brand) / 0.5); }
      `}</style>
    </div>
  );
}

function Field({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return (
    <label className={`block ${full ? "sm:col-span-2" : ""}`}>
      <span className="mb-1.5 block text-xs font-semibold text-muted">{label}</span>
      {children}
    </label>
  );
}

function PayOption({ icon: Icon, title, desc, active, onClick }: any) {
  return (
    <button onClick={onClick} className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition ${active ? "border-brand bg-brand-soft" : "border-line hover:border-brand/40"}`}>
      <span className={`grid h-11 w-11 place-items-center rounded-xl ${active ? "bg-brand text-brand-fg" : "bg-brand-soft text-brand"}`}><Icon className="h-5 w-5" /></span>
      <span>
        <span className="block font-bold">{title}</span>
        <span className="block text-xs text-muted">{desc}</span>
      </span>
    </button>
  );
}
