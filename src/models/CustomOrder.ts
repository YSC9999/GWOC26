import mongoose from 'mongoose';

const CustomOrderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },

    // Customer info
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },

    // Custom requirements
    // Keeping top-level description for the initial request
    description: { type: String, required: true },
    referenceImages: [String],
    budget: {
        type: String,
        enum: ['under-1000', '1000-3000', '3000-5000', '5000-10000', 'above-10000'],
        required: true
    },

    // Admin response / Detailed Items
    items: [{
        name: { type: String, required: true },
        description: String,
        quantity: { type: Number, required: true, default: 1 },
        price: Number, // Per unit price
        images: [String],
        status: {
            type: String,
            enum: ['pending', 'approved', 'rejected'],
            default: 'pending'
        },
        removalReason: String // If rejected
    }],

    totalPrice: Number, // Calculated total of approved items
    currency: { type: String, default: 'INR' },

    adminNotes: String,
    estimatedDelivery: String,
    expiryDate: Date, // For the quote

    status: {
        type: String,
        enum: ['pending', 'quoted', 'accepted', 'in_progress', 'completed', 'cancelled', 'declined'],
        default: 'pending'
    },
    
    // Link to actual order when paid
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order'
    }

}, { timestamps: true });

export default mongoose.models.CustomOrder || mongoose.model('CustomOrder', CustomOrderSchema);
