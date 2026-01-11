"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Filter, Search, Loader2, ArrowRight, Heart, XCircle } from "lucide-react";
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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 50,
      damping: 10,
    },
  },
};

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const cart = useCart();
  const { user, login } = useAuth();

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, searchQuery]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory !== "all") params.append("category", selectedCategory);
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
      image: product.images?.[0]
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

  const isValidImage = (img?: string) => !!img && (img.startsWith("/") || img.startsWith("http") || img.startsWith("data:"));

  const getProductImage = (product: Product) => {
    if (product.images && product.images.length > 0 && isValidImage(product.images[0])) {
      return product.images[0];
    }
    return null;
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
        className="mb-8"
      >
        {/* Search */}
        <div className="relative max-w-md mx-auto mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-soil/50" size={20} />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border-2 border-soil/20 rounded-full focus:border-clay focus:outline-none transition-colors"
          />
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap justify-center gap-3">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-5 py-2 rounded-full font-medium transition-all duration-300 ${selectedCategory === cat.id
                ? "bg-clay text-white shadow-lg shadow-clay/30"
                : "bg-white text-soil border-2 border-soil/20 hover:border-clay hover:text-clay"
                }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Products Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20 min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-clay" />
          <span className="ml-3 text-soil/70">Loading products...</span>
        </div>
      ) : products.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-20"
        >
          <div className="text-6xl mb-4">🏺</div>
          <h3 className="text-2xl font-bold text-soil mb-2">No products found</h3>
          <p className="text-soil/60">
            Try adjusting your search or filter criteria.
          </p>
        </motion.div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 px-4 md:px-8 max-w-7xl mx-auto"
        >
          <AnimatePresence mode="popLayout">
            {products.map((product) => {
              const isOutOfStock = !product.inStock || (product.stockQuantity !== undefined && product.stockQuantity <= 0);

              return (
                <motion.div
                  key={product._id}
                  variants={itemVariants}
                  layout
                  initial="hidden"
                  animate="visible"
                  exit={{ opacity: 0, scale: 0.8 }}
                  whileHover={{
                    y: -12,
                    scale: 1.02,
                    transition: { duration: 0.2 }
                  }}
                  className="group relative"
                >
                  <div className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-clay/20 transition-all duration-300 cursor-pointer h-full flex flex-col border border-transparent hover:border-clay/10">
                    {/* Image */}
                    <div
                      onClick={() => setSelectedProductId(product.slug || product._id)}
                      className="relative h-64 bg-gradient-to-br from-sand to-sand/50 overflow-hidden"
                    >
                      {getProductImage(product) ? (
                        <img
                          src={getProductImage(product)!}
                          alt={product.name}
                          className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ${isOutOfStock ? 'grayscale opacity-75' : ''}`}
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
                      <button
                        onClick={(e) => handleWishlist(e, product._id)}
                        className="absolute top-3 right-3 p-2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white text-soil transition-all shadow-sm z-20"
                      >
                        <Heart
                          size={20}
                          className={isProductLiked(product._id) ? "fill-red-500 text-red-500" : "text-gray-400"}
                        />
                      </button>

                      {/* Badges */}
                      <div className="absolute top-3 left-3 flex flex-col gap-2 pointer-events-none z-10">
                        {product.featured && (
                          <span className="bg-clay text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                            Featured
                          </span>
                        )}
                        {product.originalPrice && product.originalPrice > product.price && (
                          <span className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                            {Math.round((1 - product.price / product.originalPrice) * 100)}% OFF
                          </span>
                        )}
                      </div>

                      {/* Quick Add */}
                      {!isOutOfStock && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddToCart(product);
                          }}
                          className="absolute bottom-3 right-3 bg-soil text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 hover:bg-clay shadow-lg z-20"
                        >
                          <ShoppingCart size={18} />
                        </button>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-5" onClick={() => setSelectedProductId(product.slug || product._id)}>
                      {/* Category & Material */}
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-medium text-clay uppercase tracking-wide">
                          {product.category}
                        </span>
                        <span className="text-soil/30">•</span>
                        <span className="text-xs text-soil/50 capitalize">
                          {product.material}
                        </span>
                      </div>

                      {/* Name */}
                      <h3 className="text-lg font-bold text-soil mb-2 group-hover:text-clay transition-colors line-clamp-1">
                        {product.name}
                      </h3>

                      {/* Description */}
                      <p className="text-sm text-soil/60 mb-3 line-clamp-2 min-h-[40px]">
                        {product.description}
                      </p>

                      {/* Care Icons */}
                      <div className="flex gap-2 mb-3">
                        {product.isFoodSafe && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                            Food Safe
                          </span>
                        )}
                        {product.isMicrowaveSafe && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                            Microwave Safe
                          </span>
                        )}
                      </div>

                      {/* Price */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-bold text-clay">
                            ₹{product.price.toLocaleString()}
                          </span>
                          {product.originalPrice && product.originalPrice > product.price && (
                            <span className="text-sm text-soil/40 line-through">
                              ₹{product.originalPrice.toLocaleString()}
                            </span>
                          )}
                        </div>

                        {/* Rating */}
                        {product.rating > 0 && (
                          <div className="flex items-center gap-1 text-sm">
                            <span className="text-yellow-500">★</span>
                            <span className="text-soil/70">{product.rating}</span>
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
              We create custom pieces tailored to your vision. From personalized gifts
              to bespoke tableware sets, let's craft something special together.
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
