
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import PreviousWorkshop from "@/models/PreviousWorkshop";

export async function GET() {
    try {
        await connectDB();
        const workshops = await PreviousWorkshop.find().sort({ createdAt: -1 });
        return NextResponse.json({ success: true, data: workshops });
    } catch (error) {
        console.error("Error fetching previous workshops:", error);
        return NextResponse.json(
            { error: "Failed to fetch workshops" },
            { status: 500 }
        );
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { images, description } = body;

        if (!images || !description) {
            return NextResponse.json(
                { error: "Images and description are required" },
                { status: 400 }
            );
        }

        await connectDB();
        const newWorkshop = await PreviousWorkshop.create({ images, description });

        return NextResponse.json({ success: true, data: newWorkshop });
    } catch (error) {
        console.error("Error creating previous workshop:", error);
        return NextResponse.json(
            { error: "Failed to create workshop" },
            { status: 500 }
        );
    }
}

export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json(
                { error: "ID is required" },
                { status: 400 }
            );
        }

        await connectDB();
        const deleted = await (PreviousWorkshop as any).findByIdAndDelete(id);

        if (!deleted) {
            return NextResponse.json(
                { error: "Workshop not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, message: "Deleted successfully" });
    } catch (error) {
        console.error("Error deleting workshop:", error);
        return NextResponse.json(
            { error: "Failed to delete workshop" },
            { status: 500 }
        );
    }
}
