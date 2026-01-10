import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
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

    // Security check: Ensure email was verified before allowing details update/upsert
    const unverifiedUser = await User.findOne({ email }).lean();
    if (unverifiedUser && !unverifiedUser.emailVerified && !unverifiedUser.googleId) {
      return NextResponse.json({ error: "Email not verified" }, { status: 403 });
    }

    // Create or update user
    const user = await User.findOneAndUpdate(
      { email },
      {
        name: fullName,
        firstName,
        lastName,
        email,
        password: hashed,
        role: "customer",
        tier: "tier-0",
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
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
