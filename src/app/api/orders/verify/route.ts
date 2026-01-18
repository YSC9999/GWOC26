import { NextResponse } from "next/server";
import crypto from "crypto";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import User from "@/models/User";
import { sendAdminNotification } from "@/lib/email";

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

            // Notify Admin
            await sendAdminNotification(
                "New Order Received",
                `
                <div style="margin-bottom: 20px;">
                    <p><strong>Order ID:</strong> ${order.orderNumber || order._id}</p>
                    <p><strong>Amount:</strong> ₹${order.total}</p>
                    <p><strong>Payment ID:</strong> ${razorpay_payment_id}</p>
                    <p><strong>User ID:</strong> ${order.userId}</p>
                    <p><strong>Items:</strong> ${order.items?.length || 0}</p>
                    <hr style="margin: 15px 0; border: 0; border-top: 1px solid #eee;" />
                    <p><strong>Shipping Address:</strong></p>
                    <p>${order.shippingAddress?.name}</p>
                    <p>${order.shippingAddress?.street}</p>
                    <p>${order.shippingAddress?.city}, ${order.shippingAddress?.state} ${order.shippingAddress?.pincode}</p>
                    <p>${order.shippingAddress?.phone}</p>
                </div>
                <a href="${process.env.NEXT_PUBLIC_APP_URL || ''}/admin/orders" style="background-color: #5A3E36; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">View Order in Admin Panel</a>
                `
            );

            // Notify User
            import("@/lib/email").then(async ({ sendOrderReceivedEmail }) => {
                const User = (await import("@/models/User")).default;
                let userEmail = order.email;
                if (!userEmail && order.userId) {
                    const user = await User.findById(order.userId);
                    if (user) userEmail = user.email;
                }

                if (userEmail) {
                    await sendOrderReceivedEmail(
                        userEmail,
                        order.orderNumber || order._id.toString(),
                        order.items?.length || 0,
                        order.finalAmount || order.total || 0
                    );
                }
            });

            // Notify User via SMS
            import("@/lib/sms").then(async ({ sendSMS }) => {
                const startPhone = order.shippingAddress?.phone;
                if (startPhone) {
                    await sendSMS(
                        startPhone,
                        `Basho: Order #${order.orderNumber || order._id} confirmed! Amount: Rs.${order.finalAmount || order.total}. We will notify you when it ships.`
                    );
                }
            });

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
