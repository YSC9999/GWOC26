"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  Heart,
  Share2,
  ShoppingCart,
  Star,
  Truck,
  Shield,
  RotateCcw,
} from "lucide-react";
import Link from "next/link";

export default function ProductDetail({ params }: { params: { id: string } }) {
  const [quantity, setQuantity] = useState(1);
  const [wishlist, setWishlist] = useState(false);

  // Mock product data - in real app, fetch based on params.id
  const product = {
    id: params.id,
    name: "Premium Basics Pack",
    price: 29.99,
    originalPrice: 49.99,
    rating: 4.8,
    reviews: 142,
    image: "🎁",
    description: "Essential starter pack with quality items",
    longDescription:
      "This premium basics pack includes everything you need to get started. Each item is carefully curated to ensure quality and value. Perfect for beginners and professionals alike.",
    features: [
      "High-quality materials",
      "Eco-friendly packaging",
      "Lifetime warranty",
      "30-day money-back guarantee",
      "Free shipping worldwide",
      "24/7 customer support",
    ],
    inStock: true,
    specifications: {
      Weight: "2.5 kg",
      Dimensions: "20 x 15 x 10 cm",
      Material: "Premium Grade A",
      Color: "Black, White, Gray",
      Warranty: "Lifetime",
    },
  };

  const relatedProducts = [
    {
      id: 2,
      name: "Pro Developer Kit",
      price: 79.99,
      image: "🛠️",
      rating: 4.9,
    },
    {
      id: 3,
      name: "Creative Studio Bundle",
      price: 59.99,
      image: "🎨",
      rating: 4.7,
    },
    {
      id: 4,
      name: "Business Pro Suite",
      price: 99.99,
      image: "💼",
      rating: 4.9,
    },
  ];

  return (
    <div className="space-y-12">
      {/* Breadcrumb */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center gap-2 text-sm text-gray-600"
      >
        <Link href="/main/products" className="hover:text-clay">
          Products
        </Link>
        <span>/</span>
        <span className="text-soil font-semibold">{product.name}</span>
      </motion.div>

      {/* Product Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Image */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-sand rounded-xl h-96 flex items-center justify-center text-9xl"
        >
          {product.image}
        </motion.div>

        {/* Details */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          {/* Title & Price */}
          <div>
            <h1 className="text-4xl font-bold text-soil mb-4">
              {product.name}
            </h1>
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={20}
                    className={
                      i < Math.floor(product.rating)
                        ? "fill-clay text-clay"
                        : "text-gray-300"
                    }
                  />
                ))}
              </div>
              <span className="text-gray-600">
                {product.rating} ({product.reviews} reviews)
              </span>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-4xl font-bold text-clay">
                ${product.price}
              </span>
              <span className="text-xl text-gray-400 line-through">
                ${product.originalPrice}
              </span>
              <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-bold">
                40% OFF
              </span>
            </div>
          </div>

          {/* Description */}
          <p className="text-gray-700 text-lg">{product.longDescription}</p>

          {/* Stock Status */}
          {product.inStock ? (
            <div className="text-green-600 font-semibold flex items-center gap-2">
              <div className="w-3 h-3 bg-green-600 rounded-full"></div>
              In Stock - Ships within 24 hours
            </div>
          ) : (
            <div className="text-red-600 font-semibold">Out of Stock</div>
          )}

          {/* Quantity & Add to Cart */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <span className="font-semibold">Quantity:</span>
              <div className="flex items-center border-2 border-soil rounded-lg">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-2 hover:bg-sand transition-colors"
                >
                  −
                </button>
                <span className="px-6 py-2 border-l border-r border-soil">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-4 py-2 hover:bg-sand transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex gap-4">
              <button className="btn-primary flex-1 flex items-center justify-center gap-2">
                <ShoppingCart size={20} />
                Add to Cart
              </button>
              <button
                onClick={() => setWishlist(!wishlist)}
                className={`px-6 py-2 rounded-lg border-2 font-semibold transition-all ${
                  wishlist
                    ? "bg-red-100 border-red-400 text-red-600"
                    : "border-soil text-soil hover:bg-soil hover:text-white"
                }`}
              >
                <Heart size={20} fill={wishlist ? "currentColor" : "none"} />
              </button>
              <button className="px-6 py-2 rounded-lg border-2 border-soil text-soil hover:bg-soil hover:text-white transition-all">
                <Share2 size={20} />
              </button>
            </div>
          </div>

          {/* Benefits */}
          <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gray-200">
            <div className="flex items-center gap-3">
              <Truck className="text-clay" size={24} />
              <span className="text-sm font-semibold">Free Shipping</span>
            </div>
            <div className="flex items-center gap-3">
              <RotateCcw className="text-clay" size={24} />
              <span className="text-sm font-semibold">30-Day Returns</span>
            </div>
            <div className="flex items-center gap-3">
              <Shield className="text-clay" size={24} />
              <span className="text-sm font-semibold">Lifetime Warranty</span>
            </div>
            <div className="flex items-center gap-3">
              <ShoppingCart className="text-clay" size={24} />
              <span className="text-sm font-semibold">Secure Checkout</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Features */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="bg-sand rounded-xl p-12"
      >
        <h2 className="text-3xl font-bold text-soil mb-8">Key Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {product.features.map((feature, idx) => (
            <div key={idx} className="flex items-start gap-4">
              <div className="w-8 h-8 bg-clay rounded-full flex items-center justify-center text-white flex-shrink-0 mt-1">
                ✓
              </div>
              <span className="text-gray-700 font-semibold">{feature}</span>
            </div>
          ))}
        </div>
      </motion.section>

      {/* Specifications */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-3xl font-bold text-soil mb-8">Specifications</h2>
        <div className="card p-8 overflow-x-auto">
          <table className="w-full">
            <tbody>
              {Object.entries(product.specifications).map(
                ([key, value], idx) => (
                  <tr
                    key={idx}
                    className={`border-b border-gray-200 ${
                      idx % 2 === 0 ? "bg-sand/50" : ""
                    }`}
                  >
                    <td className="px-6 py-4 font-semibold text-soil">{key}</td>
                    <td className="px-6 py-4 text-gray-700">{value}</td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      </motion.section>

      {/* Related Products */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="section-title">Related Products</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {relatedProducts.map((prod, idx) => (
            <motion.div
              key={prod.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="card overflow-hidden hover:shadow-2xl group"
            >
              <div className="bg-sand h-40 flex items-center justify-center text-6xl group-hover:scale-110 transition-transform">
                {prod.image}
              </div>
              <div className="p-6">
                <h3 className="font-bold text-soil mb-2">{prod.name}</h3>
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      className={
                        i < Math.floor(prod.rating)
                          ? "fill-clay text-clay"
                          : "text-gray-300"
                      }
                    />
                  ))}
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-clay">
                    ${prod.price}
                  </span>
                  <Link
                    href={`/products/${prod.id}`}
                    className="bg-soil text-white p-2 rounded hover:bg-clay transition-colors"
                  >
                    <ShoppingCart size={16} />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Related Products Section */}
      <motion.section
        className="py-20"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <h2 className="font-serif text-4xl text-center mb-16 text-[#1f1f1f]">
          Related Products
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <motion.div
              key={i}
              whileHover={{ y: -8 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-lg overflow-hidden shadow-lg"
            >
              <div className="aspect-square bg-gradient-to-br from-[#efe5d8] to-[#e0d5c7] flex items-center justify-center text-6xl">
                🍯
              </div>
              <div className="p-6">
                <h3 className="font-serif text-xl mb-2">Related Product {i}</h3>
                <p className="text-[#6d4c3d] mb-4">₹2,500</p>
                <button className="w-full bg-[#c97c5d] text-white py-2 rounded-full hover:bg-[#b66a4a] transition">
                  View Details
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>
    </div>
  );
}
