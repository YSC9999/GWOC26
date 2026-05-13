import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Testimonial from "@/models/Testimonial";

export const dynamic = 'force-dynamic';

// GET approved testimonials
export async function GET(req: Request) {
    try {
        await connectDB();

        const { searchParams } = new URL(req.url);
        const featured = searchParams.get("featured");
        const limit = parseInt(searchParams.get("limit") || "10");

        const query: any = { approved: true };

        if (featured === "true") {
            query.featured = true;
        }

        const testimonials = await Testimonial.find(query)
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean();

        return NextResponse.json({ testimonials });
    } catch (error: any) {
        console.error("Testimonials GET error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
