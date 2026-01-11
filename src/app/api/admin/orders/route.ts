import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import { requireAdmin } from "@/lib/admin-guard";

/* GET ALL ORDERS (admin) */
export async function GET() {
  try {
    await requireAdmin();
    await connectDB();

    const orders = await Order.find({})
      .sort({ createdAt: -1 })
      .populate('userId', 'name email')
      .populate('items.productId', 'tags')
      .lean();

    return NextResponse.json({ orders });
  } catch (err: any) {
    console.error("Admin orders GET error:", err?.message || err);
    return NextResponse.json({ error: "Unauthorized or failed" }, { status: 401 });
  }
}

/* PATCH ORDER (update status/tracking/adminNotes) */
export async function PATCH(req: Request) {
  try {
    await requireAdmin();
    await connectDB();

    const body = await req.json();
    const { id, status, trackingNumber, adminNotes } = body;

    if (!id) return NextResponse.json({ error: "Order id required" }, { status: 400 });

    const allowed = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (status && !allowed.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const update: any = {};
    if (status) update.status = status;
    if (trackingNumber !== undefined) update.trackingNumber = trackingNumber;
    if (adminNotes !== undefined) update.adminNotes = adminNotes;

    const updated = await Order.findByIdAndUpdate(id, update, { returnDocument: "after" }).lean();

    if (!updated) return NextResponse.json({ error: "Order not found" }, { status: 404 });

    return NextResponse.json({ success: true, order: updated });
  } catch (err: any) {
    console.error("Admin orders PATCH error:", err?.message || err);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}