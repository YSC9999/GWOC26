"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { ArrowRight, ShoppingBag, Star, Quote } from "lucide-react";
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
  const [showPreloader, setShowPreloader] = useState(false);
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);

  const handleMouseMove = (e: React.MouseEvent) => {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    // Normalize to -0.5 to 0.5
    setMouseX((clientX / innerWidth) - 0.5);
    setMouseY((clientY / innerHeight) - 0.5);
  };

  useEffect(() => {
    // Always show preloader until data is fetched to prevent layout shifts
    setShowPreloader(true);
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Check session storage for cached data
      const cachedCollections = sessionStorage.getItem("home_collections");
      const cachedTestimonials = sessionStorage.getItem("home_testimonials");
      const cachedFrames = sessionStorage.getItem("home_frames");

      if (cachedCollections && cachedTestimonials && cachedFrames) {
        setCollections(JSON.parse(cachedCollections));
        setTestimonials(JSON.parse(cachedTestimonials));
        setDynamicFrames(JSON.parse(cachedFrames));
        setLoading(false);
        setShowPreloader(false);
        return;
      }

      const [collectionsRes, testimonialsRes, framesRes] = await Promise.all([
        fetch("/api/featured-collections?active=true"),
        fetch("/api/testimonials?featured=true&limit=3"),
        fetch("/api/admin/frames"),
      ]);

      const collectionsData = await collectionsRes.json();
      const testimonialsData = await testimonialsRes.json();
      const framesData = await framesRes.json();

      const newCollections = collectionsData.collections || [];
      const newTestimonials = testimonialsData.testimonials || [];
      const newFrames = framesData.frames || [];

      setCollections(newCollections);
      setTestimonials(newTestimonials);
      setDynamicFrames(newFrames);

      // Cache the data
      sessionStorage.setItem(
        "home_collections",
        JSON.stringify(newCollections)
      );
      sessionStorage.setItem(
        "home_testimonials",
        JSON.stringify(newTestimonials)
      );
      sessionStorage.setItem("home_frames", JSON.stringify(newFrames));

      // Preload images for frames
      if (newFrames && Array.isArray(newFrames)) {
        const imagePromises = newFrames
          .filter((frame: any) => frame.product?.images?.[0])
          .map((frame: any) => {
            return new Promise((resolve, reject) => {
              const img = new window.Image();
              img.src = frame.product.images[0];
              img.onload = resolve;
              img.onerror = resolve; // Continue even if one fails
            });
          });

        // Wait for images to load, but set a timeout to avoid hanging forever
        await Promise.race([
          Promise.all(imagePromises),
          new Promise((resolve) => setTimeout(resolve, 3000)), // 3s max wait time
        ]);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
      setShowPreloader(false);
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
                className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-soil mb-4 md:mb-6 leading-tight"
                style={{ fontFamily: "var(--font-kaushan-script)" }}
              >
                A Quiet Splash
                <span className="block mt-2">in Every Piece</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className="text-sm md:text-lg lg:text-xl text-[#652810] mb-4 md:mb-8"
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
                className="flex flex-col sm:flex-row gap-6 items-start"
              >
                <Link href="/products">
                  <button className="btn-primary flex items-center gap-2 px-5 py-2.5 md:px-8 md:py-4 text-sm md:text-lg hover:scale-105 transition-transform">
                    SHOP NOW
                    <ShoppingBag size={16} className="md:w-5 md:h-5" />
                  </button>
                </Link>
                <Link href="/workshops">
                  <button className="btn-secondary flex items-center gap-2 px-5 py-2.5 md:px-8 md:py-4 text-sm md:text-lg hover:scale-105 transition-transform">
                    Workshop
                    <ArrowRight size={16} className="md:w-5 md:h-5" />
                  </button>
                </Link>
              </motion.div>
            </div>

            {/* Right Image Grid - Responsive Handling */}
            <div className="relative pt-12 w-full min-h-[400px] md:h-[500px] md:pt-6">
              {/* Desktop: Absolute Positioned Scattered Frames */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className="hidden md:block relative w-full h-full scale-90 lg:scale-100 origin-top-left"
              >
                {frameData.map((frame, index) => {
                  const configuredFrame = dynamicFrames.find(
                    (f) => f.frameId === frame.id
                  );
                  const product = configuredFrame?.product;

                  const revealVariants = {
                    initial: {
                      opacity: 0,
                      scale: 0.4,
                      z: -500,
                      rotateX: 80,
                      rotateY: index % 2 === 0 ? 30 : -30,
                      rotate: index % 2 === 0 ? 15 : -15,
                      x: (180 - frame.left) * 0.8,
                      y: (180 - frame.top) * 0.8,
                    },
                    animate: {
                      opacity: 1,
                      scale: 1,
                      z: 0,
                      rotateX: 0,
                      rotateY: 0,
                      rotate: 0,
                      x: 0,
                      y: 0,
                      transition: {
                        delay: 0.2 + index * 0.04,
                        duration: 1.4,
                        type: "spring",
                        stiffness: 75,
                        damping: 18,
                        mass: 0.9
                      } as any
                    }
                  };

                  return (
                    <motion.div
                      key={frame.id}
                      initial="initial"
                      animate="animate"
                      variants={revealVariants}
                      className="absolute rounded-lg overflow-hidden border-2 border-soil/20 shadow-xl cursor-pointer group"
                      style={{
                        width: `${frame.width}px`,
                        height: `${frame.height}px`,
                        left: `${frame.left}px`,
                        top: `${frame.top}px`,
                        perspective: "1200px",
                        transformStyle: "preserve-3d"
                      }}
                      onClick={() => {
                        if (product) {
                          setSelectedProductId(product._id);
                        }
                      }}
                    >
                      {/* Inner wrapper: 160% Zoom + 3D depth volume */}
                      <motion.div
                        className="w-[160%] h-[160%] absolute -left-[30%] -top-[30%] bg-[#F5EDE4]"
                        animate={{
                          x: mouseX * (18 + (index % 3) * 12),
                          y: mouseY * (18 + (index % 4) * 10),
                          z: Math.abs(mouseX + mouseY) * 30, // Dynamic depth on hover
                          rotateX: mouseY * -4,
                          rotateY: mouseX * 4,
                        }}
                        transition={{
                          type: "spring",
                          stiffness: 50,
                          damping: 25,
                        }}
                      >
                        <motion.div
                          className="w-full h-full relative"
                          animate={{
                            y: [0, -6, 0, 6, 0],
                            x: [0, 4, 0, -4, 0],
                          }}
                          transition={{
                            duration: 9 + (index % 5) * 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                        >
                          {product ? (
                            <>
                              <img
                                src={product.images?.[0]}
                                alt={product.name}
                                className="w-full h-full object-cover object-center scale-115 group-hover:scale-130 transition-transform duration-1000 ease-out"
                              />

                              {/* The Glint: A shimmering light sweep on reveal and hover */}
                              <motion.div
                                className="absolute inset-0 z-10 pointer-events-none"
                                initial={{ x: "-150%", skewX: -45 }}
                                animate={{ x: ["150%", "-150%"] }}
                                transition={{
                                  delay: 0.8 + index * 0.1,
                                  duration: 1.5,
                                  ease: "easeInOut"
                                }}
                                style={{
                                  background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)"
                                }}
                              />

                              {/* Depth Vignette */}
                              <div className="absolute inset-0 shadow-[inset_0_0_50px_rgba(0,0,0,0.1)] group-hover:shadow-[inset_0_0_70px_rgba(0,0,0,0.15)] transition-shadow duration-500" />
                            </>
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-white text-xs font-semibold opacity-0 hover:opacity-75 transition-opacity bg-soil/30">
                              {frame.id + 1}
                            </div>
                          )}
                        </motion.div>
                      </motion.div>
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
                      style={{
                        backgroundColor: product ? "white" : frame.color,
                      }}
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
        </div >
      </motion.section >

      {/* Featured Collections Grid */}
      < FeaturedCollections collections={collections} />

      {/* Matsuo Bashō - The Poet Who Inspires Us */}
      < motion.section
        initial={{ opacity: 0 }
        }
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
                  <p className="text-soil/130 text-sm xs:text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl font-bold font-serif group-hover/haiku:opacity-0 transition-opacity duration-300">
                    古池や
                    <br />
                    蛙飛びこむ
                    <br />
                    水の音
                  </p>
                  {/* English version - visible on hover */}
                  <p className="text-soil/130 text-sm xs:text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl font-bold italic font-serif absolute top-0 left-0 opacity-0 group-hover/haiku:opacity-100 transition-opacity duration-300">
                    "The old pond—
                    <br />
                    A frog jumps in,
                    <br />
                    Sound of water."
                  </p>
                  <p className="text-soil/110 text-sm mt-2">
                    — 松尾芭蕉
                    <br />
                    (Matsuo Bashō)
                  </p>
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
      </motion.section >

      {/* Quote */}
      < motion.div
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
      </motion.div >

      {/* Three Pillars of Our Craft */}
      < div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-10 md:py-16" >
        {/* Pillar 1: Japanese Inspiration */}
        < motion.div
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
        </motion.div >

        {/* Pillar 2: Handcrafted Honor */}
        < motion.div
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
        </motion.div >

        {/* Pillar 3: Brand Essence */}
        < motion.div
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
        </motion.div >
      </div >

      {/* Know More About Basho */}
      < motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="py-10 md:py-16 px-4 md:px-8 relative overflow-hidden rounded-3xl mx-4 md:mx-8 border-2 border-[#C97C5D]"
        style={{
          background:
            "linear-gradient(135deg, #1a0f0a 0%, #2b1b14 50%, #3d2a1f 100%)",
        }}
      >
        {/* Decorative torn paper edge effect at top */}
        < div
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
      </motion.section >

      {/* Product Modal */}
      < ProductModal
        productId={selectedProductId}
        onClose={() => setSelectedProductId(null)}
      />
    </div >
  );
}
