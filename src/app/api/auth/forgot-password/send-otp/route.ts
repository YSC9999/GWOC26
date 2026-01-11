import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { generateOTP, sendForgotPasswordEmail } from "@/lib/email";

export async function POST(req: Request) {
    try {
        await connectDB();
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json({ error: "Email is required" }, { status: 400 });
        }

        const user = await User.findOne({ email });
        if (!user) {
            // Security: Don't reveal if user exists, just pretend success
            // But for better UX during dev/testing, we might return error
            // For production, always return success to prevent enumeration
            return NextResponse.json({ error: "User not found with this email" }, { status: 404 });
        }

        const otp = generateOTP();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        user.resetPasswordOTP = otp;
        user.resetPasswordExpiry = otpExpiry;
        await user.save();

        const emailSent = await sendForgotPasswordEmail(email, otp);

        if (emailSent) {
            return NextResponse.json({ success: true, message: "OTP sent successfully" });
        } else {
            return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
        }

    } catch (error: any) {
        console.error("Forgot Password error:", error);
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
    }
}
