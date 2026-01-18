import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Otp from "@/models/Otp";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(req: Request) {
  try {
    await connectDB();

    const { firstName, lastName, email, password } = await req.json();

    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json(
        { error: "All fields required" },
        { status: 400 }
      );
    }

    const hashed = await bcrypt.hash(password, 10);
    const fullName = `${firstName} ${lastName}`;

    // Check for verified OTP record
    const verifiedOtp = await Otp.findOne({ email, verified: true });

    // Also allow if user already exists (maybe updating profile) but we are treating signup as "new" mostly.
    // Actually, signup endpoint does findOneAndUpdate.
    // If it's a new user, we MUST have a verified OTP.
    // If it's an existing user (updating details?), check if they are already verified in User model.

    const existingUser = await User.findOne({ email });
    const isAlreadyVerified = existingUser?.emailVerified;

    if (existingUser?.isBlocked) {
      const now = new Date();
      if (!existingUser.blockedUntil || new Date(existingUser.blockedUntil) > now) {
        return NextResponse.json({ error: "Account is temporarily blocked. Please contact support." }, { status: 403 });
      }
    }

    if (!verifiedOtp && !isAlreadyVerified && !existingUser?.googleId) {
      return NextResponse.json(
        { error: "Email not verified. Please verify your email first." },
        { status: 403 }
      );
    }

    // Determine role (bootstrapping main admin)
    const isMainAdmin = email === "chiluverusreeshanth@gmail.com" || email === process.env.MAIN_ADMIN_EMAIL;
    const role = isMainAdmin ? "admin" : "customer";
    const tier = isMainAdmin ? "tier-3" : "tier-0"; // Give admin max tier too

    // Create or update user
    const user = await User.findOneAndUpdate(
      { email },
      {
        name: fullName,
        firstName,
        lastName,
        email,
        password: hashed,
        role,
        tier,
        subscriptionActive: false,
        emailVerified: true,
      },
      { upsert: true, new: true }
    );

    // Generate JWT for auto-login
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
      role: user.role,
      tier: user.tier,
    };

    const response = NextResponse.json({
      success: true,
      user: userWithoutPassword
    });

    // Set cookie
    response.cookies.set("basho_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });

    return response;
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: (error as Error).message || "Server error" }, { status: 500 });
  }
}
