"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Globe, Check, ChevronDown } from "lucide-react";
import { useRegionStore, useCurrentRegion } from "@/lib/region-store";

export function RegionSwitcher({ compact = false }: { compact?: boolean }) {
  const regions = useRegionStore((s) => s.regions);
  const setCurrent = useRegionStore((s) => s.setCurrent);
  const current = useCurrentRegion();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  if (!mounted || regions.length <= 1) return null;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 rounded-full bg-surface px-3 py-2 text-sm font-semibold ring-1 ring-line transition hover:ring-brand/40"
        aria-label="Choose region"
      >
        <span className="text-base leading-none">{current?.flag ?? <Globe className="h-4 w-4" />}</span>
        {!compact && <span>{current?.currency}</span>}
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.16 }}
            className="absolute right-0 z-50 mt-2 w-60 overflow-hidden rounded-2xl border border-line bg-surface p-1.5 shadow-card"
          >
            <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted">Shipping to</p>
            {regions.map((r) => (
              <button
                key={r.id}
                onClick={() => { setCurrent(r.id); setOpen(false); }}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition ${
                  current?.id === r.id ? "bg-brand-soft text-brand" : "hover:bg-cream"
                }`}
              >
                <span className="text-lg leading-none">{r.flag ?? "🌍"}</span>
                <span className="flex-1">
                  <span className="block font-semibold leading-tight">{r.name}</span>
                  <span className="block text-xs text-muted">{r.currency} · {r.currencySymbol}</span>
                </span>
                {current?.id === r.id && <Check className="h-4 w-4" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
