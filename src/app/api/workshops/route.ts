import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Workshop from "@/models/Workshop";

// GET all workshops with optional search and pagination
export async function GET(req: Request) {
    try {
        await connectDB();

        const { searchParams } = new URL(req.url);
        const type = searchParams.get("type");
        const status = searchParams.get("status") || "upcoming";
        const search = searchParams.get("search");
        const limit = parseInt(searchParams.get("limit") || "50");
        const page = parseInt(searchParams.get("page") || "1");

        const query: any = {};

        if (type && type !== "all") {
            query.type = type;
        }

        if (status !== "all") {
            query.status = status;
        }

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } }
            ];
        }

        const skip = (page - 1) * limit;

        const [workshops, total] = await Promise.all([
            Workshop.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Workshop.countDocuments(query)
        ]);

        return NextResponse.json({
            workshops,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error: any) {
        console.error("Workshops GET error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
