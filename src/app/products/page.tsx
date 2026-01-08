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
  price: number;
  img: string;
}

export default function Products() {
  const [selectedCategory, setSelectedCategory] = useState("all");

  const products: Product[] = [
    {
      id: 1,
      name: "Stoneware Bowl",
      price: 899,
      img: "/products/bowl.jpg",
    },
    {
      id: 2,
      name: "Tea Cup Set",
      price: 1299,
      img: "/products/teacup.jpg",
    },
    {
      id: 3,
      name: "Serving Platter",
      price: 1599,
      img: "/products/platter.jpg",
    },
    {
      id: 4,
      name: "Sake Cups",
      price: 699,
      img: "/products/sake.jpg",
    },
  ];

  const filteredProducts = products;

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

      {/* Category Filter removed, no categories in Product */}

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
              {product.img}
            </div>

            {/* Product Info */}
            <div className="p-6">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="text-xl font-bold text-soil flex-1">
                  {product.name}
                </h3>
                {/* Removed TierBadge, no tier property in Product */}
              </div>
              {/* Description removed, no des property in Product */}

              {/* Rating removed, no rating or reviews property in Product */}

              {/* Price and Button */}
              <div className="flex justify-between items-center">
                <div className="text-3xl font-bold text-clay">
                  ${product.price}
                </div>
                <Link
                  href={`/products/${product.id}`}
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
