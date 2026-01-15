import mongoose, { Document, Model, Schema } from "mongoose";

export interface IUsedCouponTracker extends Document {
    email: string;
    couponCode: string;
    usedAt: Date;
}

const UsedCouponTrackerSchema = new Schema<IUsedCouponTracker>({
    email: { type: String, required: true, index: true },
    couponCode: { type: String, required: true },
    usedAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Index for quick lookups
UsedCouponTrackerSchema.index({ email: 1, couponCode: 1 }, { unique: true });

const UsedCouponTracker: Model<IUsedCouponTracker> = mongoose.models.UsedCouponTracker || mongoose.model<IUsedCouponTracker>("UsedCouponTracker", UsedCouponTrackerSchema);

export default UsedCouponTracker;
