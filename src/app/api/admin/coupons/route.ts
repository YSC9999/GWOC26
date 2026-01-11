import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Coupon from "@/models/Coupon";
import { requireAdmin } from "@/lib/admin-guard";

/* GET: List all coupons */
export async function GET() {
    try {
        await requireAdmin();
        await connectDB();
        const coupons = await Coupon.find({}).sort({ createdAt: -1 });
        return NextResponse.json({ coupons });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

/* POST: Create new coupon */
export async function POST(req: Request) {
    try {
        await requireAdmin();
        await connectDB();
        const body = await req.json();
        const { code, discountPercentage, validFrom, validTo, maxDiscountAmount, isActive, usageLimit } = body;

        if (!code || !discountPercentage || !validFrom || !validTo) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Check if there is an ACTIVE and VALID coupon with the same code
        const existing = await Coupon.findOne({
            code: code.toUpperCase(),
            isActive: true,
            validTo: { $gt: new Date() } // Only block if validTo is in the future
        });

        if (existing) {
            return NextResponse.json({ error: "An active coupon with this code already exists" }, { status: 400 });
        }

        const coupon = await Coupon.create({
            code,
            discountPercentage,
            validFrom,
            validTo,
            maxDiscountAmount: maxDiscountAmount ? Number(maxDiscountAmount) : undefined,
            isActive: isActive !== undefined ? isActive : true,
            usageLimit: usageLimit ? Number(usageLimit) : 1,
        });

        return NextResponse.json({ success: true, coupon });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

/* DELETE: Remove coupon */
export async function DELETE(req: Request) {
    try {
        await requireAdmin();
        await connectDB();
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

        // Soft delete
        await Coupon.findByIdAndUpdate(id, { isDeleted: true, isActive: false });
        return NextResponse.json({ success: true });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
