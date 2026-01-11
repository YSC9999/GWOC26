import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function GET() {
    try {
        await connectDB();

        const email = "basho@gmail.com";
        const password = "12345678";
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.findOneAndUpdate(
            { email },
            {
                name: "Basho Admin",
                email,
                password: hashedPassword,
                role: "admin",
                tier: "tier-3",
                emailVerified: true,
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        return NextResponse.json({
            success: true,
            message: "Admin user created/updated successfully",
            user: { email: user.email, role: user.role }
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
