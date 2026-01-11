import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import CustomOrder from "@/models/CustomOrder";
import { getUser } from "@/lib/server-auth";

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectDB();
        const { id } = await params;

        const customOrder = await (CustomOrder as any).findOne({ _id: id, userId: user.id });

        if (!customOrder) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }

        // Allow cancel if pending or quoted
        if (!['pending', 'quoted'].includes(customOrder.status)) {
            return NextResponse.json({ error: "Cannot cancel order in current status" }, { status: 400 });
        }

        customOrder.status = 'cancelled';
        await customOrder.save();

        return NextResponse.json({ success: true });

    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
