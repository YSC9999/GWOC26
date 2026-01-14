import mongoose from "mongoose";

const StoreSettingsSchema = new mongoose.Schema({
    shippingMode: {
        type: String,
        enum: ["weight", "pincode"],
        default: "weight",
    },
    freeShippingThreshold: {
        type: Number,
        default: 0, // 0 = Disabled
    },
    pincodeType: {
        type: String,
        enum: ["standard", "specific", "shiprocket_realtime", "shiprocket_reference"],
        default: "standard",
    },
    shiprocketReferencePincode: {
        type: String,
        default: "110001" // Default to New Delhi or a major hub
    },
    shiprocketReferencePrice: {
        type: Number,
        default: 50
    },
    pincodeRateDefault: {
        type: Number,
        default: 150,
    }
}, { timestamps: true });

// Ensure we only have one settings document usually, but logic will handle fetching the first/latest.
export default mongoose.models.StoreSettings || mongoose.model("StoreSettings", StoreSettingsSchema);
