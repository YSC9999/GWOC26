import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Workshop from "@/models/Workshop";

// GET single workshop
export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();

        const { id } = await params;

        let workshop;

        if (id.match(/^[0-9a-fA-F]{24}$/)) {
            workshop = await (Workshop as any).findById(id).lean();
        }

        if (!workshop) {
            workshop = await (Workshop as any).findOne({ slug: id }).lean();
        }

        if (!workshop) {
            return NextResponse.json({ error: "Workshop not found" }, { status: 404 });
        }

        return NextResponse.json({ workshop });
    } catch (error: any) {
        console.error("Workshop GET error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
