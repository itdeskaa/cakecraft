"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { motion } from "framer-motion";
import { Cake, Loader2, Lock, Mail } from "lucide-react";
import { toast } from "sonner";

export function LoginForm({
  tenantId,
  tenantName,
  demoEmail,
}: {
  tenantId: string;
  tenantName: string;
  primaryColor: string;
  demoEmail: string;
}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await signIn("credentials", {
      email, password, tenantId, redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      toast.error("Invalid email or password");
    } else {
      toast.success("Welcome back!");
      router.push("/admin");
      router.refresh();
    }
  }

  return (
    <div className="grid min-h-screen place-items-center bg-cream px-5">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md"
      >
        <div className="mb-6 flex flex-col items-center text-center">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-brand text-brand-fg shadow-glow">
            <Cake className="h-7 w-7" />
          </span>
          <h1 className="mt-4 font-display text-3xl font-black">{tenantName}</h1>
          <p className="mt-1 text-sm text-muted">Admin Portal — sign in to manage your store</p>
        </div>

        <form onSubmit={submit} className="card space-y-4 p-7">
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-muted">Email</span>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input
                type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder={demoEmail}
                className="w-full rounded-2xl border border-line bg-surface py-3 pl-10 pr-4 text-sm outline-none focus:border-brand/50"
              />
            </div>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-muted">Password</span>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input
                type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-2xl border border-line bg-surface py-3 pl-10 pr-4 text-sm outline-none focus:border-brand/50"
              />
            </div>
          </label>

          <button type="submit" disabled={loading} className="btn-primary w-full !py-3.5">
            {loading ? <><Loader2 className="h-5 w-5 animate-spin" /> Signing in…</> : "Sign in"}
          </button>

          <p className="rounded-xl bg-brand-soft px-3 py-2.5 text-center text-xs text-brand">
            Demo: <b>{demoEmail}</b> / <b>admin123</b>
          </p>
        </form>
      </motion.div>
    </div>
  );
}
