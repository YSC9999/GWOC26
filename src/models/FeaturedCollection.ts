import mongoose, { Document, Model, Schema } from "mongoose";

export interface IFeaturedCollection extends Document {
    title: string;
    slug: string;
    description?: string;
    products: mongoose.Types.ObjectId[];
    isActive: boolean;
    displayOrder: number;
    createdAt: Date;
    updatedAt: Date;
}

const FeaturedCollectionSchema = new Schema<IFeaturedCollection>(
    {
        title: { type: String, required: true },
        slug: { type: String, required: true, unique: true },
        description: { type: String },
        products: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
        isActive: { type: Boolean, default: true },
        displayOrder: { type: Number, default: 0 },
    },
    { timestamps: true }
);

// Prevent overwrite error
const FeaturedCollection: Model<IFeaturedCollection> =
    mongoose.models.FeaturedCollection ||
    mongoose.model<IFeaturedCollection>("FeaturedCollection", FeaturedCollectionSchema);

export default FeaturedCollection;
