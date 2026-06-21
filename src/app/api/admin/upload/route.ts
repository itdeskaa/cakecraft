import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { getAdminSession } from "@/lib/session";

export const runtime = "nodejs";

const ALLOWED = ["image/png", "image/jpeg", "image/webp", "image/svg+xml", "image/x-icon"];
const MAX = 6 * 1024 * 1024; // 6 MB

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
  const form = await req.formData();
  const file = form.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });
  if (!ALLOWED.includes(file.type))
    return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
  if (file.size > MAX)
    return NextResponse.json({ error: "File too large (max 6 MB)" }, { status: 400 });

  const bytes = Buffer.from(await file.arrayBuffer());
  const ext = (file.name.split(".").pop() || "png").toLowerCase().replace(/[^a-z0-9]/g, "");
  const slug = (session.user as any).tenantSlug || "tenant";
  const filename = `${slug}-${randomUUID()}.${ext}`;

  // ── Cloud storage (Cloudinary) — used on hosts with no persistent disk
  //    (Vercel/Netlify/etc.). Enabled when these env vars are set. ──
  const cloud = process.env.CLOUDINARY_CLOUD_NAME;
  const preset = process.env.CLOUDINARY_UPLOAD_PRESET;
  if (cloud && preset) {
    const cf = new FormData();
    cf.append("file", new Blob([bytes], { type: file.type }), filename);
    cf.append("upload_preset", preset);
    cf.append("folder", `cakecraft/${slug}`);
    const isImage = file.type !== "image/svg+xml"; // svg uploads as raw/auto
    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${cloud}/${isImage ? "image" : "auto"}/upload`,
      { method: "POST", body: cf }
    );
    const data = await res.json();
    if (!res.ok || !data.secure_url) {
      return NextResponse.json({ error: data?.error?.message || "Cloud upload failed" }, { status: 400 });
    }
    return NextResponse.json({ url: data.secure_url });
  }

  // ── Local disk fallback (local dev / Node hosting with a persistent disk) ──
  try {
    const dir = process.env.UPLOAD_DIR
      ? process.env.UPLOAD_DIR
      : path.join(process.cwd(), "public", "uploads");
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, filename), bytes);
    return NextResponse.json({ url: `/uploads/${filename}` });
  } catch {
    return NextResponse.json(
      { error: "Uploads aren't supported on this host. Set up Cloudinary (Admin → Notifications docs) and add CLOUDINARY_CLOUD_NAME + CLOUDINARY_UPLOAD_PRESET." },
      { status: 400 }
    );
  }
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Upload failed" }, { status: 500 });
  }
}
