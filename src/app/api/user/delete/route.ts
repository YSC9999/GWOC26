import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import UsedCouponTracker from "@/models/UsedCouponTracker";
import { getUser } from "@/lib/server-auth";
import { cookies } from "next/headers";

export async function DELETE(req: Request) {
    try {
        const authUser = await getUser();
        if (!authUser) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { otp } = await req.json();
        if (!otp) {
            return NextResponse.json({ error: "OTP is required" }, { status: 400 });
        }

        await connectDB();
        const user = await User.findById(authUser.id);

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Verify OTP
        if (user.deleteAccountOTP !== otp) {
            return NextResponse.json({ error: "Invalid verification code" }, { status: 400 });
        }

        if (user.deleteAccountOTPExpiry && new Date() > user.deleteAccountOTPExpiry) {
            return NextResponse.json({ error: "Verification code has expired" }, { status: 400 });
        }

        // 1. Log used coupons to persistent tracker before deleting user
        if (user.usedCoupons && user.usedCoupons.length > 0) {
            const couponLogs = user.usedCoupons.map(code => ({
                email: user.email,
                couponCode: code
            }));

            for (const log of couponLogs) {
                // Use upsert to prevent duplicates if somehow already there
                await UsedCouponTracker.findOneAndUpdate(
                    { email: log.email, couponCode: log.couponCode },
                    { $setOnInsert: { usedAt: new Date() } },
                    { upsert: true }
                );
            }
        }

        // 2. Delete the user
        await User.findByIdAndDelete(authUser.id);

        // 3. Clear auth cookies
        const cookieStore = await cookies();
        cookieStore.delete("token");
        cookieStore.delete("basho_token");

        return NextResponse.json({ success: true, message: "Account deleted successfully" });
    } catch (error: any) {
        console.error("Account Deletion Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
