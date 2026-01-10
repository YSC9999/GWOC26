import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Experience from "@/models/Experience";

// GET single experience
export async function GET(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        await connectDB();

        const { id } = await params;

        let experience;

        if (id.match(/^[0-9a-fA-F]{24}$/)) {
            experience = await Experience.findById(id).lean();
        }

        if (!experience) {
            experience = await Experience.findOne({ slug: id }).lean();
        }

        if (!experience) {
            return NextResponse.json({ error: "Experience not found" }, { status: 404 });
        }

        return NextResponse.json({ experience });
    } catch (error: any) {
        console.error("Experience GET error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
