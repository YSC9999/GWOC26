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
        } else {
            // If no role specified, maybe default to ALL? 
            // The frontend was sending role=customer. 
            // If I want to find admins too, I should remove the role filter or allow specifying 'all'.
            // Actually, for wallet, we should be able to give to anyone? or just customers?
            // User requested to fix search not appearing. The user 's snm' is likely NOT a customer role if he is an Admin.
        }

        const users = await User.find(filter).select("name email").limit(5);

        return NextResponse.json({ users });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
