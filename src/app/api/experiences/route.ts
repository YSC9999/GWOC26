import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Experience from "@/models/Experience";

// GET all experiences
export async function GET(req: Request) {
    try {
        await connectDB();

        const { searchParams } = new URL(req.url);
        const type = searchParams.get("type");

        const query: any = { isActive: true };

        if (type && type !== "all") {
            query.type = type;
        }

        const experiences = await Experience.find(query)
            .sort({ createdAt: -1 })
            .lean();

        return NextResponse.json({ experiences });
    } catch (error: any) {
        console.error("Experiences GET error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
