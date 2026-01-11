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
        const { code, discountPercentage, validFrom, validTo, isActive } = body;

        if (!code || !discountPercentage || !validFrom || !validTo) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const existing = await Coupon.findOne({ code: code.toUpperCase() });
        if (existing) {
            return NextResponse.json({ error: "Coupon code already exists" }, { status: 400 });
        }

        const coupon = await Coupon.create({
            code,
            discountPercentage,
            validFrom,
            validTo,
            isActive: isActive !== undefined ? isActive : true,
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

        await Coupon.findByIdAndDelete(id);
        return NextResponse.json({ success: true });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
