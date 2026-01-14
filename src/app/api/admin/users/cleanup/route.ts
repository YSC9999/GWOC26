import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { requireMainAdmin } from "@/lib/admin-guard";

export async function DELETE(req: Request) {
    try {
        await requireMainAdmin();
        await connectDB();

        // Delete all users where emailVerified is false
        // Also including those where it might be missing (null/undefined) just in case, 
        // but primarily targeting the explicitly false ones from recent signups.
        // Safety check: ensure we don't delete admins accidentally (though admins should have verification).

        // We strictly target customers who are NOT verified.
        const result = await User.deleteMany({
            emailVerified: { $ne: true },
            role: { $ne: 'admin' }
        });

        return NextResponse.json({
            success: true,
            message: `Deleted ${result.deletedCount} unverified users.`
        });
    } catch (error: any) {
        console.error("Cleanup error:", error);
        return NextResponse.json({ error: error.message || "Server error" }, { status: 500 });
    }
}
