import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import crypto from "crypto";
import Product from "@/models/Product";

export async function POST(req: Request) {
    try {
        await connectDB();

        const body = await req.json();
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

        // 1. Verify Signature
        const shasum = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!);
        shasum.update(`${razorpay_order_id}|${razorpay_payment_id}`);
        const digest = shasum.digest("hex");

        if (digest !== razorpay_signature) {
            return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
        }

        // 2. Update Order
        const order = await Order.findOne({ razorpayOrderId: razorpay_order_id });
        if (!order) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }

        order.razorpayPaymentId = razorpay_payment_id;
        order.paymentStatus = "paid";
        order.status = "confirmed"; // Auto-confirm on payment
        await order.save();

        // 3. Update Inventory (Deduct stock)
        for (const item of order.items) {
            await Product.findByIdAndUpdate(item.productId, {
                $inc: { stockQuantity: -item.quantity }
            });
        }

        return NextResponse.json({
            success: true,
            orderId: order._id,
            message: "Payment verified and order confirmed"
        });

    } catch (error: any) {
        console.error("Payment verify error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
