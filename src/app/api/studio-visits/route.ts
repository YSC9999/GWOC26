import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import StudioVisit from "@/models/StudioVisit";
import { sendStudioVisitConfirmationEmail, sendAdminNotification } from "@/lib/email";

export async function POST(req: Request) {
    try {
        await connectDB();
        const data = await req.json();

        const visit = await StudioVisit.create(data);

        // Send confirmation email to user
        await sendStudioVisitConfirmationEmail(visit.email, visit.name, new Date(visit.date).toLocaleDateString(), "Not Specified", visit.guests);

        // Send notification to admin
        await sendAdminNotification(
            "New Studio Visit Request",
            `
            <div style="margin-bottom: 20px;">
                <p><strong>Visitor:</strong> ${visit.name}</p>
                <p><strong>Email:</strong> ${visit.email}</p>
                <p><strong>Phone:</strong> ${visit.phone}</p>
                <p><strong>Date:</strong> ${new Date(visit.date).toLocaleDateString()}</p>
                <p><strong>Guests:</strong> ${visit.guests}</p>
                <p><strong>Purpose:</strong> ${visit.purpose}</p>
                ${visit.message ? `<p><strong>Message:</strong> ${visit.message}</p>` : ''}
            </div>
            <a href="${process.env.NEXT_PUBLIC_APP_URL || ''}/admin/studio-visits" style="background-color: #5A3E36; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">View in Admin Panel</a>
            `
        );

        return NextResponse.json({ success: true, visit }, { status: 201 });
    } catch (error: any) {
        console.error("Studio Visit Error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to book visit" },
            { status: 500 }
        );
    }
}
