"use client";
import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Trash2, ShoppingBag } from "lucide-react";
import { useAuth } from "@/lib/auth";
import ProductModal from "@/components/ProductModal";

export default function WishlistPage() {
    const [wishlist, setWishlist] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

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

    // Sync global state when wishlist is fetched
    useEffect(() => {
        if (user && wishlist.length > 0) {
            // Only update if truly different to avoid loops (though useAuth might handle it)
            // simplified check: just ensure wishlist IDs match
            const globalIds = user.wishlist || [];
            const localIds = wishlist.map(item => item._id);

            // If lengths differ or not all local items are in global, sync.
            // We can just blindly sync here safely because this component fetches fresh data.
            if (JSON.stringify(globalIds) !== JSON.stringify(localIds)) {
                // Ensure we map back to just IDs if that's what the global state expects, 
                // OR if we updated auth to support objects, that's fine too. 
                // But usually auth store keeps IDs for lightweight.
                // However, our code now handles objects! 
                // Let's safe-guard: store mixed is fine, but cleaner to store IDs or consistently objects.
                // The API /api/user/wishlist returns populated objects. 
                // The login function expects User object. 
                // Let's just update the wishlist field.
                login({ ...user, wishlist: wishlist });
            }
        }
    }, [wishlist, user, login]);

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
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-[#5A3E36] font-serif">My Wishlist</h1>
                <span className="bg-[#EFE5D8] text-[#5A3E36] px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-[#5A3E36]/20 shadow-sm">
                    {wishlist.length} Items
                </span>
            </div>

            {wishlist.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {wishlist.map((product) => (
                        <div
                            key={product._id}
                            onClick={() => setSelectedProductId(product._id)}
                            className="group bg-white/60 backdrop-blur-md rounded-3xl p-4 border border-[#5A3E36]/10 hover:shadow-xl hover:shadow-[#5A3E36]/10 transition-all hover:-translate-y-1 cursor-pointer"
                        >
                            <div className="relative aspect-square rounded-2xl overflow-hidden mb-4 bg-[#EFE5D8]/50">
                                <img
                                    src={product.images?.[0] || product.image || "/placeholder.jpg"}
                                    alt={product.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                />

                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500" />

                                <button
                                    onClick={(e) => handleRemove(product._id, e)}
                                    className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full text-red-500 hover:bg-red-50 transition-colors shadow-sm opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 duration-300"
                                    title="Remove from wishlist"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>

                            <div className="space-y-2 px-1">
                                <h3 className="font-bold text-[#5A3E36] font-serif line-clamp-1 text-lg group-hover:text-[#C97C5D] transition-colors">{product.name}</h3>
                                <p className="text-xs text-[#5A3E36]/60 line-clamp-1">{product.description}</p>

                                <div className="flex justify-between items-center pt-2 border-t border-[#5A3E36]/5 mt-3">
                                    <span className="text-lg font-bold text-[#C97C5D] font-serif">₹{product.price}</span>
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#5A3E36]/40 group-hover:text-[#5A3E36]/60 transition-colors">View Details</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-white/40 backdrop-blur-md rounded-3xl border border-[#5A3E36]/10 shadow-sm">
                    <div className="w-20 h-20 bg-[#EFE5D8] rounded-full flex items-center justify-center mx-auto mb-6 text-[#5A3E36]/30">
                        <ShoppingBag size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-[#5A3E36] mb-2 font-serif">Your wishlist is empty</h2>
                    <p className="text-[#5A3E36]/60 mb-8 font-medium max-w-xs mx-auto">Save items you love to revisit them later. Your clay treasures await.</p>
                    <Link
                        href="/products"
                        className="inline-block bg-[#5A3E36] text-[#EFE5D8] px-8 py-3 rounded-xl font-bold hover:shadow-lg hover:shadow-[#5A3E36]/20 transition-all hover:-translate-y-0.5"
                    >
                        Explore Collection
                    </Link>
                </div>
            )}
            {/* Product Modal */}
            <AnimatePresence>
                {selectedProductId && (
                    <ProductModal
                        productId={selectedProductId}
                        onClose={() => setSelectedProductId(null)}
                        topPaddingClass="items-start pt-24"
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
