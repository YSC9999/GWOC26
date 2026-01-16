import mongoose from 'mongoose';

const AlbumSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true },
    coverImage: String,
    description: String,
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.models.Album || mongoose.model('Album', AlbumSchema);
