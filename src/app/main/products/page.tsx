"use client";
import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { ShoppingCart, Star } from "lucide-react";
import { TierBadge } from "@/components/TierBadge";
import { UserTier } from "@/lib/tiers";

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  rating: number;
  reviews: number;
  image: string;
  description: string;
  tier: UserTier | string;
}

export default function Products() {
  const [selectedCategory, setSelectedCategory] = useState("all");

  const products: Product[] = [
    {
      id: 1,
      name: "Clay Vessel Collection",
      category: "ceramics",
      price: 45.99,
      rating: 4.8,
      reviews: 142,
      image: "🏺",
      description: "Beautiful handcrafted clay vessels",
      tier: UserTier.TIER_0,
    },
    {
      id: 2,
      name: "Premium Pottery Set",
      category: "ceramics",
      price: 79.99,
      rating: 4.9,
      reviews: 89,
      image: "🍶",
      description: "Complete pottery toolkit for professionals",
      tier: UserTier.TIER_1,
    },
    {
      id: 3,
      name: "Artist Studio Bundle",
      category: "workshops",
      price: 59.99,
      rating: 4.7,
      reviews: 156,
      image: "🎨",
      description: "Everything for your ceramic art studio",
      tier: UserTier.TIER_1,
    },
    {
      id: 4,
      name: "Exclusive Master's Collection",
      category: "premium",
      price: 199.99,
      rating: 4.9,
      reviews: 203,
      image: "👑",
      description: "Rare masterpiece ceramics from renowned artists",
      tier: UserTier.TIER_2,
    },
    {
      id: 5,
      name: "VIP Custom Commission",
      category: "custom",
      price: 499.99,
      rating: 5.0,
      reviews: 267,
      image: "💎",
      description: "Bespoke ceramic pieces made to order",
      tier: UserTier.TIER_3,
    },
    {
      id: 6,
      name: "Beginner's Starter Kit",
      category: "learning",
      price: 34.99,
      rating: 4.6,
      reviews: 98,
      image: "📚",
      description: "Learn pottery basics with our starter kit",
      tier: UserTier.TIER_0,
    },
  ];

  const categories = [
    { id: "all", label: "All Products" },
    { id: "ceramics", label: "Ceramics" },
    { id: "workshops", label: "Workshops" },
    { id: "premium", label: "Premium" },
    { id: "custom", label: "Custom" },
    { id: "learning", label: "Learning" },
  ];

  const filteredProducts =
    selectedCategory === "all"
      ? products
      : products.filter((p) => p.category === selectedCategory);

  return (
    <div className="space-y-12 pt-12">
      {/* Header */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className="text-5xl font-bold text-soil mb-4">Our Products</h1>
        <p className="text-xl text-gray-700">
          Discover our curated collection of handcrafted ceramic pieces designed
          to enhance your life.
        </p>
      </motion.section>

      {/* Category Filter */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex flex-wrap gap-3 pb-8 border-b-2 border-clay"
      >
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-6 py-2 rounded-full font-semibold transition-all ${
              selectedCategory === cat.id
                ? "bg-clay text-white"
                : "bg-white text-soil border-2 border-clay hover:bg-clay hover:text-white"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </motion.div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredProducts.map((product, idx) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="card overflow-hidden hover:shadow-2xl group"
          >
            {/* Product Image */}
            <div className="bg-sand h-48 flex items-center justify-center text-6xl overflow-hidden group-hover:scale-110 transition-transform duration-300">
              {product.image}
            </div>

            {/* Product Info */}
            <div className="p-6">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="text-xl font-bold text-soil flex-1">
                  {product.name}
                </h3>
                <TierBadge tier={product.tier as UserTier} showLabel={false} />
              </div>
              <p className="text-gray-600 text-sm mb-4">
                {product.description}
              </p>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className={
                        i < Math.floor(product.rating)
                          ? "fill-clay text-clay"
                          : "text-gray-300"
                      }
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600">
                  {product.rating} ({product.reviews} reviews)
                </span>
              </div>

              {/* Price and Button */}
              <div className="flex justify-between items-center">
                <div className="text-3xl font-bold text-clay">
                  ${product.price}
                </div>
                <Link
                  href={`/main/products/${product.id}`}
                  className="bg-soil text-white p-3 rounded-lg hover:bg-clay transition-colors"
                >
                  <ShoppingCart size={20} />
                </Link>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-xl text-gray-600">
            No products found in this category.
          </p>
        </div>
      )}
    </div>
  );
}
