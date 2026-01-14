import mongoose from "mongoose";

export interface IPincodeRate extends mongoose.Document {
    pincode: string;
    rate: number;
    description?: string;
}

const PincodeRateSchema = new mongoose.Schema<IPincodeRate>({
    pincode: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    rate: {
        type: Number,
        required: true,
    },
    description: {
        type: String, // e.g. "Delhi NCR", "Mumbai"
        trim: true,
    }
}, { timestamps: true });

const PincodeRate: mongoose.Model<IPincodeRate> = mongoose.models.PincodeRate || mongoose.model<IPincodeRate>("PincodeRate", PincodeRateSchema);

export default PincodeRate;
