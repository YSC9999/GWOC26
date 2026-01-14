import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import Product from "@/models/Product";
import StoreSettings from "@/models/StoreSettings";
import ShippingRate from "@/models/ShippingRate";
import PincodeRate from "@/models/PincodeRate";
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
        const { items, shippingAddress, email, couponCode, customerGstNumber } = body;

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

        const totalWeightKG = orderItems.reduce((sum, item) => sum + ((item.weightGrams || 500) * item.quantity), 0) / 1000;

        // 2. Calculate shipping via StoreSettings (Sync with /api/shipping/calculate)
        let shippingCost = 0;
        try {
            // Fetch Settings
            let settings = await StoreSettings.findOne();
            if (!settings) settings = await StoreSettings.create({});

            // Check Free Shipping Threshold
            if (settings.freeShippingThreshold > 0 && subtotal >= settings.freeShippingThreshold) {
                shippingCost = 0;
            } else {
                // Determine Mode
                if (settings.shippingMode === 'pincode') {
                    // SHIPROCKET INTEGRATION
                    if (settings.pincodeType === 'shiprocket_realtime' || settings.pincodeType === 'shiprocket_reference') {
                        const targetPincode = settings.pincodeType === 'shiprocket_realtime' ? shippingAddress?.pincode : settings.shiprocketReferencePincode;
                        const weight = totalWeightKG;

                        try {
                            const { checkServiceability } = await import("@/lib/shiprocket");
                            let multiplier = 1;

                            // Calculate Multiplier for Reference Mode
                            if (settings.pincodeType === 'shiprocket_reference' && settings.shiprocketReferencePincode) {
                                try {
                                    const refData = await checkServiceability(Number(settings.shiprocketReferencePincode), 0.5); // Check 0.5kg base rate
                                    const couriers = refData.data?.available_courier_companies || [];
                                    let refRate = 50;
                                    if (couriers.length > 0) {
                                        const cheapest = couriers.reduce((prev: any, curr: any) => (Number(prev.rate) < Number(curr.rate)) ? prev : curr);
                                        refRate = Number(cheapest.rate);
                                    }
                                    const adminPrice = settings.shiprocketReferencePrice || 50;
                                    if (refRate > 0) {
                                        multiplier = adminPrice / refRate;
                                    }
                                } catch (e) {
                                    console.error("Ref Calc Error:", e);
                                    // Fallback: multiplier stays 1 if ref check fails
                                }
                            }

                            if (shippingAddress?.pincode) {
                                const srData = await checkServiceability(Number(shippingAddress.pincode), weight);
                                const couriers = srData.data?.available_courier_companies || [];

                                if (couriers.length > 0) {
                                    const cheapest = couriers.reduce((prev: any, curr: any) => (Number(prev.rate) < Number(curr.rate)) ? prev : curr);
                                    const baseRate = Number(cheapest.rate);
                                    shippingCost = Math.ceil(baseRate * multiplier);
                                } else {
                                    shippingCost = settings.pincodeRateDefault || 150;
                                }
                            } else {
                                shippingCost = settings.pincodeRateDefault || 150;
                            }
                        } catch (err) {
                            console.error("SR Calc Error:", err);
                            shippingCost = settings.pincodeRateDefault || 150;
                        }
                    }
                    // DB SPECIFIC RATE
                    else if (settings.pincodeType === 'specific' && shippingAddress?.pincode) {
                        let pinRate = settings.pincodeRateDefault || 150;
                        const specificPincodeRate = await PincodeRate.findOne({ pincode: shippingAddress.pincode });
                        if (specificPincodeRate) {
                            pinRate = specificPincodeRate.rate;
                        }
                        shippingCost = pinRate;
                    }
                    // STANDARD FALLBACK
                    else {
                        shippingCost = settings.pincodeRateDefault || 150;
                    }
                } else {
                    // Weight Based
                    // Calculate total weight (Already calc line 74)

                    const matchingRate = await ShippingRate.findOne({
                        minWeight: { $lte: totalWeightKG },
                        maxWeight: { $gte: totalWeightKG }
                    }).sort({ rate: 1 });

                    if (matchingRate) {
                        shippingCost = matchingRate.rate;
                    } else {
                        // Fallback logic for heavy items
                        const maxRate = await ShippingRate.findOne({}).sort({ maxWeight: -1 });
                        if (maxRate && totalWeightKG > maxRate.maxWeight) {
                            shippingCost = maxRate.rate + Math.ceil(totalWeightKG - maxRate.maxWeight) * 50;
                        } else {
                            shippingCost = 150; // Final safe default
                        }
                    }
                }
            }
        } catch (err) {
            console.error("Shipping calc failed, using fallback:", err);
            shippingCost = 150;
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
        const walletUsed = 0;
        const finalAmount = Math.max(0, subtotal + shippingCost - discount);
        const totalAmount = finalAmount;

        // 3. Create Razorpay Order
        let razorpayOrder = null;
        if (totalAmount > 0) {
            razorpayOrder = await razorpay.orders.create({
                amount: Math.round(totalAmount * 100),
                currency: "INR",
                receipt: `rcpt_${Date.now()}`,
            });
        }

        // 4. Create DB Order
        const order = await Order.create({
            orderNumber: `BASHO-${Date.now()}`,
            userId: userId,
            email: email,
            items: orderItems,
            subtotal,
            gstAmount,
            shippingCost,
            discount,
            walletAmount: walletUsed,
            finalAmount: totalAmount,
            couponCode: couponCode ? couponCode.toUpperCase() : undefined,
            total: subtotal + shippingCost - discount,
            shippingAddress,
            razorpayOrderId: razorpayOrder?.id,
            paymentStatus: totalAmount === 0 ? "paid" : "pending",
            status: "pending",
            customerGstNumber: customerGstNumber || undefined
        });




        // 5. Update Coupon Usage if applied (Move this to AFTER payment verification or here if we trust creation)
        // Ideally should be in verification, but keeping existing flow.

        return NextResponse.json({
            success: true,
            orderId: order._id,
            razorpayOrderId: razorpayOrder?.id, // Can be null if fully paid by wallet
            amount: totalAmount * 100, // Amount to pay via Razorpay
            currency: "INR",
            key: process.env.RAZORPAY_KEY_ID,
            bypassPayment: finalAmount === 0 // Flag for frontend
        });

    } catch (error: any) {
        console.error("Order creation error:", error);
        return NextResponse.json({ error: error.message || "Unknown error occurred" }, { status: 500 });
    }
}
