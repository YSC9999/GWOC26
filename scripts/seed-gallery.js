import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import mongoose from 'mongoose';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env file in the root directory
// scripts/.. -> root
config({ path: join(__dirname, '..', '.env') });

const MONGODB_URL = process.env.MONGODB_URL;

if (!MONGODB_URL) {
    console.error("❌ MONGODB_URL is not defined. Please check your .env file.");
    process.exit(1);
}

// Album Schema
const AlbumSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true },
    coverImage: String,
    description: String,
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });

const Album = mongoose.models.Album || mongoose.model('Album', AlbumSchema);

// Gallery Schema
const GallerySchema = new mongoose.Schema({
    title: { type: String, required: true },
    type: {
        type: String,
        enum: ['image', 'video'],
        default: 'image'
    },
    image: { type: String, required: true },
    videoUrl: { type: String },
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
    order: { type: Number, default: 0 },
}, { timestamps: true });

const Gallery = mongoose.models.Gallery || mongoose.model('Gallery', GallerySchema);

// Sample Cloudinary images
const sampleImages = {
    ceramicRoom: [
        "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=800",
        "https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=800",
        "https://images.unsplash.com/photo-1610701596061-2ecf227e85b2?w=800",
        "https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=600",
    ],
    ceramicBowl: [
        "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=600",
        "https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=700",
        "https://images.unsplash.com/photo-1610701596061-2ecf227e85b2?w=500",
    ],
    ceramicStories: [
        "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800",
        "https://images.unsplash.com/photo-1493106641515-6b5631de4bb9?w=600",
        "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=700",
        "https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=800",
    ],
    ceramicWorks: [
        "https://images.unsplash.com/photo-1610701596061-2ecf227e85b2?w=800",
        "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=700",
        "https://images.unsplash.com/photo-1493106641515-6b5631de4bb9?w=800",
    ],
};

async function seedGallery() {
    try {
        await mongoose.connect(MONGODB_URL);
        console.log("✅ Connected to database");

        // Clear existing data
        await Album.deleteMany({});
        await Gallery.deleteMany({});
        console.log("🗑️  Cleared existing albums and gallery items");

        // Create Albums
        const albums = await Album.insertMany([
            {
                name: "Ceramic Room",
                slug: "ceramic-room",
                coverImage: sampleImages.ceramicRoom[0],
                description: "Beautiful ceramic pieces displayed in our studio room",
                order: 1,
                isActive: true,
            },
            {
                name: "Ceramic Bowl",
                slug: "ceramic-bowl",
                coverImage: sampleImages.ceramicBowl[0],
                description: "Handcrafted bowls with unique glazes",
                order: 2,
                isActive: true,
            },
            {
                name: "Ceramic Stories",
                slug: "ceramic-stories",
                coverImage: sampleImages.ceramicStories[0],
                description: "Every piece tells a story",
                order: 3,
                isActive: true,
            },
            {
                name: "Ceramic Works",
                slug: "ceramic-works",
                coverImage: sampleImages.ceramicWorks[0],
                description: "Our latest pottery creations",
                order: 4,
                isActive: true,
            },
        ]);

        console.log(`✅ Created ${albums.length} albums`);

        // Create Gallery Items for each album
        const galleryItems = [];

        // Add 2 Sample Videos to Ceramic Room
        const sampleVideos = [
            {
                title: "Pottery Making Process",
                type: "video",
                image: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800", // Thumbnail
                videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", // Rick Roll for testing (safe placeholder) or use a real pottery video
                album: albums[0]._id,
                category: "process",
                description: "Watch the intricate process of creating our signature bowls",
                featured: true,
                order: -1
            },
            {
                title: "Studio Tour 2024",
                type: "video",
                image: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=800", // Thumbnail
                videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
                album: albums[0]._id,
                category: "studio",
                description: "A walk through our creative space",
                featured: true,
                order: -2
            },
            {
                title: "Glazing Techniques",
                type: "video",
                image: "https://images.unsplash.com/photo-1610701596061-2ecf227e85b2?w=800", // Thumbnail
                videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
                album: albums[0]._id,
                category: "process",
                description: "Mastering the art of glazing",
                featured: true,
                order: -3
            }
        ];
        galleryItems.push(...sampleVideos);

        // Ceramic Room images
        sampleImages.ceramicRoom.forEach((image, index) => {
            galleryItems.push({
                title: `Ceramic Room Display ${index + 1}`,
                type: "image",
                image: image,
                album: albums[0]._id,
                category: "studio",
                description: `Beautiful ceramic display in our studio space`,
                featured: index === 0,
                order: index,
            });
        });

        // Ceramic Bowl images
        sampleImages.ceramicBowl.forEach((image, index) => {
            galleryItems.push({
                title: `Handcrafted Bowl ${index + 1}`,
                type: "image",
                image: image,
                album: albums[1]._id,
                category: "products",
                description: `Unique handcrafted ceramic bowl with artisan glaze`,
                featured: index === 0,
                order: index,
            });
        });

        // Ceramic Stories images
        sampleImages.ceramicStories.forEach((image, index) => {
            galleryItems.push({
                title: `Ceramic Story ${index + 1}`,
                type: "image",
                image: image,
                album: albums[2]._id,
                category: "process",
                description: `Behind the scenes of our pottery making process`,
                featured: index === 0,
                order: index,
            });
        });

        // Ceramic Works images
        sampleImages.ceramicWorks.forEach((image, index) => {
            galleryItems.push({
                title: `Ceramic Work ${index + 1}`,
                type: "image",
                image: image,
                album: albums[3]._id,
                category: "products",
                description: `Latest pottery creation from our studio`,
                featured: index === 0,
                order: index,
            });
        });

        await Gallery.insertMany(galleryItems);
        console.log(`✅ Created ${galleryItems.length} gallery items`);

        console.log("\n🎉 Gallery seeded successfully!\n");
        console.log("Albums created:");
        albums.forEach((album) => {
            console.log(`  📁 ${album.name} (${album.slug})`);
        });
        console.log("\n✨ You can now view the gallery at /gallery");

        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error("❌ Error seeding gallery:", error);
        await mongoose.disconnect();
        process.exit(1);
    }
}

seedGallery();
