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
export default User;
