"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingCart,
  Filter,
  Search,
  Loader2,
  ArrowRight,
  Heart,
  XCircle,
  Send,
  Check,
  Image as ImageIcon,
} from "lucide-react";
import {
  fadeInUp,
  staggerContainer,
  hoverScale,
  clickTap,
} from "@/lib/animations";
import { useCart } from "@/lib/cart";
import { useAuth } from "@/lib/auth";
import ProductModal from "@/components/ProductModal";
import { Carousel } from "@/components/Carousel";
import UploadInput from "@/components/UploadInput";

interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  images: string[];
  material: string;
  isFoodSafe: boolean;
  isMicrowaveSafe: boolean;
  isDishwasherSafe: boolean;
  inStock: boolean;
  stockQuantity: number;
  rating: number;
  reviewCount: number;
  featured: boolean;
}

import { CATEGORY_EMOJIS } from "@/lib/categories";

// Use constants from the library
const categoryEmojis = CATEGORY_EMOJIS;

const budgetRanges = [
  { id: "under-1000", label: "Under ₹1,000" },
  { id: "1000-3000", label: "₹1,000 - ₹3,000" },
  { id: "3000-5000", label: "₹3,000 - ₹5,000" },
  { id: "5000-10000", label: "₹5,000 - ₹10,000" },
  { id: "above-10000", label: "Above ₹10,000" },
];

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([
    { id: "all", label: "All Products" },
  ]); // Dynamic categories
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    null
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [priceRange, setPriceRange] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("featured");
  const [showFilters, setShowFilters] = useState(false);
  const itemsPerPage = 12;
  const cart = useCart();
  const { user, login } = useAuth();

  // Custom order state
  const [customFormData, setCustomFormData] = useState({
    name: "",
    email: "",
    phone: "",
    productType: "",
    material: "",
    quantity: 1,
    glazePreference: [] as string[],
    dimensions: { height: "", width: "", depth: "" },
    colorPreferences: "",
    specialRequirements: "",
    timeline: "",
    description: "", // Keep for compatibility if needed, but not primary
    budget: "",
  });
  const [referenceImages, setReferenceImages] = useState<string[]>([]);
  const [customLoading, setCustomLoading] = useState(false);
  const [customSubmitted, setCustomSubmitted] = useState(false);
  const [customError, setCustomError] = useState("");
  const [previousOrders, setPreviousOrders] = useState<any[]>([]);
  const [otp, setOtp] = useState("");

  // Studio Info State for contact email
  const [studioEmail, setStudioEmail] = useState("hello@basho.com");

  useEffect(() => {
    // Fetch studio info for dynamic email
    const fetchStudioInfo = async () => {
      try {
        const res = await fetch("/api/studio");
        if (res.ok) {
          const data = await res.json();
          if (data.studioInfo?.email) {
            setStudioEmail(data.studioInfo.email);
          }
        }
      } catch (err) {
        console.error("Failed to fetch studio info:", err);
      }
    };
    fetchStudioInfo();

    // Fetch Categories
    fetch("/api/admin/categories")
      .then((res) => res.json())
      .then((data) => {
        const formatted = data.map((c: any) => ({ id: c.slug, label: c.name }));
        setCategories([{ id: "all", label: "All Products" }, ...formatted]);
      })
      .catch((err) => console.error("Failed to fetch categories:", err));
  }, []);

  const [otpSent, setOtpSent] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);

  useEffect(() => {
    fetchProducts();
    // Fetch previous custom orders for carousel
    fetch("/api/previous-custom-orders")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setPreviousOrders(data.data);
        }
      })
      .catch((err) => console.error(err));
  }, [selectedCategory, searchQuery]);

  useEffect(() => {
    setCurrentPage(1); // Reset to page 1 when filters change
  }, [selectedCategory, searchQuery, priceRange, sortBy]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory !== "all")
        params.append("category", selectedCategory);
      if (searchQuery) params.append("search", searchQuery);

      const res = await fetch(`/api/products?${params}`);
      const data = await res.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setLoading(false);
    }
  };

  // Custom order handlers
  const handleCustomChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    // For phone, only allow numbers
    if (name === "phone") {
      if (!/^\d*$/.test(value)) return;
      setPhoneVerified(false);
      setOtpSent(false);
      setOtp("");
    }

    setCustomFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSendOtp = async () => {
    if (!customFormData.phone || customFormData.phone.length < 10) {
      setCustomError("Please enter a valid phone number");
      return;
    }
    setSendingOtp(true);
    setCustomError("");
    try {
      const res = await fetch("/api/auth/send-phone-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: customFormData.phone }),
      });
      const data = await res.json();
      if (res.ok) {
        setOtpSent(true);
      } else {
        setCustomError(data.error || "Failed to send OTP");
      }
    } catch (err) {
      setCustomError("Failed to send OTP");
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      setCustomError("Please enter a valid 6-digit OTP");
      return;
    }
    setVerifyingOtp(true);
    setCustomError("");
    try {
      const res = await fetch("/api/auth/verify-phone-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: customFormData.phone, otp }),
      });
      const data = await res.json();
      if (res.ok) {
        setPhoneVerified(true);
        setOtpSent(false);
        setOtp("");
      } else {
        setCustomError(data.error || "Invalid OTP");
      }
    } catch (err) {
      setCustomError("Failed to verify OTP");
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCustomLoading(true);
    setCustomError("");
    try {
      const res = await fetch("/api/custom-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...customFormData,
          referenceImages,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Something went wrong");
      }
      setCustomSubmitted(true);
    } catch (err: any) {
      setCustomError(err.message);
    } finally {
      setCustomLoading(false);
    }
  };

  const resetCustomForm = () => {
    setCustomSubmitted(false);
    setCustomFormData({
      name: "",
      email: "",
      phone: "",
      productType: "",
      material: "",
      quantity: 1,
      glazePreference: [],
      dimensions: { height: "", width: "", depth: "" },
      colorPreferences: "",
      specialRequirements: "",
      timeline: "",
      description: "",
      budget: "",
    });
    setReferenceImages([]);
    setPhoneVerified(false);
    setOtpSent(false);
    setOtp("");
  };

  const handleAddToCart = (product: Product) => {
    cart.add({
      id: product._id as any,
      name: product.name,
      price: product.price,
      qty: 1,
      stock: product.stockQuantity || 0,
      image: product.images?.[0],
    });
  };

  const handleWishlist = async (e: React.MouseEvent, productId: string) => {
    e.stopPropagation();
    if (!user) {
      alert("Please login to add to wishlist");
      return;
    }

    // Optimistic update
    const currentWishlist = user.wishlist || [];
    const isLiked = currentWishlist.includes(productId);
    const newWishlist = isLiked
      ? currentWishlist.filter((id) => id !== productId)
      : [...currentWishlist, productId];

    // Update local state immediately
    login({ ...user, wishlist: newWishlist });

    try {
      const res = await fetch("/api/user/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });

      const data = await res.json();
      if (!res.ok) {
        // Revert if failed
        login({ ...user, wishlist: currentWishlist });
        console.error("Wishlist failed:", data.error);
      } else {
        // Sync with server response to be sure
        login({ ...user, wishlist: data.wishlist });
      }
    } catch (err) {
      // Revert if error
      login({ ...user, wishlist: currentWishlist });
      console.error("Wishlist error:", err);
    }
  };

  const isProductLiked = (productId: string) => {
    return user?.wishlist?.includes(productId) || false;
  };

  const isValidImage = (img?: string) =>
    !!img &&
    (img.startsWith("/") || img.startsWith("http") || img.startsWith("data:"));

  const getProductImage = (product: Product) => {
    if (
      product.images &&
      product.images.length > 0 &&
      isValidImage(product.images[0])
    ) {
      return product.images[0];
    }
    return null;
  };

  // Filter and sort products
  const getFilteredAndSortedProducts = () => {
    let filtered = [...products];

    // Price filter
    if (priceRange !== "all") {
      filtered = filtered.filter((p) => {
        if (priceRange === "under1000") return p.price < 1000;
        if (priceRange === "1000-2000")
          return p.price >= 1000 && p.price <= 2000;
        if (priceRange === "2000-5000")
          return p.price >= 2000 && p.price <= 5000;
        if (priceRange === "above5000") return p.price > 5000;
        return true;
      });
    }

    // Sort products
    if (sortBy === "price-low") {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-high") {
      filtered.sort((a, b) => b.price - a.price);
    } else if (sortBy === "rating") {
      filtered.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === "newest") {
      filtered.sort((a, b) => b._id.localeCompare(a._id));
    } else if (sortBy === "featured") {
      filtered.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    }

    // Always sort out of stock items to the end
    filtered.sort((a, b) => {
      const aOutOfStock =
        !a.inStock || (a.stockQuantity !== undefined && a.stockQuantity <= 0);
      const bOutOfStock =
        !b.inStock || (b.stockQuantity !== undefined && b.stockQuantity <= 0);
      if (aOutOfStock && !bOutOfStock) return 1;
      if (!aOutOfStock && bOutOfStock) return -1;
      return 0;
    });

    return filtered;
  };

  const filteredProducts = getFilteredAndSortedProducts();
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen py-12">
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center mb-12"
      >
        <h1 className="text-5xl md:text-6xl font-bold text-soil mb-4 font-serif">
          Our Collection
        </h1>
        <p className="text-xl text-soil/70 max-w-2xl mx-auto">
          Handcrafted Japanese-inspired pottery. Each piece tells a story of
          tradition, craftsmanship, and the beauty of imperfection.
        </p>
      </motion.section>

      {/* Search & Filter Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="mb-8 px-4"
      >
        {/* Search with Filter Button */}
        <div className="flex flex-col sm:flex-row gap-3 items-center max-w-4xl mx-auto mb-6">
          <div className="relative flex-1">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-soil/50"
              size={20}
            />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border-2 border-soil/20 rounded-full focus:border-clay focus:outline-none transition-colors"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-soil/20 rounded-full hover:border-clay transition-colors whitespace-nowrap"
          >
            <Filter size={18} />
            <span className="font-medium">Filters</span>
          </button>
        </div>

        {/* Advanced Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="max-w-7xl mx-auto mb-6 overflow-hidden"
            >
              <div className="bg-white rounded-2xl border-2 border-soil/20 p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-semibold text-soil mb-3">
                    Category
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-4 py-2 border-2 border-soil/20 rounded-lg focus:border-clay focus:outline-none"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Price Range Filter */}
                <div>
                  <label className="block text-sm font-semibold text-soil mb-3">
                    Price Range
                  </label>
                  <select
                    value={priceRange}
                    onChange={(e) => setPriceRange(e.target.value)}
                    className="w-full px-4 py-2 border-2 border-soil/20 rounded-lg focus:border-clay focus:outline-none"
                  >
                    <option value="all">All Prices</option>
                    <option value="under1000">Under ₹1,000</option>
                    <option value="1000-2000">₹1,000 - ₹2,000</option>
                    <option value="2000-5000">₹2,000 - ₹5,000</option>
                    <option value="above5000">Above ₹5,000</option>
                  </select>
                </div>

                {/* Sort By */}
                <div>
                  <label className="block text-sm font-semibold text-soil mb-3">
                    Sort By
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-4 py-2 border-2 border-soil/20 rounded-lg focus:border-clay focus:outline-none"
                  >
                    <option value="featured">Featured</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="rating">Highest Rated</option>
                    <option value="newest">Newest First</option>
                  </select>
                </div>

                {/* Results Count */}
                <div className="flex items-end">
                  <div className="text-sm text-soil/70">
                    Showing{" "}
                    <span className="font-bold text-clay">
                      {paginatedProducts.length}
                    </span>{" "}
                    of{" "}
                    <span className="font-bold text-clay">
                      {filteredProducts.length}
                    </span>{" "}
                    products
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Products Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20 min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-clay" />
          <span className="ml-3 text-soil/70">Loading products...</span>
        </div>
      ) : paginatedProducts.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-20"
        >
          <div className="text-6xl mb-4">🏺</div>
          <h3 className="text-2xl font-bold text-soil mb-2">
            No products found
          </h3>
          <p className="text-soil/60">
            Try adjusting your search or filter criteria.
          </p>
        </motion.div>
      ) : (
        <>
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8 px-4 md:px-8 max-w-7xl mx-auto"
          >
            <AnimatePresence mode="popLayout">
              {paginatedProducts.map((product) => {
                const isOutOfStock =
                  !product.inStock ||
                  (product.stockQuantity !== undefined &&
                    product.stockQuantity <= 0);

                return (
                  <motion.div
                    key={product._id}
                    variants={fadeInUp}
                    layout
                    initial="hidden"
                    animate="visible"
                    exit={{ opacity: 0, scale: 0.8 }}
                    whileHover={hoverScale}
                    className="group relative"
                  >
                    <div className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-clay/20 transition-all duration-300 cursor-pointer h-full flex flex-col border border-transparent hover:border-clay/10">
                      {/* Image */}
                      <div
                        onClick={() =>
                          !isOutOfStock &&
                          setSelectedProductId(product.slug || product._id)
                        }
                        className={`relative h-48 bg-gradient-to-br from-sand to-sand/50 overflow-hidden ${
                          isOutOfStock ? "cursor-not-allowed" : "cursor-pointer"
                        }`}
                      >
                        {getProductImage(product) ? (
                          <img
                            src={getProductImage(product)!}
                            alt={product.name}
                            className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ${
                              isOutOfStock ? "grayscale opacity-75" : ""
                            }`}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-7xl group-hover:scale-110 transition-transform duration-500">
                            {categoryEmojis[product.category] || "🏺"}
                          </div>
                        )}

                        {/* Out of Stock Overlay */}
                        {isOutOfStock && (
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10 backdrop-blur-[2px]">
                            <span className="bg-red-500 text-white font-bold px-4 py-2 rounded-full flex items-center gap-2 transform -rotate-12 shadow-xl border-2 border-white">
                              <XCircle size={18} /> Out of Stock
                            </span>
                          </div>
                        )}

                        {/* Heart Button */}
                        <motion.button
                          whileTap={clickTap}
                          onClick={(e) => handleWishlist(e, product._id)}
                          className="absolute top-3 right-3 p-2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white text-soil transition-all shadow-sm z-20"
                        >
                          <Heart
                            size={20}
                            className={
                              isProductLiked(product._id)
                                ? "fill-red-500 text-red-500"
                                : "text-gray-400"
                            }
                          />
                        </motion.button>

                        {/* Badges */}
                        <div className="absolute top-3 left-3 flex flex-col gap-2 pointer-events-none z-10">
                          {product.featured && (
                            <span className="bg-clay text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                              Featured
                            </span>
                          )}
                          {product.originalPrice &&
                            product.originalPrice > product.price && (
                              <span className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                                {Math.round(
                                  (1 - product.price / product.originalPrice) *
                                    100
                                )}
                                % OFF
                              </span>
                            )}
                        </div>

                        {/* Quick Add */}
                        {!isOutOfStock && (
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={clickTap}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddToCart(product);
                            }}
                            className="absolute bottom-3 right-3 bg-soil text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 hover:bg-clay shadow-lg z-20"
                          >
                            <ShoppingCart size={18} />
                          </motion.button>
                        )}
                      </div>

                      {/* Content */}
                      <div
                        className="p-3"
                        onClick={() =>
                          !isOutOfStock &&
                          setSelectedProductId(product.slug || product._id)
                        }
                      >
                        {/* Category & Material */}
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-medium text-clay uppercase tracking-wide">
                            {product.category}
                          </span>
                          <span className="text-soil/30 text-xs">•</span>
                          <span className="text-[10px] text-soil/50 capitalize">
                            {product.material}
                          </span>
                        </div>

                        {/* Name */}
                        <h3 className="text-sm md:text-base font-bold text-soil mb-1 group-hover:text-clay transition-colors line-clamp-1">
                          {product.name}
                        </h3>

                        {/* Description */}
                        <p className="hidden md:block text-xs text-soil/60 mb-2 line-clamp-2 min-h-[32px]">
                          {product.description}
                        </p>

                        {/* Care Icons */}
                        <div className="flex gap-1 mb-2">
                          {product.isFoodSafe && (
                            <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                              Food Safe
                            </span>
                          )}
                          {product.isMicrowaveSafe && (
                            <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                              Microwave Safe
                            </span>
                          )}
                        </div>

                        {/* Price */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-baseline gap-2">
                            <span className="text-lg font-bold text-clay">
                              ₹{product.price.toLocaleString()}
                            </span>
                            {product.originalPrice &&
                              product.originalPrice > product.price && (
                                <span className="text-xs text-soil/40 line-through">
                                  ₹{product.originalPrice.toLocaleString()}
                                </span>
                              )}
                          </div>

                          {/* Rating */}
                          {product.rating > 0 && (
                            <div className="flex items-center gap-1 text-xs">
                              <span className="text-yellow-500">★</span>
                              <span className="text-soil/70">
                                {product.rating}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>

          {/* Pagination */}
          {totalPages > 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex justify-center items-center gap-2 mt-12 flex-wrap"
            >
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  currentPage === 1
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-white text-soil border-2 border-soil/20 hover:border-clay hover:text-clay"
                }`}
              >
                Previous
              </button>

              {[...Array(totalPages)].map((_, idx) => {
                const page = idx + 1;
                // Show first, last, current, and adjacent pages
                if (
                  page === 1 ||
                  page === totalPages ||
                  (page >= currentPage - 1 && page <= currentPage + 1)
                ) {
                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        currentPage === page
                          ? "bg-clay text-white shadow-lg"
                          : "bg-white text-soil border-2 border-soil/20 hover:border-clay hover:text-clay"
                      }`}
                    >
                      {page}
                    </button>
                  );
                } else if (
                  page === currentPage - 2 ||
                  page === currentPage + 2
                ) {
                  return (
                    <span key={page} className="px-2 text-soil/50">
                      ...
                    </span>
                  );
                }
                return null;
              })}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  currentPage === totalPages
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-white text-soil border-2 border-soil/20 hover:border-clay hover:text-clay"
                }`}
              >
                Next
              </button>
            </motion.div>
          )}
        </>
      )}

      {/* Custom Order Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="mt-20 px-4 py-16 bg-transparent relative overflow-hidden"
        id="custom-order"
      >
        {/* Decorative Elements */}
        <div className="absolute top-1/2 left-5 text-4xl opacity-5">✨</div>
        <div className="absolute top-1/4 right-20 text-5xl opacity-5">🍵</div>

        <div className="text-center mb-12 relative z-10">
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
            className="inline-block mb-4"
          ></motion.div>
          <h2 className="text-4xl md:text-5xl font-bold text-soil mb-6 font-serif">
            Custom Orders
          </h2>
          <p className="text-xl text-soil/70 max-w-2xl mx-auto leading-relaxed">
            Have a specific vision? We'll bring it to life. From personalized
            gifts to bespoke tableware sets, every piece is crafted with care.
          </p>
          <span className="block text-clay font-medium mb-4 tracking-wider uppercase text-sm">
            Made Just for You
          </span>
        </div>

        {/* Previous Custom Orders Showcase - Carousel */}
        {previousOrders.length > 0 && (
          <div className="mb-16 max-w-6xl mx-auto">
            <Carousel
              items={previousOrders.flatMap((order) =>
                order.images.map((img: string) => ({
                  image: img,
                  description: order.description,
                  id: order._id + "-" + img,
                }))
              )}
            />
          </div>
        )}

        {customSubmitted ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-white to-sand/50 rounded-3xl p-12 text-center max-w-lg mx-auto shadow-xl border border-clay/10 relative overflow-hidden"
          >
            <div className="absolute top-4 right-4 text-3xl opacity-20">🌿</div>
            <div className="absolute bottom-4 left-4 text-3xl opacity-20">
              🍃
            </div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="w-20 h-20 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg"
            >
              <Check className="w-10 h-10 text-green-600" />
            </motion.div>
            <h3 className="text-3xl font-bold text-soil mb-4 font-serif">
              Request Submitted!
            </h3>
            <p className="text-soil/70 mb-8 leading-relaxed">
              Thank you for your custom order request. Our artisans will review
              your requirements and get back to you within 24-48 hours with a
              quotation.
            </p>
            <button
              onClick={resetCustomForm}
              className="bg-gradient-to-r from-clay to-clay/90 text-white px-8 py-3 rounded-full font-semibold hover:shadow-lg hover:scale-105 transition-all"
            >
              Submit Another Request
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 max-w-7xl mx-auto relative z-10">
            {/* Form */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-3"
            >
              <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-lg border border-clay/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-clay/5 to-transparent rounded-bl-full"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-sand/50 to-transparent rounded-tr-full"></div>

                <div className="flex items-center gap-3 mb-6 relative">
                  <span className="text-3xl">✨</span>
                  <h3 className="text-2xl font-bold text-soil font-serif">
                    Custom Order Request
                  </h3>
                </div>

                {customError && (
                  <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-xl mb-6">
                    {customError}
                  </div>
                )}

                <form onSubmit={handleCustomSubmit} className="space-y-8">
                  {/* Personal Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-soil mb-2">
                        Your Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={customFormData.name}
                        onChange={handleCustomChange}
                        required
                        className="w-full px-4 py-3 border border-soil/20 rounded-xl focus:border-clay focus:outline-none transition-colors"
                        placeholder="Enter your name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-soil mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={customFormData.email}
                        onChange={handleCustomChange}
                        required
                        className="w-full px-4 py-3 border border-soil/20 rounded-xl focus:border-clay focus:outline-none transition-colors"
                        placeholder="your@email.com"
                      />
                    </div>
                  </div>

                  {/* Phone & OTP */}
                  {/* Phone & OTP */}
                  <div>
                    <label className="block text-sm font-medium text-soil mb-2">
                      Phone Number *
                    </label>
                    <div className="space-y-3">
                      <div className="flex flex-col sm:flex-row gap-2">
                        <input
                          type="tel"
                          name="phone"
                          value={customFormData.phone}
                          onChange={handleCustomChange}
                          required
                          disabled={phoneVerified}
                          className="flex-1 px-4 py-3 border border-soil/20 rounded-xl focus:border-clay focus:outline-none transition-colors disabled:bg-gray-50 disabled:cursor-not-allowed"
                          placeholder="9876543210"
                          maxLength={10}
                        />
                        {!phoneVerified && !otpSent && (
                          <button
                            type="button"
                            onClick={handleSendOtp}
                            disabled={
                              sendingOtp ||
                              !customFormData.phone ||
                              customFormData.phone.length !== 10
                            }
                            className="px-4 py-3 bg-clay text-white rounded-xl font-medium hover:bg-clay/90 transition-colors disabled:opacity-50 whitespace-nowrap"
                          >
                            {sendingOtp ? (
                              <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                              "Send OTP"
                            )}
                          </button>
                        )}
                        {phoneVerified && (
                          <div className="flex items-center justify-center px-4 py-3 bg-green-100 text-green-700 rounded-xl">
                            <Check className="w-5 h-5" />
                          </div>
                        )}
                      </div>

                      {otpSent && !phoneVerified && (
                        <div className="flex flex-col sm:flex-row gap-2">
                          <input
                            type="text"
                            value={otp}
                            onChange={(e) =>
                              setOtp(
                                e.target.value.replace(/\D/g, "").slice(0, 6)
                              )
                            }
                            placeholder="Enter 6-digit OTP"
                            maxLength={6}
                            className="flex-1 px-4 py-3 border border-soil/20 rounded-xl focus:border-clay focus:outline-none transition-colors"
                          />
                          <button
                            type="button"
                            onClick={handleVerifyOtp}
                            disabled={verifyingOtp || otp.length !== 6}
                            className="px-4 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors disabled:opacity-50 whitespace-nowrap"
                          >
                            {verifyingOtp ? (
                              <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                              "Verify"
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Product Type & Quantity */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-soil mb-2">
                        Product Type *
                      </label>
                      <select
                        name="productType"
                        value={customFormData.productType}
                        onChange={handleCustomChange}
                        className="w-full px-4 py-3 border border-soil/20 rounded-xl focus:border-clay focus:outline-none bg-white"
                        required
                      >
                        <option value="">Select a product type</option>
                        <option value="Dinner Set">Dinner Set</option>
                        <option value="Mug">Mug</option>
                        <option value="Bowl">Bowl</option>
                        <option value="Vase">Vase</option>
                        <option value="Planter">Planter</option>
                        <option value="Sculpture">Sculpture</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-soil mb-2">
                        Quantity
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="number"
                          min="1"
                          name="quantity"
                          value={customFormData.quantity}
                          onChange={(e) =>
                            setCustomFormData((prev) => ({
                              ...prev,
                              quantity: Math.max(
                                1,
                                parseInt(e.target.value) || 1
                              ),
                            }))
                          }
                          className="w-full px-4 py-3 border border-soil/20 rounded-xl focus:border-clay focus:outline-none transition-colors text-center"
                        />
                        <span className="text-sm text-soil/50 whitespace-nowrap">
                          piece{customFormData.quantity > 1 ? "s" : ""}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Material */}
                  <div>
                    <label className="block text-sm font-medium text-soil mb-2">
                      Material *
                    </label>
                    <select
                      name="material"
                      value={customFormData.material}
                      onChange={handleCustomChange}
                      className="w-full px-4 py-3 border border-soil/20 rounded-xl focus:border-clay focus:outline-none bg-white"
                      required
                    >
                      <option value="">Select Material</option>
                      <option value="Stoneware">Stoneware</option>
                      <option value="Porcelain">Porcelain</option>
                      <option value="Raku">Raku</option>
                      <option value="Terracotta">Terracotta</option>
                      <option value="Earthenware">Earthenware</option>
                      <option value="Unglazed Clay">Unglazed Clay</option>
                    </select>
                  </div>

                  {/* Glaze / Finish Preference */}
                  <div>
                    <label className="block text-sm font-medium text-soil mb-3">
                      Glaze / Finish Preference
                    </label>
                    <div className="flex flex-wrap gap-3">
                      {[
                        "Matt Finish",
                        "Glossy Finish",
                        "Crackle Glaze",
                        "Celadon",
                        "Tenmoku",
                        "Shino",
                        "Ash Glaze",
                        "Cobalt Blue",
                        "Copper Red",
                      ].map((glaze) => (
                        <button
                          key={glaze}
                          type="button"
                          onClick={() => {
                            const current = customFormData.glazePreference;
                            const newGlazes = current.includes(glaze)
                              ? current.filter((g) => g !== glaze)
                              : [...current, glaze];
                            setCustomFormData((prev) => ({
                              ...prev,
                              glazePreference: newGlazes,
                            }));
                          }}
                          className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${
                            customFormData.glazePreference.includes(glaze)
                              ? "bg-clay text-white border-clay"
                              : "bg-white text-soil/70 border-soil/20 hover:border-clay/50"
                          }`}
                        >
                          {glaze}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Dimensions */}
                  <div>
                    <label className="block text-sm font-medium text-soil mb-2">
                      Dimensions (in cm)
                    </label>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <span className="text-xs text-soil/50 mb-1 block">
                          Height
                        </span>
                        <input
                          type="number"
                          placeholder="15"
                          min="0"
                          className="w-full px-3 py-2 border border-soil/20 rounded-lg focus:border-clay outline-none"
                          value={customFormData.dimensions.height}
                          onChange={(e) =>
                            setCustomFormData((prev) => ({
                              ...prev,
                              dimensions: {
                                ...prev.dimensions,
                                height: e.target.value,
                              },
                            }))
                          }
                        />
                      </div>
                      <div>
                        <span className="text-xs text-soil/50 mb-1 block">
                          Width
                        </span>
                        <input
                          type="number"
                          placeholder="20"
                          min="0"
                          className="w-full px-3 py-2 border border-soil/20 rounded-lg focus:border-clay outline-none"
                          value={customFormData.dimensions.width}
                          onChange={(e) =>
                            setCustomFormData((prev) => ({
                              ...prev,
                              dimensions: {
                                ...prev.dimensions,
                                width: e.target.value,
                              },
                            }))
                          }
                        />
                      </div>
                      <div>
                        <span className="text-xs text-soil/50 mb-1 block">
                          Depth
                        </span>
                        <input
                          type="number"
                          placeholder="10"
                          min="0"
                          className="w-full px-3 py-2 border border-soil/20 rounded-lg focus:border-clay outline-none"
                          value={customFormData.dimensions.depth}
                          onChange={(e) =>
                            setCustomFormData((prev) => ({
                              ...prev,
                              dimensions: {
                                ...prev.dimensions,
                                depth: e.target.value,
                              },
                            }))
                          }
                        />
                      </div>
                    </div>
                  </div>

                  {/* Color Preferences */}
                  <div>
                    <label className="block text-sm font-medium text-soil mb-2">
                      Color Preferences
                    </label>
                    <textarea
                      rows={2}
                      className="w-full px-4 py-3 border border-soil/20 rounded-xl focus:border-clay focus:outline-none"
                      placeholder="Describe your preferred colors, patterns, or decorative elements..."
                      value={customFormData.colorPreferences}
                      onChange={(e) =>
                        setCustomFormData((prev) => ({
                          ...prev,
                          colorPreferences: e.target.value,
                        }))
                      }
                    />
                  </div>

                  {/* Reference Images */}
                  <div>
                    <label className="block text-sm font-medium text-soil mb-2">
                      Reference Images (Max 5)
                    </label>
                    <div className="space-y-4">
                      <div className="bg-sand/10 hover:bg-sand/20 transition-colors rounded-xl overflow-hidden">
                        <UploadInput
                          uploadPreset="products_unsigned" // Using known working preset
                          folder="custom_orders"
                          onUploaded={(urls) => {
                            setReferenceImages((prev) =>
                              [...prev, ...urls].slice(0, 5)
                            );
                          }}
                        >
                          <div className="border-2 border-dashed border-clay/30 rounded-xl p-8 text-center cursor-pointer group hover:border-clay/50 transition-colors w-full h-full flex flex-col items-center justify-center">
                            <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">
                              📸
                            </div>
                            <p className="text-soil/70 text-sm mb-1 font-medium">
                              Click to upload images or drag and drop
                            </p>
                            <p className="text-soil/40 text-xs text-center">
                              PNG, JPG, GIF up to 5MB
                            </p>
                          </div>
                        </UploadInput>
                      </div>

                      {/* Image Previews */}
                      {referenceImages.length > 0 && (
                        <div className="flex gap-3 flex-wrap">
                          <AnimatePresence>
                            {referenceImages.map((img, idx) => (
                              <motion.div
                                key={img + idx}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.5 }}
                                className="relative group w-20 h-20"
                              >
                                <img
                                  src={img}
                                  alt={`Reference ${idx + 1}`}
                                  className="w-full h-full object-cover rounded-lg shadow-sm border border-soil/10"
                                />
                                <button
                                  type="button"
                                  onClick={() =>
                                    setReferenceImages((prev) =>
                                      prev.filter((_, i) => i !== idx)
                                    )
                                  }
                                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 text-xs shadow-md opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center transform hover:scale-110"
                                >
                                  ×
                                </button>
                              </motion.div>
                            ))}
                          </AnimatePresence>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Special Requirements */}
                  <div>
                    <label className="block text-sm font-medium text-soil mb-2">
                      Special Requirements
                    </label>
                    <textarea
                      rows={3}
                      className="w-full px-4 py-3 border border-soil/20 rounded-xl focus:border-clay focus:outline-none"
                      placeholder="Any special features, inscriptions, or functional requirements..."
                      value={customFormData.specialRequirements}
                      onChange={(e) =>
                        setCustomFormData((prev) => ({
                          ...prev,
                          specialRequirements: e.target.value,
                        }))
                      }
                    />
                  </div>

                  {/* Timeline & Budget */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-soil mb-2">
                        Desired Timeline
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., 6 weeks, by Christmas, etc."
                        className="w-full px-4 py-3 border border-soil/20 rounded-xl focus:border-clay focus:outline-none"
                        value={customFormData.timeline}
                        onChange={(e) =>
                          setCustomFormData((prev) => ({
                            ...prev,
                            timeline: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-soil mb-2">
                        Budget Range *
                      </label>
                      <select
                        value={customFormData.budget}
                        onChange={(e) =>
                          setCustomFormData((prev) => ({
                            ...prev,
                            budget: e.target.value,
                          }))
                        }
                        required
                        className="w-full px-4 py-3 border border-soil/20 rounded-xl focus:border-clay focus:outline-none bg-white"
                      >
                        <option value="">Select budget range</option>
                        {budgetRanges.map((range) => (
                          <option key={range.id} value={range.id}>
                            {range.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={
                      customLoading ||
                      !customFormData.productType ||
                      !customFormData.budget ||
                      !phoneVerified
                    }
                    className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-clay to-clay/90 text-white py-4 rounded-full font-semibold text-lg hover:shadow-xl hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    {customLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />{" "}
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" /> Submit Request
                      </>
                    )}
                  </button>

                  {!phoneVerified && (
                    <p className="text-sm text-red-500 text-center">
                      Please verify your phone number before submitting
                    </p>
                  )}
                </form>
              </div>
            </motion.div>

            {/* Sidebar Info */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:col-span-2 space-y-6"
            >
              <div className="bg-gradient-to-br from-sand/80 to-sand rounded-3xl p-8 border border-clay/10 relative overflow-hidden">
                <div className="absolute top-2 right-2 text-2xl opacity-30">
                  🌸
                </div>
                <div className="flex items-center gap-2 mb-6">
                  <span className="text-2xl">📋</span>
                  <h4 className="text-xl font-bold text-soil font-serif">
                    How It Works
                  </h4>
                </div>
                <div className="space-y-4">
                  {[
                    {
                      step: "1",
                      title: "Submit Your Request",
                      desc: "Fill out the form with your requirements",
                      emoji: "📝",
                    },
                    {
                      step: "2",
                      title: "Receive Quotation",
                      desc: "We'll send you a detailed quote within 48 hours",
                      emoji: "💌",
                    },
                    {
                      step: "3",
                      title: "Confirm & Pay",
                      desc: "50% advance to begin crafting",
                      emoji: "✅",
                    },
                    {
                      step: "4",
                      title: "Creation",
                      desc: "Your piece is handcrafted with care",
                      emoji: "🏺",
                    },
                    {
                      step: "5",
                      title: "Delivery",
                      desc: "Receive your unique creation",
                      emoji: "📦",
                    },
                  ].map((item) => (
                    <motion.div
                      key={item.step}
                      className="flex gap-4 group"
                      whileHover={{ x: 5 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <div className="w-10 h-10 bg-gradient-to-br from-clay to-clay/80 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 shadow-md group-hover:scale-110 transition-transform">
                        {item.emoji}
                      </div>
                      <div>
                        <div className="font-semibold text-soil">
                          {item.title}
                        </div>
                        <div className="text-sm text-soil/60">{item.desc}</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-lg border border-clay/5 relative overflow-hidden">
                <div className="absolute -top-4 -right-4 text-6xl opacity-10">
                  ⏱️
                </div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl">🕐</span>
                  <h4 className="text-xl font-bold text-soil font-serif">
                    Typical Timeline
                  </h4>
                </div>
                <p className="text-soil/60 mb-4">
                  Custom pieces take approximately{" "}
                  <span className="font-semibold text-clay bg-clay/10 px-2 py-0.5 rounded-full">
                    3-4 weeks
                  </span>{" "}
                  to complete, including:
                </p>
                <ul className="space-y-3 text-sm text-soil/70">
                  {[
                    "Design consultation",
                    "Hand-building or wheel throwing",
                    "Drying time (1 week)",
                    "First firing (bisque)",
                    "Glazing & final firing",
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-center gap-3">
                      <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Check size={12} className="text-green-600" />
                      </div>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-gradient-to-br from-clay/20 via-clay/10 to-sand rounded-3xl p-8 text-center border border-clay/10 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-clay/30 to-transparent"></div>
                <motion.div
                  className="text-5xl mb-4"
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{
                    repeat: Infinity,
                    duration: 3,
                    ease: "easeInOut",
                  }}
                >
                  💬
                </motion.div>
                <h4 className="text-lg font-bold text-soil mb-2">
                  Have Questions?
                </h4>
                <p className="text-sm text-soil/60 mb-4">
                  We're happy to help with your custom order inquiry.
                </p>
                <a
                  href={`mailto:${studioEmail}`}
                  className="inline-flex items-center gap-2 text-clay font-semibold hover:underline bg-white/50 px-4 py-2 rounded-full transition-colors hover:bg-white"
                >
                  ✉️ {studioEmail}
                </a>
              </div>
            </motion.div>
          </div>
        )}
      </motion.section>

      {/* Product Modal */}
      <ProductModal
        productId={selectedProductId}
        onClose={() => setSelectedProductId(null)}
      />
    </div>
  );
}
