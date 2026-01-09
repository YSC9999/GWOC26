import mongoose, { Schema, models } from "mongoose";

const ProductSchema = new Schema(
  {
    name: { type: String, required: true },
    description: String,
    price: { type: Number, required: true },
    stock: { type: Number, required: true, default: 0 },
    images: [{ type: String }], // future-ready
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Product =
  models.Product || mongoose.model("Product", ProductSchema);

export default Product;
