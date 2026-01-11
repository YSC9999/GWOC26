import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import CustomOrder from "@/models/CustomOrder";
import { getUser } from "@/lib/server-auth";

export async function GET() {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    await connectDB();

    const requests = await (CustomOrder as any).find({ userId: user.id }).sort({ createdAt: -1 }).lean();


    return NextResponse.json({ requests });
  } catch (err: any) {
    console.error("User custom-orders GET error:", err?.message || err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}