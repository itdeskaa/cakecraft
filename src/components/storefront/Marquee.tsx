"use client";

const DEFAULT = [
  "Freshly Baked Daily",
  "Premium Belgian Chocolate",
  "Same-Day Delivery",
  "Eggless Options",
  "Custom Designs",
  "100% Fresh Ingredients",
  "Made With Love",
];

export function Marquee({ items = DEFAULT }: { items?: string[] }) {
  const row = [...items, ...items];
  return (
    <div className="relative overflow-hidden border-y border-line bg-brand py-4 text-brand-fg">
      <div className="flex w-max animate-marquee gap-10 whitespace-nowrap">
        {row.map((t, i) => (
          <span key={i} className="flex items-center gap-10 text-sm font-semibold uppercase tracking-[0.2em]">
            {t} <span className="text-accent">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}
