import mongoose, { Document, Model, Schema } from "mongoose";

export interface IShippingRate extends Document {
    minWeight: number; // in kg
    maxWeight: number; // in kg
    rate: number;      // in INR
}

const ShippingRateSchema = new Schema<IShippingRate>({
    minWeight: { type: Number, required: true },
    maxWeight: { type: Number, required: true },
    rate: { type: Number, required: true },
});

// Compound index to ensure ranges don't overlap (basic unique constraint on minWeight for simplicity for now)
ShippingRateSchema.index({ minWeight: 1 }, { unique: true });

// Prevent Mongoose recompilation error in development
if (process.env.NODE_ENV !== 'production') {
    delete mongoose.models.ShippingRate;
}

const ShippingRate: Model<IShippingRate> = mongoose.models.ShippingRate || mongoose.model<IShippingRate>("ShippingRate", ShippingRateSchema);

export default ShippingRate;
