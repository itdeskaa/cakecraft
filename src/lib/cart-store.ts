"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItem = {
  id: string; // unique line id (product + size + flavor + message)
  productId: string;
  name: string;
  image?: string;
  flavor?: string;
  size?: string;
  message?: string;
  unitPrice: number;
  quantity: number;
};

type CartState = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "id" | "quantity">, qty?: number) => void;
  removeItem: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
  count: () => number;
  subtotal: () => number;
};

const lineId = (i: Omit<CartItem, "id" | "quantity">) =>
  [i.productId, i.size, i.flavor, i.message].filter(Boolean).join("|");

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item, qty = 1) => {
        const id = lineId(item);
        const items = [...get().items];
        const existing = items.find((i) => i.id === id);
        if (existing) {
          existing.quantity += qty;
          set({ items });
        } else {
          set({ items: [...items, { ...item, id, quantity: qty }] });
        }
      },
      removeItem: (id) => set({ items: get().items.filter((i) => i.id !== id) }),
      setQty: (id, qty) =>
        set({
          items: get()
            .items.map((i) => (i.id === id ? { ...i, quantity: Math.max(1, qty) } : i))
            .filter((i) => i.quantity > 0),
        }),
      clear: () => set({ items: [] }),
      count: () => get().items.reduce((n, i) => n + i.quantity, 0),
      subtotal: () => get().items.reduce((s, i) => s + i.unitPrice * i.quantity, 0),
    }),
    { name: "cakecraft-cart" }
  )
);
