import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { getUser } from "@/lib/server-auth";

export async function GET(req: Request) {
    try {
        const authUser = await getUser();
        if (!authUser) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectDB();
        const user = await User.findById(authUser.id);

        return NextResponse.json({ addresses: user?.addresses || [] });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const authUser = await getUser();
        if (!authUser) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectDB();
        const address = await req.json();

        // Basic validation
        if (!address.street || !address.city || !address.state || !address.pincode || !address.phone) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const user = await User.findByIdAndUpdate(
            authUser.id,
            { $push: { addresses: address } },
            { new: true }
        );

        return NextResponse.json({ success: true, addresses: user?.addresses });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const authUser = await getUser();
        if (!authUser) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectDB();
        const { _id, ...updateData } = await req.json();

        if (!_id) {
            return NextResponse.json({ error: "Address ID required" }, { status: 400 });
        }

        const user = await User.findOneAndUpdate(
            { _id: authUser.id, "addresses._id": _id },
            {
                $set: {
                    "addresses.$.name": updateData.name,
                    "addresses.$.phone": updateData.phone,
                    "addresses.$.street": updateData.street,
                    "addresses.$.city": updateData.city,
                    "addresses.$.state": updateData.state,
                    "addresses.$.pincode": updateData.pincode,
                    "addresses.$.country": updateData.country
                }
            },
            { new: true }
        );

        if (!user) {
            return NextResponse.json({ error: "Address not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, addresses: user.addresses });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const authUser = await getUser();
        if (!authUser) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectDB();
        const { searchParams } = new URL(req.url);
        const addressId = searchParams.get('id');

        if (!addressId) {
            return NextResponse.json({ error: "Address ID required" }, { status: 400 });
        }

        const user = await User.findByIdAndUpdate(
            authUser.id,
            { $pull: { addresses: { _id: addressId } } },
            { new: true }
        );

        return NextResponse.json({ success: true, addresses: user?.addresses });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
