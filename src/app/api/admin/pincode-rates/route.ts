import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import PincodeRate from "@/models/PincodeRate";
import { requireAdmin } from "@/lib/admin-guard";

export async function GET(req: Request) {
    try {
        await requireAdmin();
        await connectDB();
        const rates = await PincodeRate.find({}).sort({ pincode: 1 });
        return NextResponse.json({ rates });
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch rates" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        await requireAdmin();
        await connectDB();
        const { pincode, rate, description } = await req.json();

        if (!pincode || rate === undefined) {
            return NextResponse.json({ error: "Pincode and Rate required" }, { status: 400 });
        }

        // Upsert equivalent (find and update or create)
        const newRate = await PincodeRate.findOneAndUpdate(
            { pincode },
            { rate, description },
            { new: true, upsert: true }
        );

        return NextResponse.json({ rate: newRate });
    } catch (error) {
        return NextResponse.json({ error: "Failed to add/update rate" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        await requireAdmin();
        await connectDB();
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

        await PincodeRate.findByIdAndDelete(id);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
    }
}
