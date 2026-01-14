import mongoose from 'mongoose';

const PreviousWorkshopSchema = new mongoose.Schema({
    images: { type: [String], required: true },
    description: { type: String, required: true },
}, { timestamps: true });

export default mongoose.models.PreviousWorkshop || mongoose.model('PreviousWorkshop', PreviousWorkshopSchema);
