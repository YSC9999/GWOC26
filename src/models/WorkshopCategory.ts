import mongoose from "mongoose";

const WorkshopCategorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        slug: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
        },
    },
    { timestamps: true }
);

export default mongoose.models.WorkshopCategory ||
    mongoose.model("WorkshopCategory", WorkshopCategorySchema);
