import mongoose, { Document, Model } from "mongoose";

export interface IStudioVisit extends Document {
    name: string;
    email: string;
    phone: string;
    date: Date;
    guests: number;
    purpose: "Tour" | "Workshop Inquiry" | "Other";
    message?: string;
    status: "pending" | "confirmed" | "completed" | "cancelled";
    createdAt: Date;
}

const StudioVisitSchema = new mongoose.Schema<IStudioVisit>({
    name: {
        type: String,
        required: [true, "Please provide a name"],
    },
    email: {
        type: String,
        required: [true, "Please provide an email"],
    },
    phone: {
        type: String,
        required: [true, "Please provide a phone number"],
    },
    date: {
        type: Date,
        required: [true, "Please select a date"],
    },
    guests: {
        type: Number,
        required: [true, "Please number of guests"],
        min: 1,
    },
    purpose: {
        type: String,
        enum: ["Tour", "Workshop Inquiry", "Other"],
        default: "Tour",
    },
    message: {
        type: String,
    },
    status: {
        type: String,
        enum: ["pending", "confirmed", "completed", "cancelled"],
        default: "pending",
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const StudioVisit: Model<IStudioVisit> = mongoose.models.StudioVisit || mongoose.model<IStudioVisit>("StudioVisit", StudioVisitSchema);

export default StudioVisit;
