import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Cake, ChefHat, Clock, Gift, Heart, ShieldCheck } from "lucide-react";
import { getCurrentTenant } from "@/lib/tenant";
import { getCategories, getProducts } from "@/lib/queries";
import { Hero } from "@/components/storefront/Hero";
import { Marquee } from "@/components/storefront/Marquee";
import { CakeCard } from "@/components/storefront/CakeCard";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/Reveal";

const PERKS = [
  { icon: ChefHat, title: "Master Bakers", text: "Crafted by award-winning pastry chefs." },
  { icon: Clock, title: "Same-Day Delivery", text: "Order before 2pm for today delivery." },
  { icon: Heart, title: "Made With Love", text: "Small-batch, baked fresh to order." },
  { icon: ShieldCheck, title: "Quality Promise", text: "Premium, locally-sourced ingredients." },
];

export default async function HomePage() {
  const tenant = await getCurrentTenant();
  const [categories, featured] = await Promise.all([
    getCategories(tenant.id),
    getProducts(tenant.id, { featured: true, take: 8 }),
  ]);
  const symbol = tenant.currencySymbol;

  return (
    <>
      <Hero
        name={tenant.name}
        tagline={tenant.tagline}
        about={tenant.about}
        heroImage={tenant.heroImageUrl}
        city={tenant.city}
      />

      <Marquee />

      {/* Perks */}
      <section className="container-x py-16 sm:py-20">
        <Stagger className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {PERKS.map((p) => (
            <StaggerItem key={p.title}>
              <div className="card group h-full p-6 transition-all hover:-translate-y-1 hover:shadow-glow">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-soft text-brand transition-colors group-hover:bg-brand group-hover:text-brand-fg">
                  <p.icon className="h-6 w-6" />
                </span>
                <h3 className="mt-4 text-lg font-bold">{p.title}</h3>
                <p className="mt-1.5 text-sm text-muted">{p.text}</p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="container-x py-10">
          <Reveal className="mb-10 flex flex-col items-center text-center">
            <span className="eyebrow"><Gift className="h-4 w-4" /> Find your flavour</span>
            <h2 className="mt-3 text-4xl font-black sm:text-5xl">Shop by Category</h2>
          </Reveal>

          <Stagger className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {categories.map((c) => (
              <StaggerItem key={c.id}>
                <Link
                  href={`/menu?cat=${c.slug}`}
                  className="card group flex aspect-square flex-col items-center justify-center gap-2 p-4 text-center transition-all hover:-translate-y-1 hover:bg-brand hover:text-brand-fg"
                >
                  <span className="text-4xl transition-transform group-hover:scale-125">🎂</span>
                  <span className="font-semibold">{c.name}</span>
                  <span className="text-xs text-muted group-hover:text-brand-fg/80">{c._count.products} cakes</span>
                </Link>
              </StaggerItem>
            ))}
          </Stagger>
        </section>
      )}

      {/* Featured cakes */}
      <section className="container-x py-16 sm:py-20">
        <Reveal className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="eyebrow"><Cake className="h-4 w-4" /> Customer favourites</span>
            <h2 className="mt-3 text-4xl font-black sm:text-5xl">Bestselling Cakes</h2>
          </div>
          <Link href="/menu" className="btn-ghost group">
            View all <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </Reveal>

        <Stagger className="grid grid-cols-2 gap-5 lg:grid-cols-4">
          {featured.map((p) => (
            <StaggerItem key={p.id}>
              <CakeCard product={p} symbol={symbol} />
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      {/* About / story */}
      <section id="about" className="relative overflow-hidden py-20">
        <div className="container-x grid items-center gap-12 lg:grid-cols-2">
          <Reveal dir="right">
            <div className="relative aspect-[5/4] overflow-hidden rounded-[2.5rem] shadow-card ring-1 ring-line">
              {tenant.heroImageUrl && (
                <Image src={tenant.heroImageUrl} alt={tenant.name} fill sizes="50vw" className="object-cover" />
              )}
            </div>
          </Reveal>
          <Reveal dir="left">
            <span className="eyebrow"><Heart className="h-4 w-4" /> Our story</span>
            <h2 className="mt-3 text-4xl font-black sm:text-5xl">Baked with passion, served with joy</h2>
            <p className="mt-5 text-lg text-muted">{tenant.about}</p>
            <div className="mt-8 grid grid-cols-3 gap-4">
              {[
                { n: "10k+", l: "Happy customers" },
                { n: "50+", l: "Cake designs" },
                { n: "4.9★", l: "Average rating" },
              ].map((s) => (
                <div key={s.l} className="rounded-2xl bg-surface p-4 text-center ring-1 ring-line">
                  <p className="font-display text-2xl font-black text-brand">{s.n}</p>
                  <p className="mt-1 text-xs text-muted">{s.l}</p>
                </div>
              ))}
            </div>
            <Link href="/menu" className="btn-primary mt-8">Order your cake</Link>
          </Reveal>
        </div>
      </section>

      {/* CTA banner */}
      <section className="container-x pb-20">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2.5rem] bg-brand px-8 py-16 text-center text-brand-fg shadow-glow sm:px-16">
            <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 animate-float rounded-full bg-accent/30 blur-2xl" />
            <div className="pointer-events-none absolute -bottom-10 -left-10 h-48 w-48 animate-float rounded-full bg-white/20 blur-2xl [animation-delay:2s]" />
            <h2 className="relative text-4xl font-black sm:text-5xl">Have a celebration coming up?</h2>
            <p className="relative mx-auto mt-4 max-w-xl text-lg opacity-90">
              Custom cakes for birthdays, weddings and every sweet moment in between. Let’s make it unforgettable.
            </p>
            <Link href="/menu" className="btn-accent relative mt-8">Start your order <ArrowRight className="h-4 w-4" /></Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}
