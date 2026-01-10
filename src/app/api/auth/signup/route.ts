import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    await connectDB();

    const { firstName, lastName, email, password, emailVerified } = await req.json();

    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json(
        { error: "All fields required" },
        { status: 400 }
      );
    }

    const hashed = await bcrypt.hash(password, 10);
    const fullName = `${firstName} ${lastName}`;

    // Create or update user - no duplicate email check here since it was done at signup page
    await User.findOneAndUpdate(
      { email },
      {
        name: fullName,
        firstName,
        lastName,
        email,
        password: hashed,
        tier: "tier-0",
        subscriptionActive: false,
        emailVerified: true,
        emailVerificationOTP: undefined,
        otpExpiry: undefined,
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
