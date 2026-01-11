import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { getUser } from "@/lib/server-auth";
import Product from "@/models/Product";

export async function GET() {
    try {
        const authUser = await getUser();
        if (!authUser) return NextResponse.json({ cart: [] });

        await connectDB();
        const user = await User.findById(authUser.id).populate("cart.productId");

        if (!user) return NextResponse.json({ cart: [] });

        // Transform to frontend cart format
        const cartItems = user.cart.map((item: any) => {
            if (!item.productId) return null; // Filter out deleted products
            return {
                id: item.productId._id.toString(),
                name: item.productId.name,
                price: item.productId.price,
                image: item.productId.images?.[0] || item.productId.image,
                qty: item.qty
            };
        }).filter(Boolean);

        return NextResponse.json({ cart: cartItems });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const authUser = await getUser();
        if (!authUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { cart } = await req.json(); // Expects array of { id, qty }

        await connectDB();

        // Transform frontend cart to DB format
        // We only store ID and Qty
        const dbCart = cart.map((item: any) => ({
            productId: item.id,
            qty: item.qty
        }));

        await User.findByIdAndUpdate(authUser.id, {
            $set: { cart: dbCart }
        });

        return NextResponse.json({ success: true });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
