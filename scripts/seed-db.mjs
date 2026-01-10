// Database cleanup and seed script for Basho e-commerce platform
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const MONGODB_URL = 'mongodb+srv://basho:basho%402025@basho.p12mz56.mongodb.net/basho?retryWrites=true&w=majority';

// Import models dynamically to avoid issues
async function seedDatabase() {
    try {
        console.log('🔄 Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URL);
        console.log('✅ Connected!\n');

        const db = mongoose.connection.db;

        // ========== CLEANUP ==========
        console.log('🧹 Cleaning up existing data...');
        const collections = await db.listCollections().toArray();
        for (const collection of collections) {
            await db.collection(collection.name).deleteMany({});
            console.log(`   Cleared: ${collection.name}`);
        }
        console.log('✅ Cleanup complete!\n');

        // ========== USERS ==========
        console.log('👤 Creating users...');
        const hashedPassword = await bcrypt.hash('admin123', 10);
        const customerPassword = await bcrypt.hash('customer123', 10);

        await db.collection('users').insertMany([
            {
                name: 'Shivangi (Admin)',
                email: 'admin@basho.com',
                password: hashedPassword,
                phone: '+91 9876543210',
                role: 'admin',
                tier: 'tier-3',
                addresses: [{
                    label: 'Studio',
                    name: 'Shivangi',
                    phone: '+91 9876543210',
                    street: 'Basho Studio, Artisan Lane',
                    city: 'Ahmedabad',
                    state: 'Gujarat',
                    pincode: '380001',
                    country: 'India',
                    isDefault: true
                }],
                wishlist: [],
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                name: 'Test Customer',
                email: 'customer@test.com',
                password: customerPassword,
                phone: '+91 9998887776',
                role: 'customer',
                tier: 'tier-0',
                addresses: [],
                wishlist: [],
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ]);
        console.log('   Created: admin@basho.com (password: admin123)');
        console.log('   Created: customer@test.com (password: customer123)');

        // ========== PRODUCTS ==========
        console.log('\n🏺 Creating products...');
        const products = [
            {
                name: 'Wabi-Sabi Rice Bowl',
                slug: 'wabi-sabi-rice-bowl',
                description: 'Handcrafted stoneware rice bowl with organic irregular edges that celebrate imperfection.',
                longDescription: 'This beautiful rice bowl embodies the Japanese aesthetic of wabi-sabi - finding beauty in imperfection. Each piece is unique, hand-thrown on the wheel with subtle variations in form and glaze. The earthy tones and organic textures make everyday meals feel special.',
                price: 1200,
                originalPrice: 1500,
                category: 'bowls',
                subcategory: 'rice-bowls',
                images: ['/products/rice-bowl-1.jpg', '/products/rice-bowl-2.jpg'],
                material: 'stoneware',
                isFoodSafe: true,
                isMicrowaveSafe: true,
                isDishwasherSafe: false,
                careInstructions: 'Hand wash recommended. Avoid sudden temperature changes.',
                inStock: true,
                stockQuantity: 25,
                weightGrams: 350,
                dimensions: { length: 14, width: 14, height: 7 },
                featured: true,
                tags: ['bowl', 'rice', 'stoneware', 'japanese', 'wabi-sabi'],
                rating: 4.8,
                reviewCount: 24,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                name: 'Matcha Tea Cup Set',
                slug: 'matcha-tea-cup-set',
                description: 'Set of 4 hand-thrown tea cups perfect for Japanese tea ceremonies or everyday use.',
                longDescription: 'Inspired by traditional Japanese chawan, these tea cups are designed to cradle perfectly in your hands. The wide rim allows the tea to cool to the perfect temperature while the weighted base provides stability. Each cup features subtle glaze variations.',
                price: 2400,
                originalPrice: 2800,
                category: 'cups',
                subcategory: 'tea-cups',
                images: ['/products/tea-cups-1.jpg', '/products/tea-cups-2.jpg'],
                material: 'stoneware',
                isFoodSafe: true,
                isMicrowaveSafe: true,
                isDishwasherSafe: true,
                careInstructions: 'Dishwasher safe. Microwave safe for reheating.',
                inStock: true,
                stockQuantity: 15,
                weightGrams: 800,
                dimensions: { length: 9, width: 9, height: 8 },
                featured: true,
                tags: ['cups', 'tea', 'set', 'matcha', 'ceremony'],
                rating: 4.9,
                reviewCount: 38,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                name: 'Sake Cup Set',
                slug: 'sake-cup-set',
                description: 'Traditional ochoko sake cups with tokkuri carafe. Perfect for warm or cold sake.',
                longDescription: 'This elegant sake set includes one tokkuri (flask) and two ochoko (cups). The minimalist design features a subtle ash glaze that develops beautiful character over time. Perfect for intimate gatherings or as a thoughtful gift.',
                price: 1800,
                category: 'cups',
                subcategory: 'sake-cups',
                images: ['/products/sake-set-1.jpg'],
                material: 'stoneware',
                isFoodSafe: true,
                isMicrowaveSafe: false,
                isDishwasherSafe: false,
                careInstructions: 'Hand wash only. Not suitable for microwave.',
                inStock: true,
                stockQuantity: 20,
                weightGrams: 500,
                dimensions: { length: 15, width: 10, height: 12 },
                featured: false,
                tags: ['sake', 'cups', 'japanese', 'carafe', 'gift'],
                rating: 4.7,
                reviewCount: 15,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                name: 'Large Serving Platter',
                slug: 'large-serving-platter',
                description: 'Statement piece for entertaining. Hand-built with beautiful organic edges.',
                longDescription: 'This stunning serving platter is a conversation piece for any table. Hand-built using slab construction techniques, each platter has unique organic edges and beautiful surface variations. Perfect for serving appetizers, sushi, or as a decorative centerpiece.',
                price: 3500,
                originalPrice: 4200,
                category: 'platters',
                images: ['/products/platter-1.jpg', '/products/platter-2.jpg'],
                material: 'stoneware',
                isFoodSafe: true,
                isMicrowaveSafe: false,
                isDishwasherSafe: false,
                careInstructions: 'Hand wash with mild soap. Handle with care.',
                inStock: true,
                stockQuantity: 8,
                weightGrams: 1200,
                dimensions: { length: 35, width: 25, height: 3 },
                featured: true,
                tags: ['platter', 'serving', 'entertaining', 'statement'],
                rating: 4.9,
                reviewCount: 12,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                name: 'Ramen Bowl',
                slug: 'ramen-bowl',
                description: 'Deep bowl perfect for ramen, pho, or hearty soups. Generous size with comfortable grip.',
                longDescription: 'This generously sized bowl is designed for noodle lovers. The deep form keeps your ramen hot, while the wide rim makes sipping broth comfortable. The textured exterior provides a secure grip even with slippery hands.',
                price: 1500,
                category: 'bowls',
                subcategory: 'soup-bowls',
                images: ['/products/ramen-bowl-1.jpg'],
                material: 'stoneware',
                isFoodSafe: true,
                isMicrowaveSafe: true,
                isDishwasherSafe: true,
                careInstructions: 'Fully dishwasher and microwave safe.',
                inStock: true,
                stockQuantity: 30,
                weightGrams: 600,
                dimensions: { length: 18, width: 18, height: 9 },
                featured: false,
                tags: ['bowl', 'ramen', 'soup', 'noodles', 'deep'],
                rating: 4.8,
                reviewCount: 45,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                name: 'Coffee Mug - Rustic',
                slug: 'coffee-mug-rustic',
                description: 'Your everyday coffee companion. Ergonomic handle and perfect weight.',
                longDescription: 'Start your mornings right with this beautifully crafted coffee mug. The ergonomic handle fits naturally in your hand, while the generous capacity holds just the right amount of your favorite brew. The rustic glaze develops unique patterns with each firing.',
                price: 800,
                category: 'cups',
                subcategory: 'coffee-mugs',
                images: ['/products/coffee-mug-1.jpg'],
                material: 'stoneware',
                isFoodSafe: true,
                isMicrowaveSafe: true,
                isDishwasherSafe: true,
                careInstructions: 'Fully dishwasher and microwave safe.',
                inStock: true,
                stockQuantity: 50,
                weightGrams: 400,
                dimensions: { length: 12, width: 9, height: 10 },
                featured: true,
                tags: ['mug', 'coffee', 'everyday', 'rustic'],
                rating: 4.6,
                reviewCount: 67,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                name: 'Ikebana Vase',
                slug: 'ikebana-vase',
                description: 'Minimalist vase designed for Japanese flower arrangement. Creates stunning displays.',
                longDescription: 'This elegant vase is inspired by the Japanese art of Ikebana. The narrow neck and weighted base support both single stems and elaborate arrangements. The subtle earth tones complement any flower without competing for attention.',
                price: 2200,
                category: 'vases',
                images: ['/products/vase-1.jpg', '/products/vase-2.jpg'],
                material: 'stoneware',
                isFoodSafe: false,
                isMicrowaveSafe: false,
                isDishwasherSafe: false,
                careInstructions: 'Wipe clean. Empty and dry when not in use.',
                inStock: true,
                stockQuantity: 12,
                weightGrams: 800,
                dimensions: { length: 12, width: 12, height: 25 },
                featured: true,
                tags: ['vase', 'ikebana', 'flowers', 'minimalist', 'decor'],
                rating: 4.9,
                reviewCount: 18,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                name: 'Incense Holder',
                slug: 'incense-holder',
                description: 'Simple ceramic incense holder for stick or cone incense. Meditative design.',
                longDescription: 'Create a peaceful atmosphere with this handcrafted incense holder. The minimalist design holds both stick and cone incense securely. The shallow ash-catching basin is easy to clean. Perfect for meditation spaces or adding tranquility to any room.',
                price: 600,
                category: 'decor',
                images: ['/products/incense-holder-1.jpg'],
                material: 'stoneware',
                isFoodSafe: false,
                isMicrowaveSafe: false,
                isDishwasherSafe: false,
                careInstructions: 'Wipe clean after use. Avoid water pooling.',
                inStock: true,
                stockQuantity: 40,
                weightGrams: 200,
                dimensions: { length: 10, width: 5, height: 2 },
                featured: false,
                tags: ['incense', 'holder', 'meditation', 'decor', 'zen'],
                rating: 4.7,
                reviewCount: 32,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                name: 'Dinner Plate Set',
                slug: 'dinner-plate-set',
                description: 'Set of 4 dinner plates with beautiful reactive glaze. Each piece is unique.',
                longDescription: 'Elevate your dining experience with these stunning dinner plates. The reactive glaze creates unique patterns on each plate, making every meal feel special. Wide rimmed design provides elegant presentation for any cuisine.',
                price: 4000,
                originalPrice: 4800,
                category: 'plates',
                images: ['/products/dinner-plates-1.jpg'],
                material: 'stoneware',
                isFoodSafe: true,
                isMicrowaveSafe: true,
                isDishwasherSafe: true,
                careInstructions: 'Dishwasher safe. Stack carefully to avoid chipping.',
                inStock: true,
                stockQuantity: 10,
                weightGrams: 2400,
                dimensions: { length: 27, width: 27, height: 3 },
                featured: true,
                tags: ['plates', 'dinner', 'set', 'dining', 'reactive-glaze'],
                rating: 4.8,
                reviewCount: 22,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                name: 'Chopstick Rest Set',
                slug: 'chopstick-rest-set',
                description: 'Set of 6 ceramic chopstick rests in assorted natural colors.',
                longDescription: 'These charming chopstick rests add authentic Japanese dining touches to your table. Each set includes 6 pieces in complementary earth tones. The simple pebble-like form sits perfectly on any table setting.',
                price: 450,
                category: 'decor',
                subcategory: 'table-accessories',
                images: ['/products/chopstick-rest-1.jpg'],
                material: 'ceramic',
                isFoodSafe: true,
                isMicrowaveSafe: false,
                isDishwasherSafe: true,
                careInstructions: 'Dishwasher safe.',
                inStock: true,
                stockQuantity: 35,
                weightGrams: 120,
                dimensions: { length: 5, width: 2, height: 1 },
                featured: false,
                tags: ['chopstick', 'rest', 'set', 'table', 'accessories'],
                rating: 4.5,
                reviewCount: 28,
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ];

        await db.collection('products').insertMany(products);
        console.log(`   Created: ${products.length} products`);

        // ========== WORKSHOPS ==========
        console.log('\n🎨 Creating workshops...');
        const workshops = [
            {
                title: 'Weekend Pottery Workshop',
                slug: 'weekend-pottery-workshop',
                description: 'Learn the basics of wheel throwing in this beginner-friendly weekend workshop. Create your own bowl or cup to take home.',
                type: 'group',
                image: '/workshops/weekend-workshop.jpg',
                date: new Date('2026-01-25'),
                time: '10:00 AM - 1:00 PM',
                duration: '3 hours',
                maxParticipants: 8,
                enrolledCount: 3,
                price: 2500,
                includes: ['All materials', 'Clay (1kg)', 'Use of wheel & tools', 'Firing & glazing', 'Refreshments', 'Take home your creation'],
                location: 'studio',
                level: 'beginner',
                status: 'upcoming',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                title: 'One-on-One Private Session',
                slug: 'one-on-one-private-session',
                description: 'Personalized pottery instruction tailored to your skill level and interests. Perfect for focused learning.',
                type: 'one-on-one',
                image: '/workshops/private-session.jpg',
                date: new Date('2026-01-20'),
                time: '11:00 AM - 1:00 PM',
                duration: '2 hours',
                maxParticipants: 1,
                enrolledCount: 0,
                price: 4000,
                includes: ['Personalized instruction', 'All materials', 'Clay (2kg)', 'Firing & glazing', 'Refreshments'],
                location: 'studio',
                level: 'all-levels',
                status: 'upcoming',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                title: 'Couples Pottery Date',
                slug: 'couples-pottery-date',
                description: 'A romantic creative experience for couples. Work side by side creating pottery together.',
                type: 'couples',
                image: '/workshops/couples-date.jpg',
                date: new Date('2026-02-14'),
                time: '6:00 PM - 8:30 PM',
                duration: '2.5 hours',
                maxParticipants: 2,
                enrolledCount: 0,
                price: 5500,
                includes: ['Materials for 2', 'Champagne & snacks', 'Romantic ambiance', 'Firing & glazing', '2 take-home pieces'],
                location: 'studio',
                level: 'beginner',
                status: 'upcoming',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                title: 'Corporate Team Building',
                slug: 'corporate-team-building',
                description: 'Unique team building experience for corporate groups. Foster creativity and collaboration through pottery.',
                type: 'corporate',
                image: '/workshops/corporate-workshop.jpg',
                date: new Date('2026-02-01'),
                time: '2:00 PM - 5:00 PM',
                duration: '3 hours',
                maxParticipants: 20,
                enrolledCount: 0,
                price: 35000,
                includes: ['Materials for all', 'Professional facilitation', 'Tea/coffee & snacks', 'Firing & glazing', 'Team photo'],
                location: 'studio',
                address: 'Can also be arranged at your office location',
                level: 'beginner',
                status: 'upcoming',
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ];

        await db.collection('workshops').insertMany(workshops);
        console.log(`   Created: ${workshops.length} workshops`);

        // ========== EXPERIENCES ==========
        console.log('\n✨ Creating experiences...');
        const experiences = [
            {
                title: 'Couple Pottery Date',
                slug: 'couple-pottery-date',
                description: 'A romantic evening of creativity and connection. Perfect for anniversaries, date nights, or just because.',
                image: '/experiences/couple-date.jpg',
                type: 'couples',
                duration: '2.5 hours',
                maxGuests: 2,
                price: 5500,
                pricePerAdditionalGuest: 0,
                includes: ['Private studio access', 'All materials', 'Champagne & snacks', 'Music of your choice', '2 finished pieces', 'Photos of your experience'],
                availableDays: ['Friday', 'Saturday', 'Sunday'],
                timeSlots: ['6:00 PM', '7:00 PM'],
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                title: 'Birthday Celebration',
                slug: 'birthday-celebration',
                description: 'Make your birthday unforgettable with a pottery party! Perfect for small groups.',
                image: '/experiences/birthday.jpg',
                type: 'birthday',
                duration: '3 hours',
                maxGuests: 10,
                price: 8000,
                pricePerAdditionalGuest: 800,
                includes: ['Private studio', 'All materials', 'Birthday decorations', 'Cake & refreshments', 'Finished pieces for all', 'Photos'],
                availableDays: ['Saturday', 'Sunday'],
                timeSlots: ['11:00 AM', '3:00 PM'],
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                title: 'Garden Mini Party',
                slug: 'garden-mini-party',
                description: 'Enjoy pottery in our beautiful garden setting. Perfect for casual get-togethers.',
                image: '/experiences/garden-party.jpg',
                type: 'party',
                duration: '3 hours',
                maxGuests: 15,
                price: 12000,
                pricePerAdditionalGuest: 700,
                includes: ['Garden access', 'All materials', 'Refreshments', 'Finished pieces', 'Garden setup'],
                availableDays: ['Saturday', 'Sunday'],
                timeSlots: ['10:00 AM', '4:00 PM'],
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                title: 'Private Studio Session',
                slug: 'private-studio-session',
                description: 'Have the entire studio to yourself. Perfect for intimate gatherings or focused creative time.',
                image: '/experiences/private-studio.jpg',
                type: 'private',
                duration: '4 hours',
                maxGuests: 6,
                price: 15000,
                pricePerAdditionalGuest: 1000,
                includes: ['Private studio access', 'All materials', 'Personalized instruction', 'Refreshments', 'Finished pieces'],
                availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
                timeSlots: ['10:00 AM', '2:00 PM', '6:00 PM'],
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ];

        await db.collection('experiences').insertMany(experiences);
        console.log(`   Created: ${experiences.length} experiences`);

        // ========== EVENTS ==========
        console.log('\n📅 Creating events...');
        const events = [
            {
                title: 'Winter Pottery Exhibition',
                slug: 'winter-pottery-exhibition',
                description: 'Showcasing the latest collection of handcrafted pottery. Meet the artist and enjoy live demonstrations.',
                image: '/events/winter-exhibition.jpg',
                images: [],
                type: 'exhibition',
                venue: 'Basho Studio',
                address: 'Artisan Lane, Ahmedabad',
                city: 'Ahmedabad',
                startDate: new Date('2026-01-15'),
                endDate: new Date('2026-01-20'),
                timings: '11:00 AM - 7:00 PM',
                entryFee: 0,
                registrationRequired: false,
                status: 'upcoming',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                title: 'Artisan Market Pop-up',
                slug: 'artisan-market-popup',
                description: 'Find us at the monthly Artisan Market! Special pieces and exclusive discounts available.',
                image: '/events/artisan-market.jpg',
                images: [],
                type: 'popup',
                venue: 'Artisan Market',
                address: 'The Courtyard, Mall Road',
                city: 'Ahmedabad',
                startDate: new Date('2026-02-08'),
                endDate: new Date('2026-02-09'),
                timings: '10:00 AM - 8:00 PM',
                entryFee: 0,
                registrationRequired: false,
                status: 'upcoming',
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ];

        await db.collection('events').insertMany(events);
        console.log(`   Created: ${events.length} events`);

        // ========== TESTIMONIALS ==========
        console.log('\n💬 Creating testimonials...');
        const testimonials = [
            {
                name: 'Priya Sharma',
                location: 'Mumbai',
                content: 'The rice bowls are absolutely beautiful! Each one is unique and the craftsmanship is impeccable. They\'ve completely transformed our dining experience.',
                rating: 5,
                type: 'text',
                productRef: 'Wabi-Sabi Rice Bowl',
                experienceType: 'product',
                featured: true,
                approved: true,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                name: 'Rahul & Anita',
                location: 'Ahmedabad',
                content: 'Our couple pottery date was magical! Shivangi made us feel so comfortable even though we\'d never touched clay before. We created matching mugs that we use every morning.',
                rating: 5,
                type: 'text',
                productRef: 'Couple Pottery Date',
                experienceType: 'experience',
                featured: true,
                approved: true,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                name: 'Vikram Patel',
                location: 'Bangalore',
                content: 'The workshop was incredible. I never thought I could make something so beautiful with my own hands. Already booked my next session!',
                rating: 5,
                type: 'text',
                productRef: 'Weekend Pottery Workshop',
                experienceType: 'workshop',
                featured: true,
                approved: true,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                name: 'Corporate Client - TechCorp',
                location: 'Pune',
                content: 'Our team building session at Basho was the highlight of our offsite. The team loved it and we still display our creations in the office!',
                rating: 5,
                type: 'text',
                productRef: 'Corporate Workshop',
                experienceType: 'workshop',
                featured: false,
                approved: true,
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ];

        await db.collection('testimonials').insertMany(testimonials);
        console.log(`   Created: ${testimonials.length} testimonials`);

        // ========== GALLERY ==========
        console.log('\n🖼️ Creating gallery items...');
        const gallery = [
            { title: 'Studio Workshop', image: '/gallery/workshop-1.jpg', category: 'workshops', featured: true, order: 1, createdAt: new Date() },
            { title: 'Wheel Throwing', image: '/gallery/process-1.jpg', category: 'process', featured: true, order: 2, createdAt: new Date() },
            { title: 'Product Collection', image: '/gallery/products-1.jpg', category: 'products', featured: true, order: 3, createdAt: new Date() },
            { title: 'Studio Space', image: '/gallery/studio-1.jpg', category: 'studio', featured: true, order: 4, createdAt: new Date() },
            { title: 'Exhibition Display', image: '/gallery/events-1.jpg', category: 'events', featured: true, order: 5, createdAt: new Date() },
        ];

        await db.collection('galleries').insertMany(gallery);
        console.log(`   Created: ${gallery.length} gallery items`);

        // ========== STUDIO INFO ==========
        console.log('\n🏠 Creating studio info...');
        const studioInfo = {
            name: 'Basho Studio',
            tagline: 'Handcrafted Japanese-Inspired Pottery',
            address: 'Artisan Lane, Near Creative Hub',
            city: 'Ahmedabad',
            state: 'Gujarat',
            pincode: '380001',
            mapUrl: 'https://maps.google.com/embed?...',
            mapLink: 'https://maps.google.com/?q=Basho+Studio+Ahmedabad',
            phone: '+91 9876543210',
            email: 'hello@basho.com',
            whatsapp: '+91 9876543210',
            visitingHours: {
                monday: '10:00 AM - 6:00 PM',
                tuesday: '10:00 AM - 6:00 PM',
                wednesday: '10:00 AM - 6:00 PM',
                thursday: '10:00 AM - 6:00 PM',
                friday: '10:00 AM - 6:00 PM',
                saturday: '10:00 AM - 7:00 PM',
                sunday: 'By Appointment Only'
            },
            visitPolicy: 'Walk-ins welcome during business hours. For studio tours, please schedule in advance.',
            collectionPolicy: 'Fired pieces are ready for collection within 2-3 weeks. We\'ll notify you when your pieces are ready.',
            instagram: 'https://www.instagram.com/bashobyyshivangi/',
            facebook: '',
            youtube: '',
            aboutText: 'Basho is a pottery and tableware brand inspired by Japanese culture and the philosophy of the Japanese poet Matsuo Bashō. We focus on handcrafted, raw, earthy ceramic pieces that celebrate the beauty of imperfection.',
            founderName: 'Shivangi',
            founderBio: 'Passionate about Japanese aesthetics and the meditative quality of working with clay, Shivangi founded Basho to share the joy of handcrafted pottery with the world.',
            founderImage: '/about/founder.jpg',
            createdAt: new Date(),
            updatedAt: new Date()
        };

        await db.collection('studioinfos').insertOne(studioInfo);
        console.log('   Created: Studio info');

        // ========== SUMMARY ==========
        console.log('\n' + '='.repeat(50));
        console.log('✅ DATABASE SEEDING COMPLETE!');
        console.log('='.repeat(50));
        console.log('\n📊 Summary:');
        console.log('   • 2 Users (1 admin, 1 customer)');
        console.log('   • 10 Products');
        console.log('   • 4 Workshops');
        console.log('   • 4 Experiences');
        console.log('   • 2 Events');
        console.log('   • 4 Testimonials');
        console.log('   • 5 Gallery items');
        console.log('   • 1 Studio info');
        console.log('\n🔑 Login Credentials:');
        console.log('   Admin: admin@basho.com / admin123');
        console.log('   Customer: customer@test.com / customer123');
        console.log('\n');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB');
    }
}

seedDatabase();
