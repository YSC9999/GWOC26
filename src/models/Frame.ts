import mongoose from "mongoose";

const FrameSchema = new mongoose.Schema(
    {
        frameId: {
            type: Number, // 0 to 8
            required: true,
            unique: true,
            min: 0,
            max: 8,
        },
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true,
        },
    },
    { timestamps: true }
);

export default mongoose.models.Frame || mongoose.model("Frame", FrameSchema);
