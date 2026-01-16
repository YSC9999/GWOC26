import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { getUser as getAuthUser } from "@/lib/server-auth";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

// Unified getUser: try centralized auth first, then fall back to the legacy token cookie
async function getUser() {
    const authUser = await getAuthUser();
    if (authUser) return authUser;

    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) return null;

    try {
        const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
        return { id: decoded.userId } as any;
    } catch {
        return null;
    }
}

export async function GET(req: Request) {
    try {
        const authUser = await getUser();
        if (!authUser) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = authUser.id;

        await connectDB();
        const user = await User.findById(userId).select("-password").lean();

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json({ user });
    } catch (error) {
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const authUser = await getUser();
        if (!authUser) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = authUser.id;

        const body = await req.json();
        const { name, phone, addresses, picture, acceptsMarketingEmails } = body;

        await connectDB();

        const updateData: any = {};
        if (name) updateData.name = name;
        if (phone) updateData.phone = phone;
        if (addresses) updateData.addresses = addresses;
        if (picture) updateData.picture = picture;
        if (typeof acceptsMarketingEmails === 'boolean') updateData.acceptsMarketingEmails = acceptsMarketingEmails;

        const user = await User.findByIdAndUpdate(
            userId,
            { $set: updateData },
            { new: true }
        ).select("-password");

        return NextResponse.json({ success: true, user });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Update failed" }, { status: 500 });
    }
}
