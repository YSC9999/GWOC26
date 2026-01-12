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

        const authUser = await getUser();

        // Mock OTP generation
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiry = new Date(Date.now() + 10 * 60 * 1000);

        if (authUser) {
            await User.findByIdAndUpdate(authUser.id, {
                phoneVerificationOTP: otp,
                phoneOtpExpiry: expiry
            });
        }

        // Send Real SMS
        const smsResult = await sendSMS(phone, `Your Basho Verification Code is: ${otp}`);

        if (smsResult.success) {
            return NextResponse.json({ success: true, message: "OTP sent via SMS" });
        } else {
            // Fallback for Dev/Error cases (as requested by user)
            // "if not then otp in terminal"
            console.log(`[DEV MODE] SMS Failed (${smsResult.error}). OTP for ${phone}: ${otp}`);

            // Return SUCCESS so the Frontend UI shows the OTP Input field
            return NextResponse.json({
                success: true,
                message: `SMS Failed. Check Server Console for OTP.` // User will see this as a toast/alert but can proceed
            });
        }
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
