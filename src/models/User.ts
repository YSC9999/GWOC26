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
  firstName?: string;
  lastName?: string;
  email: string;
  password?: string;
  phone?: string;
  googleId?: string;
  picture?: string;
  role: "customer" | "admin" | "employee";
  gstNumber?: string;
  addresses: IAddress[];
  wishlist: mongoose.Types.ObjectId[];
  usedCoupons: string[];
  tier: "tier-0" | "tier-1" | "tier-2" | "tier-3";
  subscriptionActive: boolean;
  emailVerified: boolean;
  emailVerificationOTP?: string;
  otpExpiry?: Date;
  phoneVerificationOTP?: string;
  phoneOtpExpiry?: Date;
  resetPasswordOTP?: string;
  resetPasswordExpiry?: Date;
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
  firstName: String,
  lastName: String,
  email: { type: String, unique: true, required: true },
  password: String,
  phone: String,
  googleId: String,
  picture: String,
  role: {
    type: String,
    enum: ['customer', 'admin', 'employee'],
    default: 'customer'
  },
  gstNumber: String,
  addresses: [AddressSchema],
  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  usedCoupons: [{ type: String }], // Array of coupon codes used by this user
  tier: {
    type: String,
    enum: ["tier-0", "tier-1", "tier-2", "tier-3"],
    default: "tier-0"
  },

  subscriptionActive: { type: Boolean, default: false },
  emailVerified: { type: Boolean, default: false },
  emailVerificationOTP: String,
  otpExpiry: Date,
  phoneVerificationOTP: String,
  phoneOtpExpiry: Date,
  resetPasswordOTP: String,
  resetPasswordExpiry: Date,
}, { timestamps: true });

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
export default User;
