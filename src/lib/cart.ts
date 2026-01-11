"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItem = {
  id: string;
  name: string;
  price: number;
  image?: string;
  qty: number;
  stock: number;
};

type CartStore = {
  items: CartItem[];
  add: (item: CartItem) => void;
  remove: (id: string) => void;
  updateQty: (id: string, qty: number) => void;
  clear: () => void;
  total: () => number;
};

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      add: (item) => {
        const existing = get().items.find((i) => i.id === item.id);
        if (existing) {
          const newQty = existing.qty + item.qty;
          if (newQty <= item.stock) {
            set({
              items: get().items.map((i) =>
                i.id === item.id ? { ...i, qty: newQty } : i
              ),
            });
          } else {
            // Cap at max stock
            set({
              items: get().items.map((i) =>
                i.id === item.id ? { ...i, qty: item.stock } : i
              ),
            });
            alert(`Stock limit reached. Cart updated to maximum available quantity (${item.stock}).`);
          }
        } else {
          if (item.qty <= item.stock) {
            set({ items: [...get().items, item] });
          } else {
            // Cap at max stock
            set({ items: [...get().items, { ...item, qty: item.stock }] });
            alert(`Stock limit reached. Cart updated to maximum available quantity (${item.stock}).`);
          }
        }
      },
      remove: (id) => set({ items: get().items.filter((i) => i.id !== id) }),
      updateQty: (id, qty) => {
        const item = get().items.find((i) => i.id === id);
        if (!item) return;

        if (qty <= 0) {
          get().remove(id);
        } else if (qty <= item.stock) {
          set({
            items: get().items.map((i) => (i.id === id ? { ...i, qty } : i)),
          });
        } else {
          alert(`Cannot add more. Only ${item.stock} items in stock.`);
        }
      },
      clear: () => set({ items: [] }),
      total: () => {
        return get().items.reduce((acc, item) => acc + item.price * item.qty, 0);
      },
    }),
    {
      name: "basho-cart",
    }
  )
);
