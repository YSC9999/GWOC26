import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import Product from "@/models/Product";
import Razorpay from "razorpay";
import { cookies } from "next/headers";
import { getUser } from "@/lib/server-auth";

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function GET(req: Request) {
    try {
        const user = await getUser();

        if (!user) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }

        await connectDB();
        const orders = await Order.find({ userId: user.id }).sort({ createdAt: -1 });

        return NextResponse.json({ orders });
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        await connectDB();

        const body = await req.json();
        const { items, shippingAddress, email } = body;

        // Get userId from session if available
        const authUser = await getUser();
        let userId = authUser?.id || null;

        if (!items || items.length === 0) {
            return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
        }

        // 1. Verify items and calculate total from DB
        let subtotal = 0;
        const orderItems = [];

        for (const item of items) {
            const product = await Product.findById(item.id);
            if (!product) {
                throw new Error(`Product not found: ${item.id}`);
            }

            const price = product.price;
            const totalItemPrice = price * item.qty;
            subtotal += totalItemPrice;

            orderItems.push({
                productId: product._id,
                name: product.name,
                price: price,
                quantity: item.qty,
                image: product.images?.[0] || "",
                weightGrams: product.weightGrams
            });
        }

        // 2. Calculate shipping via Shiprocket
        let shippingCost = 0;
        try {
            const { checkServiceability } = await import("@/lib/shiprocket");
            const totalWeightKG = orderItems.reduce((sum, item) => sum + ((item.weightGrams || 500) * item.quantity), 0) / 1000;

            const srData = await checkServiceability(Number(shippingAddress.pincode), totalWeightKG);

            // Get cheapest courier
            const couriers = srData.data?.available_courier_companies || [];
            if (couriers.length > 0) {
                // Find cheapest
                const cheapest = couriers.reduce((prev: any, curr: any) =>
                    (Number(prev.rate) < Number(curr.rate)) ? prev : curr
                );
                shippingCost = Math.ceil(Number(cheapest.rate));
            } else {
                // Fallback to default if no courier found (e.g., remote area handle)
                shippingCost = subtotal > 2000 ? 0 : 150;
            }
        } catch (err) {
            console.error("Shipping calc failed, using fallback:", err);
            shippingCost = subtotal > 2000 ? 0 : 150;
        }

        const gstAmount = 0;
        const totalAmount = subtotal + shippingCost;

        // 3. Create Razorpay Order
        const razorpayOrder = await razorpay.orders.create({
            amount: totalAmount * 100, // paise
            currency: "INR",
            receipt: `rcpt_${Date.now()}`,
        });

        // 4. Create DB Order as Pending
        const order = await Order.create({
            orderNumber: `BASHO-${Date.now()}`,
            userId: userId,
            email: email,
            items: orderItems,
            subtotal,
            gstAmount,
            shippingCost,
            total: totalAmount,
            shippingAddress,
            razorpayOrderId: razorpayOrder.id,
            paymentStatus: "pending",
            status: "pending"
        });

        return NextResponse.json({
            success: true,
            orderId: order._id,
            razorpayOrderId: razorpayOrder.id,
            amount: totalAmount * 100, // paise
            currency: "INR",
            key: process.env.RAZORPAY_KEY_ID
        });

    } catch (error: any) {
        console.error("Order creation error:", error);
        return NextResponse.json({ error: error.message || "Unknown error occurred" }, { status: 500 });
    }
}
