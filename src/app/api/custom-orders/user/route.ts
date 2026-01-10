import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import CustomOrder from "@/models/CustomOrder";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    await connectDB();

    const requests = await CustomOrder.find({ userId: decoded.userId }).sort({ createdAt: -1 }).lean();

    return NextResponse.json({ requests });
  } catch (err: any) {
    console.error("User custom-orders GET error:", err?.message || err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}