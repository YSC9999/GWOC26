import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import ShippingRate from "@/models/ShippingRate";

import Product from "@/models/Product";
import PincodeRate from "@/models/PincodeRate";

export async function POST(req: Request) {
    try {
        const { items, weight: clientWeight, pincode } = await req.json();

        await connectDB();

        // 1. Fetch Store Settings
        const StoreSettings = (await import("@/models/StoreSettings")).default;
        let settings = await StoreSettings.findOne();
        if (!settings) settings = await StoreSettings.create({});

        // 2. Calculate Cart Value and Weight
        let weight = 0;
        let cartValue = 0;

        if (items && Array.isArray(items)) {
            const productIds = items.map((i: any) => i.id);
            const products = await Product.find({ _id: { $in: productIds } });

            items.forEach((item: any) => {
                const product = products.find(p => p._id.toString() === item.id);
                if (product) {
                    const itemWeight = (product.weightGrams || 500) / 1000; // Convert to KG
                    weight += itemWeight * (item.qty || 1);
                    cartValue += product.price * (item.qty || 1);
                }
            });
        } else if (clientWeight !== undefined) {
            // Fallback if only weight is sent (legacy or simplified call)
            weight = clientWeight;
        }

        let cost = 0;

        // 3. Check Free Shipping Threshold
        if (settings.freeShippingThreshold > 0 && cartValue >= settings.freeShippingThreshold) {
            cost = 0;
        } else {
            // 4. Calculate based on Mode
            if (settings.shippingMode === 'pincode') {
                // SHIPROCKET INTEGRATION
                // SHIPROCKET INTEGRATION
                if (settings.pincodeType === 'shiprocket_realtime' || settings.pincodeType === 'shiprocket_reference') {
                    try {
                        const { checkServiceability } = await import("@/lib/shiprocket");
                        let multiplier = 1;

                        // Calculate Multiplier for Reference Mode
                        if (settings.pincodeType === 'shiprocket_reference' && settings.shiprocketReferencePincode) {
                            try {
                                const refData = await checkServiceability(Number(settings.shiprocketReferencePincode), 0.5); // Check 0.5kg base rate
                                const couriers = refData.data?.available_courier_companies || [];
                                let refRate = 50;
                                if (couriers.length > 0) {
                                    const cheapest = couriers.reduce((prev: any, curr: any) => (Number(prev.rate) < Number(curr.rate)) ? prev : curr);
                                    refRate = Number(cheapest.rate);
                                }
                                const adminPrice = settings.shiprocketReferencePrice || 50;
                                if (refRate > 0) {
                                    multiplier = adminPrice / refRate;
                                }
                            } catch (e) {
                                console.error("Ref Calc Error:", e);
                                // Fallback: multiplier stays 1 if ref check fails
                            }
                        }

                        // Get Actual Customer Rate
                        if (pincode) {
                            const srData = await checkServiceability(Number(pincode), weight);
                            const couriers = srData.data?.available_courier_companies || [];

                            if (couriers.length > 0) {
                                const cheapest = couriers.reduce((prev: any, curr: any) => (Number(prev.rate) < Number(curr.rate)) ? prev : curr);
                                const baseRate = Number(cheapest.rate);
                                cost = Math.ceil(baseRate * multiplier);
                            } else {
                                // Fallback if destination not serviceable
                                cost = settings.pincodeRateDefault || 150;
                            }
                        } else {
                            cost = settings.pincodeRateDefault || 150;
                        }

                    } catch (err) {
                        console.error("SR Main Calc Error:", err);
                        cost = settings.pincodeRateDefault || 150;
                    }
                }
                // DB SPECIFIC RATE
                else if (settings.pincodeType === 'specific' && pincode) {
                    let pinRate = settings.pincodeRateDefault || 150;
                    const specificPincodeRate = await PincodeRate.findOne({ pincode: pincode });
                    if (specificPincodeRate) {
                        pinRate = specificPincodeRate.rate;
                    }
                    cost = pinRate;
                }
                // STANDARD FALLBACK
                else {
                    cost = settings.pincodeRateDefault || 150;
                }
            } else {
                // Weight Based (Existing Logic)
                const matchingRate = await ShippingRate.findOne({
                    minWeight: { $lte: weight },
                    maxWeight: { $gte: weight }
                }).sort({ rate: 1 });

                if (matchingRate) {
                    cost = matchingRate.rate;
                } else {
                    // Fallback logic for heavy items
                    const maxRate = await ShippingRate.findOne({}).sort({ maxWeight: -1 });
                    if (maxRate && weight > maxRate.maxWeight) {
                        cost = maxRate.rate + Math.ceil(weight - maxRate.maxWeight) * 50;
                    } else {
                        cost = 150; // Final safe default
                    }
                }
            }
        }

        return NextResponse.json({ cost, weight, appliedMode: settings.shippingMode, freeShipping: cost === 0 });
    } catch (error) {
        console.error("Shipping calc error:", error);
        return NextResponse.json({ error: "Failed to calculate shipping" }, { status: 500 });
    }
}
