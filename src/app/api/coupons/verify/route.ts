import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Coupon from "@/models/Coupon";
import User from "@/models/User";

export async function POST(req: Request) {
    try {
        const { code, userId } = await req.json();

        if (!code) {
            return NextResponse.json({ error: "Code is required" }, { status: 400 });
        }

        await connectDB();

        // Find the specific coupon that is currently valid
        const coupon = await Coupon.findOne({
            code: code.toUpperCase(),
            isActive: true,
            validTo: { $gt: new Date() }
        });

        if (!coupon) {
            return NextResponse.json({ error: "Invalid coupon code" }, { status: 404 });
        }

        if (!coupon.isActive) {
            return NextResponse.json({ error: "Coupon is inactive" }, { status: 400 });
        }

        const now = new Date();
        if (now < new Date(coupon.validFrom)) {
            return NextResponse.json({ error: "Coupon is not yet valid" }, { status: 400 });
        }

        if (now > new Date(coupon.validTo)) {
            return NextResponse.json({ error: "Coupon has expired" }, { status: 400 });
        }

        // Check for single use per user (Double Check)
        if (userId) {
            console.log(`[Verify] Checking userId: ${userId} for coupon: ${coupon.code}`);
            // 1. Check Coupon's usedBy list
            if (coupon.usedBy && coupon.usedBy.includes(userId)) {
                console.log(`[Verify] User found in coupon.usedBy`);
                return NextResponse.json({ error: "You have already used this coupon" }, { status: 400 });
            }

            // 2. Check User's usedCoupons list
            const user = await User.findById(userId);
            console.log(`[Verify] User found: ${!!user}, usedCoupons: ${user?.usedCoupons}`);

            if (user && user.usedCoupons && user.usedCoupons.includes(coupon.code)) {
                console.log(`[Verify] User found in user.usedCoupons`);
                return NextResponse.json({ error: "You have already redeemed this coupon code" }, { status: 400 });
            }
        } else {
            console.log(`[Verify] No userId provided in request`);
        }

        return NextResponse.json({
            success: true,
            coupon: {
                code: coupon.code,
                discountPercentage: coupon.discountPercentage,
                maxDiscountAmount: coupon.maxDiscountAmount,
            },
        });
    } catch (error: any) {
        console.error("Coupon verify error:", error);
        return NextResponse.json({ error: "Verification failed" }, { status: 500 });
    }
}
