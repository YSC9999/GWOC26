import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Event from "@/models/Event";

// GET all events
export async function GET(req: Request) {
    try {
        await connectDB();

        const { searchParams } = new URL(req.url);
        const status = searchParams.get("status");
        const type = searchParams.get("type");

        const query: any = {};

        // Auto-update status based on dates
        const now = new Date();

        if (status === "upcoming") {
            query.startDate = { $gt: now };
        } else if (status === "ongoing") {
            query.startDate = { $lte: now };
            query.endDate = { $gte: now };
        } else if (status === "past") {
            query.endDate = { $lt: now };
        }

        if (type && type !== "all") {
            query.type = type;
        }

        const events = await Event.find(query)
            .sort({ startDate: status === "past" ? -1 : 1 })
            .lean();

        return NextResponse.json({ events });
    } catch (error: any) {
        console.error("Events GET error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
