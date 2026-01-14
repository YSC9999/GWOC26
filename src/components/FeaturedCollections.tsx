"use client";

import { motion, useInView } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useRef, useEffect, useState } from "react";

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
}

export default function FeaturedCollections({ collections }: FeaturedCollectionsProps) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const isInView = useInView(scrollRef, { margin: "-20% 0px -20% 0px", once: true });
    // Default to the first item (or middle?)
    const [activeIndex, setActiveIndex] = useState(0);

    // Auto-scroll logic
    useEffect(() => {
        if (isInView && scrollRef.current && window.innerWidth < 768) {
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
            const targetScrollLeft = (middleIndex * totalItemWidth) - (containerWidth / 2) + (cardWidth / 2) + 20;

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

                container.scrollLeft = start + (change * ease);

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
        if (scrollRef.current && window.innerWidth < 768) {
            const container = scrollRef.current;
            const containerCenter = container.scrollLeft + (container.clientWidth / 2);

            // Find closest item to center
            const children = Array.from(container.children) as HTMLElement[];
            let minDist = Infinity;
            let newActiveIndex = 0;

            children.forEach((child, index) => {
                const childCenter = child.offsetLeft + (child.offsetWidth / 2);
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
            className="border-b border-soil/5"
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
                {collections.length > 0 ? (
                    <div
                        ref={scrollRef}
                        onScroll={handleScroll}
                        className="flex overflow-x-auto snap-x snap-mandatory gap-4 px-4 md:px-12 md:grid md:grid-cols-3 lg:grid-cols-4 md:gap-8 pb-8 scrollbar-hide items-center"
                        style={{
                            scrollbarWidth: 'none',
                            msOverflowStyle: 'none'
                        }}
                    >
                        {collections.map((collection, colIndex) => {
                            const thumbnailProduct = collection.products?.[0];
                            const thumbnailImage = thumbnailProduct?.images?.[0];
                            const isActive = colIndex === activeIndex;

                            return (
                                <motion.div
                                    key={collection._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5 }}
                                    className={`group min-w-[75vw] md:min-w-0 snap-center first:pl-2 last:pr-4 transition-all duration-500 ease-out ${isActive ? "scale-100 z-10" : "scale-95 opacity-100"}`} // Fixed opacity and scale
                                >
                                    <Link
                                        href={`/collections/${collection.slug || collection._id}`}
                                        className="block h-full"
                                    >
                                        <div className={`bg-white rounded-2xl overflow-hidden shadow-sm transition-all duration-500 border border-soil/5 h-full flex flex-col transform relative ${isActive ? "shadow-2xl" : ""}`}>
                                            <div className="h-64 md:h-72 bg-sand/20 overflow-hidden relative">
                                                {thumbnailImage ? (
                                                    <img
                                                        src={thumbnailImage}
                                                        alt={collection.title}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-4xl bg-sand/10">
                                                        🏺
                                                    </div>
                                                )}

                                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />

                                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-max max-w-[90%] z-20">
                                                    <div className="bg-white text-soil font-bold px-5 py-2.5 md:px-6 md:py-3 rounded-full shadow-lg flex items-center gap-2 hover:bg-clay hover:text-white transition-colors duration-300 text-sm md:text-base">
                                                        <span className="truncate">
                                                            {collection.title}
                                                        </span>
                                                        <ArrowRight size={16} />
                                                    </div>
                                                </div>
                                            </div>
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
