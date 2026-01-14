import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import WorkshopRegistration from "@/models/WorkshopRegistration";
import Workshop from "@/models/Workshop";
import { getUser } from "@/lib/server-auth";

export async function GET(req: Request) {
    try {
        const user = await getUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectDB();

        // Fetch registrations and populate workshop details
        const registrations = await (WorkshopRegistration as any).find({ userId: user.id })
            .populate('workshopId')
            .sort({ createdAt: -1 });

        return NextResponse.json({ registrations });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
