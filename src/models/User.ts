<<<<<<< HEAD
import mongoose, { Document, Model, Schema } from "mongoose";

export interface IAddress {
  label: string;
  name: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  isDefault: boolean;
}

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  phone?: string;
  role: "customer" | "admin";
  gstNumber?: string;
  addresses: IAddress[];
  wishlist: mongoose.Types.ObjectId[];
  tier: "tier-0" | "tier-1" | "tier-2" | "tier-3";
  subscriptionActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AddressSchema = new Schema({
  label: { type: String, default: 'Home' },
  name: String,
  phone: String,
  street: String,
  city: String,
  state: String,
  pincode: String,
  country: { type: String, default: 'India' },
  isDefault: { type: Boolean, default: false }
}, { _id: true });

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: String,
  phone: String,
  role: {
    type: String,
    enum: ['customer', 'admin'],
    default: 'customer'
  },
  gstNumber: String,
  addresses: [AddressSchema],
  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  tier: {
    type: String,
    enum: ["tier-0", "tier-1", "tier-2", "tier-3"],
    default: "tier-0"
  },
  subscriptionActive: { type: Boolean, default: false },
}, { timestamps: true });

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
=======
import mongoose, { Schema, model, models, InferSchemaType } from "mongoose";

const UserSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },

    tier: {
      type: String,
      enum: ["tier-0", "tier-1", "tier-2", "tier-3"],
      default: "tier-0",
    },

    subscriptionActive: { type: Boolean, default: false },
    tierUpgradeDate: { type: Date },
  },
  { timestamps: true }
);

export type UserDocument = InferSchemaType<typeof UserSchema>;

const User = models.User || model<UserDocument>("User", UserSchema);
>>>>>>> 5999d3ccafb5d5647a776ff6ca884f06f0f1659b
export default User;
