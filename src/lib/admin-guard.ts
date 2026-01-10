import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export async function requireAdmin() {
  const token = (await cookies()).get("basho_token")?.value;

  if (!token) throw new Error("Unauthorized");

  const decoded = jwt.verify(
    token,
    process.env.JWT_SECRET!
  ) as any;

  // ✅ TEMP: allow any logged-in user
  return decoded;
}
