# 🚀 Deploy CakeCraft to Hostinger

This app is a **Next.js (Node.js) + MySQL** application — it needs a **Node.js runtime**,
not plain PHP hosting. Follow the path that matches your Hostinger plan.

---

## 0) First check: does your plan have Node.js?

In **hPanel**, open your website → look for **“Node.js”** (Advanced → Node.js, or
“Setup Node.js App”).

- ✅ **You see Node.js** (Business / Cloud plans usually have it) → follow **Path A** below.
  Best option: your MySQL **and** image uploads stay on the same server.
- ❌ **No Node.js** (basic Premium/shared) → **Path B** (host on Vercel, keep your
  Hostinger domain). You’ll need to upgrade for image uploads — see Path B notes.

> The `&`-in-path problem you saw locally does NOT exist on Hostinger (Linux). Normal
> `npm` commands work there.

---

## PATH A — Hostinger Node.js app (recommended)

### A1. Create the MySQL database
hPanel → **Databases → MySQL Databases**:
1. Create a database (e.g. `u123_cakecraft`) + a user with a strong password.
2. Note the **DB name, user, password, host** (host is usually `localhost`).

### A2. Upload the project
Use hPanel **File Manager** or SFTP. Upload the whole project folder **except**:
- `node_modules/`  (will be installed on the server)
- `.next/`  (will be built on the server)
- `.env`  (you’ll create a fresh one on the server)

Put it in a folder like `domains/yourdomain.in/cakecraft` (or whatever the Node.js
app setup points to).

### A3. Create the `.env` on the server
Copy `.env.production.example` → `.env` in the project folder and fill real values:
```
DATABASE_URL="mysql://u123_cake:STRONGPASS@localhost:3306/u123_cakecraft"
NEXTAUTH_SECRET="<run: openssl rand -base64 32>"
NEXTAUTH_URL="https://yourdomain.in"
NEXT_PUBLIC_APP_URL="https://yourdomain.in"
DEFAULT_TENANT="sweet-bloom"
UPLOAD_DIR=""          # leave empty in production
```

### A4. Set up the Node.js app
hPanel → **Node.js**:
- **Node version:** 18 or 20 (LTS)
- **Application root:** the folder you uploaded to
- **Application startup file:** `server.js`   ← (included in this project)
- **Application URL:** your domain

### A5. Install, build, prepare DB (via SSH or hPanel terminal)
Open SSH / the browser terminal, `cd` into the project folder, then:
```bash
npm install
npm run build
npx prisma db push            # create all tables
npm run db:seed               # demo brands + admin logins
node scripts/make-india-only.mjs   # convert everything to INR (India)
```
> If `npm run build` runs out of memory on a small plan, build locally on your PC
> (`npm run build`) and upload the generated `.next/` folder instead.

### A6. Start the app
In hPanel → Node.js → **Restart / Start** the app. It runs `server.js` on the port
Hostinger provides.

### A7. Domain + free SSL
- Point the domain to this app (hPanel usually links it automatically when you set the
  Application URL).
- hPanel → **SSL** → install the **free Let’s Encrypt SSL** for the domain. HTTPS is
  required for Razorpay, login cookies, and QR scanning.

✅ Visit `https://yourdomain.in` — your store is live.

---

## After it’s live (do these in the Admin)

Go to `https://yourdomain.in/admin` → log in with `admin@sweet-bloom.ae` / `admin123`.

1. **⚠️ Change the admin password** (currently the demo `admin123` — insecure for
   production). *Ask me to add a “change password” screen if you want it in the UI;
   for now it can be reset in the database.*
2. **Branding** → set your real logo, store name, colours.
3. **Delivery & Store** → real India phone, address, city, delivery fee.
4. **Notifications** → enter your SMTP (Gmail App Password etc.) and send a test email.
5. **Payments** → add your **Razorpay LIVE** keys, enable online payments.
6. **Cakes / Menu** → delete the demo cakes, add your real products & prices.
7. Remove the demo brands you don’t need (Cocoa Noir, Rainbow Whisk) if single-brand.

---

## PATH B — No Node.js on your plan

Easiest free route, keep your Hostinger domain:

1. Push this project to **GitHub**.
2. Create a free **Vercel** account → “Import Project” → select the repo. Vercel runs
   Next.js natively.
3. Add a **managed MySQL** (Railway / Aiven free tier) and set `DATABASE_URL` in Vercel
   env vars (plus the other env vars from `.env.production.example`).
4. In Hostinger → **DNS Zone**, point your domain to Vercel (Vercel shows the exact A /
   CNAME records).

⚠️ **Important for Vercel:** the file-upload feature (logo / product images) writes to
local disk, which Vercel does **not** persist. You must switch uploads to cloud storage
(Cloudinary / Vercel Blob / S3) first — **ask me and I’ll convert the upload code** (it’s
a small change in `src/app/api/admin/upload/route.ts` + `ImageUploader`).

> Or simplest of all: **upgrade Hostinger to a plan with Node.js (or a VPS)** and use
> Path A — then nothing in the code needs changing.

---

## Troubleshooting

| Problem | Fix |
|---|---|
| 500 / app won’t start | Check Node.js app **logs** in hPanel. Usually a wrong `DATABASE_URL` or missing `.env`. |
| “No active tenant found” | You didn’t run `npm run db:seed`. Run it, then `node scripts/make-india-only.mjs`. |
| Login fails / redirect loop | `NEXTAUTH_URL` must exactly match your live `https://` domain, and SSL must be active. |
| Images upload but show broken | `UPLOAD_DIR` should be empty in prod; the `public/uploads` folder must be writable. |
| Razorpay popup error | Use LIVE keys + HTTPS; set them in Admin → Payments. |
| Prices show wrong currency | Re-run `node scripts/make-india-only.mjs`. |

---

Need help with any step? Tell me your plan name + what hPanel shows under “Node.js”, and
I’ll give you the exact clicks.
