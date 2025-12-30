import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export async function getUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("basho_token")?.value;

  if (!token) return null;

  try {
    return jwt.verify(token, "SECRETKEY") as any;
  } catch {
    return null;
  }
}
