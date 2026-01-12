"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, ArrowLeft, Heart, ShoppingCart, XCircle, Search } from "lucide-react";
import Link from "next/link";
import { useCart } from "@/lib/cart";
import { useAuth } from "@/lib/auth";
import ProductModal from "@/components/ProductModal";
import { fadeInUp, staggerContainer, hoverScale, clickTap } from "@/lib/animations";

interface Product {
    _id: string;
    name: string;
    slug: string;
    description: string;
    price: number;
    originalPrice?: number;
    category: string;
    images: string[];
    material: string;
    isFoodSafe: boolean;
    isMicrowaveSafe: boolean;
    isDishwasherSafe: boolean;
    inStock: boolean;
    stockQuantity: number;
    rating: number;
    reviewCount: number;
    featured: boolean;
}

interface Collection {
    _id: string;
    title: string;
    description: string;
    products: Product[];
}

export default function CollectionPage() {
    const params = useParams();
    const slug = params.slug as string;

    const [collection, setCollection] = useState<Collection | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");

    // Auth & Cart
    const cart = useCart();
    const { user, login } = useAuth();

    useEffect(() => {
        if (slug) fetchCollection();
    }, [slug]);

    const fetchCollection = async () => {
        try {
            const res = await fetch(`/api/featured-collections/${slug}`);
            if (!res.ok) throw new Error("Collection not found");
            const data = await res.json();
            setCollection(data.collection);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = (product: Product) => {
        cart.add({
            id: product._id as any,
            name: product.name,
            price: product.price,
            qty: 1,
            stock: product.stockQuantity || 0,
            image: product.images?.[0]
        });
    };

    const handleWishlist = async (e: React.MouseEvent, productId: string) => {
        e.stopPropagation();
        if (!user) {
            alert("Please login to add to wishlist");
            return;
        }
        // Simplified optimistic update for brevity
        const currentWishlist = user.wishlist || [];
        const isLiked = currentWishlist.includes(productId);
        const newWishlist = isLiked
            ? currentWishlist.filter((id) => id !== productId)
            : [...currentWishlist, productId];

        login({ ...user, wishlist: newWishlist });
        // (Assuming API call works as in Product list)
        fetch("/api/user/wishlist", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ productId }),
        }).catch(err => console.error(err));
    };

    const isProductLiked = (pid: string) => user?.wishlist?.includes(pid) || false;

    // Filter products
    const filteredProducts = collection?.products.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="animate-spin text-clay" size={40} />
            </div>
        );
    }

    if (!collection) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
                <h1 className="text-4xl font-serif text-soil mb-4">Collection Not Found</h1>
                <Link href="/" className="text-clay hover:underline flex items-center gap-2">
                    <ArrowLeft size={20} /> Back to Home
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-24 pb-20 px-4 md:px-12 bg-[#FDFBF7]">
            {/* Header */}
            <div className="max-w-7xl mx-auto mb-12">
                <Link href="/" className="inline-flex items-center text-soil/60 hover:text-clay mb-6 transition-colors">
                    <ArrowLeft size={16} className="mr-2" /> Back to Home
                </Link>

                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <span className="text-clay uppercase tracking-widest text-sm font-medium">Curated Collection</span>
                    <h1 className="text-4xl md:text-5xl font-bold text-soil font-serif mt-2 mb-4">{collection.title}</h1>
                    <p className="text-xl text-soil/70 max-w-2xl">{collection.description}</p>
                </motion.div>

                {/* Search Bar within Collection */}
                <div className="mt-8 relative max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-soil/40" size={20} />
                    <input
                        type="text"
                        placeholder={`Search in ${collection.title}...`}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white border border-soil/10 rounded-full focus:outline-none focus:border-clay transition-colors"
                    />
                </div>
            </div>

            {/* Products Grid */}
            <div className="max-w-7xl mx-auto">
                {filteredProducts.length === 0 ? (
                    <div className="text-center py-20 text-soil/50">
                        No products found in this collection matching your search.
                    </div>
                ) : (
                    <motion.div
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
                        variants={staggerContainer}
                        initial="hidden"
                        animate="visible"
                    >
                        {filteredProducts.map((product) => {
                            const isOutOfStock = !product.inStock || (product.stockQuantity !== undefined && product.stockQuantity <= 0);
                            return (
                                <motion.div
                                    key={product._id}
                                    variants={fadeInUp}
                                    whileHover={hoverScale}
                                    className="group relative bg-white rounded-3xl overflow-hidden cursor-pointer shadow-sm hover:shadow-xl transition-all duration-300 border border-transparent hover:border-clay/10"
                                    onClick={() => setSelectedProductId(product.slug || product._id)}
                                >
                                    {/* Image */}
                                    <div className="h-72 bg-sand/20 overflow-hidden relative">
                                        {product.images?.[0] ? (
                                            <img
                                                src={product.images[0]}
                                                alt={product.name}
                                                className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ${isOutOfStock ? "grayscale opacity-80" : ""}`}
                                            />
                                        ) : (
                                            <div className="flex items-center justify-center w-full h-full text-4xl">🏺</div>
                                        )}

                                        {/* Status Overlays */}
                                        {isOutOfStock && (
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[2px]">
                                                <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide flex items-center gap-1">
                                                    <XCircle size={12} /> Out of Stock
                                                </span>
                                            </div>
                                        )}

                                        {/* Wishlist Button */}
                                        <button
                                            onClick={(e) => handleWishlist(e, product._id)}
                                            className="absolute top-4 right-4 bg-white/90 p-2 rounded-full shadow-sm hover:bg-white text-soil transition-colors z-10"
                                        >
                                            <Heart size={18} className={isProductLiked(product._id) ? "fill-red-500 text-red-500" : "text-gray-400"} />
                                        </button>

                                        {/* Quick Add Button */}
                                        {!isOutOfStock && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleAddToCart(product);
                                                }}
                                                className="absolute bottom-4 right-4 bg-soil text-white p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300 hover:bg-clay z-10"
                                            >
                                                <ShoppingCart size={18} />
                                            </button>
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className="p-5">
                                        <div className="text-xs font-bold text-clay uppercase mb-1">{product.category}</div>
                                        <h3 className="font-bold text-soil text-lg mb-1 truncate group-hover:text-clay transition-colors">{product.name}</h3>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-xl font-bold text-clay">₹{product.price.toLocaleString()}</span>
                                            {product.originalPrice && product.originalPrice > product.price && (
                                                <span className="text-sm text-soil/40 line-through">₹{product.originalPrice.toLocaleString()}</span>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                )}
            </div>

            <ProductModal
                productId={selectedProductId}
                onClose={() => setSelectedProductId(null)}
            />
        </div>
    );
}
