"use client";
import React, { useState } from "react";
import ProductCard from "@/components/ProductCard";
import { UserTier } from "@/lib/tiers";
import { motion, AnimatePresence } from "framer-motion";

interface ProductGridWithSortProps {
    products: any[];
    userTier: UserTier;
}

export default function ProductGridWithSort({ products: initialProducts, userTier }: ProductGridWithSortProps) {
    const [sortBy, setSortBy] = useState("default");

    const getSortedProducts = () => {
        let sorted = [...initialProducts];
        if (sortBy === "price-low") {
            sorted.sort((a, b) => a.price - b.price);
        } else if (sortBy === "price-high") {
            sorted.sort((a, b) => b.price - a.price);
        } else if (sortBy === "newest") {
            sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        }
        // "default" keeps original order (which might be curated)
        return sorted;
    };

    const sortedProducts = getSortedProducts();
    const [selectedProductId, setSelectedProductId] = React.useState<string | null>(null);

    return (
        <div>
            {/* Sort Controls */}
            <div className="flex justify-end mb-8">
                <div className="flex items-center gap-3 bg-white p-2 rounded-xl border border-soil/10 shadow-sm">
                    <span className="text-sm font-bold text-soil/60 pl-2">Sort by:</span>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="text-sm font-medium text-soil bg-transparent focus:outline-none cursor-pointer p-1"
                    >
                        <option value="default">Featured</option>
                        <option value="newest">Newest First</option>
                        <option value="price-low">Price: Low to High</option>
                        <option value="price-high">Price: High to Low</option>
                    </select>
                </div>
            </div>

            {/* Grid */}
            {sortedProducts.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
                    <AnimatePresence mode="popLayout">
                        {sortedProducts.map((product) => (
                            <motion.div
                                key={product._id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.3 }}
                            >
                                <ProductCard
                                    product={product}
                                    userTier={userTier}
                                    onProductClick={(p) => setSelectedProductId(p._id)}
                                />
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            ) : (
                <div className="text-center py-20 bg-sand/10 rounded-3xl border border-sand/30">
                    <div className="text-4xl mb-4">🏺</div>
                    <h3 className="text-xl font-bold text-soil mb-2">No products found</h3>
                    <p className="text-soil/60">This collection is currently empty.</p>
                </div>
            )}

            {/* Product Modal */}
            <ProductModal
                productId={selectedProductId}
                onClose={() => setSelectedProductId(null)}
            />
        </div>
    );
}

import ProductModal from "@/components/ProductModal";
