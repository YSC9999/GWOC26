import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import StoreSettings from "@/models/StoreSettings";
import { requireAdmin } from "@/lib/admin-guard";

export async function GET(req: Request) {
    try {
        await connectDB();
        // Fetch the settings (create default if not exists)
        let settings = await StoreSettings.findOne();
        if (!settings) {
            settings = await StoreSettings.create({});
        }
        return NextResponse.json({ settings });
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        await requireAdmin();
        await connectDB();
        const { shippingMode, freeShippingThreshold, pincodeRateDefault, pincodeType, shiprocketReferencePincode, shiprocketReferencePrice } = await req.json();

        let settings = await StoreSettings.findOne();
        if (!settings) {
            settings = new StoreSettings();
        }

        if (shippingMode) settings.shippingMode = shippingMode;
        if (freeShippingThreshold !== undefined) settings.freeShippingThreshold = freeShippingThreshold;
        if (pincodeRateDefault !== undefined) settings.pincodeRateDefault = pincodeRateDefault;
        if (pincodeType) settings.pincodeType = pincodeType;
        if (shiprocketReferencePincode) settings.shiprocketReferencePincode = shiprocketReferencePincode;
        if (shiprocketReferencePrice !== undefined) settings.shiprocketReferencePrice = shiprocketReferencePrice;

        await settings.save();

        return NextResponse.json({ settings });
    } catch (error) {
        return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
    }
}
