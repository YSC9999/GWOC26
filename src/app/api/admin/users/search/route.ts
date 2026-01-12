import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export async function GET(req: Request) {
    try {
        await connectDB();
        const { searchParams } = new URL(req.url);
        const q = searchParams.get("q");
        const role = searchParams.get("role");

        if (!q) return NextResponse.json({ users: [] });

        const filter: any = {
            $or: [
                { name: { $regex: q, $options: "i" } },
                { email: { $regex: q, $options: "i" } }
            ]
        };

        if (role) {
            filter.role = role;
        }

        const users = await User.find(filter).select("name email walletBalance").limit(5);

        return NextResponse.json({ users });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
