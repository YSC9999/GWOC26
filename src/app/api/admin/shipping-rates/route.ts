import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import ShippingRate from "@/models/ShippingRate";
import { getUser } from "@/lib/server-auth";

// Helper for admin check since access-control might not be centralized
async function requireAdmin() {
    const user = await getUser();
    if (!user || user.role !== 'admin') {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    return null;
}

export async function GET() {
    try {
        const adminError = await requireAdmin();
        if (adminError) return adminError;

        await connectDB();
        // Sort by minWeight ascending
        const rates = await ShippingRate.find({}).sort({ minWeight: 1 });
        return NextResponse.json({ rates });
    } catch (error) {
        console.error("Fetch shipping rates error:", error);
        return NextResponse.json({ error: "Failed to fetch rates" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const adminError = await requireAdmin();
        if (adminError) return adminError;

        const body = await req.json();
        const { minWeight, maxWeight, rate } = body;

        if (minWeight === undefined || maxWeight === undefined || rate === undefined) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 });
        }

        await connectDB();
        const newRate = await ShippingRate.create({ minWeight, maxWeight, rate });

        return NextResponse.json({ rate: newRate }, { status: 201 });
    } catch (error) {
        console.error("Create shipping rate error:", error);
        return NextResponse.json({ error: "Failed to create rate" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const adminError = await requireAdmin();
        if (adminError) return adminError;

        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ error: "Missing ID" }, { status: 400 });
        }

        await connectDB();
        await ShippingRate.findByIdAndDelete(id);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Delete shipping rate error:", error);
        return NextResponse.json({ error: "Failed to delete rate" }, { status: 500 });
    }
}
