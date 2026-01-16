import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import StudioVisit from "@/models/StudioVisit";
import { sendEmail } from "@/lib/email";

// GET: Fetch all visits
export async function GET(req: Request) {
    try {
        await connectDB();
        // Sort by date descending (newest first)
        const visits = await StudioVisit.find({}).sort({ date: -1 });
        return NextResponse.json({ visits });
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || "Failed to fetch visits" },
            { status: 500 }
        );
    }
}

// PUT: Update status
export async function PUT(req: Request) {
    try {
        await connectDB();
        const { id, status } = await req.json();

        const visit = await StudioVisit.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        );

        if (!visit) {
            return NextResponse.json({ error: "Visit not found" }, { status: 404 });
        }

        // Optional: Send email on status change (e.g., Confirmed)
        if (status === 'confirmed') {
            await sendEmail({
                to: visit.email,
                subject: "Studio Visit Confirmed - Basho",
                html: `
              <div style="font-family: sans-serif; color: #5A3E36;">
                <h1>Visit Confirmed!</h1>
                <p>Hi ${visit.name},</p>
                <p>Great news! Your studio visit on <strong>${new Date(visit.date).toLocaleDateString()}</strong> has been confirmed.</p>
                <p>We look forward to seeing you.</p>
              </div>
            `,
            });
        }

        return NextResponse.json({ visit });
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || "Failed to update visit" },
            { status: 500 }
        );
    }
}
