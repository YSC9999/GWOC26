import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { getUser } from "@/lib/server-auth";
import { generateOTP, sendAccountDeletionOTPEmail } from "@/lib/email";

export async function POST(req: Request) {
    try {
        const authUser = await getUser();
        if (!authUser) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectDB();
        const user = await User.findById(authUser.id);

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const otp = generateOTP();
        const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        user.deleteAccountOTP = otp;
        user.deleteAccountOTPExpiry = expiry;
        await user.save();

        const emailSent = await sendAccountDeletionOTPEmail(user.email, otp);

        if (!emailSent) {
            return NextResponse.json({ error: "Failed to send OTP email" }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: "OTP sent to your email" });
    } catch (error: any) {
        console.error("Request Deletion OTP Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
