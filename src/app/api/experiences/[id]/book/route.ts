import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Experience from "@/models/Experience";
import ExperienceBooking from "@/models/ExperienceBooking";

// POST - Book an experience
export async function POST(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        await connectDB();

        const { id } = await params;
        const body = await req.json();
        const {
            name,
            email,
            phone,
            date,
            timeSlot,
            numberOfGuests,
            specialRequests,
            celebrantName,
            occasion
        } = body;

        // Validate required fields
        if (!name || !email || !phone || !date || !timeSlot || !numberOfGuests) {
            return NextResponse.json(
                { error: "Name, email, phone, date, time slot and number of guests are required" },
                { status: 400 }
            );
        }

        // Find experience
        const experience = await Experience.findById(id);
        if (!experience) {
            return NextResponse.json({ error: "Experience not found" }, { status: 404 });
        }

        // Check guest limit
        if (numberOfGuests > experience.maxGuests) {
            return NextResponse.json(
                { error: `Maximum ${experience.maxGuests} guests allowed` },
                { status: 400 }
            );
        }

        // Calculate total amount
        let totalAmount = experience.price;
        if (numberOfGuests > 2 && experience.pricePerAdditionalGuest) {
            totalAmount += (numberOfGuests - 2) * experience.pricePerAdditionalGuest;
        }

        // Create booking
        const booking = await ExperienceBooking.create({
            experienceId: id,
            name,
            email,
            phone,
            date: new Date(date),
            timeSlot,
            numberOfGuests,
            specialRequests,
            celebrantName,
            occasion,
            totalAmount,
            paymentStatus: "pending",
            status: "pending"
        });

        return NextResponse.json({
            success: true,
            booking: {
                id: booking._id,
                totalAmount,
                experienceTitle: experience.title,
                date,
                timeSlot
            }
        });
    } catch (error: any) {
        console.error("Experience booking error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
