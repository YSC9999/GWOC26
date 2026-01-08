import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  const res = NextResponse.json({ success: true });
  const cookieStore = await cookies();
  cookieStore.delete("basho_token");
  return res;
}
