"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Loader2, Save, Mail, Send, Info, CheckCircle2 } from "lucide-react";
import { updateNotifications } from "@/app/admin/actions";
import { Card, Field, Input, Toggle, Select } from "./ui";

type T = {
  emailEnabled: boolean;
  smtpHost: string; smtpPort: string; smtpSecure: boolean;
  smtpUser: string; hasPass: boolean;
  smtpFromName: string; smtpFromEmail: string; notifyEmail: string;
};

const PRESETS: Record<string, { host: string; port: string; secure: boolean; hint: string }> = {
  Gmail: { host: "smtp.gmail.com", port: "587", secure: false, hint: "Use an App Password (not your login password) — myaccount.google.com → Security → App passwords." },
  "Outlook / Microsoft 365": { host: "smtp.office365.com", port: "587", secure: false, hint: "Use your full email + account password (or app password if 2FA)." },
  Zoho: { host: "smtp.zoho.com", port: "465", secure: true, hint: "Zoho Mail SMTP. Generate an app-specific password if 2FA is on." },
  "Brevo (Sendinblue)": { host: "smtp-relay.brevo.com", port: "587", secure: false, hint: "Free 300 emails/day. Use the SMTP key from your Brevo account." },
};

export function NotificationsForm({ initial }: { initial: T }) {
  const [f, setF] = useState(initial);
  const [pass, setPass] = useState(initial.hasPass ? "••••••••••••" : "");
  const [testTo, setTestTo] = useState("");
  const [pending, start] = useTransition();
  const [testing, setTesting] = useState(false);
  const set = (k: keyof T, v: any) => setF((s) => ({ ...s, [k]: v }));

  function applyPreset(name: string) {
    const p = PRESETS[name];
    if (!p) return;
    setF((s) => ({ ...s, smtpHost: p.host, smtpPort: p.port, smtpSecure: p.secure }));
    toast.message(name, { description: p.hint });
  }

  function save() {
    start(async () => {
      await updateNotifications({
        emailEnabled: f.emailEnabled,
        smtpHost: f.smtpHost, smtpPort: f.smtpPort, smtpSecure: f.smtpSecure,
        smtpUser: f.smtpUser, smtpPass: pass,
        smtpFromName: f.smtpFromName, smtpFromEmail: f.smtpFromEmail, notifyEmail: f.notifyEmail,
      });
      toast.success("Notification settings saved");
    });
  }

  async function sendTest() {
    if (!testTo) return toast.error("Enter an email to send the test to");
    setTesting(true);
    try {
      // Save first so the latest SMTP settings are used by the server.
      await updateNotifications({
        emailEnabled: f.emailEnabled, smtpHost: f.smtpHost, smtpPort: f.smtpPort, smtpSecure: f.smtpSecure,
        smtpUser: f.smtpUser, smtpPass: pass, smtpFromName: f.smtpFromName, smtpFromEmail: f.smtpFromEmail, notifyEmail: f.notifyEmail,
      });
      const res = await fetch("/api/admin/test-email", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ to: testTo }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Test failed");
      toast.success(`Test email sent to ${testTo} 🎉`);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setTesting(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <div className="mb-5 flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-soft text-brand"><Mail className="h-5 w-5" /></span>
          <div><h2 className="text-lg font-bold">Email notifications</h2><p className="text-sm text-muted">Auto-send order confirmations & status updates to customers, plus new-order alerts to you.</p></div>
        </div>
        <Toggle checked={f.emailEnabled} onChange={(v) => set("emailEnabled", v)} label="Enable email notifications" desc="When on, emails are sent automatically using the SMTP below" />
      </Card>

      <Card>
        <h2 className="text-lg font-bold">SMTP server</h2>
        <p className="mt-1 mb-4 text-sm text-muted">Quick setup — pick your provider:</p>
        <div className="mb-6 flex flex-wrap gap-2">
          {Object.keys(PRESETS).map((name) => (
            <button key={name} type="button" onClick={() => applyPreset(name)} className="rounded-full border border-line bg-surface px-3.5 py-1.5 text-xs font-semibold transition hover:border-brand/40 hover:text-brand">
              {name}
            </button>
          ))}
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="SMTP host"><Input value={f.smtpHost} onChange={(e) => set("smtpHost", e.target.value)} placeholder="smtp.gmail.com" /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Port"><Input value={f.smtpPort} onChange={(e) => set("smtpPort", e.target.value)} placeholder="587" /></Field>
            <Field label="Security">
              <Select value={f.smtpSecure ? "ssl" : "tls"} onChange={(e) => set("smtpSecure", e.target.value === "ssl")}>
                <option value="tls">STARTTLS (587)</option>
                <option value="ssl">SSL/TLS (465)</option>
              </Select>
            </Field>
          </div>
          <Field label="SMTP username"><Input value={f.smtpUser} onChange={(e) => set("smtpUser", e.target.value)} placeholder="you@gmail.com" /></Field>
          <Field label="SMTP password / app key"><Input type="password" value={pass} onChange={(e) => setPass(e.target.value)} placeholder="App password" /></Field>
          <Field label="From name" hint="Shown as the sender"><Input value={f.smtpFromName} onChange={(e) => set("smtpFromName", e.target.value)} placeholder="Naba Ice Cakes" /></Field>
          <Field label="From email" hint="Usually same as username"><Input value={f.smtpFromEmail} onChange={(e) => set("smtpFromEmail", e.target.value)} placeholder="orders@yourdomain.com" /></Field>
          <Field label="New-order alerts go to" hint="Your inbox for new orders" className="sm:col-span-2"><Input value={f.notifyEmail} onChange={(e) => set("notifyEmail", e.target.value)} placeholder="owner@yourstore.ae" /></Field>
        </div>

        <div className="mt-5 flex gap-2 rounded-2xl bg-blue-50 p-4 text-sm text-blue-800">
          <Info className="h-5 w-5 shrink-0" />
          <p><b>Gmail tip:</b> turn on 2-step verification, then create an <b>App Password</b> (Google Account → Security → App passwords) and use that here — your normal password won’t work.</p>
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-bold">Send a test email</h2>
        <p className="mt-1 mb-4 text-sm text-muted">Verify your settings work before going live.</p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Input value={testTo} onChange={(e) => setTestTo(e.target.value)} placeholder="your@email.com" className="flex-1" />
          <button onClick={sendTest} disabled={testing} className="btn-ghost shrink-0">
            {testing ? <><Loader2 className="h-4 w-4 animate-spin" /> Sending…</> : <><Send className="h-4 w-4" /> Send test</>}
          </button>
        </div>
      </Card>

      <div className="sticky bottom-4 z-10 flex justify-end">
        <button onClick={save} disabled={pending} className="btn-primary shadow-glow">
          {pending ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</> : <><Save className="h-4 w-4" /> Save settings</>}
        </button>
      </div>
    </div>
  );
}
