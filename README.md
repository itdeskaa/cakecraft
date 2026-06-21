# 🎂 CakeCraft — Multi-Tenant Cake Commerce Platform

One premium codebase, **many cake companies**. Each brand gets its own logo, colours,
fonts, menu, payment settings and delivery rules — all from a shared, enterprise-grade
Next.js application.

> **Status:** Phases 1 & 2 complete → animated storefront **+ full admin portal**.
> Phase 3 (super-admin onboarding) is next. See [Roadmap](#-roadmap).

---

## ✨ What's built so far

- **Multi-tenant core** — tenant resolved by subdomain (`sweet-bloom.localhost:3000`) or
  custom domain, with per-tenant theme (colours, fonts, logo) injected as CSS variables.
- **Premium animated storefront** (Framer Motion):
  - Parallax hero with floating cards & animated gradient text
  - Category grid, bestsellers, "our story", CTA banner, marquee
  - 3D-tilt cake cards with quick-add
  - Menu page with animated filtering, search & sort
  - Cake detail with size / flavour / message configurator
  - Cart with live totals, coupons, free-delivery progress
  - Checkout with **Cash on Delivery** + **Razorpay** (online)
  - Order confirmation
- **Server-trusted ordering** — prices, delivery fee, tax and discounts are recomputed
  on the server; never trusted from the client.
- **MySQL + Prisma** data model with 3 seeded demo brands.

### 🔐 Admin portal (`/admin`)
Per-brand, secure (NextAuth credentials, tenant-scoped — brand A admins can't touch brand B):

- **Dashboard** — live stats (orders, revenue, new orders, menu size) + recent orders
- **Orders** — filter by status, full order detail, **status workflow** (Placed → Confirmed →
  Baking → Out for delivery → Delivered / Cancelled), mark-as-paid
- **Cakes / Menu** — add / edit / delete cakes, multi-image upload, sizes, flavours,
  featured & availability toggles
- **Categories** — inline add / edit / remove
- **Coupons** — percent / flat discount codes
- **Branding & Logo** — **upload your logo**, hero image, favicon; pick theme colours
  (with palette presets + live preview) and font theme — instantly re-themes the storefront
- **Payments** — **enable/disable Cash on Delivery**, enable online payments, store
  per-brand Razorpay keys
- **Delivery & Store** — contact info, currency, **delivery fee**, free-delivery threshold,
  min order, tax %

> Sign in at **http://&lt;brand&gt;.localhost:3000/admin** with the demo logins below.

---

## 🧰 Prerequisites (install these first)

This project needs **Node.js** and **MySQL**, which aren't on your machine yet.

### 1. Node.js (v18.18+ or v20 LTS)
Download the **Windows LTS installer**: https://nodejs.org/en/download
Run it, accept defaults, then **open a new terminal** and verify:
```bash
node -v
npm -v
```

### 2. MySQL (v8)
Easiest options:
- **MySQL Installer for Windows**: https://dev.mysql.com/downloads/installer/  → choose "Server only", set a root password.
- *or* install **XAMPP** (bundles MySQL/MariaDB): https://www.apachefriends.org/

Create the database (in MySQL shell or MySQL Workbench):
```sql
CREATE DATABASE cakecraft CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

---

## 🚀 Setup

```bash
# 1. Install dependencies
npm install

# 2. Create your environment file
copy .env.example .env
#    → edit .env and set DATABASE_URL with your MySQL user/password
#      e.g. mysql://root:YOURPASSWORD@localhost:3306/cakecraft

# 3. Create the tables
npm run db:push

# 4. Seed 3 demo cake brands + products + admins
npm run db:seed

# 5. Start the dev server
npm run dev
```

Open: **http://localhost:3000** (loads the `DEFAULT_TENANT` from `.env`).

### ⚠️ Windows note for this machine (`A&A-415`)
The folder path contains a `&`, which breaks npm's `.cmd` shims (`npm run dev` fails with
`Cannot find module C:\Users\prisma\...`). Run the binaries through **node directly** instead.
This machine uses **XAMPP MySQL** (`D:\xampp`, user `root`, no password) — start MySQL from
the XAMPP Control Panel first. Node lives at `C:\Program Files\nodejs`.

```powershell
# from the project folder
$P = "C:\Users\A&A-415\Documents\Ideas\Project Cake"
$NODE = "C:\Program Files\nodejs\node.exe"

& $NODE "$P\node_modules\prisma\build\index.js" generate
& $NODE "$P\node_modules\prisma\build\index.js" db push
& $NODE "$P\node_modules\tsx\dist\cli.mjs" "$P\prisma\seed.ts"
& $NODE "$P\node_modules\next\dist\bin\next" dev      # → http://localhost:3000
```
> Tip: moving the project to a path without `&` (e.g. `C:\Projects\cakecraft`) lets the normal
> `npm run dev` / `npm run db:seed` commands work directly.

### Try the multi-tenant magic
Each brand has its own theme. Visit (works out-of-the-box on Chrome/Edge):
- http://sweet-bloom.localhost:3000  → rose & gold, classic serif 🌸
- http://cocoa-noir.localhost:3000   → dark chocolate & gold, modern 🍫
- http://rainbow-whisk.localhost:3000 → purple & amber, playful 🌈

> `*.localhost` subdomains resolve automatically in modern browsers — no hosts-file edit needed.

### Demo admin logins (for upcoming admin portal)
| Brand | Email | Password |
|-------|-------|----------|
| Sweet Bloom | `admin@sweet-bloom.ae` | `admin123` |
| Cocoa Noir | `admin@cocoa-noir.ae` | `admin123` |
| Rainbow Whisk | `admin@rainbow-whisk.ae` | `admin123` |

---

## 💳 Enabling Razorpay (online payments)

Cash on Delivery works immediately. For online payments:
1. Get **test keys** from https://dashboard.razorpay.com → Settings → API Keys.
2. Either set them globally in `.env` (`RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`),
   or per-brand in the Admin portal (Phase 2). Per-tenant keys override the env.
3. Set the tenant's `onlinePayEnabled = true` (Admin portal, or DB for now).

---

## 🗂️ Project structure

```
src/
├─ app/
│  ├─ (shop)/              # customer storefront (Navbar + Footer layout)
│  │  ├─ page.tsx          # home
│  │  ├─ menu/             # catalogue + filtering
│  │  ├─ cake/[slug]/      # product detail
│  │  ├─ cart/             # cart
│  │  ├─ checkout/         # checkout (COD + Razorpay)
│  │  └─ order-confirmed/
│  ├─ admin/
│  │  ├─ login/            # tenant-aware admin sign-in
│  │  ├─ (dash)/           # protected: dashboard, orders, products,
│  │  │                    #   categories, coupons, branding, payments, settings
│  │  └─ actions.ts        # all admin mutations (server actions)
│  ├─ api/
│  │  ├─ auth/[...nextauth]/ # NextAuth credentials
│  │  ├─ admin/upload/     # image upload → /public/uploads
│  │  ├─ checkout/         # create order (+ Razorpay order)
│  │  └─ payment/verify/   # verify Razorpay signature
│  ├─ layout.tsx           # root: per-tenant theme + fonts
│  └─ globals.css          # design system
├─ components/
│  ├─ motion/              # Reveal / Stagger animation primitives
│  └─ storefront/          # Navbar, Hero, CakeCard, Cart, Checkout…
├─ lib/
│  ├─ tenant.ts            # multi-tenant resolution
│  ├─ prisma.ts  queries.ts  orders.ts  razorpay.ts  cart-store.ts
│  └─ utils.ts  validators.ts
├─ middleware.ts           # subdomain → x-tenant header
prisma/
├─ schema.prisma          # multi-tenant data model
└─ seed.ts                # 3 demo brands
```

---

## 🛣️ Roadmap

- [x] **Phase 1** — Foundation + premium animated storefront
- [x] **Phase 2** — Admin portal: login, dashboard, **logo upload**, menu CRUD,
      categories, coupons, **payment gateway config**, **COD enable/disable**,
      **delivery fee**, orders management, order status workflow
- [ ] **Phase 3** — Super-admin: onboard new cake companies, branding wizard, analytics
- [ ] **Phase 4** — Email/WhatsApp notifications, reviews, image hosting (Cloudinary), deploy

---

Built with Next.js 14 · TypeScript · Tailwind CSS · Framer Motion · Prisma · MySQL · Razorpay.
