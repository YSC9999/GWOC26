"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { ArrowRight, ShoppingBag, Star, Quote, Sparkles } from "lucide-react";
import ProductModal from "@/components/ProductModal";
import Preloader from "@/components/Preloader";
import FeaturedCollections from "@/components/FeaturedCollections";

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
  stockQuantity?: number;
}

interface Collection {
  _id: string;
  title: string;
  slug: string;
  description: string;
  products: Product[];
}

interface Testimonial {
  _id: string;
  name: string;
  location: string;
  content: string;
  rating: number;
  productRef: string;
}

interface FrameConfig {
  frameId: number;
  product?: Product;
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
  const [collections, setCollections] = useState<Collection[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    null
  );
  const [dynamicFrames, setDynamicFrames] = useState<FrameConfig[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [collectionsRes, testimonialsRes, framesRes] = await Promise.all([
        fetch("/api/featured-collections?active=true"),
        fetch("/api/testimonials?featured=true&limit=3"),
        fetch("/api/admin/frames"),
      ]);

      const collectionsData = await collectionsRes.json();
      const testimonialsData = await testimonialsRes.json();
      const framesData = await framesRes.json();

      setCollections(collectionsData.collections || []);
      setTestimonials(testimonialsData.testimonials || []);
      setDynamicFrames(framesData.frames || []);

      // Image preloading removed to speed up initial render
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

  if (loading) {
    return <Preloader />;
  }

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
                className="text-3xl md:text-6xl lg:text-7xl font-serif font-bold text-soil mb-4 md:mb-6 leading-tight italic"
              >
                A Quiet Splash
                <br />
                in Every Piece
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className="text-sm md:text-lg lg:text-xl text-soil/80 mb-6 md:mb-12 font-light"
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
                  <button className="btn-primary flex items-center gap-2 px-5 py-2.5 md:px-8 md:py-4 text-sm md:text-lg hover:scale-105 transition-transform">
                    SHOP NOW
                    <ShoppingBag size={16} className="md:w-5 md:h-5" />
                  </button>
                </Link>
                <Link href="/custom-orders">
                  <button className="btn-secondary flex items-center gap-2 px-5 py-2.5 md:px-8 md:py-4 text-sm md:text-lg hover:scale-105 transition-transform">
                    CUSTOM ORDER
                    <ArrowRight size={16} className="md:w-5 md:h-5" />
                  </button>
                </Link>
              </motion.div>
            </div>

            {/* Right Image Grid - Responsive Handling */}
            <div className="relative pt-12 w-full min-h-[50vh] md:h-screen md:pt-12">

              {/* Desktop: Absolute Positioned Scattered Frames */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className="hidden md:block relative w-full h-full scale-90 lg:scale-100 origin-top-left"
              >
                {frameData.map((frame) => {
                  const configuredFrame = dynamicFrames.find(
                    (f) => f.frameId === frame.id
                  );
                  const product = configuredFrame?.product;

                  return (
                    <motion.div
                      key={frame.id}
                      initial={{ opacity: 0, scale: 0.6, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      whileHover={{
                        scale: 1.25,
                        zIndex: 50,
                        transition: {
                          duration: 0.01,
                          type: "spring",
                          stiffness: 500,
                          damping: 10,
                        },
                      }}
                      transition={{
                        delay: frame.id * 0.005,
                        duration: 0.1,
                        type: "spring",
                        stiffness: 400,
                        damping: 15,
                      }}
                      className="absolute rounded-lg overflow-hidden border-2 border-soil/30 shadow-md hover:shadow-2xl transition-all cursor-pointer group"
                      style={{
                        backgroundColor: product ? "white" : frame.color,
                        width: `${frame.width}px`,
                        height: `${frame.height}px`,
                        left: `${frame.left}px`,
                        top: `${frame.top}px`,
                      }}
                      onClick={() => {
                        if (product) {
                          setSelectedProductId(product._id);
                        }
                      }}
                    >
                      {product ? (
                        <>
                          <img
                            src={product.images?.[0]}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white text-xs font-semibold opacity-0 hover:opacity-75 transition-opacity bg-black/30">
                          {frame.id + 1}
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </motion.div>

              {/* Mobile: Simple Grid Layout */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="md:hidden grid grid-cols-3 gap-3"
              >
                {frameData.map((frame) => {
                  const configuredFrame = dynamicFrames.find(
                    (f) => f.frameId === frame.id
                  );
                  const product = configuredFrame?.product;

                  // Skip empty frames on mobile to save space if desired, or show colored blocks
                  if (!product && !frame.color) return null;

                  return (
                    <motion.div
                      key={frame.id}
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: frame.id * 0.05 }}
                      className="aspect-square rounded-lg overflow-hidden border border-soil/20 shadow-sm"
                      style={{ backgroundColor: product ? "white" : frame.color }}
                      onClick={() => {
                        if (product) {
                          setSelectedProductId(product._id);
                        }
                      }}
                    >
                      {product && (
                        <img
                          src={product.images?.[0]}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </motion.div>
                  );
                })}
              </motion.div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Featured Collections Grid */}
      <FeaturedCollections collections={collections} />

      {/* Why Basho Section */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="py-12 bg-gradient-to-br from-sand/50 to-transparent rounded-3xl mx-4 md:mx-12"
      >
        <div className="max-w-6xl mx-auto p-6 md:p-8 bg-white/95 rounded-2xl border-2 border-[#2b1b14]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-8"
          >
            <span className="inline-block text-clay font-medium mb-2 tracking-wider uppercase text-sm">
              The Basho Philosophy
            </span>
            <h2 className="text-2xl md:text-4xl font-bold text-soil font-serif">
              Why Choose Handcrafted?
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-4 md:px-6">
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
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                whileHover={{ y: -5, scale: 1.02 }}
                transition={{ delay: idx * 0.1, duration: 0.4 }}
                className="bg-sand/10 rounded-2xl p-6 text-center hover:shadow-xl hover:bg-sand/20 transition-all border-2 border-[#2b1b14]/20"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  transition={{
                    delay: idx * 0.1 + 0.2,
                    type: "spring",
                    stiffness: 200,
                  }}
                  className="text-4xl mb-3"
                >
                  {item.icon}
                </motion.div>
                <h3 className="text-lg font-bold text-soil mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-[#2b1b14]/80">{item.description}</p>
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
              <h2 className="text-3xl md:text-5xl font-bold text-soil mb-6 font-serif">
                Experience the Joy of Making
              </h2>
              <p className="text-sm md:text-lg text-soil/70 mb-6 md:mb-8 leading-relaxed">
                From romantic couple dates to team-building workshops, discover
                the meditative art of pottery in our cozy studio.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/workshops">
                  <button className="bg-clay text-white px-6 py-3 md:px-8 md:py-4 rounded-full font-semibold hover:bg-clay/90 transition-colors hover:scale-105 text-sm md:text-base">
                    Browse Workshops
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
          <div className="text-center mb-16">
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-block text-clay font-medium mb-4 tracking-wider uppercase"
            >
              What People Say
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-3xl md:text-5xl font-bold text-soil font-serif"
            >
              Stories from Our Community
            </motion.h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {testimonials.map((testimonial, idx) => (
              <motion.div
                key={testimonial._id}
                initial={{ opacity: 0, y: 40, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                whileHover={{
                  y: -8,
                  boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
                  transition: { duration: 0.3 },
                }}
                transition={{
                  delay: idx * 0.15,
                  duration: 0.6,
                  type: "spring",
                }}
                className="relative p-8 rounded-3xl border border-soil/10 bg-white/80 backdrop-blur-sm"
              >
                <motion.div
                  initial={{ rotate: 0 }}
                  whileHover={{ rotate: 12, scale: 1.1 }}
                  transition={{ duration: 0.3 }}
                  className="absolute top-6 right-6"
                >
                  <Quote size={36} className="text-clay/30" />
                </motion.div>

                <motion.div
                  className="flex items-center gap-1 mb-5"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ delay: idx * 0.15 + 0.3 }}
                >
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.15 + 0.4 + i * 0.05 }}
                    >
                      <Star
                        size={18}
                        className="fill-yellow-400 text-yellow-400"
                      />
                    </motion.div>
                  ))}
                </motion.div>

                <p className="text-soil/80 mb-6 italic leading-relaxed text-base md:text-lg">
                  "{testimonial.content}"
                </p>

                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.15 + 0.5 }}
                  className="border-t border-soil/10 pt-4"
                >
                  <div className="font-bold text-soil text-lg">
                    {testimonial.name}
                  </div>
                  <div className="text-sm text-soil/60">
                    {testimonial.location}
                  </div>
                  {testimonial.productRef && (
                    <div className="text-xs text-clay mt-2 font-medium">
                      ✦ {testimonial.productRef}
                    </div>
                  )}
                </motion.div>
              </motion.div>
            ))}
          </div>
        </motion.section>
      )}

      {/* Know More About Basho */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="py-20 px-4 md:px-12"
      >
        <div className="bg-gradient-to-br from-sand to-sand/60 rounded-3xl p-12 text-center max-w-4xl mx-auto border border-soil/10">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Sparkles className="mx-auto text-clay mb-4" size={40} />
          </motion.div>
          <h2 className="text-2xl md:text-4xl font-bold text-soil mb-4 font-serif">
            Know More About Basho
          </h2>
          <p className="text-soil/70 mb-6 md:mb-8 max-w-lg mx-auto text-sm md:text-lg">
            Discover our philosophy, meet the artist, and learn about the
            journey behind every handcrafted piece of pottery.
          </p>
          <Link href="/about">
            <button className="bg-soil text-white px-6 py-3 md:px-8 md:py-4 rounded-full font-semibold hover:bg-clay transition-colors inline-flex items-center gap-2 hover:scale-105 transform text-sm md:text-base">
              Explore Our Story
              <ArrowRight size={20} />
            </button>
          </Link>
        </div>
      </motion.section>

      {/* Product Modal */}
      <ProductModal
        productId={selectedProductId}
        onClose={() => setSelectedProductId(null)}
      />
    </div>
  );
}
