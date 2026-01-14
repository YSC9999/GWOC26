import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Event from "@/models/Event";
import { requireAdmin } from "@/lib/admin-guard";

// GET all events (admin view - maybe includes drafts/all statuses if we had them)
// For now, re-using public logic but authenticated
export async function GET(req: Request) {
    try {
        await requireAdmin();
        await connectDB();

        // Admin wants to see all events sorted by start date descending (newest/future first)
        const events = await Event.find().sort({ startDate: -1 });

        return NextResponse.json({ events });
    } catch (error: any) {
        console.error("Admin Events GET error:", error);
        if (error.message === "Unauthorized") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST create new event
export async function POST(req: Request) {
    try {
        await requireAdmin();
        await connectDB();

        const body = await req.json();

        // Basic validation
        if (!body.title || !body.startDate || !body.endDate || !body.type) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        const newEvent = await Event.create(body);

        return NextResponse.json({ event: newEvent }, { status: 201 });
    } catch (error: any) {
        console.error("Admin Event POST error:", error);
        if (error.message === "Unauthorized") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// PUT update event
export async function PUT(req: Request) {
    try {
        await requireAdmin();
        await connectDB();

        const body = await req.json();
        const { _id, ...updateData } = body;

        if (!_id) {
            return NextResponse.json({ error: "Missing Event ID" }, { status: 400 });
        }

        const updatedEvent = await Event.findByIdAndUpdate(_id, updateData, {
            new: true,
            runValidators: true,
        } as any);

        if (!updatedEvent) {
            return NextResponse.json({ error: "Event not found" }, { status: 404 });
        }

        return NextResponse.json({ event: updatedEvent });
    } catch (error: any) {
        console.error("Admin Event PUT error:", error);
        if (error.message === "Unauthorized") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE event
export async function DELETE(req: Request) {
    try {
        await requireAdmin();
        await connectDB();

        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ error: "Missing ID" }, { status: 400 });
        }

        const deletedEvent = await Event.findByIdAndDelete(id);

        if (!deletedEvent) {
            return NextResponse.json({ error: "Event not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "Event deleted successfully" });
    } catch (error: any) {
        console.error("Admin Event DELETE error:", error);
        if (error.message === "Unauthorized") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
