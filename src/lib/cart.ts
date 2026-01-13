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
  add: (item: CartItem) => { success: boolean; message?: string };
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
        // Sanitize incoming item
        const sanitizedItem = {
          ...item,
          id: String(item.id),
          price: Number(item.price) || 0,
          qty: Number(item.qty) || 1,
          stock: typeof item.stock === 'number' ? item.stock : 0,
        };

        const items = get().items;
        // Robust ID comparison
        const existing = items.find((i) => String(i.id) === sanitizedItem.id);

        console.log("Cart Add:", sanitizedItem, "Existing:", existing);

        if (existing) {
          // Update stale stock with fresh stock from product page
          const existingQty = Number(existing.qty) || 0;
          const newQty = existingQty + sanitizedItem.qty;

          if (sanitizedItem.stock > 0 && newQty <= sanitizedItem.stock) {
            set({
              items: items.map((i) =>
                String(i.id) === sanitizedItem.id
                  ? { ...i, qty: newQty, stock: sanitizedItem.stock, price: sanitizedItem.price }
                  : i
              ),
            });
            return { success: true };
          } else {
            // Cap at max stock
            if (sanitizedItem.stock <= 0) {
              set({
                items: items.filter((i) => String(i.id) !== sanitizedItem.id),
              });
              return { success: false, message: "Item is now out of stock and removed from cart." };
            }

            // Update to max stock if we are exceeding it
            if (existingQty < sanitizedItem.stock) {
              set({
                items: items.map((i) =>
                  String(i.id) === sanitizedItem.id
                    ? { ...i, qty: sanitizedItem.stock, stock: sanitizedItem.stock, price: sanitizedItem.price }
                    : i
                ),
              });
              return { success: true, message: `Quantity set to max available (${sanitizedItem.stock})` };
            }

            return { success: false, message: `Max stock (${sanitizedItem.stock}) already in cart.` };
          }
        } else {
          // New Item
          if (sanitizedItem.stock <= 0) {
            return { success: false, message: "Out of stock" };
          }

          if (sanitizedItem.qty <= sanitizedItem.stock) {
            set({ items: [...items, sanitizedItem] });
            return { success: true };
          } else {
            set({ items: [...items, { ...sanitizedItem, qty: sanitizedItem.stock }] });
            return { success: true, message: `Added max available (${sanitizedItem.stock})` };
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
