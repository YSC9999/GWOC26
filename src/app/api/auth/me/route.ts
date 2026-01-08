import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("basho_token")?.value;
    if (!token) return NextResponse.json({ loggedIn: false }, { status: 401 });

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);

    await connectDB();
    const user = await User.findOne({ _id: decoded.id } as any).lean();
    if (!user) return NextResponse.json({ loggedIn: false }, { status: 401 });

    return NextResponse.json({
      loggedIn: true,
      name: user.name,
      email: user.email,
      tier: user.tier,
    });
  } catch {
    return NextResponse.json({ loggedIn: false }, { status: 401 });
  }
}
