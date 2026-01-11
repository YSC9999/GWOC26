import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Coupon from "@/models/Coupon";

export async function POST(req: Request) {
    try {
        const { code } = await req.json();

        if (!code) {
            return NextResponse.json({ error: "Code is required" }, { status: 400 });
        }

        await connectDB();

        const coupon = await Coupon.findOne({ code: code.toUpperCase() });

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

        return NextResponse.json({
            success: true,
            coupon: {
                code: coupon.code,
                discountPercentage: coupon.discountPercentage,
            },
        });
    } catch (error: any) {
        console.error("Coupon verify error:", error);
        return NextResponse.json({ error: "Verification failed" }, { status: 500 });
    }
}
