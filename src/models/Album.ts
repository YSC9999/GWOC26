import mongoose, { Document, Model } from 'mongoose';

export interface IAlbum extends Document {
    name: string;
    slug: string;
    coverImage?: string;
    description?: string;
    order: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const AlbumSchema = new mongoose.Schema<IAlbum>({
    name: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true },
    coverImage: String,
    description: String,
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });

const Album: Model<IAlbum> = mongoose.models.Album || mongoose.model<IAlbum>('Album', AlbumSchema);

export default Album;
