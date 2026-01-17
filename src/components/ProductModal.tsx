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
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

// ... (keep existing imports)



import { useCart } from "@/lib/cart";
import { useAuth } from "@/lib/auth";
import { StarRating } from "@/components/StarRating";

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
  topPaddingClass?: string;
}

export default function ProductModal({
  productId,
  onClose,
  topPaddingClass = "items-center pt-28",
}: ProductModalProps) {
  //...
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const cart = useCart();
  const { user, login } = useAuth();

  useEffect(() => {
    if (productId) {
      fetchProduct();
      setQuantity(1);
      setAddedToCart(false);
      setCurrentImageIndex(0);
    } else {
      setProduct(null);
    }
  }, [productId]);

  const isValidImage = (img?: string) =>
    !!img && (img.startsWith("/") || img.startsWith("http") || img.startsWith("data:"));

  const validImages = product?.images?.filter(isValidImage) || [];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % validImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + validImages.length) % validImages.length);
  };


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

  const [statusMsg, setStatusMsg] = useState("");

  const handleAddToCart = () => {
    if (!product) return;

    console.log("Adding to cart:", { name: product.name, qty: quantity, stock: product.stockQuantity, id: product._id });
    const result = cart.add({
      id: product._id as any,
      name: product.name,
      price: product.price,
      qty: quantity,
      stock: product.stockQuantity || 0,
    });

    if (result.success) {
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2000);
      if (result.message) {
        // Show toast for max stock reached
        setStatusMsg("All remaining products added to cart");
        setTimeout(() => setStatusMsg(""), 3000);
      }
    } else if (result.message) {
      setStatusMsg(result.message);
      setTimeout(() => setStatusMsg(""), 3000);
    }
  };

  const handleWishlist = async () => {
    if (!user) {
      alert("Please login to add to wishlist");
      return;
    }

    if (!product?._id) return;

    const targetId = product._id;
    const currentWishlist = user.wishlist || [];
    const isLiked = currentWishlist.some((item: any) => {
      const itemId = typeof item === "string" ? item : item._id;
      return itemId === targetId;
    });

    const newWishlist = isLiked
      ? currentWishlist.filter((item: any) => {
        const itemId = typeof item === "string" ? item : item._id;
        return itemId !== targetId;
      })
      : [...currentWishlist, targetId];

    login({ ...user, wishlist: newWishlist });

    try {
      const res = await fetch("/api/user/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: targetId }),
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
          className={`fixed inset-0 z-[9999] flex justify-center p-4 ${topPaddingClass} bg-black/60 backdrop-blur-sm`}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="relative bg-white rounded-3xl w-full max-w-4xl max-h-[calc(100vh-8rem)] overflow-y-auto shadow-2xl [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']"
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
              <div>
                <div className="grid grid-cols-1 lg:grid-cols-2">
                  {/* Image Section */}
                  <div className="bg-gradient-to-br from-sand to-sand/50 h-96 lg:h-auto lg:min-h-[500px] flex items-center justify-center overflow-hidden relative group">
                    {/* Main Image */}
                    {validImages.length > 0 ? (
                      <motion.img
                        key={currentImageIndex}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        src={validImages[currentImageIndex]}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-[120px]">
                        {categoryEmojis[product.category] || "🏺"}
                      </div>
                    )}

                    {/* Navigation Arrows */}
                    {validImages.length > 1 && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            prevImage();
                          }}
                          className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 hover:bg-white text-soil shadow-lg opacity-0 group-hover:opacity-100 transition-all transform hover:scale-110"
                        >
                          <ChevronLeft size={24} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            nextImage();
                          }}
                          className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 hover:bg-white text-soil shadow-lg opacity-0 group-hover:opacity-100 transition-all transform hover:scale-110"
                        >
                          <ChevronRight size={24} />
                        </button>

                        {/* Dots/Thumbnails Indicator */}
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                          {validImages.map((_, idx) => (
                            <button
                              key={idx}
                              onClick={(e) => {
                                e.stopPropagation();
                                setCurrentImageIndex(idx);
                              }}
                              className={`w-2.5 h-2.5 rounded-full transition-all shadow-sm ${idx === currentImageIndex
                                ? "bg-clay w-6"
                                : "bg-white/70 hover:bg-white"
                                }`}
                            />
                          ))}
                        </div>
                      </>
                    )}

                    {/* Discount Badge */}
                    {discount > 0 && (
                      <div className="absolute top-4 left-4 bg-green-500 text-white font-bold px-4 py-2 rounded-full z-10">
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

                    </div>

                    {/* Title */}
                    <h2 className="text-3xl lg:text-4xl font-bold text-soil font-serif">
                      {product.name}
                    </h2>

                    {/* Rating */}
                    {product.rating > 0 && (
                      <div className="flex items-center gap-3">
                        <StarRating rating={product.rating} size={18} showCount={false} />
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
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-green-600">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                          <span className="font-medium text-sm">
                            In Stock - Ships within 2-3 days
                          </span>
                        </div>
                        {product.stockQuantity !== undefined && product.stockQuantity <= 5 && product.stockQuantity > 0 && (
                          <p className="text-amber-600 text-sm font-bold animate-pulse">
                            🔥 Hurry! Only {product.stockQuantity} left in stock!
                          </p>
                        )}

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
                          className={`p-3 rounded-full border-2 transition-all ${product?._id && user?.wishlist?.some((item: any) => (typeof item === 'string' ? item : item._id) === product._id)
                            ? "bg-red-50 border-red-300 text-red-500"
                            : "border-soil/20 text-soil hover:border-clay hover:text-clay"
                            }`}
                        >
                          <Heart
                            size={20}
                            fill={product?._id && user?.wishlist?.some((item: any) => (typeof item === 'string' ? item : item._id) === product._id) ? "currentColor" : "none"}
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

                {/* Reviews Section */}
                <ReviewsSection productId={product._id} />

              </div >
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

      {/* Toast Notification */}
      {statusMsg && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-24 right-4 z-[10000] bg-white text-soil border-[3px] border-clay px-6 py-3 rounded-full shadow-2xl text-sm font-bold max-w-[90vw] md:max-w-sm"
        >
          {statusMsg}
        </motion.div>
      )}
    </AnimatePresence >
  );
}

// Sub-component for Reviews (keeps main file cleaner)
import { Trash2, ShoppingBag as BagIcon, Camera } from "lucide-react";

function ReviewsSection({ productId }: { productId: string }) {
  const [reviews, setReviews] = useState<any[]>([]);
  const [eligibility, setEligibility] = useState({ eligible: false, hasReviewed: false, canReview: false });
  const [showForm, setShowForm] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [comment, setComment] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchReviews();
    checkEligibility();
  }, [productId, user]);

  const fetchReviews = async () => {
    try {
      const res = await fetch(`/api/reviews?productId=${productId}`);
      const data = await res.json();
      setReviews(data.reviews || []);
    } catch (e) {
      console.error(e);
    }
  };

  const checkEligibility = async () => {
    if (!user) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/reviews?productId=${productId}&checkEligibility=true`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      setEligibility(data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          productId,
          rating: newRating,
          comment,
          images, // Send images
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setShowForm(false);
        setComment("");
        setImages([]);
        fetchReviews(); // Refresh
        checkEligibility(); // Hide form logic
      } else {
        alert(data.error);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (reviewId: string) => {
    if (!confirm("Delete this review?")) return;
    const token = localStorage.getItem("token");
    try {
      await fetch(`/api/reviews?id=${reviewId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      fetchReviews();
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <div className="bg-[#FDFBF7] p-8 border-t border-soil/10">
      <h3 className="text-2xl font-serif font-bold text-soil mb-6">Customer Reviews</h3>

      {/* Write Review Button / State */}
      <div className="mb-8">
        {!user ? (
          <p className="text-soil/60 text-sm">Please login to write a review.</p>
        ) : eligibility.canReview ? (
          !showForm ? (
            <button onClick={() => setShowForm(true)} className="bg-soil text-white px-6 py-2 rounded-full text-sm font-medium hover:bg-clay transition-colors">
              Write a Review
            </button>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-sm border border-soil/10 animate-fade-in-up">
              <div className="mb-4">
                <label className="block text-sm font-bold text-soil mb-2">Rating</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button type="button" key={star} onClick={() => setNewRating(star)} className="focus:outline-none transition-transform hover:scale-110">
                      <Star size={24} className={star <= newRating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"} />
                    </button>
                  ))}
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-bold text-soil mb-2">Review</label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full p-3 border border-soil/20 rounded-lg focus:outline-none focus:border-clay"
                  rows={3}
                  placeholder="Tell us what you like about this product..."
                  required
                />
              </div>
              {/* Photo Upload */}
              <div className="mb-4">
                <label className="block text-sm font-bold text-soil mb-2 flex items-center gap-2">
                  <Camera size={16} /> Add Photos (Optional)
                </label>

                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {images.map((img, idx) => (
                      <div key={idx} className="relative w-16 h-16 rounded-md overflow-hidden border border-soil/20 group">
                        <img src={img} alt="Preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setImages(prev => prev.filter((_, i) => i !== idx))}
                          className="absolute top-0 right-0 bg-red-500 text-white p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}

                    {images.length < 3 && (
                      <label className="w-16 h-16 border-2 border-dashed border-soil/20 rounded-md flex items-center justify-center cursor-pointer hover:border-clay hover:text-clay transition-colors">
                        <Plus size={20} className="text-soil/40" />
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              if (file.size > 5000000) { // 5MB limit
                                alert("File too large (max 5MB)");
                                return;
                              }
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                if (typeof reader.result === 'string') {
                                  setImages(prev => [...prev, reader.result as string]);
                                }
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </label>
                    )}
                  </div>
                  <p className="text-xs text-soil/50">Max 3 images.</p>
                </div>
              </div>

              <div className="flex gap-3">
                <button type="submit" disabled={isSubmitting} className="bg-clay text-white px-6 py-2 rounded-full text-sm font-bold hover:bg-clay/90 disabled:opacity-50 disabled:cursor-not-allowed">
                  {isSubmitting ? (
                    <span className="flex items-center gap-2"><Loader2 className="animate-spin" size={14} /> Posting...</span>
                  ) : "Submit Review"}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="text-soil/60 px-4 py-2 text-sm hover:text-soil">Cancel</button>
              </div>
            </form>
          )
        ) : eligibility.hasReviewed ? (
          <p className="text-green-600 font-medium text-sm flex items-center gap-2"><Check size={16} /> You verified this purchase and reviewed it.</p>
        ) : (
          <div className="bg-sand/20 p-4 rounded-xl flex items-center gap-3 text-soil/70 text-sm">
            <BagIcon size={18} />
            <span>You need to purchase this product to leave a review.</span>
          </div>
        )}
      </div>

      {/* Review List */}
      <div className="space-y-6">
        {reviews.length === 0 ? (
          <p className="text-soil/50 italic">No reviews yet. Be the first to share your thoughts!</p>
        ) : (
          reviews.map((review) => (
            <div key={review._id} className="border-b border-soil/10 pb-6 last:border-0">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-clay text-white flex items-center justify-center font-bold text-xs">
                    {review.userName?.[0] || "U"}
                  </div>
                  <span className="font-bold text-soil text-sm">{review.userName || "Customer"}</span>
                  <span className="text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                    <Check size={10} /> Verified Purchase
                  </span>
                </div>
                <div className="flex items-center gap-1 text-xs text-soil/40">
                  {new Date(review.createdAt).toLocaleDateString()}
                  {user?.role === 'admin' && (
                    <button onClick={() => handleDelete(review._id)} className="ml-4 text-red-400 hover:text-red-600 p-1">
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
              <div className="mb-2">
                <StarRating rating={review.rating} size={14} showCount={false} />
              </div>
              <p className="text-soil/80 text-sm leading-relaxed mb-3">{review.comment}</p>

              {/* Review Images */}
              {review.images && review.images.length > 0 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {review.images.map((img: string, idx: number) => (
                    <div key={idx} className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border border-soil/10">
                      <img src={img} alt="Review" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
