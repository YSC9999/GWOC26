"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useCart } from "@/lib/cart";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  firstName?: string;
  lastName?: string;
  tier?: string;
  wishlist?: string[];
  walletBalance?: number;
}

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
}

export const useAuth = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      login: (user: User) => {
        const prev = get().user;
        set({ user, isAuthenticated: true });
        // If a different user just logged in, clear the client cart to avoid leaking items
        if (!prev || prev._id !== user._id) {
          useCart.getState().clear();
        }
      },
      logout: () => {
        set({ user: null, isAuthenticated: false });
        // Clear cart on logout
        useCart.getState().clear();
      },
    }),
    {
      name: "basho-auth",
      skipHydration: false,
    }
  )
);
