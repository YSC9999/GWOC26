// Script to check MongoDB connection and explore data
import mongoose from 'mongoose';

const MONGODB_URL = 'mongodb+srv://basho:basho%402025@basho.p12mz56.mongodb.net/basho?retryWrites=true&w=majority';

async function checkDatabase() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URL);
        console.log('Connected successfully!\n');

        const db = mongoose.connection.db;

        // Get all collections
        const collections = await db.listCollections().toArray();
        console.log('Collections:', collections.map(c => c.name).join(', '));

        // For each collection, show data
        for (const collection of collections) {
            const collName = collection.name;
            const coll = db.collection(collName);
            const count = await coll.countDocuments();

            console.log(`\n--- ${collName.toUpperCase()} (${count} docs) ---`);

            if (count > 0) {
                const docs = await coll.find({}).limit(5).toArray();
                docs.forEach((doc, i) => {
                    // Remove password for security when displaying
                    const safeDoc = { ...doc };
                    if (safeDoc.password) safeDoc.password = '[HIDDEN]';
                    console.log(`Doc ${i + 1}:`, JSON.stringify(safeDoc, null, 2));
                });
            } else {
                console.log('(empty)');
            }
        }

        console.log('\nDone!');
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await mongoose.disconnect();
    }
}

checkDatabase();
