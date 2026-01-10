import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import Product from "@/models/Product";
import Razorpay from "razorpay";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function GET(req: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;

        if (!token) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }

        const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
        await connectDB();

        const orders = await Order.find({ userId: decoded.userId }).sort({ createdAt: -1 });

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

        // Get userId from token if available (for logged in users)
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;
        let userId = null;
        if (token) {
            try {
                const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
                userId = decoded.userId;
            } catch (e) {
                // Token invalid, proceed as guest
            }
        }

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

        // 2. Calculate shipping & tax
        const shippingCost = subtotal > 2000 ? 0 : 150;
        const gstAmount = 0; // Keeping simple as per previous decision
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
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
