import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Event from "@/models/Event";
import { requireAdmin } from "@/lib/admin-guard";

// GET all events
export async function GET(req: Request) {
    try {
        await requireAdmin();
        await connectDB();
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

// Generate slug
const generateSlug = (title: string) => {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
};

// POST create new event
export async function POST(req: Request) {
    try {
        await requireAdmin();
        await connectDB();
        const body = await req.json();

        if (!body.title || !body.startDate || !body.endDate || !body.type) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const slug = generateSlug(body.title);
        const eventData = { ...body, slug, description: body.description || "" };
        const newEvent = await Event.create(eventData);

        return NextResponse.json({ event: newEvent }, { status: 201 });
    } catch (error: any) {
        console.error("Admin Event POST error:", error);
        if (error.code === 11000) {
            return NextResponse.json({ error: "An event with this title already exists." }, { status: 409 });
        }
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

        if (updateData.title) {
            updateData.slug = generateSlug(updateData.title);
        }

        const updatedEvent = await Event.findByIdAndUpdate(_id, updateData, { new: true, runValidators: true } as any);

        if (!updatedEvent) {
            return NextResponse.json({ error: "Event not found" }, { status: 404 });
        }

        return NextResponse.json({ event: updatedEvent });
    } catch (error: any) {
        console.error("Admin Event PUT error:", error);
        if (error.code === 11000) {
            return NextResponse.json({ error: "An event with this title already exists." }, { status: 409 });
        }
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

        // Fix TS error by casting to any
        const deletedEvent = await (Event as any).findByIdAndDelete(id);

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
