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
    productType: {
        type: String,
        required: true,
        enum: ['bowl', 'cup', 'plate', 'platter', 'vase', 'decor', 'set', 'other']
    },
    quantity: { type: Number, required: true, min: 1 },
    description: { type: String, required: true },
    referenceImages: [String],
    budget: {
        type: String,
        enum: ['under-1000', '1000-3000', '3000-5000', '5000-10000', 'above-10000'],
        required: true
    },

    // Admin response
    quotation: Number,
    adminNotes: String,
    estimatedDelivery: String,

    status: {
        type: String,
        enum: ['pending', 'quoted', 'accepted', 'in_progress', 'completed', 'cancelled'],
        default: 'pending'
    },

}, { timestamps: true });

export default mongoose.models.CustomOrder || mongoose.model('CustomOrder', CustomOrderSchema);
