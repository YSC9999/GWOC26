import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import CustomOrder from "@/models/CustomOrder";
import { requireAdmin } from "@/lib/admin-guard";

export async function GET(req: Request) {
  try {
    await requireAdmin();
    await connectDB();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const query: any = {};
    if (status) query.status = status;

    const orders = await CustomOrder.find(query).sort({ createdAt: -1 });

    return NextResponse.json({ orders });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}