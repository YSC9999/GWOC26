import mongoose from 'mongoose';

const CorporateInquirySchema = new mongoose.Schema({
    // Company details
    companyName: { type: String, required: true },
    contactPerson: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },

    // Inquiry
    inquiryType: {
        type: String,
        enum: ['gifting', 'workshop', 'collaboration', 'event', 'other'],
        required: true
    },
    quantity: Number, // For gifting
    budget: String,
    description: { type: String, required: true },
    preferredDate: Date, // For workshops/events

    // Admin
    status: {
        type: String,
        enum: ['new', 'contacted', 'quoted', 'converted', 'closed'],
        default: 'new'
    },
    adminNotes: String,

}, { timestamps: true });

export default mongoose.models.CorporateInquiry || mongoose.model('CorporateInquiry', CorporateInquirySchema);
