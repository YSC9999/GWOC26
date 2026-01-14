import mongoose from 'mongoose';

const WorkshopInquirySchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    groupSize: { type: Number, required: true },
    preferredDate: { type: Date },
    occasion: { type: String },
    message: { type: String },
    status: {
        type: String,
        enum: ['new', 'contacted', 'booked', 'closed'],
        default: 'new'
    }
}, { timestamps: true });

export default mongoose.models.WorkshopInquiry || mongoose.model('WorkshopInquiry', WorkshopInquirySchema);
