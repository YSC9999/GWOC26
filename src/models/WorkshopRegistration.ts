import mongoose from 'mongoose';

const WorkshopRegistrationSchema = new mongoose.Schema({
    workshopId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Workshop',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },

    // Participant info
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    numberOfParticipants: { type: Number, required: true, min: 1 },

    // Special requests
    specialRequests: String,
    gstNumber: String, // Added GST Number for invoice

    // Payment
    totalAmount: { type: Number, required: true },
    razorpayOrderId: String,
    razorpayPaymentId: String,
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed', 'refunded'],
        default: 'pending'
    },

    // Status
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'attended', 'cancelled', 'no_show'],
        default: 'pending'
    },

}, { timestamps: true });

export default mongoose.models.WorkshopRegistration || mongoose.model('WorkshopRegistration', WorkshopRegistrationSchema);
