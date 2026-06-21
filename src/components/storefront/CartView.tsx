"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Tag } from "lucide-react";
import { useCart } from "@/lib/cart-store";
import { useMoney, useCurrentRegion } from "@/lib/region-store";

export type ShopSettings = {
  symbol: string;
  deliveryFee: number;
  freeDeliveryAbove: number | null;
  minOrderValue: number;
  taxPercent: number;
};

export function CartView({ settings }: { settings: ShopSettings }) {
  const items = useCart((s) => s.items);
  const setQty = useCart((s) => s.setQty);
  const removeItem = useCart((s) => s.removeItem);
  const subtotalBase = useCart((s) => s.subtotal());

  const region = useCurrentRegion();
  const money = useMoney(); // base → selected region currency
  const rate = region?.fxRate ?? 1;
  const symbol = region?.currencySymbol ?? settings.symbol;
  const fmt = (n: number) =>
    `${symbol} ${n.toLocaleString("en-US", { minimumFractionDigits: n % 1 === 0 ? 0 : 2, maximumFractionDigits: 2 })}`;

  // Delivery values are stored per-region in that region's currency.
  const deliveryFee = region?.deliveryFee ?? settings.deliveryFee;
  const freeAbove = region?.freeDeliveryAbove ?? settings.freeDeliveryAbove;

  const [coupon, setCoupon] = useState("");
  const [discountBase, setDiscountBase] = useState(0);
  const [couponMsg, setCouponMsg] = useState<string | null>(null);

  const subtotal = subtotalBase * rate; // region currency
  const discount = discountBase * rate;
  const freeQualified = freeAbove != null && subtotal >= freeAbove;
  const delivery = items.length === 0 || freeQualified ? 0 : deliveryFee;
  const tax = ((subtotal - discount) * settings.taxPercent) / 100;
  const total = Math.max(0, subtotal - discount) + delivery + tax;

  function applyCoupon() {
    // Demo client-side coupon — real validation happens server-side at checkout.
    if (coupon.trim().toUpperCase() === "WELCOME10") {
      const d = Math.min(subtotalBase * 0.1, 50); // base currency
      setDiscountBase(d);
      setCouponMsg(`WELCOME10 applied — you saved ${fmt(d * rate)}`);
    } else {
      setDiscountBase(0);
      setCouponMsg("Invalid coupon code");
    }
  }

  if (items.length === 0) {
    return (
      <div className="container-x pt-28 pb-24">
        <div className="mx-auto grid max-w-md place-items-center rounded-4xl border border-dashed border-line py-20 text-center">
          <span className="grid h-20 w-20 place-items-center rounded-full bg-brand-soft text-4xl">🛒</span>
          <h2 className="mt-6 text-2xl font-black">Your cart is empty</h2>
          <p className="mt-2 text-muted">Looks like you haven’t added any cakes yet.</p>
          <Link href="/menu" className="btn-primary mt-6">Browse cakes <ArrowRight className="h-4 w-4" /></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-x pt-28 pb-24">
      <h1 className="text-4xl font-black sm:text-5xl">Your Cart</h1>
      <p className="mt-2 text-muted">{items.length} item{items.length !== 1 ? "s" : ""} ready for checkout</p>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_380px]">
        {/* Items */}
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {items.map((it) => (
              <motion.div
                key={it.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -40 }}
                className="card flex gap-4 p-4"
              >
                <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-brand-soft">
                  {it.image ? <Image src={it.image} alt={it.name} fill sizes="96px" className="object-cover" /> : <div className="grid h-full place-items-center text-3xl">🎂</div>}
                </div>
                <div className="flex flex-1 flex-col">
                  <div className="flex justify-between gap-3">
                    <div>
                      <h3 className="font-display text-lg font-bold leading-tight">{it.name}</h3>
                      <p className="mt-0.5 text-xs text-muted">
                        {[it.size, it.flavor].filter(Boolean).join(" · ")}
                      </p>
                      {it.message && <p className="mt-0.5 text-xs italic text-brand">“{it.message}”</p>}
                    </div>
                    <button onClick={() => removeItem(it.id)} className="grid h-9 w-9 place-items-center rounded-full text-muted transition hover:bg-red-50 hover:text-red-500">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="mt-auto flex items-center justify-between pt-2">
                    <div className="flex items-center rounded-full border border-line">
                      <button onClick={() => setQty(it.id, it.quantity - 1)} className="grid h-9 w-9 place-items-center rounded-full hover:bg-brand-soft"><Minus className="h-3.5 w-3.5" /></button>
                      <span className="w-8 text-center text-sm font-bold">{it.quantity}</span>
                      <button onClick={() => setQty(it.id, it.quantity + 1)} className="grid h-9 w-9 place-items-center rounded-full hover:bg-brand-soft"><Plus className="h-3.5 w-3.5" /></button>
                    </div>
                    <span className="num font-bold text-brand">{money(it.unitPrice * it.quantity)}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Summary */}
        <div className="lg:sticky lg:top-24 lg:h-fit">
          <div className="card p-6">
            <h2 className="text-xl font-bold">Order Summary</h2>

            {/* coupon */}
            <div className="mt-5">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                  <input value={coupon} onChange={(e) => setCoupon(e.target.value)} placeholder="Coupon code" className="w-full rounded-full border border-line bg-surface py-2.5 pl-9 pr-3 text-sm outline-none focus:border-brand/50" />
                </div>
                <button onClick={applyCoupon} className="btn-ghost !px-4 !py-2.5 text-sm">Apply</button>
              </div>
              {couponMsg && <p className={`mt-2 text-xs ${discount > 0 ? "text-emerald-600" : "text-red-500"}`}>{couponMsg}</p>}
              {!couponMsg && <p className="mt-2 text-xs text-muted">Try <b>WELCOME10</b> for 10% off</p>}
            </div>

            <dl className="mt-6 space-y-3 border-t border-line pt-5 text-sm">
              <Row label="Subtotal" value={fmt(subtotal)} />
              {discount > 0 && <Row label="Discount" value={`− ${fmt(discount)}`} accent />}
              <Row label="Delivery" value={delivery === 0 ? "FREE" : fmt(delivery)} />
              {settings.taxPercent > 0 && <Row label={`Tax (${settings.taxPercent}%)`} value={fmt(tax)} />}
              <div className="flex items-center justify-between border-t border-line pt-4 text-lg font-black">
                <span>Total</span>
                <span className="num text-brand">{fmt(total)}</span>
              </div>
            </dl>

            {!freeQualified && freeAbove != null && (
              <p className="mt-3 rounded-xl bg-brand-soft px-3 py-2 text-xs text-brand">
                Add {fmt(freeAbove - subtotal)} more for free delivery 🚚
              </p>
            )}

            <Link href="/checkout" className="btn-primary mt-6 w-full !py-4">
              Proceed to Checkout <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/menu" className="mt-3 flex items-center justify-center gap-2 text-sm font-semibold text-muted hover:text-brand">
              <ShoppingBag className="h-4 w-4" /> Continue shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-muted">{label}</dt>
      <dd className={`num font-semibold ${accent ? "text-emerald-600" : ""}`}>{value}</dd>
    </div>
  );
}
