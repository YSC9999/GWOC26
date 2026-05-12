"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { ArrowRight, ShoppingBag, Star, Quote } from "lucide-react";
import ProductModal from "@/components/ProductModal";
import Preloader from "@/components/Preloader";
import FeaturedCollections from "@/components/FeaturedCollections";
import OptimizedImage from "@/components/OptimizedImage";

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

export default function Home() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    null,
  );
  const [dynamicFrames, setDynamicFrames] = useState<FrameConfig[]>([]);
  const [showPreloader, setShowPreloader] = useState(false);
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());

  const handleMouseMove = (e: React.MouseEvent) => {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    // Normalize to -0.5 to 0.5
    setMouseX(clientX / innerWidth - 0.5);
    setMouseY(clientY / innerHeight - 0.5);
  };

  useEffect(() => {
    // Always show preloader until data is fetched to prevent layout shifts
    setShowPreloader(true);
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setError(null);
      const [collectionsRes, testimonialsRes, framesRes] = await Promise.all([
        fetch("/api/featured-collections?active=true", { cache: "no-store" }),
        fetch("/api/testimonials?featured=true&limit=3", { cache: "no-store" }),
        fetch("/api/admin/frames", { cache: "no-store" }),
      ]);

      const collectionsData = collectionsRes.ok ? await collectionsRes.json().catch(() => ({})) : {};
      const testimonialsData = testimonialsRes.ok ? await testimonialsRes.json().catch(() => ({})) : {};
      const framesData = framesRes.ok ? await framesRes.json().catch(() => ({})) : {};

      setCollections(collectionsData.collections || []);
      setTestimonials(testimonialsData.testimonials || []);
      setDynamicFrames(framesData.frames || []);
    } catch (error: any) {
      console.warn("Failed to fetch data, using empty fallbacks:", error);
    } finally {
      setLoading(false);
      setShowPreloader(false);
    }
  };

  // Static frame data from original design
  // Static frame data with distinct earthy colors for poster effect
  const frameData = [
    // Row 1
    {
      id: 0,
      width: 130,
      height: 150,
      left: 20,
      top: 10,
      rotation: -4,
      zIndex: 1,
      color: "#F5EDE4",
    }, // Off-white/Beige
    {
      id: 1,
      width: 140,
      height: 140,
      left: 190,
      top: 0,
      rotation: 3,
      zIndex: 2,
      color: "#E6D2C4",
    }, // Light Clay
    {
      id: 2,
      width: 130,
      height: 150,
      left: 360,
      top: 15,
      rotation: -2,
      zIndex: 1,
      color: "#D4C5B9",
    }, // Stone
    // Row 2
    {
      id: 3,
      width: 150,
      height: 130,
      left: 0,
      top: 200,
      rotation: 4,
      zIndex: 2,
      color: "#C9A690",
    }, // Dusty Earth
    {
      id: 4,
      width: 130,
      height: 150,
      left: 180,
      top: 180,
      rotation: -1,
      zIndex: 3,
      color: "#FFFFFF",
    }, // White Accent
    {
      id: 5,
      width: 140,
      height: 140,
      left: 350,
      top: 200,
      rotation: 3,
      zIndex: 2,
      color: "#E0D8D0",
    }, // Light Greyish
    // Row 3
    {
      id: 6,
      width: 130,
      height: 140,
      left: 30,
      top: 380,
      rotation: -5,
      zIndex: 1,
      color: "#DDBEA9",
    }, // Warm Beige
    {
      id: 7,
      width: 150,
      height: 130,
      left: 200,
      top: 370,
      rotation: 2,
      zIndex: 2,
      color: "#F0EAD6",
    }, // Eggshell
    {
      id: 8,
      width: 130,
      height: 150,
      left: 380,
      top: 390,
      rotation: -3,
      zIndex: 1,
      color: "#CB997E",
    }, // Terracotta tint
  ];

  if (showPreloader) {
    return <Preloader />;
  }

  return (
    <div className="overflow-hidden">
      {/* Original Hero Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative w-full px-4 md:px-12 pt-6 md:pt-10 pb-10 md:pb-16"
        onMouseMove={handleMouseMove}
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Left Content */}
            <div className="relative z-10 pt-14">
              <motion.h1
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.8 }}
                className="text-3xl xs:text-4xl sm:text-5xl md:text-5xl text-center lg:text-6xl xl:text-7xl font-bold text-brick mb-4 md:mb-6 leading-tight"
                style={{ fontFamily: "var(--font-kaushan-script)" }}
              >
                A Quiet Splash
                <span className="block mt-2">in Every Piece</span>
              </motion.h1>
              <br />
              <motion.p
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className="text-sm md:text-lg lg:text-xl text-center text-soil/160 mb-4 md:mb-8"
                style={{ fontFamily: "var(--font-berkshire-swash)" }}
              >
                Artistry for the home and the self. Discover a curated
                collection of fashion designed to reflect your unique story with
                grace and intention crafted with love and affection.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.8 }}
                className="flex flex-col sm:flex-row gap-6 items-center justify-center"
              >
                <Link href="/products">
                  <button className="flex items-center gap-2 px-5 py-2.5 md:px-8 md:py-4 text-sm md:text-lg hover:scale-105 transition-transform bg-[#8B4513] text-white rounded-full font-semibold hover:bg-[#7A3A0F]">
                    SHOP NOW
                    <ShoppingBag size={16} className="md:w-5 md:h-5" />
                  </button>
                </Link>
                <Link href="/workshops">
                  <button className="flex items-center gap-2 px-5 py-2.5 md:px-8 md:py-4 text-sm md:text-lg hover:scale-105 transition-transform border-2 border-[#8B4513] text-[#8B4513] rounded-full font-semibold hover:bg-[#8B4513] hover:text-white">
                    Workshop
                    <ArrowRight size={16} className="md:w-5 md:h-5" />
                  </button>
                </Link>
              </motion.div>
            </div>

            {/* Right Image Grid - Responsive Handling */}
            <div className="relative w-full mt-8 md:mt-0">
              {/* Mobile/Small Tablet View (Grid Layout) */}
              <div className="grid grid-cols-3 gap-3 md:hidden max-w-sm mx-auto">
                {frameData.map((frame, index) => {
                  const configuredFrame = Array.isArray(dynamicFrames)
                    ? dynamicFrames.find((f) => f.frameId === frame.id)
                    : undefined;
                  const product = configuredFrame?.product;

                  return (
                    <motion.div
                      key={`mobile-${frame.id}`}
                      initial={{ scale: 0, opacity: 0, rotate: 0 }}
                      animate={{
                        scale: 1,
                        opacity: 1,
                        rotate: frame.rotation,
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 90,
                        damping: 15,
                        delay: index * 0.05,
                      }}
                      whileHover={{ scale: 1.05 }}
                      className="relative w-full aspect-[0.85] p-[3px] shadow-md rounded-[3px] overflow-hidden border-[0.5px] border-black/10"
                      style={{ backgroundColor: frame.color }}
                      onClick={() =>
                        product && setSelectedProductId(product._id)
                      }
                    >
                      <div className="w-full h-full overflow-hidden relative shadow-sm rounded-[1px]">
                          {product && product.images?.[0] ? (
                            <OptimizedImage
                              src={product.images[0]}
                              alt={product.name || "Product"}
                              priority={index < 3}
                              containerClassName="w-full h-full"
                              className="filter contrast-[1.05] brightness-105"
                              onLoad={() => {
                                setLoadedImages((prev) => new Set(prev).add(product._id));
                              }}
                            />
                          ) : null}
                        <div
                          className={`w-full h-full flex items-center justify-center bg-gray-100 text-[#5A3E36]/20 text-2xl ${product && product.images?.[0] && loadedImages.has(product._id) ? "hidden" : ""}`}
                        >
                          🍯
                        </div>
                        <div className="absolute inset-0 shadow-[inset_0_0_10px_rgba(0,0,0,0.05)] pointer-events-none"></div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Desktop/Landscape View (Scattered Layout - Preserved) */}
              <div className="hidden md:block relative w-full h-[600px]">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5, duration: 1 }}
                  className="absolute inset-0 w-full h-full"
                >
                  {frameData.map((frame, index) => {
                    const configuredFrame = Array.isArray(dynamicFrames)
                      ? dynamicFrames.find((f) => f.frameId === frame.id)
                      : undefined;
                    const product = configuredFrame?.product;

                    const centerX = 255;
                    const centerY = 270;

                    const revealVariants = {
                      initial: {
                        opacity: 0,
                        scale: 0.1,
                        x: centerX - (frame.left + frame.width / 2),
                        y: centerY - (frame.top + frame.height / 2),
                        rotate: 0,
                      },
                      animate: {
                        opacity: 1,
                        scale: 1,
                        x: 0,
                        y: 0,
                        rotate: frame.rotation,
                        transition: {
                          type: "spring",
                          stiffness: 90,
                          damping: 15,
                          mass: 1.0,
                          delay: 0.1 + index * 0.06,
                        } as any,
                      },
                    };

                    return (
                      <motion.div
                        key={frame.id}
                        initial="initial"
                        animate="animate"
                        variants={revealVariants}
                        whileHover={{
                          scale: 1.1,
                          zIndex: 50,
                          rotate: 0,
                          transition: { duration: 0.3 },
                        }}
                        transition={{ duration: 0 }}
                        className="absolute p-[3px] shadow-md hover:shadow-xl transition-all duration-300 transform origin-center rounded-[3px] overflow-hidden border-[0.5px] border-black/10"
                        style={{
                          backgroundColor: frame.color,
                          width: `${frame.width}px`,
                          height: `${frame.height}px`,
                          left: `${frame.left}px`,
                          top: `${frame.top}px`,
                          zIndex: frame.zIndex,
                        }}
                        onClick={() => {
                          if (product) {
                            setSelectedProductId(product._id);
                          }
                        }}
                      >
                        <div className="w-full h-full overflow-hidden relative cursor-pointer shadow-sm rounded-[1px]">
                          {product && product.images?.[0] ? (
                            <OptimizedImage
                              src={product.images[0]}
                              alt={product.name || "Product"}
                              priority={index < 3}
                              containerClassName="w-full h-full"
                              className="filter contrast-[1.05] brightness-105"
                              onLoad={() => {
                                setLoadedImages((prev) => new Set(prev).add(product._id));
                              }}
                            />
                          ) : null}
                          <div
                            className={`w-full h-full flex items-center justify-center bg-gray-100 text-[#5A3E36]/20 text-4xl absolute inset-0 ${product && product.images?.[0] && loadedImages.has(product._id) ? "hidden" : ""}`}
                          >
                            🍯
                          </div>
                          {/* Shadow overlay for depth */}
                          <div className="absolute inset-0 shadow-[inset_0_0_20px_rgba(0,0,0,0.05)] pointer-events-none"></div>
                        </div>
                      </motion.div>
                    );
                  })}
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Featured Collections Grid */}
      <FeaturedCollections
        collections={collections}
        loading={loading}
        error={error}
      />

      {/* Matsuo Bashō - The Poet Who Inspires Us */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="py-10 md:py-16 px-4 md:px-12"
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            {/* Bashō Image */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-[#2b1b14]/10">
                <Image
                  src="/Basho-poet.jpeg"
                  alt="Matsuo Bashō - The Haiku Master"
                  width={600}
                  height={700}
                  className="w-full h-auto object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#2b1b14]/60 via-transparent to-transparent" />
                <div className="absolute top-4 sm:top-6 md:top-7 left-4 sm:left-6 md:left-8 right-4 sm:right-8 md:right-20 group/haiku cursor-pointer">
                  {/* Japanese version - visible by default */}
                  <p className="text-soil/130 text-sm xs:text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl font-bold font-serif transform transition-all duration-500 group-hover/haiku:opacity-0 group-hover/haiku:-translate-y-2 group-hover/haiku:blur-sm">
                    古池や
                    <br />
                    蛙飛びこむ
                    <br />
                    水の音
                  </p>
                  {/* English version - visible on hover */}
                  <p className="text-soil/130 text-sm xs:text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl font-bold italic font-serif absolute top-0 left-0 opacity-0 translate-y-2 blur-sm transition-all duration-500 group-hover/haiku:opacity-100 group-hover/haiku:translate-y-0 group-hover/haiku:blur-0">
                    "The old pond—
                    <br />
                    A frog jumps in,
                    <br />
                    Sound of water."
                  </p>
                  <p className="text-soil/110 text-sm mt-2 transition-all duration-300 group-hover/haiku:text-clay">
                    — 松尾芭蕉
                    <br />
                    (Matsuo Bashō)
                  </p>
                  {/* Hover hint */}
                  <span className="absolute -bottom-6 left-0 text-[10px] text-soil/50 opacity-0 group-hover/haiku:opacity-0 animate-pulse">
                    Hover for translation
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Bashō Content */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-6 text-center lg:text-center"
            >
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-soil font-serif leading-tight">
                Matsuo Bashō
                <br />
                <span className="text-clay">俳聖 The Haiku Saint</span>
              </h2>
              <div className="space-y-4 text-[#652810] leading-relaxed">
                <p>
                  <strong className="text-[#652810]">
                    Matsuo Bashō (1644–1694)
                  </strong>{" "}
                  was Japan's most celebrated haiku poet, whose work transformed
                  simple observations of nature into profound meditations on
                  existence.
                </p>
                <p>
                  His philosophy of{" "}
                  <em className="text-clay font-medium">wabi-sabi</em> — finding
                  beauty in imperfection and transience — deeply influences
                  every piece we create. Like his poems, our pottery celebrates
                  the authentic, the handmade, and the beautifully imperfect.
                </p>
                <p>
                  Bashō believed that true art emerges from deep connection with
                  nature and mindful presence. Each bowl we shape, each cup we
                  glaze, honors this tradition of thoughtful creation.
                </p>
              </div>
              <div className="flex flex-wrap gap-4 pt-4 justify-center">
                <div className="bg-sand/70 px-6 py-3 rounded-2xl border border-soil/60 text-center">
                  <span className="text-2xl">🎋</span>
                  <p className="text-sm text-soil/90 mt-1">Wabi-Sabi</p>
                </div>
                <div className="bg-sand/70 px-6 py-3 rounded-2xl border border-soil/60 text-center">
                  <span className="text-2xl">🍃</span>
                  <p className="text-sm text-soil/90 mt-1">Naturalism</p>
                </div>
                <div className="bg-sand/70 px-6 py-3 rounded-2xl border border-soil/60 text-center">
                  <span className="text-2xl">🧘</span>
                  <p className="text-sm text-soil/90 mt-1">Mindfulness</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Quote */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="py-10 md:py-16 text-center bg-soil/100 rounded-3xl p-8 border border-clay/70 overflow-hidden"
      >
        <Quote className="w-12 h-12 text-clay/50 mx-auto mb-4" />
        <p className="text-lg sm:text-xl md:text-2xl italic font-serif text-white/90 max-w-3xl mx-auto">
          "Do not seek to follow in the footsteps of the wise
          <br />
          seek what they sought."
        </p>
        <p className="text-clay mt-4 font-medium">— Matsuo Bashō</p>
      </motion.div>
      <br />
      <br />
      {/* Three Pillars of Our Craft */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-10 md:py-16">
        {/* Pillar 1: Japanese Inspiration */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-[#F5EDE4] rounded-3xl p-8 hover:shadow-2xl hover:shadow-black/20 transition-all group border-2 border-clay/70"
        >
          <div className="w-16 h-16 bg-[#2b1b14] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <span className="text-3xl">🏯</span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold mb-4 font-serif text-[#2b1b14]">
            Japanese Inspiration
          </h3>
          <p className="text-[#2b1b14]/80 leading-relaxed mb-4">
            Our designs draw from centuries of Japanese ceramic traditions —
            from the rustic beauty of
            <em className="text-[#8B4513] font-semibold"> Bizen-yaki</em> to the
            refined elegance of{" "}
            <em className="text-[#8B4513] font-semibold">Arita porcelain</em>.
          </p>
          <ul className="space-y-2 text-sm text-[#2b1b14]/70">
            <li className="flex items-center gap-2">
              <span className="text-[#8B4513]">◈</span> Minimalist aesthetics
            </li>
            <li className="flex items-center gap-2">
              <span className="text-[#8B4513]">◈</span> Natural earth tones
            </li>
            <li className="flex items-center gap-2">
              <span className="text-[#8B4513]">◈</span> Functional beauty
            </li>
          </ul>
        </motion.div>

        {/* Pillar 2: Handcrafted Honor */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-[#F5EDE4] rounded-3xl p-8 hover:shadow-2xl hover:shadow-black/20 transition-all group border-2 border-clay/70"
        >
          <div className="w-16 h-16 bg-[#2b1b14] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <span className="text-3xl">🤲</span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold mb-4 font-serif text-[#2b1b14]">
            Handcrafted with Honor
          </h3>
          <p className="text-[#2b1b14]/80 leading-relaxed mb-4">
            Each piece passes through caring hands — wedging, centering,
            throwing, trimming, glazing, and firing. No two pieces are ever
            identical.
          </p>
          <ul className="space-y-2 text-sm text-[#2b1b14]/70">
            <li className="flex items-center gap-2">
              <span className="text-[#8B4513]">◈</span> Wheel-thrown &
              hand-built
            </li>
            <li className="flex items-center gap-2">
              <span className="text-[#8B4513]">◈</span> High-fire stoneware
            </li>
            <li className="flex items-center gap-2">
              <span className="text-[#8B4513]">◈</span> Food-safe glazes
            </li>
          </ul>
        </motion.div>

        {/* Pillar 3: Brand Essence */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-[#F5EDE4] rounded-3xl p-8 hover:shadow-2xl hover:shadow-black/20 transition-all group border-2 border-clay/70"
        >
          <div className="w-16 h-16 bg-[#2b1b14] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <span className="text-3xl">✨</span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold mb-4 font-serif text-[#2b1b14]">
            The Basho Essence
          </h3>
          <p className="text-[#2b1b14]/80 leading-relaxed mb-4">
            More than pottery — we create vessels for life's quiet moments. A
            morning tea ritual, a shared meal, a pause to appreciate beauty.
          </p>
          <ul className="space-y-2 text-sm text-[#2b1b14]/70">
            <li className="flex items-center gap-2">
              <span className="text-[#8B4513]">◈</span> Mindful living
            </li>
            <li className="flex items-center gap-2">
              <span className="text-[#8B4513]">◈</span> Sustainable practice
            </li>
            <li className="flex items-center gap-2">
              <span className="text-[#8B4513]">◈</span> Artisan integrity
            </li>
          </ul>
        </motion.div>
      </div>

      {/* Know More About Basho */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="mt-20 mb-16 py-12 md:py-16 px-4 md:px-8 relative overflow-hidden rounded-3xl mx-4 md:mx-8 border-2 border-[#C97C5D]"
        style={{
          background:
            "linear-gradient(135deg, #1a0f0a 0%, #2b1b14 50%, #3d2a1f 100%)",
        }}
      >
        {/* Decorative torn paper edge effect at top */}
        <div
          className="absolute top-0 left-0 right-0 h-6 bg-[#F5EDE4] rounded-t-3xl"
          style={{
            clipPath:
              "polygon(0 0, 100% 0, 100% 40%, 97% 80%, 94% 50%, 90% 90%, 85% 40%, 80% 70%, 75% 30%, 70% 80%, 65% 50%, 60% 90%, 55% 40%, 50% 70%, 45% 30%, 40% 80%, 35% 50%, 30% 90%, 25% 40%, 20% 70%, 15% 30%, 10% 80%, 5% 50%, 0 100%)",
          }}
        />

        {/* Decorative torn paper edge effect on left */}
        <div
          className="absolute top-0 bottom-0 left-0 w-6 bg-[#F5EDE4]"
          style={{
            clipPath:
              "polygon(0 0, 100% 0, 40% 3%, 80% 6%, 50% 10%, 90% 15%, 40% 20%, 70% 25%, 30% 30%, 80% 35%, 50% 40%, 90% 45%, 40% 50%, 70% 55%, 30% 60%, 80% 65%, 50% 70%, 90% 75%, 40% 80%, 70% 85%, 30% 90%, 80% 94%, 50% 97%, 0 100%)",
          }}
        />

        {/* Decorative torn paper edge effect on right */}
        <div
          className="absolute top-0 bottom-0 right-0 w-6 bg-[#F5EDE4]"
          style={{
            clipPath:
              "polygon(100% 0, 0% 0, 60% 3%, 20% 6%, 50% 10%, 10% 15%, 60% 20%, 30% 25%, 70% 30%, 20% 35%, 50% 40%, 10% 45%, 60% 50%, 30% 55%, 70% 60%, 20% 65%, 50% 70%, 10% 75%, 60% 80%, 30% 85%, 70% 90%, 20% 94%, 50% 97%, 100% 100%)",
          }}
        />

        {/* Scattered decorative elements */}
        <div className="absolute top-20 left-[10%] w-3 h-3 bg-[#8B4513]/40 rounded-full" />
        <div className="absolute top-32 right-[15%] w-2 h-2 bg-[#C97C5D]/30 rounded-full" />
        <div className="absolute bottom-24 left-[20%] w-4 h-4 bg-[#8B4513]/20 rounded-full" />
        <div className="absolute top-1/2 right-[8%] w-2 h-2 bg-[#F5EDE4]/20 rounded-full" />

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            {/* Left side - Handwritten style content */}
            <motion.div
              initial={{ opacity: 0, rotate: -2 }}
              whileInView={{ opacity: 1, rotate: 0 }}
              transition={{ duration: 0.6 }}
              className="flex-1 relative"
            >
              {/* Paper-like card with slight rotation */}
              <div
                className="bg-[#F5EDE4] p-8 md:p-12 relative shadow-2xl"
                style={{ transform: "rotate(-1deg)" }}
              >
                {/* Tape effect at top */}
                <div
                  className="absolute -top-3 left-1/2 -translate-x-1/2 w-20 h-8 bg-[#e8dfd3]/80 shadow-sm"
                  style={{ transform: "rotate(2deg)" }}
                />

                {/* Japanese brush stroke accent */}
                <div className="absolute top-4 right-4 text-6xl text-[#2b1b14]/10 font-serif">
                  道
                </div>

                <p className="text-[#8B4513] text-sm tracking-[0.3em] uppercase mb-4">
                  The path of clay
                </p>

                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif text-[#1a0f0a] mb-6 leading-tight">
                  Every pot has
                  <br />
                  <span className="relative inline-block">
                    a story
                    <svg
                      className="absolute -bottom-2 left-0 w-full"
                      height="8"
                      viewBox="0 0 100 8"
                      preserveAspectRatio="none"
                    >
                      <path
                        d="M0,5 Q25,0 50,5 T100,5"
                        stroke="#8B4513"
                        strokeWidth="2"
                        fill="none"
                      />
                    </svg>
                  </span>
                </h2>

                <p className="text-[#2b1b14]/70 text-lg leading-relaxed mb-8">
                  Behind the wheel, beneath the glaze, there's a person who
                  chose to slow down. We'd love to share that journey with you.
                </p>

                {/* Handwritten arrow pointing to button */}
                <div className="flex items-center gap-4">
                  <Link href="/about">
                    <button className="group bg-[#1a0f0a] text-[#F5EDE4] px-8 py-4 font-medium hover:bg-[#8B4513] transition-all inline-flex items-center gap-3 text-lg">
                      Read our story
                      <span className="group-hover:translate-x-2 transition-transform">
                        →
                      </span>
                    </button>
                  </Link>
                </div>

                {/* Coffee stain effect */}
                <div
                  className="absolute -bottom-4 -right-4 w-16 h-16 rounded-full border-4 border-[#8B4513]/20"
                  style={{ borderStyle: "double" }}
                />
              </div>
            </motion.div>

            {/* Right side - Polaroid style image stack */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative w-72 h-80 hidden md:block"
            >
              {/* Back polaroid */}
              <div
                className="absolute top-4 left-4 w-56 h-64 bg-[#F5EDE4] p-3 shadow-xl"
                style={{ transform: "rotate(8deg)" }}
              >
                <div className="w-full h-44 bg-[#2b1b14]/20" />
                <p className="text-center text-[#2b1b14]/60 text-sm mt-3 font-serif italic">
                  The first bowl, 2019
                </p>
              </div>

              {/* Front polaroid */}
              <div
                className="absolute top-0 left-0 w-56 h-64 bg-[#F5EDE4] p-3 shadow-2xl"
                style={{ transform: "rotate(-4deg)" }}
              >
                <div className="w-full h-44 bg-gradient-to-br from-[#8B4513]/30 to-[#2b1b14]/40 flex items-center justify-center">
                  <span className="text-6xl">🏺</span>
                </div>
                <p className="text-center text-[#2b1b14]/80 text-sm mt-3 font-serif">
                  Our studio today
                </p>
              </div>

              {/* Decorative pin */}
              <div className="absolute -top-2 left-24 w-4 h-4 bg-[#8B4513] rounded-full shadow-lg z-10" />
            </motion.div>
          </div>
        </div>

        {/* Decorative torn paper edge effect at bottom */}
        <div
          className="absolute bottom-0 left-0 right-0 h-6 bg-[#F5EDE4] rounded-b-3xl"
          style={{
            clipPath:
              "polygon(0 100%, 100% 100%, 100% 60%, 97% 20%, 94% 50%, 90% 10%, 85% 60%, 80% 30%, 75% 70%, 70% 20%, 65% 50%, 60% 10%, 55% 60%, 50% 30%, 45% 70%, 40% 20%, 35% 50%, 30% 10%, 25% 60%, 20% 30%, 15% 70%, 10% 20%, 5% 50%, 0 0)",
          }}
        />
      </motion.section>

      {/* Product Modal */}
      <ProductModal
        productId={selectedProductId}
        onClose={() => setSelectedProductId(null)}
      />
    </div>
  );
}
