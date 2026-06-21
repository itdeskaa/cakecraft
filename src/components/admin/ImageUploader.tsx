"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { Upload, Loader2, X, ImageIcon } from "lucide-react";
import { toast } from "sonner";

type Props = {
  value?: string | null;
  onChange: (url: string | null) => void;
  label?: string;
  aspect?: "square" | "wide" | "round";
  hint?: string;
};

export function ImageUploader({ value, onChange, label, aspect = "square", hint }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);

  async function handleFile(file: File) {
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      onChange(data.url);
      toast.success("Image uploaded");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }

  const aspectCls = aspect === "wide" ? "aspect-[16/9]" : aspect === "round" ? "aspect-square rounded-full" : "aspect-square";

  return (
    <div>
      {label && <p className="mb-1.5 text-xs font-semibold text-muted">{label}</p>}
      <div
        onClick={() => !loading && inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files?.[0]; if (f) handleFile(f); }}
        className={`group relative grid w-full max-w-[220px] cursor-pointer place-items-center overflow-hidden border-2 border-dashed border-line bg-surface transition hover:border-brand/50 ${aspectCls} ${aspect === "round" ? "" : "rounded-2xl"}`}
      >
        {value ? (
          <>
            <Image src={value} alt="" fill sizes="220px" className="object-cover" />
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onChange(null); }}
              className="absolute right-2 top-2 z-10 grid h-7 w-7 place-items-center rounded-full bg-ink/70 text-white opacity-0 transition group-hover:opacity-100"
            >
              <X className="h-4 w-4" />
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center gap-1.5 p-4 text-center text-muted">
            {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : <ImageIcon className="h-6 w-6" />}
            <span className="text-xs font-medium">{loading ? "Uploading…" : "Click or drop image"}</span>
          </div>
        )}
        {loading && value && <div className="absolute inset-0 grid place-items-center bg-ink/40"><Loader2 className="h-6 w-6 animate-spin text-white" /></div>}
      </div>
      {hint && <p className="mt-1.5 text-xs text-muted">{hint}</p>}
      <input ref={inputRef} type="file" accept="image/*" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
    </div>
  );
}
