import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: String,
  tier: { 
    type: String, 
    enum: ["tier-0", "tier-1", "tier-2", "tier-3"],
    default: "tier-0"
  },
  tierUpgradeDate: { type: Date },
  subscriptionActive: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.models.User || mongoose.model("User", UserSchema);
