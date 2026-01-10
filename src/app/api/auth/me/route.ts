<<<<<<< HEAD
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export async function GET(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    await connectDB();

    // Select specific fields for session
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      tier: user.tier, // Assuming tier exists on User model if used in Navbar
    });

  } catch (error) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
=======
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import jwt from "jsonwebtoken";

export async function GET(req: Request) {
  try {
    await connectDB();

    const token = req.headers.get("cookie")?.split("token=")[1];
    if (!token) throw new Error();

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as { id: string };

    const user = await User.findById(decoded.id)
      .select("-password")
      .exec(); // ✅ FIX

    if (!user) throw new Error();

    return Response.json(user);
  } catch {
    return new Response("Unauthorized", { status: 401 });
>>>>>>> 5999d3ccafb5d5647a776ff6ca884f06f0f1659b
  }
}
