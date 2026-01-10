import mongoose from 'mongoose';

const ExperienceSchema = new mongoose.Schema({
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    image: String,

    type: {
        type: String,
        enum: ['couples', 'birthday', 'party', 'private', 'corporate'],
        required: true
    },

    // Details
    duration: { type: String, required: true }, // "3 hours"
    maxGuests: { type: Number, required: true },

    // Pricing
    price: { type: Number, required: true }, // Base price
    pricePerAdditionalGuest: { type: Number, default: 0 },

    // What's included
    includes: [String],

    // Availability
    availableDays: [String], // ["Saturday", "Sunday"]
    timeSlots: [String], // ["10:00 AM", "2:00 PM", "6:00 PM"]

    isActive: { type: Boolean, default: true },

}, { timestamps: true });

// Create slug from title before saving
ExperienceSchema.pre('save', function (next) {
    if (this.isModified('title') && !this.slug) {
        this.slug = this.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
    }
    next();
});

export default mongoose.models.Experience || mongoose.model('Experience', ExperienceSchema);
