"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ShoppingBag, Menu, X, Phone } from "lucide-react";
import { useCart } from "@/lib/cart-store";
import { cn } from "@/lib/utils";
import { RegionSwitcher } from "./RegionSwitcher";

type Props = {
  name: string;
  logoUrl?: string | null;
  phone?: string | null;
  categories: { name: string; slug: string }[];
};

const NAV = [
  { href: "/", label: "Home" },
  { href: "/menu", label: "Menu" },
  { href: "/#about", label: "About" },
  { href: "/#contact", label: "Contact" },
];

export function Navbar({ name, logoUrl, phone, categories }: Props) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const count = useCart((s) => s.count());
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-x-0 top-0 z-50"
    >
      <div
        className={cn(
          "transition-all duration-500",
          scrolled
            ? "border-b border-line/70 bg-cream/85 backdrop-blur-xl shadow-[0_8px_30px_-18px_rgb(0_0_0/0.25)]"
            : "bg-transparent"
        )}
      >
        <nav className="container-x flex h-[68px] items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            {logoUrl ? (
              <Image src={logoUrl} alt={name} width={40} height={40} className="h-10 w-10 rounded-full object-cover" />
            ) : (
              <span className="grid h-10 w-10 place-items-center rounded-full bg-brand text-brand-fg text-lg shadow-glow transition-transform group-hover:rotate-12">
                {name.charAt(0)}
              </span>
            )}
            <span className="font-display text-lg font-bold leading-none sm:text-xl">{name}</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden items-center gap-1 lg:flex">
            {NAV.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="relative rounded-full px-4 py-2 text-sm font-medium text-ink/80 transition-colors hover:text-brand"
              >
                {l.label}
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {phone && (
              <a href={`tel:${phone}`} className="hidden xl:inline-flex btn-ghost !px-4 !py-2 text-xs">
                <Phone className="h-3.5 w-3.5" /> {phone}
              </a>
            )}

            <RegionSwitcher />

            <Link href="/cart" className="relative grid h-11 w-11 place-items-center rounded-full bg-surface ring-1 ring-line transition hover:ring-brand/40 hover:-translate-y-0.5">
              <ShoppingBag className="h-5 w-5 text-ink" />
              <AnimatePresence>
                {mounted && count > 0 && (
                  <motion.span
                    key={count}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -right-1 -top-1 grid h-5 min-w-[1.25rem] place-items-center rounded-full bg-brand px-1 text-[11px] font-bold text-brand-fg"
                  >
                    {count}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>

            <button
              onClick={() => setOpen(true)}
              className="grid h-11 w-11 place-items-center rounded-full bg-surface ring-1 ring-line lg:hidden"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </nav>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-sm lg:hidden"
            />
            <motion.aside
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 26, stiffness: 240 }}
              className="fixed right-0 top-0 z-50 flex h-full w-[82%] max-w-sm flex-col bg-cream p-6 shadow-2xl lg:hidden"
            >
              <div className="flex items-center justify-between">
                <span className="font-display text-xl font-bold">{name}</span>
                <button onClick={() => setOpen(false)} className="grid h-10 w-10 place-items-center rounded-full ring-1 ring-line">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-8 flex flex-col gap-1">
                {NAV.map((l) => (
                  <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="rounded-2xl px-4 py-3 text-lg font-medium hover:bg-brand-soft">
                    {l.label}
                  </Link>
                ))}
              </div>

              {categories.length > 0 && (
                <>
                  <p className="mt-6 px-4 text-xs font-semibold uppercase tracking-widest text-muted">Categories</p>
                  <div className="mt-2 flex flex-col gap-0.5">
                    {categories.map((c) => (
                      <Link key={c.slug} href={`/menu?cat=${c.slug}`} onClick={() => setOpen(false)} className="rounded-2xl px-4 py-2.5 text-sm hover:bg-brand-soft">
                        {c.name}
                      </Link>
                    ))}
                  </div>
                </>
              )}

              <Link href="/menu" onClick={() => setOpen(false)} className="btn-primary mt-auto">
                Order Now
              </Link>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
