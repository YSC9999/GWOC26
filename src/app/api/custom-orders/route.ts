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
            description,
            referenceImages,
            budget
        } = body;

        // Validate required fields
        if (!name || !email || !phone || !description || !budget) {
            return NextResponse.json(
                { error: "All fields are required" },
                { status: 400 }
            );
        }

        const user = await getUser();

        // Create custom order
        const customOrder = await CustomOrder.create({
            userId: user?.id, // Optional linkage
            name,
            email,
            phone,
            quantity: quantity || 1, // Default to 1 if not provided, though form usually provides it
            description,
            referenceImages: referenceImages || [],
            budget,
            status: "pending",
            items: [] // Initialize empty items array for Admin to populate
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
