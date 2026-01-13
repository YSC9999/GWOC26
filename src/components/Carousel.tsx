"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface SlideData {
  image: string;
  description?: string;
  id: string;
  title?: string; // Added title for optional overlay text
}

export function Carousel({ items }: { items: SlideData[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % items.length);
  }, [items.length]);

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
    manualInteraction();
  };

  const manualNext = () => {
    nextSlide();
    manualInteraction();
  };

  const manualInteraction = () => {
    setIsPaused(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setIsPaused(false);
    }, 5000);
  };

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(nextSlide, 3500);
    return () => clearInterval(interval);
  }, [isPaused, nextSlide]);

  if (items.length === 0) return null;

  return (
    <div
      className="relative w-full max-w-7xl mx-auto bg-white rounded-3xl overflow-hidden shadow-2xl aspect-[21/9] group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => {
        manualInteraction();
      }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0 flex"
        >
          {/* Image Side - Full Width */}
          <div className="w-full h-full bg-gray-100 relative">
            <img
              src={items[currentIndex].image}
              alt="Showcase"
              className="w-full h-full object-cover"
            />
            {/* Optional Title Overlay */}
            {items[currentIndex].title && (
              <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/70 to-transparent text-white">
                <h3 className="text-xl font-bold font-serif">
                  {items[currentIndex].title}
                </h3>
                {items[currentIndex].description && (
                  <p className="text-sm opacity-90 line-clamp-2">
                    {items[currentIndex].description}
                  </p>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Controls */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 backdrop-blur rounded-full flex items-center justify-center text-soil hover:bg-white transition-colors opacity-0 group-hover:opacity-100 z-10"
      >
        <ChevronLeft size={20} />
      </button>
      <button
        onClick={manualNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 backdrop-blur rounded-full flex items-center justify-center text-soil hover:bg-white transition-colors opacity-0 group-hover:opacity-100 z-10"
      >
        <ChevronRight size={20} />
      </button>

      {/* Indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {items.map((_, idx) => (
          <div
            key={idx}
            className={`w-2 h-2 rounded-full transition-all ${
              idx === currentIndex ? "bg-clay w-6" : "bg-white/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
