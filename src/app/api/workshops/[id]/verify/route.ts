import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Workshop from "@/models/Workshop";
import WorkshopRegistration from "@/models/WorkshopRegistration";
import crypto from "crypto";
import { sendAdminNotification } from "@/lib/email";

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

        // Send notification to admin
        await sendAdminNotification(
            "New Workshop Booking Confirmed",
            `
            <div style="margin-bottom: 20px;">
                <p><strong>Customer:</strong> ${registration.name}</p>
                <p><strong>Email:</strong> ${registration.email}</p>
                <p><strong>Phone:</strong> ${registration.phone}</p>
                <hr style="margin: 15px 0; border: 0; border-top: 1px solid #eee;" />
                <p><strong>Participants:</strong> ${registration.numberOfParticipants}</p>
                <p><strong>Total Amount:</strong> ₹${registration.totalAmount}</p>
                <p><strong>Payment ID:</strong> ${razorpay_payment_id}</p>
                ${registration.gstNumber ? `<p><strong>GST:</strong> ${registration.gstNumber}</p>` : ''}
                ${registration.specialRequests ? `<p><strong>Special Requests:</strong> ${registration.specialRequests}</p>` : ''}
            </div>
            <a href="${process.env.NEXT_PUBLIC_APP_URL || ''}/admin/workshops" style="background-color: #5A3E36; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">View in Admin Panel</a>
            `
        );

        // Notify User
        import("@/lib/email").then(async ({ sendWorkshopBookingEmail }) => {
            const workshop = await (Workshop as any).findById(id);
            if (workshop) {
                await sendWorkshopBookingEmail(
                    registration.email,
                    workshop.title,
                    workshop.date,
                    registration.numberOfParticipants,
                    registration.totalAmount
                );
            }
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
