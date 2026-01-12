import mongoose, { Document, Model, Schema } from "mongoose";

export interface IReview extends Document {
    product: mongoose.Types.ObjectId;
    user: mongoose.Types.ObjectId;
    userName: string;
    rating: number;
    comment: string;
    images: string[];
    createdAt: Date;
}

const ReviewSchema = new Schema<IReview>(
    {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        userName: { type: String, required: true },
        rating: { type: Number, required: true, min: 1, max: 5 },
        comment: { type: String, required: true },
        images: [{ type: String }],
    },
    { timestamps: true }
);

// Prevent duplicate reviews from same user for same product
ReviewSchema.index({ product: 1, user: 1 }, { unique: true });

const Review: Model<IReview> = mongoose.models.Review || mongoose.model<IReview>("Review", ReviewSchema);

export default Review;
