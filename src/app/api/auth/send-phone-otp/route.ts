import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { getUser } from "@/lib/server-auth";
import { sendSMS } from "@/lib/sms";

export async function POST(req: Request) {
    try {
        await connectDB();

        const { phone } = await req.json();

        if (!phone) return NextResponse.json({ error: "Phone required" }, { status: 400 });

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
        const smsSent = await sendSMS(phone, `Your Basho Verification Code is: ${otp}`);

        if (smsSent) {
            return NextResponse.json({ success: true, message: "OTP sent via SMS" });
        } else {
            // Fallback for demo/dev if keys missing
            console.log(`[DEV MODE] OTP for ${phone}: ${otp}`);
            return NextResponse.json({ success: true, message: "OTP sent (Dev Mode: Check Console)" });
        }
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
