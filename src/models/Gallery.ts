import mongoose from 'mongoose';

const GallerySchema = new mongoose.Schema({
    title: { type: String, required: true },
    image: { type: String, required: true },
    album: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Album',
        required: true
    },
    category: {
        type: String,
        enum: ['products', 'workshops', 'studio', 'events', 'process'],
        required: true
    },
    description: String,
    featured: { type: Boolean, default: false },
    order: { type: Number, default: 0 }, // For custom ordering within album

}, { timestamps: true });

export default mongoose.models.Gallery || mongoose.model('Gallery', GallerySchema);
