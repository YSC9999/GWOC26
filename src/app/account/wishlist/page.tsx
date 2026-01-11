"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Trash2, ShoppingBag } from "lucide-react";
import { useAuth } from "@/lib/auth";

export default function WishlistPage() {
    const [wishlist, setWishlist] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchWishlist();
    }, []);

    const fetchWishlist = async () => {
        try {
            const res = await fetch("/api/user/wishlist");
            if (res.ok) {
                const data = await res.json();
                setWishlist(data.wishlist || []);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const { user, login } = useAuth();

    // ...

    const handleRemove = async (id: string, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        // Optimistic update
        setWishlist(items => items.filter(item => item._id !== id));

        // Update global auth store
        if (user) {
            const newWishlist = user.wishlist?.filter((wId: string) => wId !== id) || [];
            login({ ...user, wishlist: newWishlist });
        }

        try {
            await fetch("/api/user/wishlist", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ productId: id }),
            });
        } catch (err) {
            console.error(err);
            fetchWishlist(); // Revert on error
            // Should ideally revert global state too, but fetching fresh is safer
        }
    };

    if (loading) return (
        <div className="min-h-screen pt-32 pb-12 px-4 flex justify-center">
            <div className="animate-pulse text-soil">Loading wishlist...</div>
        </div>
    );

    return (
        <div className="min-h-screen pt-32 pb-12 px-4 md:px-8 max-w-7xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
                <h1 className="text-3xl font-bold text-soil font-serif">My Wishlist</h1>
                <span className="bg-sand text-soil px-3 py-1 rounded-full text-sm font-medium">
                    {wishlist.length} Items
                </span>
            </div>

            {wishlist.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {wishlist.map((product) => (
                        <Link
                            href={`/products/${product._id}`}
                            key={product._id}
                            className="group bg-white rounded-2xl p-4 border border-stone-100 hover:shadow-md transition-all"
                        >
                            <div className="relative aspect-square rounded-xl overflow-hidden mb-4 bg-sand/20">
                                <img
                                    src={product.images?.[0] || product.image}
                                    alt={product.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />

                                <button
                                    onClick={(e) => handleRemove(product._id, e)}
                                    className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full text-red-500 hover:bg-red-50 transition-colors shadow-sm"
                                    title="Remove from wishlist"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>

                            <div className="space-y-2">
                                <h3 className="font-bold text-soil line-clamp-1">{product.name}</h3>
                                <p className="text-sm text-stone-500 line-clamp-1">{product.description}</p>

                                <div className="flex justify-between items-center pt-2">
                                    <span className="text-lg font-bold text-clay">₹{product.price}</span>
                                    {/* Optional: Add to cart button here if desired */}
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-white rounded-3xl border border-stone-100">
                    <ShoppingBag size={48} className="mx-auto text-soil/20 mb-4" />
                    <h2 className="text-xl font-bold text-soil mb-2">Your wishlist is empty</h2>
                    <p className="text-stone-500 mb-6">Save items you love to revisit them later.</p>
                    <Link
                        href="/products"
                        className="inline-block bg-soil text-white px-8 py-3 rounded-full font-medium hover:bg-soil/90 transition-colors"
                    >
                        Explore Collection
                    </Link>
                </div>
            )}
        </div>
    );
}
