import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema({
  email: String,
  products: [
    {
      id: Number,
      name: String,
      price: Number,
      qty: Number
    }
  ],
  total: Number,
  razorpay_order_id: String,
  payment_id: String,
  status: { type: String, default: "pending" },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Order || mongoose.model("Order", OrderSchema);
