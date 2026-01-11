import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Workshop from "@/models/Workshop";
import WorkshopRegistration from "@/models/WorkshopRegistration";

// POST - Register for a workshop
export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();

        const { id } = await params;
        const body = await req.json();
        const { name, email, phone, numberOfParticipants, specialRequests } = body;

        // Validate required fields
        if (!name || !email || !phone || !numberOfParticipants) {
            return NextResponse.json(
                { error: "Name, email, phone and number of participants are required" },
                { status: 400 }
            );
        }

        // Find workshop
        const workshop = await (Workshop as any).findById(id);
        if (!workshop) {
            return NextResponse.json({ error: "Workshop not found" }, { status: 404 });
        }

        // Check availability
        const availableSpots = workshop.maxParticipants - workshop.enrolledCount;
        if (numberOfParticipants > availableSpots) {
            return NextResponse.json(
                { error: `Only ${availableSpots} spots available` },
                { status: 400 }
            );
        }

        // Calculate total amount
        const totalAmount = workshop.price * numberOfParticipants;

        // Create registration
        const registration = await WorkshopRegistration.create({
            workshopId: id,
            name,
            email,
            phone,
            numberOfParticipants,
            specialRequests,
            totalAmount,
            paymentStatus: "pending",
            status: "pending"
        });

        // Update enrolled count
        await (Workshop as any).findByIdAndUpdate(id, {
            $inc: { enrolledCount: numberOfParticipants }
        });

        return NextResponse.json({
            success: true,
            registration: {
                id: registration._id,
                totalAmount,
                workshopTitle: workshop.title,
                workshopDate: workshop.date,
                workshopTime: workshop.time
            }
        });
    } catch (error: any) {
        console.error("Workshop registration error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
