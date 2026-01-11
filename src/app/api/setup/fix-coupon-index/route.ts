import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Coupon from "@/models/Coupon";
import mongoose from "mongoose";

export async function GET() {
    try {
        await connectDB();

        // Get the native collection
        const collection = mongoose.connection.collection("coupons");

        // List indexes to see what we have (optional debug, but good practice)
        const indexes = await collection.indexes();
        console.log("Current indexes:", indexes);

        // Drop the unique index on 'code' if it exists.
        // Mongoose usually names it 'code_1'.
        const indexName = "code_1";

        const indexExists = indexes.some((idx: any) => idx.name === indexName);

        if (indexExists) {
            await collection.dropIndex(indexName);
            return NextResponse.json({
                success: true,
                message: "Unique index 'code_1' dropped successfully. You can now create duplicate coupon codes."
            });
        } else {
            return NextResponse.json({
                success: true,
                message: "Index 'code_1' not found. It might have already been dropped."
            });
        }

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
