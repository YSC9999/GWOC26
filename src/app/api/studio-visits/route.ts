import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import StudioVisit from "@/models/StudioVisit";
import { sendEmail } from "@/lib/email";

export async function POST(req: Request) {
    try {
        await connectDB();
        const data = await req.json();

        const visit = await StudioVisit.create(data);

        // Send confirmation email to user
        await sendEmail({
            to: visit.email,
            subject: "Studio Visit Request Received - Basho",
            html: `
        <div style="font-family: sans-serif; color: #5A3E36;">
          <h1>Thank you for your interest!</h1>
          <p>Hi ${visit.name},</p>
          <p>We have received your request for a studio visit on <strong>${new Date(visit.date).toLocaleDateString()}</strong>.</p>
          <p>We will review your request and get back to you shortly with a confirmation.</p>
          <br/>
          <p>Best regards,</p>
          <p>The Basho Team</p>
        </div>
      `,
        });

        // Send notification to admin (hardcoded for now or use env var)
        // await sendEmail({ to: "admin@basho.com", ... }) 

        return NextResponse.json({ success: true, visit }, { status: 201 });
    } catch (error: any) {
        console.error("Studio Visit Error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to book visit" },
            { status: 500 }
        );
    }
}
