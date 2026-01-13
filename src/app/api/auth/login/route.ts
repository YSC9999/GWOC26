import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { email, password } = await req.json();

    // 1. Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      console.log(`[Login API] User not found: ${email}`);
      return NextResponse.json({ error: "Invalid credentials" }, { status: 400 });
    }

    // 2. Validate password
    if (!user.password) {
      return NextResponse.json({ error: "Please log in with Google" }, { status: 400 });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log(`[Login API] Password mismatch for: ${email}`);
      return NextResponse.json({ error: "Invalid credentials" }, { status: 400 });
    }

    // 3. Check for Admin Role and "Main Admin" override
    if (user.role === 'admin' || user.email === 'chiluverusreeshanth@gmail.com') {
      const { generateOTP, sendOTPEmail } = await import("@/lib/email");
      const otp = generateOTP();

      user.emailVerificationOTP = otp;
      user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 mins
      await user.save();

      console.log(`[Login] Admin 2FA required for: ${user.email}`);
      await sendOTPEmail(user.email, otp);

      return NextResponse.json({
        requiredOtp: true,
        email: user.email,
        message: "OTP sent to your email"
      });
    }

    // 4. Generate JWT for non-admin users
    console.log(`[Login] Logging in user: ${user.email}, Role: ${user.role}, Tier: ${user.tier}`);

    const token = jwt.sign(
      { id: user._id, email: user.email, tier: user.tier, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );

    // 5. Return user info (excluding password)
    const userWithoutPassword = {
      _id: user._id,
      name: user.name,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      tier: user.tier,
    };

    const response = NextResponse.json({
      success: true,
      message: "Login successful",
      user: userWithoutPassword,
    });

    // Set cookie
    response.cookies.set("basho_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Ensure this is false on localhost if using http
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });

    return response;

  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
