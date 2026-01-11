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

import Coupon from "@/models/Coupon";
import User from "@/models/User";

export async function POST(req: Request) {
    try {
        await connectDB();

        const body = await req.json();
        const { items, shippingAddress, email, couponCode } = body;

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

        /* Coupon Logic */
        /* Coupon Logic */
        let discount = 0;
        let appliedCouponId = null;

        if (couponCode) {
            // Find the specific coupon that is currently valid
            const coupon = await Coupon.findOne({
                code: couponCode.toUpperCase(),
                isActive: true,
                validTo: { $gt: new Date() }
            });
            if (coupon && coupon.isActive) {
                const now = new Date();

                // Date Validation
                if (now < new Date(coupon.validFrom) || now > new Date(coupon.validTo)) {
                    return NextResponse.json({ error: "Coupon is not valid at this time" }, { status: 400 });
                }

                // Usage Limit Check (Double verification)
                const limit = coupon.usageLimit || 1;

                // 1. Check Coupon's usedBy list
                if (userId && coupon.usedBy) {
                    const usesInCoupon = coupon.usedBy.filter((id: any) => id.toString() === userId).length;
                    if (usesInCoupon >= limit) {
                        return NextResponse.json({ error: `You have already used this coupon ${limit} time(s)` }, { status: 400 });
                    }
                }

                // 2. Check User's usedCoupons list (Persistent check)
                if (userId) {
                    const user = await User.findById(userId);
                    if (user && user.usedCoupons) {
                        const usesInUser = user.usedCoupons.filter((c: string) => c === coupon.code).length;
                        if (usesInUser >= limit) {
                            return NextResponse.json({ error: `You have already redeemed this coupon code ${limit} time(s)` }, { status: 400 });
                        }
                    }
                }

                // Calculate Discount
                const rawDiscount = (subtotal * coupon.discountPercentage) / 100;

                // Max Cap Check
                if (coupon.maxDiscountAmount && rawDiscount > coupon.maxDiscountAmount) {
                    discount = coupon.maxDiscountAmount;
                } else {
                    discount = rawDiscount;
                }

                appliedCouponId = coupon._id;
            } else if (couponCode) {
                return NextResponse.json({ error: "Invalid coupon" }, { status: 400 });
            }
        }

        const gstAmount = 0;
        const totalAmount = Math.max(0, subtotal + shippingCost - discount); // Ensure non-negative

        // 3. Create Razorpay Order
        const razorpayOrder = await razorpay.orders.create({
            amount: Math.round(totalAmount * 100), // paise, verify integer
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
            discount,
            couponCode: couponCode ? couponCode.toUpperCase() : undefined,
            total: totalAmount,
            shippingAddress,
            razorpayOrderId: razorpayOrder.id,
            paymentStatus: "pending",
            status: "pending"
        });

        // 5. Update Coupon Usage if applied
        if (appliedCouponId && userId) {
            await Coupon.findByIdAndUpdate(appliedCouponId, {
                $push: { usedBy: userId }
            });

            // Also update User model for persistent tracking (Double Lock)
            if (couponCode) {
                await User.findByIdAndUpdate(userId, {
                    $push: { usedCoupons: couponCode.toUpperCase() }
                });
            }
        }

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
