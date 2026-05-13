"use client";

import { motion, useInView } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useRef, useEffect, useState } from "react";
import OptimizedImage from "./OptimizedImage";

interface Product {
  _id: string;
  name: string;
  slug: string;
  images: string[];
}

interface Collection {
  _id: string;
  title: string;
  slug: string;
  description: string;
  products: Product[];
}

interface FeaturedCollectionsProps {
  collections: Collection[];
  loading?: boolean;
  error?: string | null;
}

export default function FeaturedCollections({
  collections,
  loading,
  error,
}: FeaturedCollectionsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(scrollRef, {
    margin: "-20% 0px -20% 0px",
    once: true,
  });
  // Default to the first item (or middle?)
  const [activeIndex, setActiveIndex] = useState(0);

  // Auto-scroll logic
  useEffect(() => {
    // Check if horizontal scroll is active (mobile OR desktop with >4 items)
    const isHorizontalScroll = window.innerWidth < 768 || collections.length > 4;
    
    if (
      isInView &&
      scrollRef.current &&
      isHorizontalScroll &&
      Array.isArray(collections) &&
      collections.length > 0
    ) {
      const container = scrollRef.current;

      // Force start at beginning
      container.scrollLeft = 0;
      setActiveIndex(0);

      const cardWidth = container.firstElementChild?.clientWidth || 0;
      const gap = 16;
      const totalItemWidth = cardWidth + gap;

      // Calculate middle index
      const middleIndex = Math.floor(collections.length / 2);

      const containerWidth = container.clientWidth;
      const targetScrollLeft =
        middleIndex * totalItemWidth - containerWidth / 2 + cardWidth / 2 + 20;

      let startTime: number;
      const duration = 2000;
      const start = 0;
      const change = targetScrollLeft;

      const animateScroll = (time: number) => {
        if (!startTime) startTime = time;
        const timeElapsed = time - startTime;
        const progress = Math.min(timeElapsed / duration, 1);

        // Ease out cubic
        const ease = 1 - Math.pow(1 - progress, 3);

        container.scrollLeft = start + change * ease;

        if (timeElapsed < duration) {
          requestAnimationFrame(animateScroll);
        }
      };

      const timer = setTimeout(() => {
        requestAnimationFrame(animateScroll);
      }, 600);

      return () => clearTimeout(timer);
    }
  }, [isInView, collections.length]);

  // Track active item on scroll for "zoom" effect
  const handleScroll = () => {
    // Check if horizontal scroll is active (mobile OR desktop with >4 items)
    const isHorizontalScroll = window.innerWidth < 768 || collections.length > 4;
    
    if (scrollRef.current && isHorizontalScroll) {
      const container = scrollRef.current;
      const containerCenter = container.scrollLeft + container.clientWidth / 2;

      // Find closest item to center
      const children = Array.from(container.children) as HTMLElement[];
      let minDist = Infinity;
      let newActiveIndex = 0;

      children.forEach((child, index) => {
        const childCenter = child.offsetLeft + child.offsetWidth / 2;
        const dist = Math.abs(childCenter - containerCenter);
        if (dist < minDist) {
          minDist = dist;
          newActiveIndex = index;
        }
      });

      if (newActiveIndex !== activeIndex) {
        setActiveIndex(newActiveIndex);
      }
    }
  };

  return (
    <motion.section
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      className="border-b border-soil/5 py-10 md:py-16"
    >
      <div className="text-center mb-8 px-4">
        <h2 className="text-2xl md:text-4xl font-bold text-soil font-serif">
          Featured Collections
        </h2>
        <p className="text-soil/60 mt-2 max-w-2xl mx-auto text-sm md:text-base">
          Explore our curated selections of handcrafted ceramics.
        </p>
      </div>

      <div className="w-full">
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <span className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-soil"></span>
            <span className="ml-4 text-soil/60">Loading collections...</span>
          </div>
        ) : error ? (
          <div className="text-center py-12 bg-red-100 rounded-2xl mx-4">
            <p className="text-red-700 italic font-semibold">{error}</p>
          </div>
        ) : Array.isArray(collections) && collections.length > 0 ? (
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className={`flex overflow-x-auto snap-x snap-mandatory gap-4 px-4 pb-8 scrollbar-hide items-center ${
              collections.length <= 4 
                ? "md:grid md:grid-cols-3 lg:grid-cols-4 md:gap-8 md:px-12" 
                : "md:gap-6 md:px-12"
            }`}
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
            {collections.map((collection, colIndex) => {
              const thumbnailProduct = Array.isArray(collection.products)
                ? collection.products[0]
                : null;
              const thumbnailImage = thumbnailProduct?.images?.[0] || null;
              const isActive = colIndex === activeIndex;

              return (
                <motion.div
                  key={collection._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                  className={`group snap-center first:pl-2 last:pr-4 transition-all duration-500 ease-out ${
                    isActive ? "scale-100 z-10" : "scale-95 opacity-100"
                  } ${
                    collections.length > 4 
                      ? "min-w-[75vw] md:min-w-[320px] lg:min-w-[380px]" 
                      : "min-w-[75vw] md:min-w-0"
                  }`}
                  style={{ willChange: "transform, opacity" }}
                >
                  <Link
                    href={`/collections/${collection.slug || collection._id}`}
                    className="block h-full group px-2 py-4"
                  >
                    <div
                      className={`relative h-[320px] md:h-[380px] w-full bg-[#E3E4C8] shadow-2xl group-hover:shadow-[0_8px_32px_rgba(0,0,0,0.25)] transition-all duration-500 overflow-hidden flex flex-col justify-end border border-black/5 transform ${colIndex % 2 === 0 ? "-rotate-3" : "rotate-3"} hover:rotate-0 hover:scale-[1.02] hover:z-20`}
                      style={{
                        borderRadius: "32px",
                      }}
                    >
                      {/* Full Background Image */}
                      {thumbnailImage ? (
                        <OptimizedImage
                          src={thumbnailImage}
                          alt={collection.title || "Collection"}
                          priority={colIndex < 2}
                          width={600}
                          fallbackSrc="/Logo.png"
                          containerClassName="absolute inset-0 w-full h-full z-0"
                          className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ${colIndex === 2 ? "mix-blend-multiply" : ""}`}
                        />
                      ) : (
                        <div className="absolute inset-0 w-full h-full bg-[#E3E4C8] flex items-center justify-center z-0">
                          <span className="text-6xl opacity-20">🏺</span>
                        </div>
                      )}

                      {/* Bottom Overlay Gradient for Text */}
                      <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black/70 via-black/20 to-transparent z-10 pointer-events-none"></div>

                      {/* Footer Text Overlay - Anchored to Bottom */}
                      <div className="absolute bottom-6 left-0 right-0 text-center z-20 px-4">
                        <h4
                          className="text-2xl md:text-4xl text-white font-normal drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] transform -rotate-2"
                          style={{ fontFamily: "var(--font-berkshire-swash)" }}
                        >
                          {collection.title}
                        </h4>
                        <div className="w-16 h-1 bg-white/90 mx-auto mt-3 rounded-full shadow-sm"></div>
                      </div>

                      {/* Paper Texture Overlay (Subtle) */}
                      <div className="absolute inset-0 bg-white opacity-[0.02] pointer-events-none mix-blend-overlay z-30"></div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 bg-sand/10 rounded-2xl mx-4">
            <p className="text-soil/50 italic">
              No collections available at the moment.
            </p>
          </div>
        )}
      </div>
      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </motion.section>
  );
}
