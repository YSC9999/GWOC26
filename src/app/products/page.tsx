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

import { PRODUCT_CATEGORIES, CATEGORY_EMOJIS } from "@/lib/categories";

// Use constants from the library
const categories = PRODUCT_CATEGORIES;
const categoryEmojis = CATEGORY_EMOJIS;

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
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

  useEffect(() => {
    fetchProducts();
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
            className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8 px-4 md:px-8 max-w-7xl mx-auto"
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
                        className={`relative h-48 bg-gradient-to-br from-sand to-sand/50 overflow-hidden ${isOutOfStock ? "cursor-not-allowed" : "cursor-pointer"
                          }`}
                      >
                        {getProductImage(product) ? (
                          <img
                            src={getProductImage(product)!}
                            alt={product.name}
                            className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ${isOutOfStock ? "grayscale opacity-75" : ""
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
                className={`px-4 py-2 rounded-lg font-medium transition-all ${currentPage === 1
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
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${currentPage === page
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
                className={`px-4 py-2 rounded-lg font-medium transition-all ${currentPage === totalPages
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

      {/* Bottom CTA */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mt-20 text-center px-4"
      >
        <div className="bg-gradient-to-br from-clay to-clay/80 rounded-3xl p-12 md:p-16 text-white max-w-4xl mx-auto shadow-xl">
          <motion.div
            initial={{ scale: 0.9 }}
            whileInView={{ scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <span className="text-5xl mb-4 block">🎨</span>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 font-serif">
              Looking for something unique?
            </h2>
            <p className="text-lg text-white/90 mb-8 max-w-xl mx-auto leading-relaxed">
              We create custom pieces tailored to your vision. From personalized
              gifts to bespoke tableware sets, let's craft something special
              together.
            </p>
            <Link
              href="/custom-orders"
              className="inline-flex items-center gap-2 bg-white text-clay font-bold px-8 py-4 rounded-full transition-all hover:scale-105 hover:shadow-lg"
            >
              Request Custom Order
              <ArrowRight size={20} />
            </Link>
          </motion.div>
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
