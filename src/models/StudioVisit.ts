import mongoose from "mongoose";

const StudioVisitSchema = new mongoose.Schema({
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

export default mongoose.models.StudioVisit ||
    mongoose.model("StudioVisit", StudioVisitSchema);
