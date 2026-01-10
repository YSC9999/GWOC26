import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import StudioInfo from "@/models/StudioInfo";

// GET studio information
export async function GET() {
    try {
        await connectDB();

        // Get the first (and only) studio info document
        const studioInfo = await StudioInfo.findOne().lean();

        if (!studioInfo) {
            return NextResponse.json({ error: "Studio info not found" }, { status: 404 });
        }

        return NextResponse.json({ studioInfo });
    } catch (error: any) {
        console.error("Studio info GET error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
