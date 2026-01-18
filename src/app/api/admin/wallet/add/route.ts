import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
// import WalletTransaction from "@/models/WalletTransaction";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { sendWalletCreditEmail } from "@/lib/email";

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

export async function POST(req: Request) {
    try {
        await connectDB();
        const admin = await getUserFromRequest(req);
        if (!admin || admin.role !== 'admin') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const { userId, amount, mode, count, message } = await req.json();

        // Mode: 'single' (Add to one user) OR 'random' (Giveaway)

        if (mode === 'random') {
            // Giveaway Logic
            const randomUsers = await User.aggregate([
                { $match: { role: 'customer' } }, // Only customers
                { $sample: { size: Number(count) || 1 } }
            ]);

            const updates = [];
            for (const user of randomUsers) {
                // 1. Update User Balance
                const newBalance = (user.walletBalance || 0) + Number(amount);
                updates.push(User.findByIdAndUpdate(user._id, { walletBalance: newBalance }));

                // 2. Create Transaction (WalletTransaction model removed)
                // updates.push(WalletTransaction.create({
                //     user: user._id,
                //     amount: Number(amount),
                //     type: 'credit',
                //     description: message || "Admin Giveaway Surprise! 🎉"
                // }));

                // 3. Send Email
                updates.push(sendWalletCreditEmail(user.email, amount, newBalance, message));
            }

            await Promise.all(updates);
            return NextResponse.json({ success: true, message: `Added ₹${amount} to ${randomUsers.length} lucky users!` });

        } else {
            // Single User Logic
            const user = await User.findById(userId);
            if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

            const newBalance = (user.walletBalance || 0) + Number(amount);

            await User.findByIdAndUpdate(userId, { walletBalance: newBalance });

            // WalletTransaction model removed; skipping transaction creation
            // await WalletTransaction.create({
            //     user: userId,
            //     amount: Number(amount),
            //     type: 'credit',
            //     description: message || "Admin Added Funds"
            // });

            await sendWalletCreditEmail(user.email, amount, newBalance, message);

            return NextResponse.json({ success: true, balance: newBalance });
        }

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
