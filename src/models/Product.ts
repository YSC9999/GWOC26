import mongoose, { Document, Model, Schema } from "mongoose";

export interface IProduct extends Document {
  name: string;
  slug: string;
  description: string;
  longDescription?: string;
  price: number;
  originalPrice?: number;
  category: "bowls" | "cups" | "plates" | "platters" | "vases" | "decor" | "sets";
  subcategory?: string;
  images: string[];
  material: "stoneware" | "porcelain" | "terracotta" | "ceramic";
  isFoodSafe: boolean;
  isMicrowaveSafe: boolean;
  isDishwasherSafe: boolean;
  careInstructions?: string;
  inStock: boolean;
  stockQuantity: number;
  weightGrams: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  featured: boolean;
  tags: string[];
  rating: number;
  reviewCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
    },

    description: {
      type: String,
      required: true,
    },

    longDescription: String,

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    originalPrice: Number,

    category: {
      type: String,
      enum: ["bowls", "cups", "plates", "platters", "vases", "decor", "sets"],
      required: true,
    },

    subcategory: String,

    images: {
      type: [String],
      default: [],
    },

    material: {
      type: String,
      enum: ["stoneware", "porcelain", "terracotta", "ceramic"],
      default: "stoneware",
    },

    isFoodSafe: { type: Boolean, default: true },
    isMicrowaveSafe: { type: Boolean, default: false },
    isDishwasherSafe: { type: Boolean, default: false },
    careInstructions: String,

    inStock: { type: Boolean, default: true },
    stockQuantity: { type: Number, default: 0 },

    weightGrams: { type: Number, default: 500 },

    dimensions: {
      length: Number,
      width: Number,
      height: Number,
    },

    featured: { type: Boolean, default: false },
    tags: { type: [String], default: [] },
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Text search index
ProductSchema.index({
  name: "text",
  description: "text",
  tags: "text",
});

const Product: Model<IProduct> =
  mongoose.models.Product ||
  mongoose.model<IProduct>("Product", ProductSchema);

export default Product;
