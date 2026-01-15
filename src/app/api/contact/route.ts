import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Contact from "@/models/Contact";

// POST - Submit contact form
export async function POST(req: Request) {
    try {
        await connectDB();

        const body = await req.json();
        const { name, email, phone, companyName, companyWebsite, subject, message } = body;

        // Validate required fields
        if (!name || !email || !phone || !subject || !message) {
            return NextResponse.json(
                { error: "Name, email, phone, subject and message are required" },
                { status: 400 }
            );
        }

        // Company name is required for Corporate Inquiry and Collaboration
        const requiresCompanyName = subject === "Corporate Inquiry" || subject === "Collaboration";
        if (requiresCompanyName && !companyName) {
            return NextResponse.json(
                { error: "Company name is required for corporate inquiries and collaborations" },
                { status: 400 }
            );
        }

        // Server-side 200-word limit
        const words = message.trim().split(/\s+/).filter(Boolean);
        if (words.length > 200) {
            return NextResponse.json({ error: "Message exceeds 200-word limit" }, { status: 400 });
        }

        // Create contact message
        await Contact.create({
            name,
            email,
            phone,
            companyName: companyName || "",
            companyWebsite,
            subject,
            message,
            status: "new"
        });

        return NextResponse.json({
            success: true,
            message: "Thank you for your message. We'll get back to you soon!"
        });
    } catch (error: any) {
        console.error("Contact form error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
