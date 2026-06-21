import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/session";
import { sendMail, verifySmtp } from "@/lib/email";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const { tenant } = await requireAdmin();
  const { to } = await req.json();
  if (!to) return NextResponse.json({ error: "Enter an email address to send the test to" }, { status: 400 });

  // Verify the connection first for a clearer error message.
  const v = await verifySmtp(tenant);
  if (!v.ok) return NextResponse.json({ error: `SMTP connection failed: ${v.error}` }, { status: 400 });

  const res = await sendMail(tenant, {
    to,
    subject: `✅ Test email from ${tenant.name}`,
    html: `
      <div style="font-family:Segoe UI,Arial,sans-serif;padding:24px">
        <h2 style="color:${tenant.primaryColor}">It works! 🎉</h2>
        <p>This is a test email from <b>${tenant.name}</b>'s order notification system.</p>
        <p>Your customers will now receive order confirmations and live status updates automatically.</p>
      </div>`,
  });

  if (!res.ok) return NextResponse.json({ error: "Could not send the test email" }, { status: 400 });
  return NextResponse.json({ ok: true });
}
