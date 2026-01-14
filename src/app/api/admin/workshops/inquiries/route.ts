
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import WorkshopInquiry from "@/models/WorkshopInquiry";

export async function GET() {
    try {
        await connectDB();
        const inquiries = await WorkshopInquiry.find().sort({ createdAt: -1 });
        return NextResponse.json({ inquiries });
    } catch (error) {
        console.error("Error fetching inquiries:", error);
        return NextResponse.json(
            { error: "Failed to fetch inquiries" },
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
                { error: "Inquiry ID is required" },
                { status: 400 }
            );
        }

        await connectDB();
        // casting to any to avoid TS signature mismatch error
        const deletedInquiry = await (WorkshopInquiry as any).findByIdAndDelete(id);

        if (!deletedInquiry) {
            return NextResponse.json(
                { error: "Inquiry not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, message: "Inquiry deleted successfully" });
    } catch (error) {
        console.error("Error deleting inquiry:", error);
        return NextResponse.json(
            { error: "Failed to delete inquiry" },
            { status: 500 }
        );
    }
}
