"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import { Loader2, Save, Plus, X, ImagePlus } from "lucide-react";
import { saveProduct, type ProductInput } from "@/app/admin/actions";
import { Card, Field, Input, Textarea, Select, Toggle } from "./ui";

type Category = { id: string; name: string };
type Size = { label: string; price: number };

export function ProductForm({
  categories, product,
}: {
  categories: Category[];
  product?: any;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();

  const [name, setName] = useState(product?.name ?? "");
  const [categoryId, setCategoryId] = useState<string>(product?.categoryId ?? "");
  const [shortDesc, setShortDesc] = useState(product?.shortDesc ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [basePrice, setBasePrice] = useState(String(product ? Number(product.basePrice) : ""));
  const [compareAt, setCompareAt] = useState(product?.compareAt ? String(Number(product.compareAt)) : "");
  const [images, setImages] = useState<string[]>((product?.images as string[]) ?? []);
  const [flavors, setFlavors] = useState<string[]>((product?.flavors as string[]) ?? []);
  const [flavorInput, setFlavorInput] = useState("");
  const [sizes, setSizes] = useState<Size[]>((product?.sizes as Size[]) ?? [{ label: "1 kg", price: 0 }]);
  const [eggless, setEggless] = useState<boolean>(product?.eggless ?? false);
  const [servesUpTo, setServesUpTo] = useState(product?.servesUpTo ? String(product.servesUpTo) : "");
  const [isFeatured, setIsFeatured] = useState<boolean>(product?.isFeatured ?? false);
  const [isAvailable, setIsAvailable] = useState<boolean>(product?.isAvailable ?? true);
  const [uploading, setUploading] = useState(false);

  async function uploadImages(files: FileList) {
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setImages((prev) => [...prev, data.url]);
      }
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setUploading(false);
    }
  }

  function addFlavor() {
    const v = flavorInput.trim();
    if (v && !flavors.includes(v)) setFlavors((f) => [...f, v]);
    setFlavorInput("");
  }

  function save() {
    if (!name.trim()) return toast.error("Enter a cake name");
    if (!basePrice) return toast.error("Enter a base price");

    const payload: ProductInput = {
      id: product?.id,
      name: name.trim(),
      categoryId: categoryId || null,
      shortDesc, description,
      basePrice,
      compareAt: compareAt || null,
      images,
      flavors,
      sizes: sizes.filter((s) => s.label.trim()).map((s) => ({ label: s.label, price: Number(s.price) || 0 })),
      eggless,
      servesUpTo: servesUpTo ? Number(servesUpTo) : null,
      isFeatured,
      isAvailable,
    };
    start(async () => {
      await saveProduct(payload);
      toast.success(product ? "Cake updated" : "Cake added");
      router.push("/admin/products");
      router.refresh();
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
      {/* Main */}
      <div className="space-y-6">
        <Card>
          <h2 className="mb-5 text-lg font-bold">Cake details</h2>
          <div className="grid gap-5">
            <Field label="Name *"><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Belgian Chocolate Truffle" /></Field>
            <Field label="Short description" hint="Shown on cards"><Input value={shortDesc} onChange={(e) => setShortDesc(e.target.value)} placeholder="Triple layer dark chocolate ganache" /></Field>
            <Field label="Full description"><Textarea rows={4} value={description} onChange={(e) => setDescription(e.target.value)} /></Field>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Category">
                <Select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                  <option value="">Uncategorised</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </Select>
              </Field>
              <Field label="Serves up to (people)"><Input type="number" value={servesUpTo} onChange={(e) => setServesUpTo(e.target.value)} placeholder="8" /></Field>
            </div>
          </div>
        </Card>

        <Card>
          <h2 className="mb-1 text-lg font-bold">Photos</h2>
          <p className="mb-4 text-sm text-muted">First image is the cover. Add as many as you like.</p>
          <div className="flex flex-wrap gap-3">
            {images.map((src, i) => (
              <div key={src} className="group relative h-24 w-24 overflow-hidden rounded-2xl border border-line">
                <Image src={src} alt="" fill sizes="96px" className="object-cover" />
                {i === 0 && <span className="absolute left-1 top-1 rounded-full bg-brand px-1.5 py-0.5 text-[10px] font-bold text-brand-fg">Cover</span>}
                <button type="button" onClick={() => setImages(images.filter((x) => x !== src))} className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-ink/70 text-white opacity-0 transition group-hover:opacity-100"><X className="h-3.5 w-3.5" /></button>
              </div>
            ))}
            <label className="grid h-24 w-24 cursor-pointer place-items-center rounded-2xl border-2 border-dashed border-line text-muted transition hover:border-brand/50">
              {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <ImagePlus className="h-5 w-5" />}
              <input type="file" accept="image/*" multiple hidden onChange={(e) => e.target.files && uploadImages(e.target.files)} />
            </label>
          </div>
        </Card>

        <Card>
          <h2 className="mb-5 text-lg font-bold">Sizes & pricing</h2>
          <Field label="Base price *" className="mb-5 max-w-xs" hint="Used when no size is selected">
            <Input type="number" value={basePrice} onChange={(e) => setBasePrice(e.target.value)} placeholder="145" />
          </Field>
          <Field label="Compare-at price" className="mb-5 max-w-xs" hint="Optional strike-through price">
            <Input type="number" value={compareAt} onChange={(e) => setCompareAt(e.target.value)} placeholder="195" />
          </Field>

          <p className="mb-2 text-xs font-semibold text-muted">Size options</p>
          <div className="space-y-2.5">
            {sizes.map((s, i) => (
              <div key={i} className="flex gap-2.5">
                <Input value={s.label} onChange={(e) => setSizes(sizes.map((x, j) => j === i ? { ...x, label: e.target.value } : x))} placeholder="1 kg" className="flex-1" />
                <Input type="number" value={s.price} onChange={(e) => setSizes(sizes.map((x, j) => j === i ? { ...x, price: Number(e.target.value) } : x))} placeholder="price" className="w-32" />
                <button type="button" onClick={() => setSizes(sizes.filter((_, j) => j !== i))} className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-muted hover:bg-red-50 hover:text-red-500"><X className="h-4 w-4" /></button>
              </div>
            ))}
          </div>
          <button type="button" onClick={() => setSizes([...sizes, { label: "", price: 0 }])} className="btn-ghost mt-3 !py-2 text-sm"><Plus className="h-4 w-4" /> Add size</button>
        </Card>

        <Card>
          <h2 className="mb-4 text-lg font-bold">Flavours</h2>
          <div className="flex gap-2.5">
            <Input value={flavorInput} onChange={(e) => setFlavorInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addFlavor())} placeholder="Type a flavour and press Enter" />
            <button type="button" onClick={addFlavor} className="btn-ghost shrink-0 !py-2"><Plus className="h-4 w-4" /></button>
          </div>
          {flavors.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {flavors.map((f) => (
                <span key={f} className="chip">{f}<button type="button" onClick={() => setFlavors(flavors.filter((x) => x !== f))}><X className="h-3 w-3" /></button></span>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Sidebar */}
      <div className="space-y-4 lg:sticky lg:top-8 lg:h-fit">
        <Card className="space-y-3">
          <h2 className="text-lg font-bold">Visibility</h2>
          <Toggle checked={isAvailable} onChange={setIsAvailable} label="Available" desc="Show on the store & allow ordering" />
          <Toggle checked={isFeatured} onChange={setIsFeatured} label="Featured" desc="Highlight as a bestseller" />
          <Toggle checked={eggless} onChange={setEggless} label="Eggless" desc="Mark as an eggless cake" />
        </Card>

        <button onClick={save} disabled={pending} className="btn-primary w-full !py-3.5">
          {pending ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</> : <><Save className="h-4 w-4" /> {product ? "Update cake" : "Add cake"}</>}
        </button>
        <button onClick={() => router.back()} className="btn-ghost w-full">Cancel</button>
      </div>
    </div>
  );
}
