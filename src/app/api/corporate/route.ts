import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import CorporateInquiry from "@/models/CorporateInquiry";

// POST - Submit corporate inquiry
export async function POST(req: Request) {
    try {
        await connectDB();

        const body = await req.json();
        const {
            companyName,
            contactPerson,
            email,
            phone,
            inquiryType,
            quantity,
            budget,
            description,
            preferredDate
        } = body;

        // Validate required fields
        if (!companyName || !contactPerson || !email || !phone || !inquiryType || !description) {
            return NextResponse.json(
                { error: "Company name, contact person, email, phone, inquiry type and description are required" },
                { status: 400 }
            );
        }

        // Create corporate inquiry
        const inquiry = await CorporateInquiry.create({
            companyName,
            contactPerson,
            email,
            phone,
            inquiryType,
            quantity,
            budget,
            description,
            preferredDate: preferredDate ? new Date(preferredDate) : undefined,
            status: "new"
        });

        return NextResponse.json({
            success: true,
            message: "Thank you for your inquiry. Our team will contact you within 24 hours.",
            inquiryId: inquiry._id
        });
    } catch (error: any) {
        console.error("Corporate inquiry error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
