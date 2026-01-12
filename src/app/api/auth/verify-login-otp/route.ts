import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import jwt from "jsonwebtoken";

export async function POST(req: Request) {
    try {
        await connectDB();
        const { email, otp } = await req.json();

        if (!email || !otp) {
            return NextResponse.json({ error: "Email and OTP are required" }, { status: 400 });
        }

        const cleanEmail = email.trim().toLowerCase();
        const cleanOtp = otp.toString().trim();

        const user = await User.findOne({ email: cleanEmail });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // specific admin check or fallback for main admin
        const isAdmin = user.role === 'admin' || user.email === 'chiluverusreeshanth@gmail.com';
        if (!isAdmin) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        // Verify OTP
        const storedOtp = user.emailVerificationOTP?.toString().trim();

        console.log(`[Verify OTP] Email: ${cleanEmail}, Received: ${cleanOtp}, Stored: ${storedOtp}`);

        if (storedOtp !== cleanOtp) {
            return NextResponse.json({ error: "Invalid OTP" }, { status: 400 });
        }

        if (user.otpExpiry && new Date() > user.otpExpiry) {
            return NextResponse.json({ error: "OTP expired" }, { status: 400 });
        }

        // Clear OTP
        user.emailVerificationOTP = undefined;
        user.otpExpiry = undefined;
        // If user was main admin email but not role admin, maybe update role?
        // Let's just ensure they can login. Access control depends on stored role OR email check in guard.
        // If the valid OTP is provided, we log them in.

        // Explicitly Upgrade Main Admin if needed (Optional, but good for consistency)
        if (user.email === 'chiluverusreeshanth@gmail.com' && user.role !== 'admin') {
            user.role = 'admin';
        }

        await user.save();

        // Generate JWT (Same as login)
        const token = jwt.sign(
            { id: user._id, email: user.email, tier: user.tier, role: user.role },
            process.env.JWT_SECRET!,
            { expiresIn: "7d" }
        );

        const userWithoutPassword = {
            _id: user._id,
            name: user.name,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role, // role might have been updated
            tier: user.tier,
        };

        const response = NextResponse.json({
            success: true,
            message: "Login successful",
            user: userWithoutPassword,
        });

        response.cookies.set("basho_token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60, // 7 days
            path: "/",
        });

        return response;

    } catch (error: any) {
        console.error("OTP Verification Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
