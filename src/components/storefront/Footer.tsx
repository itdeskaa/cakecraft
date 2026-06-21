import Link from "next/link";
import { MapPin, Phone, Mail, Instagram, Facebook, Cake } from "lucide-react";
import type { Tenant } from "@prisma/client";

export function Footer({ tenant, categories }: { tenant: Tenant; categories: { name: string; slug: string }[] }) {
  return (
    <footer id="contact" className="relative mt-24 border-t border-line bg-surface">
      <div className="container-x grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-1">
          <div className="flex items-center gap-2.5">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-brand text-brand-fg">
              <Cake className="h-5 w-5" />
            </span>
            <span className="font-display text-xl font-bold">{tenant.name}</span>
          </div>
          <p className="mt-4 max-w-xs text-sm text-muted">{tenant.tagline}</p>
          <div className="mt-5 flex gap-2">
            <a href="#" className="grid h-10 w-10 place-items-center rounded-full ring-1 ring-line transition hover:bg-brand hover:text-brand-fg"><Instagram className="h-4 w-4" /></a>
            <a href="#" className="grid h-10 w-10 place-items-center rounded-full ring-1 ring-line transition hover:bg-brand hover:text-brand-fg"><Facebook className="h-4 w-4" /></a>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-bold uppercase tracking-wider">Explore</h4>
          <ul className="mt-4 space-y-2.5 text-sm text-muted">
            <li><Link href="/" className="hover:text-brand">Home</Link></li>
            <li><Link href="/menu" className="hover:text-brand">All Cakes</Link></li>
            <li><Link href="/track" className="hover:text-brand">Track Order</Link></li>
            <li><Link href="/#about" className="hover:text-brand">About Us</Link></li>
            <li><Link href="/cart" className="hover:text-brand">My Cart</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-bold uppercase tracking-wider">Categories</h4>
          <ul className="mt-4 space-y-2.5 text-sm text-muted">
            {categories.slice(0, 5).map((c) => (
              <li key={c.slug}><Link href={`/menu?cat=${c.slug}`} className="hover:text-brand">{c.name}</Link></li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-bold uppercase tracking-wider">Get in touch</h4>
          <ul className="mt-4 space-y-3 text-sm text-muted">
            {tenant.address && <li className="flex gap-2"><MapPin className="h-4 w-4 shrink-0 text-brand" /> {tenant.address}</li>}
            {tenant.phone && <li className="flex gap-2"><Phone className="h-4 w-4 shrink-0 text-brand" /> <a href={`tel:${tenant.phone}`} className="hover:text-brand">{tenant.phone}</a></li>}
            {tenant.email && <li className="flex gap-2"><Mail className="h-4 w-4 shrink-0 text-brand" /> <a href={`mailto:${tenant.email}`} className="hover:text-brand">{tenant.email}</a></li>}
          </ul>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="container-x flex flex-col items-center justify-between gap-3 py-6 text-xs text-muted sm:flex-row">
          <p>© {new Date().getFullYear()} {tenant.name}. All rights reserved.</p>
          <p>Powered by <span className="font-semibold text-brand">IsaiGram</span></p>
        </div>
      </div>
    </footer>
  );
}
