import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Frame from "@/models/Frame";
import Product from "@/models/Product"; // Ensure Product is registered
import { requireAdmin } from "@/lib/admin-guard";

export async function GET() {
    try {
        await requireAdmin();
        await requireAdmin();
        await connectDB();
        try { await new Product(); } catch (e) { } // Force schema registration
        const frames = await Frame.find().populate("product").sort({ frameId: 1 });
        return NextResponse.json({ frames });
    } catch (error) {
        console.error("Error fetching frames:", error);
        return NextResponse.json(
            { error: "Failed to fetch frames" },
            { status: 500 }
        );
    }
}

export async function POST(req: Request) {
    try {
        await requireAdmin();
        await connectDB();
        const { frameId, productId } = await req.json();

        if (frameId === undefined || frameId < 0 || frameId > 8) {
            return NextResponse.json({ error: "Invalid frame ID" }, { status: 400 });
        }

        if (!productId) {
            // If no product ID, we might want to clear the frame?
            // For now let's assume we are setting a product. 
            // If clearing is needed, we can interpret null productId as deletion.
            await (Frame as any).findOneAndDelete({ frameId });
            return NextResponse.json({ message: "Frame cleared" });
        }

        const frame = await (Frame as any).findOneAndUpdate(
            { frameId },
            { product: productId },
            { upsert: true, new: true }
        ).populate("product");

        return NextResponse.json({ frame });
    } catch (error) {
        console.error("Error updating frame:", error);
        return NextResponse.json(
            { error: "Failed to update frame" },
            { status: 500 }
        );
    }
}
