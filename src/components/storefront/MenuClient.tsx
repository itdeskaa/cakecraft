"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Search, SlidersHorizontal } from "lucide-react";
import { CakeCard } from "./CakeCard";
import type { ProductDTO, CategoryDTO } from "@/lib/queries";

export function MenuClient({
  products,
  categories,
  symbol,
  initialCat,
}: {
  products: ProductDTO[];
  categories: CategoryDTO[];
  symbol: string;
  initialCat?: string;
}) {
  const [active, setActive] = useState<string>(initialCat ?? "all");
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<"featured" | "low" | "high">("featured");

  const filtered = useMemo(() => {
    let list = products.filter((p) => {
      const inCat = active === "all" || p.category?.slug === active;
      const inSearch = !q || p.name.toLowerCase().includes(q.toLowerCase());
      return inCat && inSearch;
    });
    if (sort === "low") list = [...list].sort((a, b) => Number(a.basePrice) - Number(b.basePrice));
    if (sort === "high") list = [...list].sort((a, b) => Number(b.basePrice) - Number(a.basePrice));
    return list;
  }, [products, active, q, sort]);

  return (
    <div>
      {/* Controls */}
      <div className="sticky top-[68px] z-30 -mx-5 mb-8 border-y border-line bg-cream/85 px-5 py-4 backdrop-blur-xl sm:-mx-8 sm:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            <Chip label="All Cakes" active={active === "all"} onClick={() => setActive("all")} />
            {categories.map((c) => (
              <Chip key={c.slug} label={c.name} active={active === c.slug} onClick={() => setActive(c.slug)} />
            ))}
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search cakes…"
                className="w-full rounded-full border border-line bg-surface py-2.5 pl-9 pr-4 text-sm outline-none focus:border-brand/50 sm:w-56"
              />
            </div>
            <div className="relative">
              <SlidersHorizontal className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as typeof sort)}
                className="appearance-none rounded-full border border-line bg-surface py-2.5 pl-9 pr-8 text-sm outline-none focus:border-brand/50"
              >
                <option value="featured">Featured</option>
                <option value="low">Price: Low to High</option>
                <option value="high">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <p className="mb-5 text-sm text-muted">{filtered.length} cake{filtered.length !== 1 ? "s" : ""} found</p>

      <motion.div layout className="grid grid-cols-2 gap-5 lg:grid-cols-4">
        <AnimatePresence mode="popLayout">
          {filtered.map((p) => (
            <motion.div
              key={p.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.35 }}
            >
              <CakeCard product={p} symbol={symbol} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {filtered.length === 0 && (
        <div className="grid place-items-center rounded-4xl border border-dashed border-line py-24 text-center">
          <span className="text-5xl">🔍</span>
          <p className="mt-4 text-lg font-semibold">No cakes match your search</p>
          <p className="text-sm text-muted">Try a different category or keyword.</p>
        </div>
      )}
    </div>
  );
}

function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`relative rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
        active ? "text-brand-fg" : "text-ink/70 hover:text-brand"
      }`}
    >
      {active && (
        <motion.span layoutId="chip-bg" className="absolute inset-0 rounded-full bg-brand" transition={{ type: "spring", damping: 22, stiffness: 280 }} />
      )}
      <span className="relative">{label}</span>
    </button>
  );
}
