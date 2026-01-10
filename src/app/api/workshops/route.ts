import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Workshop from "@/models/Workshop";

// GET all workshops
export async function GET(req: Request) {
    try {
        await connectDB();

        const { searchParams } = new URL(req.url);
        const type = searchParams.get("type");
        const status = searchParams.get("status") || "upcoming";

        const query: any = {};

        if (type && type !== "all") {
            query.type = type;
        }

        if (status !== "all") {
            query.status = status;
        }

        const workshops = await Workshop.find(query)
            .sort({ date: 1 })
            .lean();

        return NextResponse.json({ workshops });
    } catch (error: any) {
        console.error("Workshops GET error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
