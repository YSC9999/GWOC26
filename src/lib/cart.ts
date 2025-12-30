"use client";
import { create } from "zustand";

type CartItem = {
  id: number;
  name: string;
  price: number;
  qty: number;
};

type CartStore = {
  items: CartItem[];
  add: (item: CartItem) => void;
  remove: (id: number) => void;
  clear: () => void;
};

export const useCart = create<CartStore>((set, get) => ({
  items: [],
  add: (item) => {
    const existing = get().items.find(i => i.id === item.id);
    if (existing) {
      set({
        items: get().items.map(i =>
          i.id === item.id ? { ...i, qty: i.qty + 1 } : i
        )
      });
    } else {
      set({ items: [...get().items, item] });
    }
  },
  remove: (id) => set({ items: get().items.filter(i => i.id !== id) }),
  clear: () => set({ items: [] }),
}));
