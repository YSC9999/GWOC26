import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Workshop from "@/models/Workshop";
import WorkshopRegistration from "@/models/WorkshopRegistration";
import Razorpay from "razorpay";
import { getUser } from "@/lib/server-auth";

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

// POST - Register for a workshop
export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();

        const { id } = await params;
        const body = await req.json();
        const { name, email, phone, numberOfParticipants, specialRequests, gstNumber } = body;

        // Get userId from session if available
        const authUser = await getUser();
        const userId = authUser?.id || null;

        // Validate required fields
        if (!name || !email || !phone || !numberOfParticipants) {
            return NextResponse.json(
                { error: "Name, email, phone and number of participants are required" },
                { status: 400 }
            );
        }

        // Find workshop
        const workshop = await (Workshop as any).findById(id);
        if (!workshop) {
            return NextResponse.json({ error: "Workshop not found" }, { status: 404 });
        }

        // Check availability
        const availableSpots = workshop.maxParticipants - workshop.enrolledCount;
        if (numberOfParticipants > availableSpots) {
            return NextResponse.json(
                { error: `Only ${availableSpots} spots available` },
                { status: 400 }
            );
        }

        // Calculate total amount
        const totalAmount = workshop.price * numberOfParticipants;

        // Create Razorpay Order
        const razorpayOrder = await razorpay.orders.create({
            amount: Math.round(totalAmount * 100), // paise
            currency: "INR",
            receipt: `workshop_${Date.now()}`,
        });

        // Create registration with pending payment
        const registration = await WorkshopRegistration.create({
            workshopId: id,
            userId,
            name,
            email,
            phone,
            numberOfParticipants,
            specialRequests,
            gstNumber, // Added GST number
            totalAmount,
            razorpayOrderId: razorpayOrder.id,
            paymentStatus: "pending",
            status: "pending"
        });

        return NextResponse.json({
            success: true,
            registrationId: registration._id,
            razorpayOrderId: razorpayOrder.id,
            amount: totalAmount * 100, // paise
            currency: "INR",
            key: process.env.RAZORPAY_KEY_ID,
            workshopTitle: workshop.title,
            workshopDate: workshop.date,
            workshopTime: workshop.time
        });
    } catch (error: any) {
        console.error("Workshop registration error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
