# 🆓 Deploy CakeCraft FREE & always-on (Vercel + TiDB + Cloudinary)

Goal: a public link anyone can open **even when your laptop is off**, for ₹0.

Three free services (all genuinely free, always-on):
| Piece | Service | Free? |
|---|---|---|
| App (Next.js) | **Vercel** | ✅ Hobby tier, always-on |
| Database (MySQL) | **TiDB Cloud Serverless** | ✅ free, MySQL-compatible |
| Image uploads | **Cloudinary** | ✅ free tier |

The code already supports Cloudinary uploads automatically when the env vars are set.

---

## Step 1 — Free MySQL database (TiDB Cloud)
1. Go to **tidbcloud.com** → sign up (free) → create a **Serverless** cluster.
2. Click **Connect** → choose **Prisma** (or “General”) → copy the **connection string**.
   It looks like:
   ```
   mysql://xxxx.root:PASSWORD@gateway01.xxx.prod.aws.tidbcloud.com:4000/test?sslaccept=strict
   ```
3. Keep it — this is your `DATABASE_URL`. (You can keep DB name `test` or create `cakecraft`.)

> Alternative free MySQL: **Aiven** (aiven.io) free plan.

## Step 2 — Free image storage (Cloudinary)
1. Go to **cloudinary.com** → sign up free.
2. Dashboard → note your **Cloud name**.
3. **Settings → Upload → Upload presets → Add unsigned preset** → set **Signing Mode =
   Unsigned** → save. Note the **preset name**.
4. You now have `CLOUDINARY_CLOUD_NAME` and `CLOUDINARY_UPLOAD_PRESET`.

## Step 3 — Set up the database (run once from YOUR laptop)
On your PC, point the app at the cloud DB and push the schema + data:
```powershell
# in the project folder
$env:DATABASE_URL = "PASTE-YOUR-TIDB-URL-HERE"
$NODE = "C:\Program Files\nodejs\node.exe"
& $NODE node_modules\prisma\build\index.js db push
& $NODE node_modules\tsx\dist\cli.mjs prisma\seed.ts
& $NODE scripts\make-india-only.mjs
```
This creates all tables + the demo brands (admin logins) in the cloud DB, in INR.

## Step 4 — Put the code on GitHub
A git repo + first commit are already prepared for you. Just:
1. Create a new **empty** repo on **github.com** (e.g. `cakecraft`), no README.
2. Connect & push (replace the URL):
   ```bash
   git remote add origin https://github.com/YOURNAME/cakecraft.git
   git branch -M main
   git push -u origin main
   ```
   (GitHub will ask you to log in / use a token.)

## Step 5 — Deploy on Vercel
1. Go to **vercel.com** → sign up with GitHub → **Add New → Project** → import your repo.
2. Before clicking Deploy, open **Environment Variables** and add:
   | Name | Value |
   |---|---|
   | `DATABASE_URL` | your TiDB connection string |
   | `NEXTAUTH_SECRET` | a long random string |
   | `NEXTAUTH_URL` | `https://YOURPROJECT.vercel.app` (set after first deploy, then redeploy) |
   | `NEXT_PUBLIC_APP_URL` | `https://YOURPROJECT.vercel.app` |
   | `DEFAULT_TENANT` | `sweet-bloom` |
   | `CLOUDINARY_CLOUD_NAME` | your cloud name |
   | `CLOUDINARY_UPLOAD_PRESET` | your unsigned preset |
3. Click **Deploy**. Wait ~2 min.
4. Vercel gives you `https://YOURPROJECT.vercel.app`. Copy it into `NEXTAUTH_URL` and
   `NEXT_PUBLIC_APP_URL` (Settings → Environment Variables) and **Redeploy** once so login
   + QR links use the real URL.

✅ Done — share `https://YOURPROJECT.vercel.app`. It stays up 24×7, laptop off or on.

## Step 6 — After it’s live
`https://YOURPROJECT.vercel.app/admin` → log in `admin@sweet-bloom.ae` / `admin123`:
- **Change the admin password** (ask me to add a UI for it).
- Branding (logo, name, colours), products, delivery, SMTP, Razorpay.

---

## Attach your Hostinger domain (optional, later)
Vercel → Project → **Settings → Domains** → add `yourdomain.in`. Vercel shows the DNS
records; add them in Hostinger **DNS Zone**. Then update `NEXTAUTH_URL` /
`NEXT_PUBLIC_APP_URL` to the domain and redeploy. Free SSL is automatic.

## Notes / limits (free tiers)
- Vercel Hobby is for non-commercial/personal use — fine for testing. For real sales
  later, use Hostinger Node/VPS (see `DEPLOY-HOSTINGER.md`) or a Vercel paid plan.
- TiDB/Cloudinary free tiers are generous for testing.
- Don’t commit the real `.env` (already git-ignored).
