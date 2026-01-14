import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import WorkshopInquiry from "@/models/WorkshopInquiry";

export async function POST(req: Request) {
    try {
        await connectDB();
        const body = await req.json();

        // Simple validation
        if (!body.name || !body.email || !body.phone) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        const inquiry = await WorkshopInquiry.create(body);

        return NextResponse.json({ success: true, data: inquiry }, { status: 201 });
    } catch (error: any) {
        console.error("Workshop Inquiry Error:", error);
        return NextResponse.json(
            { error: "Failed to submit inquiry" },
            { status: 500 }
        );
    }
}
