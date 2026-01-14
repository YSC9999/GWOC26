import mongoose, { Document, Model, Schema } from "mongoose";

export interface IOtp extends Document {
    email: string;
    otp: string;
    expiresAt: Date;
    verified: boolean;
    createdAt: Date;
}

const OtpSchema = new Schema<IOtp>(
    {
        email: { type: String, required: true, unique: true },
        otp: { type: String, required: true },
        expiresAt: { type: Date, required: true },
        verified: { type: Boolean, default: false },
    },
    { timestamps: true }
);

// TTL index to automatically delete expired OTPs
OtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Otp: Model<IOtp> = mongoose.models.Otp || mongoose.model<IOtp>("Otp", OtpSchema);
export default Otp;
