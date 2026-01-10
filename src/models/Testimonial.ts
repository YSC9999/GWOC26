import mongoose from 'mongoose';

const TestimonialSchema = new mongoose.Schema({
    name: { type: String, required: true },
    location: String, // "Mumbai"
    content: { type: String, required: true },
    rating: { type: Number, min: 1, max: 5, default: 5 },

    type: {
        type: String,
        enum: ['text', 'video'],
        default: 'text'
    },
    videoUrl: String, // For video testimonials
    image: String, // Customer photo

    productRef: String, // What they bought/experienced
    experienceType: String, // "workshop", "product", "experience"

    featured: { type: Boolean, default: false },
    approved: { type: Boolean, default: false }, // Admin approval

}, { timestamps: true });

export default mongoose.models.Testimonial || mongoose.model('Testimonial', TestimonialSchema);
