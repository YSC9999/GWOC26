import mongoose from 'mongoose';

// Single document collection for studio information
const StudioInfoSchema = new mongoose.Schema({
    name: { type: String, default: 'Basho Studio' },
    tagline: String,

    // Location
    address: String,
    city: String,
    state: String,
    pincode: String,
    mapUrl: String, // Google Maps embed URL
    mapLink: String, // Google Maps link

    // Contact
    phone: String,
    email: String,
    whatsapp: String,

    // Visiting hours
    visitingHours: {
        monday: String,
        tuesday: String,
        wednesday: String,
        thursday: String,
        friday: String,
        saturday: String,
        sunday: String
    },

    // Policies
    visitPolicy: String,
    collectionPolicy: String,

    // Social
    instagram: String,
    facebook: String,
    youtube: String,

    // About
    aboutText: String,
    founderName: String,
    founderBio: String,
    founderImage: String,

}, { timestamps: true });

export default mongoose.models.StudioInfo || mongoose.model('StudioInfo', StudioInfoSchema);
