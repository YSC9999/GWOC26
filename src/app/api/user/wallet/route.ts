import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import WalletTransaction from "@/models/WalletTransaction";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const SECRET_KEY = process.env.JWT_SECRET || "your-secret-key";

async function getUserFromRequest(req: Request) {
    try {
        let token = null;
        const authHeader = req.headers.get("authorization");
        if (authHeader && authHeader.startsWith("Bearer ")) {
            token = authHeader.split(" ")[1];
        } else {
            const cookieStore = await cookies();
            token = cookieStore.get("basho_token")?.value || null;
        }

        if (!token) return null;
        return jwt.verify(token, SECRET_KEY) as any;
    } catch {
        return null;
    }
}

export async function GET(req: Request) {
    try {
        await connectDB();
        const user = await getUserFromRequest(req);
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const dbUser = await User.findById(user.id).select("walletBalance");
        const transactions = await WalletTransaction.find({ user: user.id }).sort({ createdAt: -1 });

        return NextResponse.json({
            balance: dbUser?.walletBalance || 0,
            transactions
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
