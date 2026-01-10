import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import CustomOrder from "@/models/CustomOrder";
import { requireAdmin } from "@/lib/admin-guard";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await requireAdmin();
        await connectDB();

        const { id } = await params;
        const order = await CustomOrder.findById(id).populate("userId", "name email");

        if (!order) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }

        return NextResponse.json(order);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await requireAdmin();
        await connectDB();

        const { id } = await params;
        const body = await req.json();

        // We expect body to contain updates like { items, status, quotation, etc. }
        // If items are updated, we should recalculate total price if not provided, but let's trust frontend/admin for now or calc here.
        // Let's rely on what Admin sends.

        const updatedOrder = await CustomOrder.findByIdAndUpdate(
            id,
            { $set: body },
            { new: true }
        );

        if (!updatedOrder) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }

        return NextResponse.json(updatedOrder);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
