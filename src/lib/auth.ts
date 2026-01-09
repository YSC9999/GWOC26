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
}
