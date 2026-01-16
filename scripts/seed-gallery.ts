import { connectDB } from "@/lib/mongodb";
import Album from "@/models/Album";
import Gallery from "@/models/Gallery";

// Sample Cloudinary images (using placeholder images for now - replace with your actual Cloudinary URLs)
const sampleImages = {
    ceramicRoom: [
        "https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg",
        "https://res.cloudinary.com/demo/image/upload/v1312461204/sample_2.jpg",
        "https://res.cloudinary.com/demo/image/upload/v1312461204/sample_3.jpg",
    ],
    ceramicBowl: [
        "https://res.cloudinary.com/demo/image/upload/v1312461204/sample_4.jpg",
        "https://res.cloudinary.com/demo/image/upload/v1312461204/sample_5.jpg",
    ],
    ceramicStories: [
        "https://res.cloudinary.com/demo/image/upload/v1312461204/sample_6.jpg",
        "https://res.cloudinary.com/demo/image/upload/v1312461204/sample_7.jpg",
        "https://res.cloudinary.com/demo/image/upload/v1312461204/sample_8.jpg",
    ],
    ceramicWorks: [
        "https://res.cloudinary.com/demo/image/upload/v1312461204/sample_9.jpg",
        "https://res.cloudinary.com/demo/image/upload/v1312461204/sample_10.jpg",
    ],
};

async function seedGallery() {
    try {
        await connectDB();
        console.log("Connected to database");

        // Clear existing data
        await Album.deleteMany({});
        await Gallery.deleteMany({});
        console.log("Cleared existing albums and gallery items");

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

        console.log(`Created ${albums.length} albums`);

        // Create Gallery Items for each album
        const galleryItems = [];

        // Ceramic Room images
        sampleImages.ceramicRoom.forEach((image, index) => {
            galleryItems.push({
                title: `Ceramic Room ${index + 1}`,
                image: image,
                album: albums[0]._id,
                category: "studio",
                description: `Beautiful ceramic display in our studio space - piece ${index + 1}`,
                featured: index === 0,
                order: index,
            });
        });

        // Ceramic Bowl images
        sampleImages.ceramicBowl.forEach((image, index) => {
            galleryItems.push({
                title: `Handcrafted Bowl ${index + 1}`,
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
                image: image,
                album: albums[3]._id,
                category: "products",
                description: `Latest pottery creation from our studio`,
                featured: index === 0,
                order: index,
            });
        });

        await Gallery.insertMany(galleryItems);
        console.log(`Created ${galleryItems.length} gallery items`);

        console.log("\n✅ Gallery seeded successfully!");
        console.log(`\nAlbums created:`);
        albums.forEach((album) => {
            console.log(`  - ${album.name} (${album.slug})`);
        });

        process.exit(0);
    } catch (error) {
        console.error("Error seeding gallery:", error);
        process.exit(1);
    }
}

seedGallery();
