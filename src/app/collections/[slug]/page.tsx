
import { connectDB } from "@/lib/mongodb";
import FeaturedCollection from "@/models/FeaturedCollection";
import Product from "@/models/Product";
import ProductCard from "@/components/ProductCard";
import { UserTier } from "@/lib/tiers";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface PageProps {
    params: Promise<{
        slug: string;
    }>;
}

// Ensure Product model is registered
const _ = Product;

async function getCollection(slug: string) {
    await connectDB();
    console.log("Fetching collection for slug:", slug);
    const collection = await FeaturedCollection.findOne({
        slug: { $regex: new RegExp(`^${slug}$`, 'i') }
    })
        .populate("products")
        .lean();

    if (collection) {
        (collection._id as any) = collection._id.toString();
        if (collection.createdAt) (collection.createdAt as any) = collection.createdAt.toISOString();
        if (collection.updatedAt) (collection.updatedAt as any) = collection.updatedAt.toISOString();

        if (collection.products) {
            collection.products = collection.products.map((product: any) => ({
                ...product,
                _id: product._id.toString(),
                createdAt: product.createdAt?.toISOString(),
                updatedAt: product.updatedAt?.toISOString(),
            }));
        }
    }

    console.log("Found collection:", collection ? collection.title : "null");
    return collection;
}

export default async function CollectionPage({ params }: PageProps) {
    const { slug } = await params;
    const collection = await getCollection(slug);

    if (!collection) {
        return (
            <div className="min-h-screen pt-32 text-center text-soil">
                <h1 className="text-2xl font-bold text-clay mb-2">Collection Not Found</h1>
                <p>We couldn't find a collection with the slug: <strong>{slug}</strong></p>
                <Link href="/" className="text-sm underline mt-4 inline-block hover:text-clay">Return Home</Link>
            </div>
        );
    }

    // Default to 'Guest' tier (TIER_0) for public access
    const userTier = UserTier.TIER_0;

    return (
        <div className="min-h-screen pt-24 pb-16 px-4 md:px-12 bg-[#FDF9F5]">
            <div className="max-w-7xl mx-auto">
                {/* Back Link */}
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-soil/60 hover:text-soil mb-8 transition-colors group"
                >
                    <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    Back to Home
                </Link>

                {/* Header */}
                <div className="text-center mb-16 space-y-4">
                    <span className="text-clay font-bold tracking-widest uppercase text-sm block">
                        Collection
                    </span>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-soil">
                        {collection.title}
                    </h1>
                    {collection.description && (
                        <p className="text-soil/70 max-w-2xl mx-auto text-lg leading-relaxed">
                            {collection.description}
                        </p>
                    )}
                </div>

                {/* Products Grid */}
                {collection.products && collection.products.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
                        {collection.products.map((product: any) => (
                            <ProductCard
                                key={product._id}
                                product={product}
                                userTier={userTier}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-sand/10 rounded-3xl border border-sand/30">
                        <div className="text-4xl mb-4">🏺</div>
                        <h3 className="text-xl font-bold text-soil mb-2">No products found</h3>
                        <p className="text-soil/60">This collection is currently empty.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
