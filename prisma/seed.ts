import { PrismaClient, Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const img = (id: string, w = 900) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

// Shared cake photo pool (Unsplash IDs)
const PHOTOS = {
  chocolate: "photo-1578985545062-69928b1d9587",
  redVelvet: "photo-1586985289688-ca3cf47d3e6e",
  strawberry: "photo-1565958011703-44f9829ba187",
  wedding: "photo-1535141192574-5d4897c12636",
  cupcakes: "photo-1486427944299-d1955d23e34d",
  birthday: "photo-1464349095431-e9a21285b5f3",
  cheesecake: "photo-1533134242443-d4fd215305ad",
  macaron: "photo-1569864358642-9d1684040f43",
  vanilla: "photo-1542826438-bd32f43d626f",
  blackforest: "photo-1606890737304-57a1ca8a5b62",
  pastry: "photo-1517427294546-5aa121f68e8a",
  donut: "photo-1551024601-bec78aea704b",
};

type SeedProduct = {
  name: string;
  category: string;
  shortDesc: string;
  basePrice: number;
  compareAt?: number;
  image: string;
  flavors: string[];
  sizes: { label: string; price: number }[];
  eggless?: boolean;
  servesUpTo?: number;
  featured?: boolean;
  rating?: number;
};

type SeedTenant = {
  slug: string;
  name: string;
  tagline: string;
  about: string;
  primaryColor: string;
  accentColor: string;
  fontTheme: string;
  logoEmoji: string;
  hero: string;
  phone: string;
  whatsapp: string;
  city: string;
  address: string;
  codEnabled: boolean;
  deliveryFee: number;
  freeDeliveryAbove: number;
  categories: string[];
  products: SeedProduct[];
};

const sizes = (base: number) => [
  { label: "0.5 kg", price: Math.round(base * 0.6) },
  { label: "1 kg", price: base },
  { label: "1.5 kg", price: Math.round(base * 1.45) },
  { label: "2 kg", price: Math.round(base * 1.9) },
];

const TENANTS: SeedTenant[] = [
  {
    slug: "sweet-bloom",
    name: "Sweet Bloom Patisserie",
    tagline: "Where every cake blossoms with flavour",
    about:
      "A boutique patisserie crafting artisan cakes with seasonal ingredients and floral artistry. Hand-finished, baked fresh daily.",
    primaryColor: "#b91c5c",
    accentColor: "#e0a92e",
    fontTheme: "classic",
    logoEmoji: "🌸",
    hero: img(PHOTOS.strawberry, 1600),
    phone: "+971 50 123 4567",
    whatsapp: "971501234567",
    city: "Dubai",
    address: "Jumeirah Beach Road, Dubai, UAE",
    codEnabled: true,
    deliveryFee: 15,
    freeDeliveryAbove: 200,
    categories: ["Signature Cakes", "Birthday", "Wedding", "Cupcakes", "Cheesecakes"],
    products: [
      { name: "Rose Pistachio Dream", category: "Signature Cakes", shortDesc: "Persian rose sponge, pistachio cream", basePrice: 165, compareAt: 195, image: img(PHOTOS.strawberry), flavors: ["Rose", "Pistachio", "Vanilla"], sizes: sizes(165), servesUpTo: 10, featured: true, rating: 4.9 },
      { name: "Belgian Chocolate Truffle", category: "Signature Cakes", shortDesc: "Triple layer dark chocolate ganache", basePrice: 145, image: img(PHOTOS.chocolate), flavors: ["Dark Chocolate", "Hazelnut"], sizes: sizes(145), servesUpTo: 8, featured: true, rating: 4.9 },
      { name: "Classic Red Velvet", category: "Birthday", shortDesc: "Cream cheese frosting, velvet crumb", basePrice: 130, image: img(PHOTOS.redVelvet), flavors: ["Red Velvet"], sizes: sizes(130), eggless: true, servesUpTo: 8, featured: true, rating: 4.8 },
      { name: "Ivory Wedding Tier", category: "Wedding", shortDesc: "Two-tier vanilla & raspberry", basePrice: 480, image: img(PHOTOS.wedding), flavors: ["Vanilla", "Raspberry"], sizes: [{ label: "2 tier", price: 480 }, { label: "3 tier", price: 720 }], servesUpTo: 40, featured: true, rating: 5.0 },
      { name: "Garden Cupcakes (6)", category: "Cupcakes", shortDesc: "Buttercream florals, box of six", basePrice: 60, image: img(PHOTOS.cupcakes), flavors: ["Vanilla", "Chocolate", "Lemon"], sizes: [{ label: "Box of 6", price: 60 }, { label: "Box of 12", price: 110 }], rating: 4.7 },
      { name: "New York Cheesecake", category: "Cheesecakes", shortDesc: "Baked vanilla cheesecake, berry coulis", basePrice: 120, image: img(PHOTOS.cheesecake), flavors: ["Vanilla", "Blueberry"], sizes: sizes(120), servesUpTo: 8, rating: 4.8 },
    ],
  },
  {
    slug: "cocoa-noir",
    name: "Cocoa Noir",
    tagline: "Dark. Decadent. Unforgettable.",
    about:
      "A modern chocolaterie for the bold palate. Single-origin cacao, architectural cakes, and a love affair with deep cocoa.",
    primaryColor: "#3f2a1d",
    accentColor: "#c9962f",
    fontTheme: "modern",
    logoEmoji: "🍫",
    hero: img(PHOTOS.chocolate, 1600),
    phone: "+971 52 987 6543",
    whatsapp: "971529876543",
    city: "Abu Dhabi",
    address: "Al Maryah Island, Abu Dhabi, UAE",
    codEnabled: true,
    deliveryFee: 20,
    freeDeliveryAbove: 250,
    categories: ["Chocolate Cakes", "Gateaux", "Brownies & Bars", "Celebration"],
    products: [
      { name: "Midnight Ganache", category: "Chocolate Cakes", shortDesc: "70% dark, salted caramel core", basePrice: 175, compareAt: 210, image: img(PHOTOS.chocolate), flavors: ["Dark Chocolate", "Salted Caramel"], sizes: sizes(175), servesUpTo: 10, featured: true, rating: 5.0 },
      { name: "Black Forest Noir", category: "Gateaux", shortDesc: "Kirsch cherries, dark cream", basePrice: 150, image: img(PHOTOS.blackforest), flavors: ["Black Forest"], sizes: sizes(150), servesUpTo: 8, featured: true, rating: 4.9 },
      { name: "Velvet Underground", category: "Celebration", shortDesc: "Red velvet, mascarpone gold leaf", basePrice: 160, image: img(PHOTOS.redVelvet), flavors: ["Red Velvet"], sizes: sizes(160), featured: true, rating: 4.8 },
      { name: "Fudge Brownie Stack", category: "Brownies & Bars", shortDesc: "Walnut fudge, box of nine", basePrice: 70, image: img(PHOTOS.pastry), flavors: ["Chocolate", "Walnut"], sizes: [{ label: "Box of 9", price: 70 }], rating: 4.7 },
      { name: "Hazelnut Praline Dome", category: "Gateaux", shortDesc: "Crunchy praline, milk chocolate", basePrice: 185, image: img(PHOTOS.vanilla), flavors: ["Hazelnut", "Milk Chocolate"], sizes: sizes(185), servesUpTo: 10, featured: true, rating: 4.9 },
    ],
  },
  {
    slug: "rainbow-whisk",
    name: "Rainbow Whisk",
    tagline: "Big smiles, bigger sprinkles!",
    about:
      "A playful bakery for kids and the young-at-heart. Colourful, fun, custom cartoon cakes and the best birthday parties in town.",
    primaryColor: "#7c3aed",
    accentColor: "#f59e0b",
    fontTheme: "playful",
    logoEmoji: "🌈",
    hero: img(PHOTOS.birthday, 1600),
    phone: "+971 54 222 1188",
    whatsapp: "971542221188",
    city: "Sharjah",
    address: "Al Majaz Waterfront, Sharjah, UAE",
    codEnabled: true,
    deliveryFee: 12,
    freeDeliveryAbove: 150,
    categories: ["Birthday", "Kids & Cartoon", "Cupcakes", "Donuts", "Macarons"],
    products: [
      { name: "Confetti Party Cake", category: "Birthday", shortDesc: "Rainbow sponge, vanilla buttercream", basePrice: 120, image: img(PHOTOS.birthday), flavors: ["Vanilla", "Funfetti"], sizes: sizes(120), eggless: true, servesUpTo: 10, featured: true, rating: 4.9 },
      { name: "Unicorn Magic", category: "Kids & Cartoon", shortDesc: "Fondant unicorn, strawberry layers", basePrice: 180, image: img(PHOTOS.strawberry), flavors: ["Strawberry", "Vanilla"], sizes: sizes(180), servesUpTo: 12, featured: true, rating: 5.0 },
      { name: "Galaxy Sprinkle Cupcakes", category: "Cupcakes", shortDesc: "Twelve cosmic cupcakes", basePrice: 90, image: img(PHOTOS.cupcakes), flavors: ["Chocolate", "Vanilla", "Bubblegum"], sizes: [{ label: "Box of 6", price: 50 }, { label: "Box of 12", price: 90 }], featured: true, rating: 4.8 },
      { name: "Glazed Donut Tower", category: "Donuts", shortDesc: "Stacked rainbow glazed donuts", basePrice: 110, image: img(PHOTOS.donut), flavors: ["Assorted"], sizes: [{ label: "12 donuts", price: 110 }], rating: 4.7 },
      { name: "Macaron Rainbow Box", category: "Macarons", shortDesc: "Twelve pastel French macarons", basePrice: 85, image: img(PHOTOS.macaron), flavors: ["Assorted"], sizes: [{ label: "Box of 12", price: 85 }], featured: true, rating: 4.9 },
    ],
  },
];

const slugify = (s: string) =>
  s.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

async function main() {
  console.log("🌱  Seeding CakeCraft platform...");

  // wipe (dev only)
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.deliveryZone.deleteMany();
  await prisma.adminUser.deleteMany();
  await prisma.tenant.deleteMany();

  const passwordHash = await bcrypt.hash("admin123", 10);

  for (const t of TENANTS) {
    const tenant = await prisma.tenant.create({
      data: {
        slug: t.slug,
        name: t.name,
        tagline: t.tagline,
        about: t.about,
        logoUrl: null,
        heroImageUrl: t.hero,
        primaryColor: t.primaryColor,
        accentColor: t.accentColor,
        fontTheme: t.fontTheme,
        phone: t.phone,
        whatsapp: t.whatsapp,
        email: `hello@${t.slug}.ae`,
        city: t.city,
        address: t.address,
        currency: "AED",
        currencySymbol: "AED",
        codEnabled: t.codEnabled,
        onlinePayEnabled: false,
        deliveryFee: new Prisma.Decimal(t.deliveryFee),
        freeDeliveryAbove: new Prisma.Decimal(t.freeDeliveryAbove),
        taxPercent: new Prisma.Decimal(0),
      },
    });

    // categories
    const catMap = new Map<string, string>();
    for (let i = 0; i < t.categories.length; i++) {
      const c = await prisma.category.create({
        data: {
          tenantId: tenant.id,
          name: t.categories[i],
          slug: slugify(t.categories[i]),
          sortOrder: i,
        },
      });
      catMap.set(t.categories[i], c.id);
    }

    // products
    for (let i = 0; i < t.products.length; i++) {
      const p = t.products[i];
      await prisma.product.create({
        data: {
          tenantId: tenant.id,
          categoryId: catMap.get(p.category) ?? null,
          name: p.name,
          slug: slugify(p.name),
          shortDesc: p.shortDesc,
          description: `${p.shortDesc}. Freshly baked to order by ${t.name}. Choose your size, flavour and add a personal message at checkout.`,
          basePrice: new Prisma.Decimal(p.basePrice),
          compareAt: p.compareAt ? new Prisma.Decimal(p.compareAt) : null,
          images: [p.image],
          flavors: p.flavors,
          sizes: p.sizes,
          eggless: p.eggless ?? false,
          servesUpTo: p.servesUpTo ?? null,
          isFeatured: p.featured ?? false,
          rating: new Prisma.Decimal(p.rating ?? 4.8),
          ratingCount: Math.floor(Math.random() * 180) + 40,
          sortOrder: i,
        },
      });
    }

    // admin user (owner)
    await prisma.adminUser.create({
      data: {
        tenantId: tenant.id,
        name: `${t.name} Admin`,
        email: `admin@${t.slug}.ae`,
        passwordHash,
        role: "OWNER",
      },
    });

    // a sample coupon
    await prisma.coupon.create({
      data: {
        tenantId: tenant.id,
        code: "WELCOME10",
        type: "PERCENT",
        value: new Prisma.Decimal(10),
        minOrder: new Prisma.Decimal(100),
        maxDiscount: new Prisma.Decimal(50),
      },
    });

    console.log(`  ✓ ${t.name}  (admin@${t.slug}.ae / admin123)`);
  }

  console.log("\n✅  Done. Visit:");
  console.log("   http://sweet-bloom.localhost:3000");
  console.log("   http://cocoa-noir.localhost:3000");
  console.log("   http://rainbow-whisk.localhost:3000");
  console.log("   (or set DEFAULT_TENANT in .env and use http://localhost:3000)\n");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
