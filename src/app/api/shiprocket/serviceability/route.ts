import { NextResponse } from "next/server";
import { checkServiceability } from "@/lib/shiprocket";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const pincode = searchParams.get("pincode");
        const weight = searchParams.get("weight");

        if (!pincode) {
            return NextResponse.json({ error: "Pincode is required" }, { status: 400 });
        }

        const data = await checkServiceability(Number(pincode), Number(weight) || 0.5);
        return NextResponse.json(data);

    } catch (error: any) {
        console.error("Shiprocket API Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
