import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import WorkshopRegistration from "@/models/WorkshopRegistration";
import Workshop from "@/models/Workshop";
import { getUser } from "@/lib/server-auth";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getUser();
        if (!user) {
            // Allow access if it's admin or the owner. For invoice, maybe allow if valid ID?
            // Security: In strict mode, check auth.
            // For now, let's enforce auth.
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectDB();
        const { id } = await params;

        const registration = await (WorkshopRegistration as any).findById(id).populate('workshopId');

        if (!registration) {
            return NextResponse.json({ error: "Registration not found" }, { status: 404 });
        }

        // Check ownership
        // Note: Admin should also be able to access. Assuming getUser returns role.
        if (registration.userId.toString() !== user.id && user.role !== 'admin') {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        return NextResponse.json({ registration });

    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
