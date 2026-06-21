"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { signOut } from "next-auth/react";
import { AnimatePresence, motion } from "framer-motion";
import {
  LayoutDashboard, ShoppingBag, Cake, Tags, Palette, CreditCard,
  Truck, Ticket, Bell, Globe, LogOut, Menu, X, ExternalLink, Cake as CakeIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/products", label: "Cakes / Menu", icon: Cake },
  { href: "/admin/categories", label: "Categories", icon: Tags },
  { href: "/admin/coupons", label: "Coupons", icon: Ticket },
  { href: "/admin/branding", label: "Branding & Logo", icon: Palette },
  { href: "/admin/payments", label: "Payments", icon: CreditCard },
  { href: "/admin/regions", label: "Regions & Currency", icon: Globe },
  { href: "/admin/notifications", label: "Notifications", icon: Bell },
  { href: "/admin/settings", label: "Delivery & Store", icon: Truck },
];

export function Sidebar({ storeName, adminName }: { storeName: string; adminName: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (l: (typeof LINKS)[number]) =>
    l.exact ? pathname === l.href : pathname.startsWith(l.href);

  const Nav = (
    <nav className="flex h-full flex-col">
      <Link href="/admin" className="flex items-center gap-2.5 px-5 py-5">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand text-brand-fg shadow-glow">
          <CakeIcon className="h-5 w-5" />
        </span>
        <div className="leading-tight">
          <p className="font-display text-base font-bold">{storeName}</p>
          <p className="text-[11px] text-muted">Admin Portal</p>
        </div>
      </Link>

      <div className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
        {LINKS.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            onClick={() => setOpen(false)}
            className={cn(
              "relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
              isActive(l) ? "text-brand-fg" : "text-ink/70 hover:bg-brand-soft hover:text-brand"
            )}
          >
            {isActive(l) && (
              <motion.span layoutId="sidebar-active" className="absolute inset-0 rounded-xl bg-brand" transition={{ type: "spring", damping: 24, stiffness: 280 }} />
            )}
            <l.icon className="relative h-[18px] w-[18px]" />
            <span className="relative">{l.label}</span>
          </Link>
        ))}
      </div>

      <div className="border-t border-line p-3">
        <a href="/" target="_blank" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-ink/70 hover:bg-brand-soft hover:text-brand">
          <ExternalLink className="h-[18px] w-[18px]" /> View store
        </a>
        <button onClick={() => signOut({ callbackUrl: "/admin/login" })} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50">
          <LogOut className="h-[18px] w-[18px]" /> Sign out
        </button>
        <p className="px-3 pt-2 text-[11px] text-muted">Signed in as {adminName}</p>
      </div>
    </nav>
  );

  return (
    <>
      {/* Desktop */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-line bg-surface lg:block">
        {Nav}
      </aside>

      {/* Mobile top bar */}
      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-line bg-surface/90 px-4 py-3 backdrop-blur lg:hidden">
        <span className="font-display font-bold">{storeName}</span>
        <button onClick={() => setOpen(true)} className="grid h-10 w-10 place-items-center rounded-xl ring-1 ring-line"><Menu className="h-5 w-5" /></button>
      </div>

      <AnimatePresence>
        {open && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)} className="fixed inset-0 z-50 bg-ink/40 lg:hidden" />
            <motion.aside initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }} transition={{ type: "spring", damping: 26, stiffness: 240 }} className="fixed left-0 top-0 z-50 h-full w-72 bg-surface shadow-2xl lg:hidden">
              <button onClick={() => setOpen(false)} className="absolute right-3 top-4 grid h-9 w-9 place-items-center rounded-lg ring-1 ring-line"><X className="h-5 w-5" /></button>
              {Nav}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
