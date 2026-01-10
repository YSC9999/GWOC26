import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(req: Request) {
  try {
    await connectDB();

    const { firstName, lastName, email, googleId, picture } = await req.json();

    if (!email || !googleId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if user already exists
    let user = await User.findOne({ email }).lean();

    if (user) {
      // User exists, update with Google info if not already set
      if (!user.googleId) {
        await User.findByIdAndUpdate(user._id, {
          googleId,
          picture,
          emailVerified: true,
        });
      }
    } else {
      // Create new user with Google info
      user = await User.create({
        firstName,
        lastName,
        name: `${firstName} ${lastName}`,
        email,
        googleId,
        picture,
        emailVerified: true,
        tier: "tier-0",
        subscriptionActive: false,
        role: "customer",
      });
    }

    // Generate JWT token for login
    const token = require("jsonwebtoken").sign(
      { id: user._id, email: user.email, tier: user.tier },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "7d" }
    );

    const response = NextResponse.json({ 
      success: true,
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        tier: user.tier,
        picture: user.picture,
      }
    });

    // Set auth cookie
    response.cookies.set("basho_token", token, {
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
