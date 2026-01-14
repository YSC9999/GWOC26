import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import CustomOrder from "@/models/CustomOrder";
import { getUser } from "@/lib/server-auth";

// GET - List user's custom orders or get single by ID
export async function GET(req: Request) {
    try {
        const user = await getUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectDB();

        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (id) {
            const order = await CustomOrder.findOne({ _id: id, userId: user.id } as any);
            if (!order) {
                return NextResponse.json({ error: "Order not found" }, { status: 404 });
            }
            return NextResponse.json(order);
        } else {
            const orders = await CustomOrder.find({ userId: user.id } as any).sort({ createdAt: -1 });
            return NextResponse.json({ orders });
        }
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST - Submit custom order request
export async function POST(req: Request) {
    try {
        await connectDB();

        const body = await req.json();
        const {
            name,
            email,
            phone,
            quantity,
            productType,
            material,
            glazePreference,
            dimensions,
            colorPreferences,
            specialRequirements,
            timeline,
            description,
            referenceImages,
            budget
        } = body;

        // Validate required fields
        if (!name || !email || !phone || !budget || !productType || !material) {
            return NextResponse.json(
                { error: "Please fill in all required fields" },
                { status: 400 }
            );
        }

        const user = await getUser();

        // Create custom order
        const customOrder = await CustomOrder.create({
            userId: user?.id,
            name,
            email,
            phone,
            productType,
            material,
            quantity: quantity || 1,
            glazePreference: glazePreference || [],
            dimensions,
            colorPreferences,
            specialRequirements,
            timeline,
            description,
            referenceImages: referenceImages || [],
            budget,
            status: "pending",
            items: []
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
