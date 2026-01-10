"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ShoppingBag } from "lucide-react";

export default function MainHome() {
  // Static frame data with varied sizes and artistic placement - responsive sizing with more spacing
  const frameData = [
    { id: 0, width: 120, height: 95, left: 10, top: 5, color: "#442D1C" },
    { id: 1, width: 145, height: 125, left: 155, top: 0, color: "#652810" },
    { id: 2, width: 105, height: 115, left: 325, top: 10, color: "#8E5022" },
    { id: 3, width: 130, height: 105, left: 35, top: 155, color: "#C85428" },
    { id: 4, width: 160, height: 135, left: 190, top: 170, color: "#EDD8B4" },
    { id: 5, width: 115, height: 125, left: 375, top: 155, color: "#442D1C" },
    { id: 6, width: 125, height: 110, left: 5, top: 290, color: "#652810" },
    { id: 7, width: 150, height: 140, left: 155, top: 335, color: "#8E5022" },
    { id: 8, width: 120, height: 110, left: 330, top: 315, color: "#C85428" },
  ];

  const products = [
    {
      id: 1,
      name: "Clay Vessel",
      tier: "tier-1",
      image: "\ud83d\uddfa",
      price: "$45",
    },
    {
      id: 2,
      name: "Soil Canvas",
      tier: "tier-2",
      image: "\ud83c\udfa8",
      price: "$60",
    },
    {
      id: 3,
      name: "Sand Sculpture",
      tier: "tier-1",
      image: "\ud83d\uddff",
      price: "$55",
    },
    {
      id: 4,
      name: "Ink Painting",
      tier: "tier-0",
      image: "\ud83d\uddbc\ufe0f",
      price: "$75",
    },
    {
      id: 5,
      name: "Ceramic Bowl",
      tier: "tier-2",
      image: "\ud83c\udf76",
      price: "$50",
    },
    {
      id: 6,
      name: "Stone Carving",
      tier: "tier-3",
      image: "\u26cf\ufe0f",
      price: "$85",
    },
  ];

  return (
    <div>
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative w-full px-4 md:px-12 py-20 md:py-28"
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Left Content */}
            <div className="relative z-10 pt-12">
              <motion.h1
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.8 }}
                className="text-5xl md:text-7xl font-serif font-bold text-soil mb-6 leading-tight italic"
              >
                A Quiet Splash
                <br />
                in Every Piece
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className="text-lg md:text-xl text-soil/80 mb-12 font-light"
              >
                Artistry for the home and the self. Discover a curated
                collection of fashion designed to reflect your unique story with
                grace and intention.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.8 }}
                className="flex flex-col sm:flex-row gap-6 items-start"
              >
                <Link href="/products">
                  <button className="btn-primary flex items-center gap-2 px-8 py-4 text-lg hover:scale-105 transition-transform">
                    SHOP NOW
                    <ShoppingBag size={20} />
                  </button>
                </Link>
                <Link href="/about">
                  <button className="btn-secondary flex items-center gap-2 px-8 py-4 text-lg hover:scale-105 transition-transform">
                    OUR STORY
                    <ArrowRight size={20} />
                  </button>
                </Link>
              </motion.div>
            </div>

            {/* Right Image Grid - 9 Static Frames, Responsive Sizing */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="relative pt-12 w-full h-screen scale-75 md:scale-90 lg:scale-100 origin-top-left"
            >
              {frameData.map((frame) => (
                <motion.div
                  key={frame.id}
                  initial={{ opacity: 0, scale: 0.6, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{
                    delay: 0.5 + frame.id * 0.04,
                    duration: 0.4,
                    type: "spring",
                    stiffness: 100,
                  }}
                  className="absolute rounded-lg overflow-hidden border-2 border-soil/30 shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                  style={{
                    backgroundColor: frame.color,
                    width: `${frame.width}px`,
                    height: `${frame.height}px`,
                    left: `${frame.left}px`,
                    top: `${frame.top}px`,
                  }}
                >
                  <div className="w-full h-full flex items-center justify-center text-white text-xs font-semibold opacity-0 hover:opacity-75 transition-opacity bg-black/30">
                    {frame.id + 1}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Featured Collection */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative w-full px-4 md:px-12 py-20"
      >
        <div className="max-w-7xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-5xl font-bold text-soil text-center mb-16"
          >
            Featured Collection
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                whileHover={{
                  y: -10,
                  boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
                }}
                className="card p-6 group cursor-pointer"
              >
                <Link href={`/products/${product.id}`}>
                  <div className="text-6xl mb-4 text-center group-hover:scale-110 transition-transform">
                    {product.image}
                  </div>
                  <h3 className="text-xl font-semibold text-soil mb-2">
                    {product.name}
                  </h3>
                  <p className="text-sm text-gray-500 mb-3">
                    <span className="inline-block bg-sand px-3 py-1 rounded-full">
                      {product.tier}
                    </span>
                  </p>
                  <p className="text-lg font-bold text-clay mb-4">
                    {product.price}
                  </p>
                  <button className="btn-primary w-full py-2 text-sm">
                    View Details
                  </button>
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-16">
            <Link href="/products">
              <button className="btn-outline px-10 py-3 text-lg">
                View All Products
              </button>
            </Link>
          </div>
        </div>
      </motion.section>

      {/* Blank Section - Reserved for Future */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative w-full px-4 md:px-12 py-20 bg-gradient-to-br from-soil/5 via-transparent to-clay/5"
      >
        <div className="max-w-7xl mx-auto h-32"></div>
      </motion.section>
    </div>
  );
}
