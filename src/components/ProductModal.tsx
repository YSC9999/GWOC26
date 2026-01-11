"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Heart,
  ShoppingCart,
  Star,
  Truck,
  Shield,
  RotateCcw,
  Check,
  Loader2,
  Minus,
  Plus,
} from "lucide-react";
import { useCart } from "@/lib/cart";
import { useAuth } from "@/lib/auth";

interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  longDescription: string;
  price: number;
  originalPrice?: number;
  category: string;
  images: string[];
  material: string;
  isFoodSafe: boolean;
  isMicrowaveSafe: boolean;
  isDishwasherSafe: boolean;
  careInstructions: string;
  inStock: boolean;
  stockQuantity: number;
  weightGrams: number;
  dimensions: { length: number; width: number; height: number };
  rating: number;
  reviewCount: number;
  tags: string[];
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

interface ProductModalProps {
  productId: string | null;
  onClose: () => void;
}

export default function ProductModal({
  productId,
  onClose,
}: ProductModalProps) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const cart = useCart();
  const { user, login } = useAuth();

  useEffect(() => {
    if (productId) {
      fetchProduct();
      setQuantity(1);
      setAddedToCart(false);
    } else {
      setProduct(null);
    }
  }, [productId]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (productId) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [productId]);

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/products/${productId}`);
      const data = await res.json();
      if (data.product) {
        setProduct(data.product);
      }
    } catch (error) {
      console.error("Failed to fetch product:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;

    cart.add({
      id: product._id as any,
      name: product.name,
      price: product.price,
      qty: quantity,
      stock: product.stockQuantity || 0,
    });

    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleWishlist = async () => {
    if (!user || !productId) {
      alert("Please login to add to wishlist");
      return;
    }

    const currentWishlist = user.wishlist || [];
    const isLiked = currentWishlist.includes(productId);
    const newWishlist = isLiked
      ? currentWishlist.filter((id) => id !== productId)
      : [...currentWishlist, productId];

    login({ ...user, wishlist: newWishlist });

    try {
      const res = await fetch("/api/user/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });

      const data = await res.json();
      if (!res.ok) login({ ...user, wishlist: currentWishlist });
      else login({ ...user, wishlist: data.wishlist });
    } catch (err) {
      login({ ...user, wishlist: currentWishlist });
    }
  };

  const getProductImage = () => {
    if (
      product?.images &&
      product.images.length > 0 &&
      product.images[0].startsWith("/")
    ) {
      return product.images[0];
    }
    return null;
  };

  const discount = product?.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 0;

  if (!productId) return null;

  return (
    <AnimatePresence>
      {productId && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="relative bg-white rounded-3xl w-full max-w-5xl max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 p-2 bg-white/90 hover:bg-white rounded-full shadow-lg text-soil hover:text-clay transition-colors"
            >
              <X size={24} />
            </button>

            {loading ? (
              <div className="flex items-center justify-center py-32">
                <Loader2 className="w-8 h-8 animate-spin text-clay" />
                <span className="ml-3 text-soil/70">Loading product...</span>
              </div>
            ) : product ? (
              <div className="grid grid-cols-1 lg:grid-cols-2">
                {/* Image Section */}
                <div className="bg-gradient-to-br from-sand to-sand/50 h-72 lg:h-auto lg:min-h-[500px] flex items-center justify-center overflow-hidden relative">
                  {getProductImage() ? (
                    <img
                      src={getProductImage()!}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-[120px]">
                      {categoryEmojis[product.category] || "🏺"}
                    </div>
                  )}

                  {/* Discount Badge */}
                  {discount > 0 && (
                    <div className="absolute top-4 left-4 bg-green-500 text-white font-bold px-4 py-2 rounded-full">
                      {discount}% OFF
                    </div>
                  )}
                </div>

                {/* Details Section */}
                <div className="p-6 lg:p-8 space-y-5">
                  {/* Category */}
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-clay uppercase tracking-wide bg-clay/10 px-3 py-1 rounded-full">
                      {product.category}
                    </span>
                    <span className="text-sm text-soil/50 capitalize">
                      {product.material}
                    </span>
                  </div>

                  {/* Title */}
                  <h2 className="text-3xl lg:text-4xl font-bold text-soil font-serif">
                    {product.name}
                  </h2>

                  {/* Rating */}
                  {product.rating > 0 && (
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={18}
                            className={
                              i < Math.floor(product.rating)
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300"
                            }
                          />
                        ))}
                      </div>
                      <span className="text-soil/60">
                        {product.rating} ({product.reviewCount} reviews)
                      </span>
                    </div>
                  )}

                  {/* Price */}
                  <div className="flex items-baseline gap-4">
                    <span className="text-3xl font-bold text-clay">
                      ₹{product.price.toLocaleString()}
                    </span>
                    {product.originalPrice &&
                      product.originalPrice > product.price && (
                        <span className="text-xl text-soil/40 line-through">
                          ₹{product.originalPrice.toLocaleString()}
                        </span>
                      )}
                  </div>

                  {/* Description */}
                  <p className="text-soil/70 leading-relaxed">
                    {product.longDescription || product.description}
                  </p>

                  {/* Care Badges */}
                  <div className="flex flex-wrap gap-2">
                    {product.isFoodSafe && (
                      <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                        <Check size={14} /> Food Safe
                      </span>
                    )}
                    {product.isMicrowaveSafe && (
                      <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                        <Check size={14} /> Microwave Safe
                      </span>
                    )}
                    {product.isDishwasherSafe && (
                      <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium">
                        <Check size={14} /> Dishwasher Safe
                      </span>
                    )}
                  </div>

                  {/* Stock Status */}
                  {product.inStock ? (
                    <div className="flex items-center gap-2 text-green-600">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      <span className="font-medium text-sm">
                        In Stock - Ships within 2-3 days
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-red-600">
                      <div className="w-2 h-2 bg-red-500 rounded-full" />
                      <span className="font-medium text-sm">
                        Currently Out of Stock
                      </span>
                    </div>
                  )}

                  {/* Quantity & Add to Cart */}
                  <div className="space-y-4 pt-4 border-t border-soil/10">
                    <div className="flex items-center gap-4">
                      <span className="font-semibold text-soil">Quantity:</span>
                      <div className="flex items-center bg-sand rounded-full">
                        <button
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          className="p-2 hover:text-clay transition-colors"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="px-4 py-1 font-semibold min-w-[40px] text-center">
                          {quantity}
                        </span>
                        <button
                          onClick={() =>
                            setQuantity(
                              Math.min(
                                product.stockQuantity || 10,
                                quantity + 1
                              )
                            )
                          }
                          className="p-2 hover:text-clay transition-colors"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={handleAddToCart}
                        disabled={!product.inStock || addedToCart}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-full font-semibold transition-all ${addedToCart
                          ? "bg-green-500 text-white"
                          : product.inStock
                            ? "bg-clay text-white hover:bg-clay/90 hover:scale-[1.02]"
                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                          }`}
                      >
                        {addedToCart ? (
                          <>
                            <Check size={20} /> Added!
                          </>
                        ) : (
                          <>
                            <ShoppingCart size={20} /> Add to Cart
                          </>
                        )}
                      </button>

                      <button
                        onClick={handleWishlist}
                        className={`p-3 rounded-full border-2 transition-all ${user?.wishlist?.includes(productId!)
                          ? "bg-red-50 border-red-300 text-red-500"
                          : "border-soil/20 text-soil hover:border-clay hover:text-clay"
                          }`}
                      >
                        <Heart
                          size={20}
                          fill={user?.wishlist?.includes(productId!) ? "currentColor" : "none"}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Benefits */}
                  <div className="grid grid-cols-2 gap-3 pt-4 border-t border-soil/10">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-clay/10 rounded-full text-clay">
                        <Truck size={16} />
                      </div>
                      <div>
                        <div className="font-semibold text-soil text-xs">
                          Free Shipping
                        </div>
                        <div className="text-xs text-soil/50">
                          Orders above ₹2000
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-clay/10 rounded-full text-clay">
                        <RotateCcw size={16} />
                      </div>
                      <div>
                        <div className="font-semibold text-soil text-xs">
                          Easy Returns
                        </div>
                        <div className="text-xs text-soil/50">7-day policy</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-clay/10 rounded-full text-clay">
                        <Shield size={16} />
                      </div>
                      <div>
                        <div className="font-semibold text-soil text-xs">
                          Secure Payment
                        </div>
                        <div className="text-xs text-soil/50">100% secure</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-clay/10 rounded-full text-clay">
                        <Check size={16} />
                      </div>
                      <div>
                        <div className="font-semibold text-soil text-xs">
                          Handcrafted
                        </div>
                        <div className="text-xs text-soil/50">Unique piece</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-32">
                <div className="text-6xl mb-4">🏺</div>
                <h3 className="text-2xl font-bold text-soil mb-2">
                  Product not found
                </h3>
                <p className="text-soil/60">
                  The product you're looking for doesn't exist.
                </p>
              </div>
            )}
          </motion.div>
        </motion.div>
      )
      }
    </AnimatePresence >
  );
}
