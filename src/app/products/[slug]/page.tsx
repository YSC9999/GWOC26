"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { StarRating } from "@/components/StarRating";
import {
    Heart,
    Share2,
    ShoppingCart,
    Star,
    Truck,
    Shield,
    RotateCcw,
    Check,
    Loader2,
    ChevronLeft,
    Minus,
    Plus,
} from "lucide-react";
import { useCart } from "@/lib/cart";
import { useAuth } from "@/lib/auth";

interface Product {
    _id: string;
    name: string;
    slug: string;
    description: string;
    longDescription: string;
    price: number;
    originalPrice?: number;
    category: string;
    images: string[];
    material: string;
    isFoodSafe: boolean;
    isMicrowaveSafe: boolean;
    isDishwasherSafe: boolean;
    careInstructions: string;
    inStock: boolean;
    stockQuantity: number;
    weightGrams: number;
    dimensions: { length: number; width: number; height: number };
    rating: number;
    reviewCount: number;
    tags: string[];
}

const categoryEmojis: Record<string, string> = {
    bowls: "🥣",
    cups: "🍵",
    plates: "🍽️",
    platters: "🍱",
    vases: "🏺",
    decor: "🕯️",
    sets: "🎁",
};

export default function ProductDetail() {
    const params = useParams();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [wishlist, setWishlist] = useState(false);
    const [addedToCart, setAddedToCart] = useState(false);
    const cart = useCart();

    useEffect(() => {
        if (params.slug) {
            fetchProduct();
        }
    }, [params.slug]);

    const fetchProduct = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/products/${params.slug}`);
            const data = await res.json();
            if (data.product) {
                setProduct(data.product);
            }
        } catch (error) {
            console.error("Failed to fetch product:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = () => {
        if (!product) return;

        for (let i = 0; i < quantity; i++) {
            cart.add({
                id: product._id as any,
                name: product.name,
                price: product.price,
                qty: 1,
                stock: product.stockQuantity || 0,
                image: product.images?.[0]
            });
        }

        setAddedToCart(true);
        setTimeout(() => setAddedToCart(false), 2000);
    };

    const getProductImage = () => {
        const img = product?.images?.[0];
        if (
            img &&
            (img.startsWith("/") || img.startsWith("http") || img.startsWith("data:"))
        ) {
            return img;
        }
        return null;
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-clay" />
                <span className="ml-3 text-soil/70">Loading product...</span>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center">
                <div className="text-6xl mb-4">🏺</div>
                <h2 className="text-2xl font-bold text-soil mb-2">Product not found</h2>
                <p className="text-soil/60 mb-6">
                    The product you're looking for doesn't exist.
                </p>
                <Link href="/products" className="btn-primary">
                    Browse Products
                </Link>
            </div>
        );
    }

    const discount = product.originalPrice
        ? Math.round((1 - product.price / product.originalPrice) * 100)
        : 0;

    return (
        <div className="min-h-screen py-8">
            {/* Breadcrumb */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mb-8"
            >
                <Link
                    href="/products"
                    className="inline-flex items-center gap-2 text-soil/60 hover:text-clay transition-colors"
                >
                    <ChevronLeft size={18} />
                    Back to Products
                </Link>
            </motion.div>

            {/* Product Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Image */}
                <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="bg-gradient-to-br from-sand to-sand/50 rounded-3xl h-[500px] flex items-center justify-center overflow-hidden relative">
                        {getProductImage() ? (
                            <img
                                src={getProductImage()!}
                                alt={product.name}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="text-[150px]">
                                {categoryEmojis[product.category] || "🏺"}
                            </div>
                        )}

                        {/* Badges */}
                        {discount > 0 && (
                            <div className="absolute top-4 left-4 bg-green-500 text-white font-bold px-4 py-2 rounded-full">
                                {discount}% OFF
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Details */}
                <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                    className="space-y-6"
                >
                    {/* Category */}
                    <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-clay uppercase tracking-wide bg-clay/10 px-3 py-1 rounded-full">
                            {product.category}
                        </span>
                        <span className="text-sm text-soil/50 capitalize">
                            {product.material}
                        </span>
                    </div>

                    {/* Title */}
                    <h1 className="text-4xl md:text-5xl font-bold text-soil font-serif">
                        {product.name}
                    </h1>

                    {/* Rating */}
                    {product.rating > 0 && (
                        <div className="flex items-center gap-3">
                            <StarRating rating={product.rating} size={20} showCount={false} />
                            <span className="text-soil/60">
                                {product.rating} ({product.reviewCount} reviews)
                            </span>
                        </div>
                    )}

                    {/* Price */}
                    <div className="flex items-baseline gap-4">
                        <span className="text-4xl font-bold text-clay">
                            ₹{product.price.toLocaleString()}
                        </span>
                        {product.originalPrice && product.originalPrice > product.price && (
                            <span className="text-xl text-soil/40 line-through">
                                ₹{product.originalPrice.toLocaleString()}
                            </span>
                        )}
                    </div>

                    {/* Description */}
                    <p className="text-lg text-soil/70 leading-relaxed">
                        {product.longDescription || product.description}
                    </p>

                    {/* Care Badges */}
                    <div className="flex flex-wrap gap-3">
                        {product.isFoodSafe && (
                            <span className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-medium">
                                <Check size={16} /> Food Safe
                            </span>
                        )}
                        {product.isMicrowaveSafe && (
                            <span className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium">
                                <Check size={16} /> Microwave Safe
                            </span>
                        )}
                        {product.isDishwasherSafe && (
                            <span className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-medium">
                                <Check size={16} /> Dishwasher Safe
                            </span>
                        )}
                    </div>

                    {/* Stock Status */}
                    {product.inStock ? (
                        <div className="flex items-center gap-2 text-green-600">
                            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                            <span className="font-medium">
                                In Stock - Ships within 2-3 days
                            </span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 text-red-600">
                            <div className="w-3 h-3 bg-red-500 rounded-full" />
                            <span className="font-medium">Currently Out of Stock</span>
                        </div>
                    )}

                    {/* Quantity & Add to Cart */}
                    <div className="space-y-4 pt-4 border-t border-soil/10">
                        <div className="flex items-center gap-6">
                            <span className="font-semibold text-soil">Quantity:</span>
                            <div className="flex items-center bg-sand rounded-full">
                                <button
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    className="p-3 hover:text-clay transition-colors"
                                >
                                    <Minus size={18} />
                                </button>
                                <span className="px-6 py-2 font-semibold text-lg min-w-[60px] text-center">
                                    {quantity}
                                </span>
                                <button
                                    onClick={() =>
                                        setQuantity(
                                            Math.min(product.stockQuantity || 10, quantity + 1)
                                        )
                                    }
                                    className="p-3 hover:text-clay transition-colors"
                                >
                                    <Plus size={18} />
                                </button>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={handleAddToCart}
                                disabled={!product.inStock || addedToCart}
                                className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-full font-semibold text-lg transition-all ${addedToCart
                                    ? "bg-green-500 text-white"
                                    : product.inStock
                                        ? "bg-clay text-white hover:bg-clay/90 hover:scale-[1.02]"
                                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                                    }`}
                            >
                                {addedToCart ? (
                                    <>
                                        <Check size={22} /> Added to Cart
                                    </>
                                ) : (
                                    <>
                                        <ShoppingCart size={22} /> Add to Cart
                                    </>
                                )}
                            </button>

                            <button
                                onClick={() => setWishlist(!wishlist)}
                                className={`p-4 rounded-full border-2 transition-all ${wishlist
                                    ? "bg-red-50 border-red-300 text-red-500"
                                    : "border-soil/20 text-soil hover:border-clay hover:text-clay"
                                    }`}
                            >
                                <Heart size={22} fill={wishlist ? "currentColor" : "none"} />
                            </button>

                            <button className="p-4 rounded-full border-2 border-soil/20 text-soil hover:border-clay hover:text-clay transition-all">
                                <Share2 size={22} />
                            </button>
                        </div>
                    </div>

                    {/* Benefits */}
                    <div className="grid grid-cols-2 gap-4 pt-6 border-t border-soil/10">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-clay/10 rounded-full text-clay">
                                <Truck size={20} />
                            </div>
                            <div>
                                <div className="font-semibold text-soil text-sm">
                                    Free Shipping
                                </div>
                                <div className="text-xs text-soil/50">
                                    On orders above ₹2000
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-clay/10 rounded-full text-clay">
                                <RotateCcw size={20} />
                            </div>
                            <div>
                                <div className="font-semibold text-soil text-sm">
                                    Easy Returns
                                </div>
                                <div className="text-xs text-soil/50">7-day return policy</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-clay/10 rounded-full text-clay">
                                <Shield size={20} />
                            </div>
                            <div>
                                <div className="font-semibold text-soil text-sm">
                                    Secure Payment
                                </div>
                                <div className="text-xs text-soil/50">100% secure checkout</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-clay/10 rounded-full text-clay">
                                <Check size={20} />
                            </div>
                            <div>
                                <div className="font-semibold text-soil text-sm">
                                    Handcrafted
                                </div>
                                <div className="text-xs text-soil/50">Each piece is unique</div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Product Details Section */}
            <motion.section
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8"
            >
                {/* Specifications */}
                <div className="bg-white rounded-2xl p-8 shadow-sm">
                    <h3 className="text-2xl font-bold text-soil mb-6 font-serif">
                        Specifications
                    </h3>
                    <div className="space-y-4">
                        <div className="flex justify-between py-3 border-b border-soil/10">
                            <span className="text-soil/60">Material</span>
                            <span className="font-medium text-soil capitalize">
                                {product.material}
                            </span>
                        </div>
                        <div className="flex justify-between py-3 border-b border-soil/10">
                            <span className="text-soil/60">Weight</span>
                            <span className="font-medium text-soil">
                                {product.weightGrams}g
                            </span>
                        </div>
                        {product.dimensions && (
                            <div className="flex justify-between py-3 border-b border-soil/10">
                                <span className="text-soil/60">Dimensions</span>
                                <span className="font-medium text-soil">
                                    {product.dimensions.length} × {product.dimensions.width} ×{" "}
                                    {product.dimensions.height} cm
                                </span>
                            </div>
                        )}
                        <div className="flex justify-between py-3 border-b border-soil/10">
                            <span className="text-soil/60">Category</span>
                            <span className="font-medium text-soil capitalize">
                                {product.category}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Care Instructions */}
                <div className="bg-sand/50 rounded-2xl p-8">
                    <h3 className="text-2xl font-bold text-soil mb-6 font-serif">
                        Care Instructions
                    </h3>
                    <p className="text-soil/70 leading-relaxed mb-4">
                        {product.careInstructions ||
                            "Hand wash recommended for best results. Avoid sudden temperature changes to preserve the beauty of the piece."}
                    </p>
                    <div className="space-y-3">
                        {product.isFoodSafe && (
                            <div className="flex items-center gap-3 text-green-700">
                                <Check size={18} /> Safe for food contact
                            </div>
                        )}
                        {product.isMicrowaveSafe && (
                            <div className="flex items-center gap-3 text-blue-700">
                                <Check size={18} /> Safe for microwave use
                            </div>
                        )}
                        {product.isDishwasherSafe && (
                            <div className="flex items-center gap-3 text-purple-700">
                                <Check size={18} /> Dishwasher safe
                            </div>
                        )}
                        {!product.isDishwasherSafe && (
                            <div className="flex items-center gap-3 text-amber-700">
                                <Check size={18} /> Hand wash recommended
                            </div>
                        )}
                    </div>
                </div>
            </motion.section>

            {/* Tags */}
            {product.tags && product.tags.length > 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    className="mt-8 flex flex-wrap gap-2"
                >
                    {product.tags.map((tag) => (
                        <span
                            key={tag}
                            className="px-3 py-1 bg-sand text-soil/60 rounded-full text-sm"
                        >
                            #{tag}
                        </span>
                    ))}
                </motion.div>
            )}

            {/* Reviews Section */}
            <section className="mt-20 border-t border-soil/10 pt-16">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                    <div>
                        <h2 className="text-3xl font-bold text-soil font-serif">Customer Reviews</h2>
                        <div className="flex items-center gap-2 mt-2">
                            <StarRating rating={product.rating} size={16} showCount={false} />
                            <span className="font-bold text-soil">{product.rating} / 5.0</span>
                            <span className="text-soil/40 font-medium">({product.reviewCount} reviews)</span>
                        </div>
                    </div>
                    <Link
                        href={`/account/orders`}
                        className="bg-soil text-white px-8 py-3 rounded-xl font-bold hover:shadow-lg hover:shadow-soil/20 transition-all text-sm"
                    >
                        Write a Review
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Reviews List */}
                    <div className="lg:col-span-2 space-y-8">
                        <ReviewForm productId={product._id} onSuccess={() => window.location.reload()} />
                        <ReviewsList productId={product._id} />
                    </div>

                    {/* Stats Summary */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-3xl p-8 border border-sand/30 shadow-sm">
                            <h3 className="font-bold text-soil mb-6">Review Breakdown</h3>
                            {[5, 4, 3, 2, 1].map((rating) => (
                                <div key={rating} className="flex items-center gap-4 mb-3">
                                    <span className="text-sm font-bold text-soil w-4">{rating}</span>
                                    <div className="flex-1 h-2 bg-sand/30 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-orange-400 rounded-full"
                                            style={{ width: `${product.reviewCount > 0 ? (rating === 5 ? 80 : rating === 4 ? 15 : 5) : 0}%` }}
                                        />
                                    </div>
                                    <span className="text-xs font-bold text-soil/40 w-8">
                                        {product.reviewCount > 0 ? (rating === 5 ? '80%' : rating === 4 ? '15%' : '5%') : '0%'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

function ReviewForm({ productId, onSuccess }: { productId: string, onSuccess: () => void }) {
    const { user } = useAuth();
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    if (!user) return (
        <div className="bg-sand/20 rounded-3xl p-8 text-center border border-dashed border-sand">
            <p className="text-soil/60 font-medium mb-4">You must be logged in to leave a review.</p>
            <Link href="/login" className="text-clay font-bold hover:underline">Login Now</Link>
        </div>
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError("");

        try {
            const res = await fetch("/api/reviews", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ productId, rating, comment, images: [] })
            });

            if (res.ok) {
                setComment("");
                onSuccess();
            } else {
                const data = await res.json();
                setError(data.error || "Failed to submit review");
            }
        } catch (err) {
            setError("Something went wrong. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-8 border border-sand/30 shadow-sm space-y-6">
            <h3 className="text-xl font-bold text-soil font-serif">Write a Review</h3>

            <div>
                <label className="block text-sm font-bold text-soil/40 uppercase tracking-widest mb-3">Rating</label>
                <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            className="transition-transform hover:scale-110"
                        >
                            <Star
                                size={28}
                                className={star <= rating ? "fill-orange-400 text-orange-400" : "text-sand"}
                            />
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <label className="block text-sm font-bold text-soil/40 uppercase tracking-widest mb-3">Your Thoughts</label>
                <textarea
                    required
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Tell us about your experience with this treasure..."
                    className="w-full bg-sand/10 rounded-2xl p-4 min-h-[120px] focus:outline-none focus:ring-2 focus:ring-clay/20 border border-transparent focus:border-clay/30 transition-all text-soil"
                />
            </div>

            {error && <p className="text-red-500 text-sm font-bold">{error}</p>}

            <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-brick text-white py-4 rounded-xl font-bold hover:shadow-lg hover:shadow-brick/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
                {isSubmitting ? <Loader2 className="animate-spin" /> : "Submit Review"}
            </button>
        </form>
    );
}

function ReviewsList({ productId }: { productId: string }) {
    const [reviews, setReviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchReviews();
    }, [productId]);

    const fetchReviews = async () => {
        try {
            const res = await fetch(`/api/reviews?productId=${productId}`);
            if (res.ok) {
                const data = await res.json();
                setReviews(data.reviews || []);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="flex justify-center py-10"><Loader2 className="animate-spin text-clay" /></div>;
    if (reviews.length === 0) return <div className="text-soil/40 italic py-10 border-t border-dashed border-sand/30">No reviews yet for this treasure.</div>;

    return (
        <div className="space-y-10">
            {reviews.map((review) => (
                <div key={review._id} className="border-b border-sand/30 pb-10 last:border-none">
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-sand flex items-center justify-center font-serif text-soil font-bold">
                                {review.userName?.charAt(0) || "C"}
                            </div>
                            <div>
                                <h4 className="font-bold text-soil">{review.userName || "Customer"}</h4>
                                <div className="flex items-center gap-1 mt-0.5">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} size={12} className={i < review.rating ? "fill-orange-400 text-orange-400" : "text-sand"} />
                                    ))}
                                </div>
                            </div>
                        </div>
                        <span className="text-[10px] font-bold text-soil/30 uppercase tracking-widest">
                            {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                    </div>
                    <p className="text-soil/70 leading-relaxed italic">"{review.comment}"</p>
                    {review.images && review.images.length > 0 && (
                        <div className="flex gap-2 mt-4">
                            {review.images.map((img: string, idx: number) => (
                                <div key={idx} className="w-16 h-16 rounded-xl overflow-hidden bg-sand/10 border border-sand/30">
                                    <img src={img} className="w-full h-full object-cover" />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}
