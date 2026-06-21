"use client";

import Link from "next/link";
import Image from "next/image";
import { useRef } from "react";
import { motion, useMotionTemplate, useMotionValue, useSpring } from "framer-motion";
import { Star, Plus, Leaf } from "lucide-react";
import { useCart } from "@/lib/cart-store";
import { useMoney } from "@/lib/region-store";
import { toast } from "sonner";
import type { ProductDTO } from "@/lib/queries";

export function CakeCard({ product }: { product: ProductDTO; symbol?: string }) {
  const money = useMoney();
  const ref = useRef<HTMLDivElement>(null);
  const rx = useSpring(useMotionValue(0), { stiffness: 150, damping: 18 });
  const ry = useSpring(useMotionValue(0), { stiffness: 150, damping: 18 });
  const transform = useMotionTemplate`perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg)`;
  const addItem = useCart((s) => s.addItem);

  const images = (product.images as string[]) ?? [];
  const cover = images[0];
  const price = Number(product.basePrice);
  const compare = product.compareAt ? Number(product.compareAt) : null;

  function onMove(e: React.MouseEvent) {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    ry.set(px * 10);
    rx.set(-py * 10);
  }
  function onLeave() {
    rx.set(0);
    ry.set(0);
  }

  function quickAdd() {
    const firstFlavor = (product.flavors as string[] | null)?.[0];
    const firstSize = (product.sizes as { label: string; price: number }[] | null)?.[0];
    addItem({
      productId: product.id,
      name: product.name,
      image: cover,
      flavor: firstFlavor,
      size: firstSize?.label,
      unitPrice: firstSize?.price ?? price,
    });
    toast.success(`${product.name} added to cart`, { description: "Customise size & message in cart." });
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ transform }}
      className="group relative will-change-transform"
    >
      <div className="card overflow-hidden">
        <Link href={`/cake/${product.slug}`} className="relative block aspect-[4/5] overflow-hidden">
          <div className="shine absolute inset-0 z-10" />
          {cover ? (
            <Image
              src={cover}
              alt={product.name}
              fill
              sizes="(max-width:768px) 50vw, 25vw"
              className="object-cover transition-transform duration-700 group-hover:scale-110"
            />
          ) : (
            <div className="grid h-full place-items-center bg-brand-soft text-5xl">🎂</div>
          )}

          {/* badges */}
          <div className="absolute left-3 top-3 z-20 flex flex-col gap-1.5">
            {product.isFeatured && <span className="chip bg-accent/90 text-accent-fg ring-0">Bestseller</span>}
            {compare && compare > price && (
              <span className="chip bg-brand text-brand-fg ring-0">Save {money(compare - price)}</span>
            )}
            {product.eggless && (
              <span className="chip bg-emerald-500/90 text-white ring-0"><Leaf className="h-3 w-3" /> Eggless</span>
            )}
          </div>

          <div className="absolute right-3 top-3 z-20 flex items-center gap-1 rounded-full bg-ink/60 px-2 py-1 text-xs font-semibold text-white backdrop-blur">
            <Star className="h-3 w-3 fill-accent text-accent" /> {Number(product.rating).toFixed(1)}
          </div>
        </Link>

        <div className="flex flex-col gap-2 p-4">
          {product.category && (
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted">
              {product.category.name}
            </span>
          )}
          <Link href={`/cake/${product.slug}`}>
            <h3 className="font-display text-lg font-bold leading-snug transition-colors group-hover:text-brand">
              {product.name}
            </h3>
          </Link>
          <p className="line-clamp-1 text-sm text-muted">{product.shortDesc}</p>

          <div className="mt-1 flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              <span className="num text-lg font-bold text-brand">{money(price)}</span>
              {compare && compare > price && (
                <span className="num text-sm text-muted line-through">{money(compare)}</span>
              )}
            </div>
            <button
              onClick={quickAdd}
              aria-label="Add to cart"
              className="grid h-10 w-10 place-items-center rounded-full bg-brand text-brand-fg shadow-glow transition hover:scale-110 active:scale-95"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
