<<<<<<< HEAD
"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
=======
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { UserTier } from "@/lib/tiers";

export interface AuthUser {
  id: string;
  email: string;
  tier: UserTier;
}

export async function getUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("basho_token")?.value;

  if (!token) return null;

  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as AuthUser;
  } catch {
    return null;
  }
>>>>>>> 5999d3ccafb5d5647a776ff6ca884f06f0f1659b
}

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
}

export const useAuth = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      login: (user) => set({ user, isAuthenticated: true }),
      logout: () => set({ user: null, isAuthenticated: false }),
    }),
    {
      name: "basho-auth",
    }
  )
);
