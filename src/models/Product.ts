import mongoose, { Schema, models } from "mongoose";

export interface ProductDocument extends mongoose.Document {
  name: string;
  description?: string;
  price: number;
  images: string[];
  stock: number;
  isActive: boolean;
}

const ProductSchema = new Schema<ProductDocument>(
  {
    name: { type: String, required: true },
    description: String,
    price: { type: Number, required: true },
    images: [{ type: String }],
    stock: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Product =
  models.Product || mongoose.model<ProductDocument>("Product", ProductSchema);

export default Product;
