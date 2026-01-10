import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export async function requireAdmin() {
  const token = (await cookies()).get("basho_token")?.value;

  if (!token) throw new Error("Unauthorized");

  const decoded = jwt.verify(
    token,
    process.env.JWT_SECRET!
  ) as any;

  // Temporary: still return decoded user; other checks can be added later
  return decoded;
}

export async function requireMainAdmin() {
  // Reuse requireAdmin to validate token and decode payload
  const decoded = await requireAdmin();

  const main = process.env.MAIN_ADMIN_EMAIL;
  if (!main) throw new Error("MAIN_ADMIN_EMAIL not configured");

  // Check that the logged-in user's email matches the configured main admin email
  if (!decoded?.email || decoded.email !== main) {
    throw new Error("Unauthorized - main admin required");
  }

  return decoded;
}
