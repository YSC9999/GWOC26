import mongoose from 'mongoose';

const PreviousCustomOrderSchema = new mongoose.Schema({
    images: {
        type: [String],
        required: true
    },
    description: {
        type: String,
        required: true
    }
}, { timestamps: true });

export default mongoose.models.PreviousCustomOrder || mongoose.model('PreviousCustomOrder', PreviousCustomOrderSchema);
