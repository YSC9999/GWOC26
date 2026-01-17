import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { getUser } from "@/lib/server-auth";

export async function GET(req: Request) {
  try {
    const authUser = await getUser();

    if (!authUser) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    await connectDB();

    // Select specific fields for session
    const user = await User.findById(authUser.id).select("-password");

    if (!user) {
      // User deleted from DB but has valid token -> Clear cookie
      const response = NextResponse.json({ error: "User not found" }, { status: 401 });
      response.cookies.delete("basho_token");
      return response;
    }

    if (user.isBlocked) {
      const now = new Date();
      if (!user.blockedUntil || new Date(user.blockedUntil) > now) {
        const response = NextResponse.json({ error: "Something went wrong" }, { status: 401 });
        response.cookies.delete("basho_token");
        return response;
      }
    }

    return NextResponse.json({
      _id: user._id,
      name: user.name,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      picture: user.picture,
      tier: user.tier,
      addresses: user.addresses,
      wishlist: user.wishlist
    });

  } catch (error) {
    console.error("Auth Me API Error:", error);
    return NextResponse.json({ error: "Invalid token" }, { status: 500 }); // Changed to 500 to debug
  }
}
