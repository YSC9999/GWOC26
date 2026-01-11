import mongoose, { Document, Model, Schema } from "mongoose";

export interface ICoupon extends Document {
    code: string;
    discountPercentage: number;
    validFrom: Date;
    validTo: Date;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const CouponSchema = new Schema<ICoupon>(
    {
        code: { type: String, required: true, unique: true, uppercase: true, trim: true },
        discountPercentage: { type: Number, required: true, min: 1, max: 100 },
        validFrom: { type: Date, required: true },
        validTo: { type: Date, required: true },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

const Coupon: Model<ICoupon> = mongoose.models.Coupon || mongoose.model<ICoupon>("Coupon", CouponSchema);
export default Coupon;
