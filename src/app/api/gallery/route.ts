import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Gallery from "@/models/Gallery";

// GET gallery items
export async function GET(req: Request) {
    try {
        await connectDB();

        const { searchParams } = new URL(req.url);
        const category = searchParams.get("category");
        const featured = searchParams.get("featured");

        const query: any = {};

        if (category && category !== "all") {
            query.category = category;
        }

        if (featured === "true") {
            query.featured = true;
        }

        const gallery = await Gallery.find(query)
            .sort({ order: 1, createdAt: -1 })
            .lean();

        return NextResponse.json({ gallery });
    } catch (error: any) {
        console.error("Gallery GET error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
