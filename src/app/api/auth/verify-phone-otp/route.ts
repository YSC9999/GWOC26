import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { getUser } from "@/lib/server-auth";

export async function POST(req: Request) {
    try {
        const { phone, otp } = await req.json();
        const authUser = await getUser();

        if (!authUser) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectDB();
        const user = await User.findById(authUser.id);

        if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

        if (user.phoneVerificationOTP !== otp) {
            return NextResponse.json({ error: "Invalid OTP" }, { status: 400 });
        }

        if (!user.phoneOtpExpiry || new Date() > user.phoneOtpExpiry) {
            return NextResponse.json({ error: "OTP expired" }, { status: 400 });
        }

        // Clear OTP fields
        await User.findByIdAndUpdate(authUser.id, {
            $unset: { phoneVerificationOTP: 1, phoneOtpExpiry: 1 },
            // We can also implicitly verify the phone number field on the user if it matches
            // But for now just return success
        });

        return NextResponse.json({ success: true });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
