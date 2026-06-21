"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { Minus, Plus, Star, Leaf, Users, ShoppingBag, Check, ArrowLeft } from "lucide-react";
import { useCart } from "@/lib/cart-store";
import { useMoney } from "@/lib/region-store";
import { toast } from "sonner";

type Size = { label: string; price: number };
type Props = {
  product: any;
  symbol: string;
};

export function ProductDetail({ product }: Props) {
  const money = useMoney();
  const images = (product.images as string[]) ?? [];
  const flavors = (product.flavors as string[] | null) ?? [];
  const sizes = (product.sizes as Size[] | null) ?? [];

  const [activeImg, setActiveImg] = useState(0);
  const [size, setSize] = useState<Size | null>(sizes[0] ?? null);
  const [flavor, setFlavor] = useState<string>(flavors[0] ?? "");
  const [message, setMessage] = useState("");
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const addItem = useCart((s) => s.addItem);
  const unitPrice = size?.price ?? Number(product.basePrice);
  const compare = product.compareAt ? Number(product.compareAt) : null;

  function add() {
    addItem(
      {
        productId: product.id,
        name: product.name,
        image: images[0],
        flavor: flavor || undefined,
        size: size?.label,
        message: message || undefined,
        unitPrice,
      },
      qty
    );
    setAdded(true);
    toast.success(`${product.name} added to cart`);
    setTimeout(() => setAdded(false), 1800);
  }

  return (
    <div className="container-x pt-28 pb-20">
      <Link href="/menu" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-muted hover:text-brand">
        <ArrowLeft className="h-4 w-4" /> Back to menu
      </Link>

      <div className="grid gap-10 lg:grid-cols-2">
        {/* Gallery */}
        <div>
          <motion.div
            key={activeImg}
            initial={{ opacity: 0.5, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative aspect-square overflow-hidden rounded-[2rem] shadow-card ring-1 ring-line"
          >
            {images[activeImg] ? (
              <Image src={images[activeImg]} alt={product.name} fill priority sizes="50vw" className="object-cover" />
            ) : (
              <div className="grid h-full place-items-center bg-brand-soft text-8xl">🎂</div>
            )}
          </motion.div>
          {images.length > 1 && (
            <div className="mt-4 flex gap-3">
              {images.map((src: string, i: number) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={`relative h-20 w-20 overflow-hidden rounded-2xl ring-2 transition ${i === activeImg ? "ring-brand" : "ring-line"}`}
                >
                  <Image src={src} alt="" fill sizes="80px" className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          {product.category && (
            <span className="text-xs font-semibold uppercase tracking-wider text-muted">{product.category.name}</span>
          )}
          <h1 className="mt-2 font-display text-4xl font-black sm:text-5xl">{product.name}</h1>

          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
            <span className="flex items-center gap-1 font-semibold">
              <Star className="h-4 w-4 fill-accent text-accent" /> {Number(product.rating).toFixed(1)}
              <span className="font-normal text-muted">({product.ratingCount})</span>
            </span>
            {product.eggless && <span className="chip bg-emerald-50 text-emerald-700 ring-emerald-200"><Leaf className="h-3 w-3" /> Eggless</span>}
            {product.servesUpTo && <span className="chip"><Users className="h-3 w-3" /> Serves {product.servesUpTo}</span>}
          </div>

          <div className="mt-5 flex items-baseline gap-3">
            <span className="num text-4xl font-bold text-brand">{money(unitPrice)}</span>
            {compare && compare > unitPrice && <span className="num text-xl text-muted line-through">{money(compare)}</span>}
          </div>

          <p className="mt-5 text-muted">{product.description}</p>

          {/* Sizes */}
          {sizes.length > 0 && (
            <div className="mt-7">
              <p className="text-sm font-bold">Choose size</p>
              <div className="mt-3 flex flex-wrap gap-2.5">
                {sizes.map((s) => (
                  <button
                    key={s.label}
                    onClick={() => setSize(s)}
                    className={`rounded-2xl border px-4 py-2.5 text-sm font-semibold transition ${
                      size?.label === s.label ? "border-brand bg-brand text-brand-fg" : "border-line hover:border-brand/40"
                    }`}
                  >
                    {s.label} · {money(s.price)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Flavours */}
          {flavors.length > 0 && (
            <div className="mt-6">
              <p className="text-sm font-bold">Choose flavour</p>
              <div className="mt-3 flex flex-wrap gap-2.5">
                {flavors.map((f) => (
                  <button
                    key={f}
                    onClick={() => setFlavor(f)}
                    className={`rounded-2xl border px-4 py-2.5 text-sm font-semibold transition ${
                      flavor === f ? "border-brand bg-brand-soft text-brand" : "border-line hover:border-brand/40"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Message on cake */}
          <div className="mt-6">
            <label className="text-sm font-bold">Message on cake <span className="font-normal text-muted">(optional)</span></label>
            <input
              value={message}
              maxLength={40}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="e.g. Happy Birthday Sara!"
              className="mt-2 w-full rounded-2xl border border-line bg-surface px-4 py-3 text-sm outline-none focus:border-brand/50"
            />
          </div>

          {/* Qty + add */}
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <div className="flex items-center rounded-full border border-line bg-surface">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="grid h-12 w-12 place-items-center rounded-full hover:bg-brand-soft"><Minus className="h-4 w-4" /></button>
              <span className="w-10 text-center font-bold">{qty}</span>
              <button onClick={() => setQty((q) => q + 1)} className="grid h-12 w-12 place-items-center rounded-full hover:bg-brand-soft"><Plus className="h-4 w-4" /></button>
            </div>

            <button onClick={add} className="btn-primary flex-1 min-w-[200px] !py-4">
              {added ? <><Check className="h-5 w-5" /> Added!</> : <><ShoppingBag className="h-5 w-5" /> Add to cart · {money(unitPrice * qty)}</>}
            </button>
          </div>

          <div className="mt-6 rounded-2xl bg-brand-soft p-4 text-sm text-brand">
            🚚 Freshly baked & delivered. Order before 2 PM for same-day delivery.
          </div>
        </div>
      </div>
    </div>
  );
}
