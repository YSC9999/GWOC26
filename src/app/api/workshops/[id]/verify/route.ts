import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Workshop from "@/models/Workshop";
import WorkshopRegistration from "@/models/WorkshopRegistration";
import crypto from "crypto";

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();

        const { id } = await params;
        const body = await req.json();
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

        // 1. Verify Signature
        const shasum = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!);
        shasum.update(`${razorpay_order_id}|${razorpay_payment_id}`);
        const digest = shasum.digest("hex");

        if (digest !== razorpay_signature) {
            return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
        }

        // 2. Find and Update Registration
        const registration = await WorkshopRegistration.findOne({ 
            razorpayOrderId: razorpay_order_id,
            workshopId: id 
        } as any);

        if (!registration) {
            return NextResponse.json({ error: "Registration not found" }, { status: 404 });
        }

        registration.razorpayPaymentId = razorpay_payment_id;
        registration.paymentStatus = "paid";
        registration.status = "confirmed";
        await registration.save();

        // 3. Update Workshop enrolled count
        await (Workshop as any).findByIdAndUpdate(id, {
            $inc: { enrolledCount: registration.numberOfParticipants }
        });

        return NextResponse.json({
            success: true,
            registrationId: registration._id,
            message: "Payment verified and registration confirmed"
        });

    } catch (error: any) {
        console.error("Workshop payment verify error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
