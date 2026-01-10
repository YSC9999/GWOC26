import mongoose from 'mongoose';

const ExperienceBookingSchema = new mongoose.Schema({
    experienceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Experience',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },

    // Booking details
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    date: { type: Date, required: true },
    timeSlot: { type: String, required: true },
    numberOfGuests: { type: Number, required: true, min: 1 },
    specialRequests: String,

    // For birthday celebrations
    celebrantName: String,
    occasion: String,

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
        enum: ['pending', 'confirmed', 'completed', 'cancelled'],
        default: 'pending'
    },

}, { timestamps: true });

export default mongoose.models.ExperienceBooking || mongoose.model('ExperienceBooking', ExperienceBookingSchema);
