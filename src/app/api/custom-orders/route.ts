import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import CustomOrder from "@/models/CustomOrder";

// POST - Submit custom order request
export async function POST(req: Request) {
    try {
        await connectDB();

        const body = await req.json();
        const {
            name,
            email,
            phone,
            productType,
            quantity,
            description,
            referenceImages,
            budget
        } = body;

        // Validate required fields
        if (!name || !email || !phone || !productType || !quantity || !description || !budget) {
            return NextResponse.json(
                { error: "All fields are required" },
                { status: 400 }
            );
        }

        // Create custom order
        const customOrder = await CustomOrder.create({
            name,
            email,
            phone,
            productType,
            quantity,
            description,
            referenceImages: referenceImages || [],
            budget,
            status: "pending"
        });

        return NextResponse.json({
            success: true,
            message: "Your custom order request has been submitted. We'll get back to you within 24-48 hours.",
            orderId: customOrder._id
        });
    } catch (error: any) {
        console.error("Custom order error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
