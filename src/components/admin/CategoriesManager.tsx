"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Plus, Trash2, Pencil, Check, X, Loader2, GripVertical } from "lucide-react";
import { saveCategory, deleteCategory } from "@/app/admin/actions";
import { Card, Input } from "./ui";

type Cat = { id: string; name: string; sortOrder: number; isActive: boolean; count: number };

export function CategoriesManager({ categories }: { categories: Cat[] }) {
  const [newName, setNewName] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [pending, start] = useTransition();

  function add() {
    if (!newName.trim()) return;
    start(async () => {
      await saveCategory({ name: newName.trim(), sortOrder: categories.length });
      setNewName("");
      toast.success("Category added");
    });
  }
  function saveEdit(id: string, sortOrder: number) {
    if (!editName.trim()) return;
    start(async () => {
      await saveCategory({ id, name: editName.trim(), sortOrder, isActive: true });
      setEditId(null);
      toast.success("Category updated");
    });
  }
  function remove(id: string, count: number) {
    if (count > 0 && !confirm(`This category has ${count} cake(s). Delete anyway? Cakes will become uncategorised.`)) return;
    start(async () => {
      await deleteCategory(id);
      toast.success("Category deleted");
    });
  }

  return (
    <div className="space-y-6">
      <Card>
        <h2 className="mb-4 text-lg font-bold">Add a category</h2>
        <div className="flex gap-3">
          <Input value={newName} onChange={(e) => setNewName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add()} placeholder="e.g. Birthday, Wedding, Cupcakes" />
          <button onClick={add} disabled={pending} className="btn-primary shrink-0">
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Add
          </button>
        </div>
      </Card>

      <Card className="!p-0">
        {categories.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted">No categories yet. Add your first above.</p>
        ) : (
          <div className="divide-y divide-line">
            {categories.map((c) => (
              <div key={c.id} className="flex items-center gap-3 px-5 py-3.5">
                <GripVertical className="h-4 w-4 text-muted/50" />
                {editId === c.id ? (
                  <>
                    <Input value={editName} onChange={(e) => setEditName(e.target.value)} className="flex-1" autoFocus />
                    <button onClick={() => saveEdit(c.id, c.sortOrder)} className="grid h-9 w-9 place-items-center rounded-lg bg-emerald-50 text-emerald-600"><Check className="h-4 w-4" /></button>
                    <button onClick={() => setEditId(null)} className="grid h-9 w-9 place-items-center rounded-lg bg-slate-100 text-slate-600"><X className="h-4 w-4" /></button>
                  </>
                ) : (
                  <>
                    <span className="flex-1 font-semibold">{c.name}</span>
                    <span className="rounded-full bg-cream px-2.5 py-1 text-xs text-muted">{c.count} cake{c.count !== 1 ? "s" : ""}</span>
                    <button onClick={() => { setEditId(c.id); setEditName(c.name); }} className="grid h-9 w-9 place-items-center rounded-lg text-muted hover:bg-brand-soft hover:text-brand"><Pencil className="h-4 w-4" /></button>
                    <button onClick={() => remove(c.id, c.count)} className="grid h-9 w-9 place-items-center rounded-lg text-muted hover:bg-red-50 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
