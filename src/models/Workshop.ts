import mongoose from 'mongoose';

const WorkshopSchema = new mongoose.Schema({
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },

    type: {
        type: String,
        enum: ['group', 'one-on-one', 'couples', 'corporate'],
        required: true
    },

    image: String,

    // Scheduling
    date: { type: Date, required: true },
    time: { type: String, required: true }, // "10:00 AM - 1:00 PM"
    duration: { type: String, required: true }, // "3 hours"

    // Capacity
    maxParticipants: { type: Number, required: true },
    enrolledCount: { type: Number, default: 0 },

    // Pricing
    price: { type: Number, required: true },

    // What's included
    includes: [String],

    // Location
    location: {
        type: String,
        enum: ['studio', 'offsite'],
        default: 'studio'
    },
    address: String,

    // Level
    level: {
        type: String,
        enum: ['beginner', 'intermediate', 'all-levels'],
        default: 'all-levels'
    },

    status: {
        type: String,
        enum: ['upcoming', 'full', 'completed', 'cancelled'],
        default: 'upcoming'
    },

}, { timestamps: true });

// Create slug from title before saving
WorkshopSchema.pre('save', function (this: any) {
    if (this.isModified('title') && !this.slug) {
        this.slug = this.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
    }
    // synchronous hook — no next() required
});

export default mongoose.models.Workshop || mongoose.model('Workshop', WorkshopSchema);
