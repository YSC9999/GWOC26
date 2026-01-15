"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Play, Quote, Star, Video, Image as ImageIcon } from "lucide-react";

interface GalleryItem {
  _id: string;
  title: string;
  image: string;
  category: string;
  description?: string;
  featured: boolean;
}

interface Testimonial {
  _id: string;
  name: string;
  location?: string;
  content: string;
  rating: number;
  type: "text" | "video";
  videoUrl?: string;
  image?: string;
  productRef?: string;
  experienceType?: string;
}

// Masonry layout generator with random sizes
const generateMasonryLayout = (items: GalleryItem[]) => {
  const sizes = ["small", "medium", "large"];
  return items.map((item, index) => ({
    ...item,
    // Randomly assign sizes but ensure good distribution
    size: sizes[Math.floor(Math.random() * sizes.length)],
    // Add slight randomization to positioning
    delay: Math.random() * 0.3,
  }));
};

export default function GalleryPage() {
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [activeTestimonialVideo, setActiveTestimonialVideo] = useState<
    string | null
  >(null);

  // Videos section data (can be moved to CMS later)
  const studioVideos = [
    {
      id: "1",
      title: "The Art of Pottery Making",
      thumbnail: "/pottery-pattern.png",
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", // Replace with actual video
      description: "Watch our artisans create beautiful pieces",
    },
    {
      id: "2",
      title: "Behind the Scenes",
      thumbnail: "/pottery-pattern.png",
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      description: "A day in the life at our studio",
    },
    {
      id: "3",
      title: "Workshop Highlights",
      thumbnail: "/pottery-pattern.png",
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      description: "See what happens in our workshops",
    },
  ];

  const categories = [
    { value: "all", label: "All", emoji: "🎨" },
    { value: "products", label: "Products", emoji: "🏺" },
    { value: "workshops", label: "Workshops", emoji: "🎓" },
    { value: "studio", label: "Studio", emoji: "🏠" },
    { value: "events", label: "Events", emoji: "🎉" },
    { value: "process", label: "Process", emoji: "⚙️" },
  ];

  useEffect(() => {
    fetchGallery();
    fetchTestimonials();
  }, [selectedCategory]);

  const fetchGallery = async () => {
    try {
      const categoryQuery =
        selectedCategory !== "all" ? `?category=${selectedCategory}` : "";
      const res = await fetch(`/api/gallery${categoryQuery}`);
      const data = await res.json();
      setGalleryItems(data.gallery || []);
    } catch (error) {
      console.error("Failed to fetch gallery:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTestimonials = async () => {
    try {
      const res = await fetch("/api/testimonials?limit=20");
      const data = await res.json();
      setTestimonials(data.testimonials || []);
    } catch (error) {
      console.error("Failed to fetch testimonials:", error);
    }
  };

  // Memoized masonry layout to prevent re-shuffling on re-renders
  const masonryItems = useMemo(
    () => generateMasonryLayout(galleryItems),
    [galleryItems]
  );

  const getSizeClasses = (size: string) => {
    switch (size) {
      case "small":
        return "col-span-1 row-span-1 h-64";
      case "medium":
        return "col-span-1 md:col-span-2 row-span-1 h-64 md:h-80";
      case "large":
        return "col-span-1 md:col-span-2 lg:col-span-3 row-span-2 h-96";
      default:
        return "col-span-1 row-span-1 h-64";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FDF8F3] to-[#F5EDE4] py-20 px-4 md:px-8">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto text-center mb-16"
      >
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-[#5A3E36] mb-4 font-serif">
          Our Gallery 🎨
        </h1>
        <p className="text-lg text-[#5A3E36]/70 max-w-2xl mx-auto">
          Explore the artistry and craftsmanship behind every piece. From our
          studio to your home.
        </p>
      </motion.div>

      {/* Category Filter */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="max-w-7xl mx-auto mb-12"
      >
        <div className="flex flex-wrap justify-center gap-3">
          {categories.map((category) => (
            <motion.button
              key={category.value}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedCategory(category.value)}
              className={`px-6 py-3 rounded-full font-semibold transition-all ${
                selectedCategory === category.value
                  ? "bg-[#5A3E36] text-[#EFE5D8] shadow-lg"
                  : "bg-white text-[#5A3E36] hover:bg-[#5A3E36]/10 border-2 border-[#5A3E36]/20"
              }`}
            >
              <span className="mr-2">{category.emoji}</span>
              {category.label}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Masonry Gallery Grid */}
      {loading ? (
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#C97C5D] border-t-transparent"></div>
        </div>
      ) : galleryItems.length === 0 ? (
        <div className="text-center py-20">
          <ImageIcon size={64} className="mx-auto text-[#5A3E36]/30 mb-4" />
          <p className="text-[#5A3E36]/50 text-xl">
            No gallery items yet. Check back soon!
          </p>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="max-w-7xl mx-auto"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 auto-rows-auto">
            {masonryItems.map((item: any, index) => (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: item.delay }}
                className={`${getSizeClasses(
                  item.size
                )} relative rounded-2xl overflow-hidden cursor-pointer group shadow-lg hover:shadow-2xl transition-shadow`}
                onClick={() => setSelectedImage(item)}
              >
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                    <h3 className="font-bold text-lg mb-1">{item.title}</h3>
                    {item.description && (
                      <p className="text-sm text-white/80 line-clamp-2">
                        {item.description}
                      </p>
                    )}
                  </div>
                </div>
                <div className="absolute top-3 right-3 bg-[#C97C5D] text-white px-3 py-1 rounded-full text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                  View
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Studio Videos Section */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="max-w-7xl mx-auto mt-32 mb-24"
      >
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-bold text-[#5A3E36] mb-4 font-serif">
            Studio Stories 🎬
          </h2>
          <p className="text-lg text-[#5A3E36]/70">
            Watch the magic unfold in our pottery studio
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {studioVideos.map((video, index) => (
            <motion.div
              key={video.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all group"
            >
              <div className="relative h-56 bg-gradient-to-br from-[#C97C5D] to-[#8B4513] overflow-hidden">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-full object-cover opacity-40 group-hover:opacity-60 transition-opacity"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center cursor-pointer shadow-xl"
                  >
                    <Play size={32} className="text-[#C97C5D] ml-1" />
                  </motion.div>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-[#5A3E36] mb-2">
                  {video.title}
                </h3>
                <p className="text-[#5A3E36]/60 text-sm">{video.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Customer Experience Section */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="max-w-7xl mx-auto mt-32"
      >
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-[#5A3E36] mb-4 font-serif">
            Customer Experiences ✨
          </h2>
          <p className="text-lg text-[#5A3E36]/70">
            Hear what our customers have to say about their Basho journey
          </p>
        </div>

        {testimonials.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl">
            <Quote size={64} className="mx-auto text-[#5A3E36]/30 mb-4" />
            <p className="text-[#5A3E36]/50 text-xl">
              No testimonials yet. Be the first to share your experience!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial._id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all relative overflow-hidden"
              >
                {/* Decorative background */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#C97C5D]/10 to-transparent rounded-bl-full"></div>

                {testimonial.type === "video" && testimonial.videoUrl ? (
                  <>
                    {/* Video Testimonial */}
                    <div className="relative mb-6 rounded-xl overflow-hidden">
                      {activeTestimonialVideo === testimonial._id ? (
                        <iframe
                          src={testimonial.videoUrl}
                          className="w-full h-64 rounded-xl"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        ></iframe>
                      ) : (
                        <div
                          className="relative h-64 bg-gradient-to-br from-[#C97C5D] to-[#8B4513] rounded-xl cursor-pointer group"
                          onClick={() =>
                            setActiveTestimonialVideo(testimonial._id)
                          }
                        >
                          {testimonial.image && (
                            <img
                              src={testimonial.image}
                              alt={testimonial.name}
                              className="w-full h-full object-cover opacity-40 group-hover:opacity-60 transition-opacity"
                            />
                          )}
                          <div className="absolute inset-0 flex items-center justify-center">
                            <motion.div
                              whileHover={{ scale: 1.1 }}
                              className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl"
                            >
                              <Play size={28} className="text-[#C97C5D] ml-1" />
                            </motion.div>
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    {/* Text Testimonial */}
                    <Quote
                      size={40}
                      className="text-[#C97C5D]/30 mb-4 relative z-10"
                    />
                  </>
                )}

                {/* Rating */}
                <div className="flex gap-1 mb-4 relative z-10">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={18}
                      className={`${
                        i < testimonial.rating
                          ? "fill-[#C97C5D] text-[#C97C5D]"
                          : "text-[#5A3E36]/20"
                      }`}
                    />
                  ))}
                </div>

                {/* Content */}
                <p className="text-[#5A3E36]/80 mb-6 leading-relaxed relative z-10">
                  {testimonial.content}
                </p>

                {/* Customer Info */}
                <div className="flex items-center gap-3 relative z-10">
                  {testimonial.image && testimonial.type === "text" && (
                    <img
                      src={testimonial.image}
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-[#C97C5D]"
                    />
                  )}
                  <div>
                    <h4 className="font-bold text-[#5A3E36]">
                      {testimonial.name}
                    </h4>
                    <p className="text-sm text-[#5A3E36]/50">
                      {testimonial.location || "Basho Customer"}
                    </p>
                  </div>
                </div>

                {/* Experience Type Badge */}
                {testimonial.experienceType && (
                  <div className="mt-4 inline-block px-3 py-1 bg-[#C97C5D]/10 text-[#C97C5D] text-xs font-semibold rounded-full">
                    {testimonial.experienceType}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Image Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
          >
            <motion.button
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="absolute top-4 right-4 bg-white/90 hover:bg-white rounded-full p-3 z-10 shadow-xl"
              onClick={() => setSelectedImage(null)}
            >
              <X size={24} className="text-[#5A3E36]" />
            </motion.button>

            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", damping: 25 }}
              className="max-w-5xl max-h-[90vh] relative"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={selectedImage.image}
                alt={selectedImage.title}
                className="w-full h-full object-contain rounded-2xl"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 rounded-b-2xl">
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
                  {selectedImage.title}
                </h3>
                {selectedImage.description && (
                  <p className="text-white/90">{selectedImage.description}</p>
                )}
                <span className="inline-block mt-3 px-4 py-2 bg-[#C97C5D] text-white rounded-full text-sm font-semibold">
                  {selectedImage.category}
                </span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
