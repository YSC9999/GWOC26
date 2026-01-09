import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export async function GET() {
  await connectDB();

  const token = (await cookies()).get("basho_token")?.value;
  if (!token) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as { id: string };

    const user = await User.findById(decoded.id)
      .select("-password")
      .lean();

    if (!user) {
      return new Response("User not found", { status: 404 });
    }

    return Response.json(user);
  } catch {
    return new Response("Invalid token", { status: 401 });
  }
}
