import mongoose from 'mongoose';

const EventSchema = new mongoose.Schema({
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    image: String,
    images: [String], // Gallery

    type: {
        type: String,
        enum: ['popup', 'exhibition', 'market', 'collaboration'],
        required: true
    },

    // Location & Time
    venue: { type: String, required: true },
    address: String,
    city: { type: String, required: true },

    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    timings: String, // "10:00 AM - 8:00 PM"

    // Entry
    entryFee: { type: Number, default: 0 }, // 0 for free
    registrationRequired: { type: Boolean, default: false },
    registrationLink: String,

    status: {
        type: String,
        enum: ['upcoming', 'ongoing', 'past'],
        default: 'upcoming'
    },

}, { timestamps: true });

// Create slug from title before saving
EventSchema.pre('save', function (next) {
    if (this.isModified('title') && !this.slug) {
        this.slug = this.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
    }
    next();
});

export default mongoose.models.Event || mongoose.model('Event', EventSchema);
