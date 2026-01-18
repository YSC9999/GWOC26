import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { getUser } from "@/lib/server-auth";
import { sendSMS } from "@/lib/sms";

export async function POST(req: Request) {
    try {
        await connectDB();

        let { phone } = await req.json();
        if (!phone) return NextResponse.json({ error: "Phone required" }, { status: 400 });

        // Sanitize: strip spaces, dashes, etc. Keep leading +
        phone = phone.trim().replace(/[^\d+]/g, '');

        // Add +91 prefix if not present
        if (!phone.startsWith('+')) {
            phone = '+91' + phone;
        }

        const authUser = await getUser();

        // Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiry = new Date(Date.now() + 10 * 60 * 1000);

        if (authUser) {
            await User.findByIdAndUpdate(authUser.id, {
                phoneVerificationOTP: otp,
                phoneOtpExpiry: expiry
            });
        }

        // Send SMS via Twilio
        const smsResult = await sendSMS(phone, `Your Basho Verification Code is: ${otp}`);

        if (smsResult.success) {
            return NextResponse.json({ success: true, message: "OTP sent via SMS" });
        } else {
            // Fallback for Dev/Error cases - return OTP for frontend alert
            console.log(`[DEV MODE] SMS Failed (${smsResult.error}). OTP for ${phone}: ${otp}`);

            // Return SUCCESS with OTP so the Frontend can show it in an alert
            return NextResponse.json({
                success: true,
                message: "SMS service unavailable. Your OTP is shown in the alert.",
                devOtp: otp, // Send OTP to frontend for alert display
                devMode: true
            });
        }
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
