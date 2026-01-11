import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const uri = process.env.MONGODB_URI;
if (!uri) {
    console.error("MONGODB_URI is not defined in .env.local");
    process.exit(1);
}

const client = new MongoClient(uri);

async function run() {
    try {
        await client.connect();
        const database = client.db("test");
        const studioInfo = database.collection("studioinfos"); // Mongoose pluralizes model name usually

        const result = await studioInfo.updateOne(
            {}, // filter: update the first one found (assuming singleton)
            { $set: { email: "chiluverusreeshanth@gmail.com" } }
        );

        console.log(`${result.matchedCount} document(s) matched the filter, updated ${result.modifiedCount} document(s)`);
    } finally {
        await client.close();
    }
}

run().catch(console.dir);
