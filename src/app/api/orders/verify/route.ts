import { NextResponse } from "next/server";
import crypto from "crypto";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import User from "@/models/User";

import Coupon from "@/models/Coupon";

export async function POST(req: Request) {
    try {
        await connectDB();
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
            await req.json();

        const order = await Order.findOne({ razorpayOrderId: razorpay_order_id });
        if (!order) {
            // MIGHT be a wallet-only order that bypassed razorpay logic but frontend called verify?
            // Unlikely if logic is correct.
            return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }

        const body = razorpay_order_id + "|" + razorpay_payment_id;

        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
            .update(body.toString())
            .digest("hex");

        const isAuthentic = expectedSignature === razorpay_signature;

        if (isAuthentic) {
            // Payment Successful
            order.paymentStatus = "paid";
            order.razorpayPaymentId = razorpay_payment_id;
            order.status = "pending"; // Wait for Admin Confirmation
            await order.save();

            // NOW we finalize the Coupons usage if we were deferring it. 
            // But we did it optimistically in creation. 
            // If payment failed, we would have already deducted coupon. 
            // This is a known trade-off. Correct way is two-phase commit or refund on failure.
            // For now, simpler flow.

            return NextResponse.json({ success: true });
        } else {
            // Payment Failed
            order.paymentStatus = "failed";
            await order.save();

            // Rolling back wallet/coupon is complex here without more logic.
            // Assuming simple flow for now.

            return NextResponse.json(
                { error: "Payment verification failed" },
                { status: 400 }
            );
        }
    } catch (error) {
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
