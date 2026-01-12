import mongoose, { Document, Model, Schema } from "mongoose";

export interface ICoupon extends Document {
    code: string;
    discountPercentage: number;
    maxDiscountAmount?: number;
    usedBy: mongoose.Types.ObjectId[];
    validFrom: Date;
    validTo: Date;
    isActive: boolean;
    isDeleted: boolean;
    usageLimit: number;
    createdAt: Date;
    updatedAt: Date;
}

const CouponSchema = new Schema<ICoupon>(
    {
        code: { type: String, required: true, uppercase: true, trim: true },
        discountPercentage: { type: Number, required: true, min: 1, max: 100 },
        maxDiscountAmount: { type: Number },
        usedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        validFrom: { type: Date, required: true },
        validTo: { type: Date, required: true },
        isActive: { type: Boolean, default: true },
        isDeleted: { type: Boolean, default: false },
        usageLimit: { type: Number, default: 1 },
    },
    { timestamps: true }
);

// TTL Index: Auto-delete documents 0 seconds after 'validTo'
CouponSchema.index({ validTo: 1 }, { expireAfterSeconds: 0 });

const Coupon: Model<ICoupon> = mongoose.models.Coupon || mongoose.model<ICoupon>("Coupon", CouponSchema);
export default Coupon;
