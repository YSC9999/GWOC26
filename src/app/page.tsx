"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import {
  ArrowRight,
  ShoppingBag,
  Star,
  Calendar,
  Quote,
  Sparkles,
} from "lucide-react";

interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  images: string[];
  rating: number;
}

interface Testimonial {
  _id: string;
  name: string;
  location: string;
  content: string;
  rating: number;
  productRef: string;
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

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [productsRes, testimonialsRes] = await Promise.all([
        fetch("/api/products/featured"),
        fetch("/api/testimonials?featured=true&limit=3"),
      ]);

      const productsData = await productsRes.json();
      const testimonialsData = await testimonialsRes.json();

      setFeaturedProducts(productsData.products || []);
      setTestimonials(testimonialsData.testimonials || []);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Static frame data from original design
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

  return (
    <div className="overflow-hidden">
      {/* Original Hero Section */}
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

      {/* Featured Products */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="py-20"
      >
        <div className="text-center mb-12">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="inline-block text-clay font-medium mb-4 tracking-wider uppercase"
          >
            Handpicked for You
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold text-soil font-serif"
          >
            Featured Collection
          </motion.h2>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-clay border-t-transparent"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-4 md:px-12 max-w-7xl mx-auto">
            {featuredProducts.length > 0 ? (
              featuredProducts.map((product, index) => (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -10 }}
                  className="group"
                >
                  <Link href={`/products/${product.slug || product._id}`}>
                    <div className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
                      <div className="h-56 bg-gradient-to-br from-sand to-sand/50 flex items-center justify-center overflow-hidden relative">
                        {product.images?.[0] && (product.images[0].startsWith("/") || product.images[0].startsWith("http") || product.images[0].startsWith("data:")) ? (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                          />
                        ) : (
                          <div className="text-7xl group-hover:scale-110 transition-transform duration-500">
                            {categoryEmojis[product.category] || "🏺"}
                          </div>
                        )}
                        {product.originalPrice &&
                          product.originalPrice > product.price && (
                            <div className="absolute top-3 left-3 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                              {Math.round(
                                (1 - product.price / product.originalPrice) *
                                  100
                              )}
                              % OFF
                            </div>
                          )}
                      </div>
                      <div className="p-6">
                        <span className="text-xs font-medium text-clay uppercase tracking-wide">
                          {product.category}
                        </span>
                        <h3 className="text-xl font-bold text-soil mt-1 mb-2 group-hover:text-clay transition-colors">
                          {product.name}
                        </h3>
                        <p className="text-sm text-soil/60 mb-3 line-clamp-2">
                          {product.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-bold text-clay">
                              ₹{product.price.toLocaleString()}
                            </span>
                            {product.originalPrice && (
                              <span className="text-sm text-soil/40 line-through">
                                ₹{product.originalPrice.toLocaleString()}
                              </span>
                            )}
                          </div>
                          {product.rating > 0 && (
                            <div className="flex items-center gap-1">
                              <Star
                                size={14}
                                className="fill-yellow-400 text-yellow-400"
                              />
                              <span className="text-sm text-soil/60">
                                {product.rating}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))
            ) : (
              <div className="col-span-3 text-center py-10">
                <p>No featured products found.</p>
              </div>
            )}
          </div>
        )}

        <div className="text-center mt-12">
          <Link href="/products">
            <button className="group inline-flex items-center gap-2 bg-soil text-white px-8 py-4 rounded-full font-semibold hover:bg-clay transition-colors">
              View All Products
              <ArrowRight
                size={20}
                className="group-hover:translate-x-1 transition-transform"
              />
            </button>
          </Link>
        </div>
      </motion.section>

      {/* Why Basho Section */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="py-20 bg-gradient-to-br from-sand/50 to-transparent rounded-3xl mx-4 md:mx-12"
      >
        <div className="max-w-7xl mx-auto p-8 md:p-12 bg-white/95 rounded-2xl border-4 border-[#2b1b14]">
          <div className="text-center mb-12">
            <span className="inline-block text-clay font-medium mb-4 tracking-wider uppercase">
              The Basho Philosophy
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-soil font-serif">
              Why Choose Handcrafted?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4 md:px-8">
            {[
              {
                icon: "🎋",
                title: "Japanese Inspiration",
                description:
                  "Each piece embodies the philosophy of Matsuo Bashō – finding profound beauty in simplicity and the natural world.",
              },
              {
                icon: "🤲",
                title: "Handmade with Care",
                description:
                  "Every item is wheel-thrown or hand-built in our studio, ensuring each piece carries the warmth of human touch.",
              },
              {
                icon: "♻️",
                title: "Sustainable Craft",
                description:
                  "We use locally-sourced clay and eco-friendly glazes, creating pieces that are kind to both you and the earth.",
              },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.15 }}
                className="bg-sand/10 rounded-2xl p-8 text-center hover:shadow-lg transition-shadow border-2 border-[#2b1b14]/20"
              >
                <div className="text-5xl mb-4">{item.icon}</div>
                <h3 className="text-xl font-bold text-soil mb-3">
                  {item.title}
                </h3>
                <p className="text-[#2b1b14]/80">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Experiences CTA */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="py-20 px-4 md:px-12"
      >
        <div className="bg-gradient-to-br from-sand to-sand/50 rounded-3xl overflow-hidden max-w-7xl mx-auto border border-soil/10 relative">
          <div className="absolute inset-0 bg-[url('/pottery-pattern.png')] opacity-10 bg-repeat bg-[length:400px_auto]" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10">
            <div className="p-12 lg:p-16">
              <span className="inline-block text-clay bg-clay/10 px-4 py-2 rounded-full text-sm font-medium mb-6">
                Create Memories
              </span>
              <h2 className="text-4xl md:text-5xl font-bold text-soil mb-6 font-serif">
                Experience the Joy of Making
              </h2>
              <p className="text-lg text-soil/70 mb-8 leading-relaxed">
                From romantic couple dates to team-building workshops, discover
                the meditative art of pottery in our cozy studio.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/workshops">
                  <button className="bg-clay text-white px-8 py-4 rounded-full font-semibold hover:bg-clay/90 transition-colors hover:scale-105">
                    Browse Workshops
                  </button>
                </Link>
                <Link href="/corporate">
                  <button className="btn-outline px-8 py-4 rounded-full">
                    Corporate Inquiries
                  </button>
                </Link>
              </div>
            </div>
            <div className="hidden lg:flex items-center justify-center bg-sand/50 p-12">
              <div className="w-80 h-80">
                <Image
                  src="/Home-Page-icon1.jpeg"
                  alt="Experience icon"
                  width={600}
                  height={600}
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="py-20 px-4 md:px-12"
        >
          <div className="text-center mb-12">
            <span className="inline-block text-clay font-medium mb-4 tracking-wider uppercase">
              What People Say
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-soil font-serif">
              Stories from Our Community
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {testimonials.map((testimonial, idx) => (
              <motion.div
                key={testimonial._id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white rounded-2xl p-8 relative"
              >
                <Quote
                  size={32}
                  className="text-clay/20 absolute top-6 right-6"
                />
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className="fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>
                <p className="text-soil/70 mb-6 italic leading-relaxed">
                  "{testimonial.content}"
                </p>
                <div>
                  <div className="font-semibold text-soil">
                    {testimonial.name}
                  </div>
                  <div className="text-sm text-soil/50">
                    {testimonial.location}
                  </div>
                  {testimonial.productRef && (
                    <div className="text-xs text-clay mt-1">
                      {testimonial.productRef}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>
      )}

      {/* Newsletter */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="py-20 px-4 md:px-12"
      >
        <div className="bg-sand rounded-3xl p-12 text-center max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-soil mb-4 font-serif">
            Stay Connected
          </h2>
          <p className="text-soil/60 mb-8 max-w-lg mx-auto">
            Be the first to know about new collections, upcoming workshops, and
            exclusive offers from Basho.
          </p>
          <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-6 py-4 rounded-full border-2 border-soil/10 focus:border-clay focus:outline-none transition-colors"
              required
            />
            <button
              type="submit"
              className="bg-clay text-white px-8 py-4 rounded-full font-semibold hover:bg-clay/90 transition-colors whitespace-nowrap"
            >
              Subscribe
            </button>
          </form>
        </div>
      </motion.section>
    </div>
  );
}
