import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { generateOTP, sendOTPEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    await connectDB();

    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Check if email already exists and is FULLY registered (has a password)
    const existingUser = await User.findOne({ email }).lean();
    if (existingUser && existingUser.emailVerified && existingUser.password) {
      return NextResponse.json(
        { error: "Email already registered. Please login." },
        { status: 400 }
      );
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Send OTP email
    const emailSent = await sendOTPEmail(email, otp);

    if (!emailSent) {
      return NextResponse.json(
        { error: "Failed to send OTP. Please check email configuration." },
        { status: 500 }
      );
    }

    // If user exists but not verified, update OTP. Otherwise, create temporary record
    if (existingUser) {
      await User.updateOne(
        { email },
        {
          emailVerificationOTP: otp,
          otpExpiry,
        }
      );
    } else {
      // Create a temporary user record for new emails
      await User.create({
        email,
        name: "Unverified",
        emailVerificationOTP: otp,
        otpExpiry,
        emailVerified: false,
      });
    }

    return NextResponse.json({
      success: true,
      message: "OTP sent to your email",
    });
  } catch (error) {
    console.error("Error in send OTP:", error);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
