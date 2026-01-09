import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    email: { type: String, required: true },
    products: [
      {
        id: Number,
        name: String,
        price: Number,
        qty: Number,
      },
    ],
    total: { type: Number, required: true },
    razorpay_order_id: String,
    payment_id: String,
    status: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
  },
  { timestamps: true }
);

OrderSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.models.Order ||
  mongoose.model("Order", OrderSchema);
