"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { ArrowRight, Sparkles, Star, Truck } from "lucide-react";

type Props = {
  name: string;
  tagline?: string | null;
  about?: string | null;
  heroImage?: string | null;
  city?: string | null;
};

export function Hero({ name, tagline, about, heroImage, city }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 140]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);
  const fade = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section ref={ref} className="relative min-h-[92vh] overflow-hidden pt-[68px]">
      {/* animated blobs */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-24 top-24 h-80 w-80 animate-float rounded-full bg-brand/20 blur-3xl" />
        <div className="absolute right-0 top-40 h-96 w-96 animate-float rounded-full bg-accent/20 blur-3xl [animation-delay:2s]" />
      </div>

      <div className="container-x grid min-h-[calc(92vh-68px)] items-center gap-10 py-10 lg:grid-cols-2">
        {/* Left copy */}
        <motion.div style={{ opacity: fade }} className="relative z-10 max-w-xl">
          <motion.span
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            className="eyebrow"
          >
            <Sparkles className="h-4 w-4" /> {city ? `Freshly baked in ${city}` : "Freshly baked daily"}
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1 }}
            className="mt-5 font-display text-5xl font-black leading-[1.02] sm:text-6xl lg:text-7xl"
          >
            {tagline ? (
              <>
                <span className="text-gradient">{name}</span>
                <span className="mt-3 block text-3xl font-semibold text-ink/90 sm:text-4xl">{tagline}</span>
              </>
            ) : (
              <span className="text-gradient">{name}</span>
            )}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-6 max-w-md text-lg text-muted"
          >
            {about ?? "Hand-crafted cakes for every celebration, delivered fresh to your door."}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-8 flex flex-wrap items-center gap-3"
          >
            <Link href="/menu" className="btn-primary group">
              Explore Cakes
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link href="/#about" className="btn-ghost">Our Story</Link>
          </motion.div>

          {/* trust row */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4 text-sm"
          >
            <div className="flex items-center gap-2">
              <span className="flex">{[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-accent text-accent" />)}</span>
              <span className="font-semibold">4.9</span><span className="text-muted">/ 2k+ reviews</span>
            </div>
            <div className="flex items-center gap-2 text-muted">
              <Truck className="h-5 w-5 text-brand" /> Same-day delivery
            </div>
          </motion.div>
        </motion.div>

        {/* Right image */}
        <div className="relative z-0 h-[420px] sm:h-[520px] lg:h-[600px]">
          <motion.div style={{ y, scale }} className="absolute inset-0">
            <div className="relative h-full w-full overflow-hidden rounded-[2.5rem] shadow-2xl ring-1 ring-line">
              {heroImage ? (
                <Image src={heroImage} alt={name} fill priority sizes="(max-width:1024px) 100vw, 50vw" className="object-cover" />
              ) : (
                <div className="grid h-full place-items-center bg-brand-soft text-[10rem]">🎂</div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-ink/30 via-transparent to-transparent" />
            </div>
          </motion.div>

          {/* floating cards */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.6 }}
            className="absolute -left-3 bottom-10 z-20 flex items-center gap-3 rounded-2xl bg-surface/90 p-3 pr-5 shadow-card backdrop-blur"
          >
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand text-brand-fg text-xl">🍰</span>
            <div>
              <p className="text-sm font-bold leading-none">100% Fresh</p>
              <p className="mt-1 text-xs text-muted">Baked to order</p>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
