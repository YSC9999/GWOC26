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
  }
}
