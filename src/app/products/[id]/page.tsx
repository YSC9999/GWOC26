"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Heart,
  Share2,
  ShoppingCart,
  Star,
  Truck,
  Shield,
  RotateCcw,
  Check,
  Loader2,
  ChevronLeft,
  Minus,
  Plus,
} from "lucide-react";
import { useCart } from "@/lib/cart";

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

export default function ProductDetail() {
  const params = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [wishlist, setWishlist] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const cart = useCart();

  useEffect(() => {
    if (params.id) {
      fetchProduct();
    }
  }, [params.id]);

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/products/${params.id}`);
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
    
    for (let i = 0; i < quantity; i++) {
      cart.add({
        id: product._id as any,
        name: product.name,
        price: product.price,
        qty: 1,
      });
    }
    
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const getProductImage = () => {
    if (product?.images && product.images.length > 0 && product.images[0].startsWith("/")) {
      return product.images[0];
    }
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-clay" />
        <span className="ml-3 text-soil/70">Loading product...</span>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="text-6xl mb-4">🏺</div>
        <h2 className="text-2xl font-bold text-soil mb-2">Product not found</h2>
        <p className="text-soil/60 mb-6">The product you're looking for doesn't exist.</p>
        <Link href="/products" className="btn-primary">
          Browse Products
        </Link>
      </div>
    );
  }

  const discount = product.originalPrice 
    ? Math.round((1 - product.price / product.originalPrice) * 100) 
    : 0;

  return (
    <div className="min-h-screen py-8">
      {/* Breadcrumb */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mb-8"
      >
        <Link 
          href="/products" 
          className="inline-flex items-center gap-2 text-soil/60 hover:text-clay transition-colors"
        >
          <ChevronLeft size={18} />
          Back to Products
        </Link>
      </motion.div>

      {/* Product Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Image */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="bg-gradient-to-br from-sand to-sand/50 rounded-3xl h-[500px] flex items-center justify-center overflow-hidden relative">
            {getProductImage() ? (
              <img
                src={getProductImage()!}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-[150px]">
                {categoryEmojis[product.category] || "🏺"}
              </div>
            )}
            
            {/* Badges */}
            {discount > 0 && (
              <div className="absolute top-4 left-4 bg-green-500 text-white font-bold px-4 py-2 rounded-full">
                {discount}% OFF
              </div>
            )}
          </div>
        </motion.div>

        {/* Details */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
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
          <h1 className="text-4xl md:text-5xl font-bold text-soil font-serif">
            {product.name}
          </h1>

          {/* Rating */}
          {product.rating > 0 && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={20}
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
            <span className="text-4xl font-bold text-clay">
              ₹{product.price.toLocaleString()}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-xl text-soil/40 line-through">
                ₹{product.originalPrice.toLocaleString()}
              </span>
            )}
          </div>

          {/* Description */}
          <p className="text-lg text-soil/70 leading-relaxed">
            {product.longDescription || product.description}
          </p>

          {/* Care Badges */}
          <div className="flex flex-wrap gap-3">
            {product.isFoodSafe && (
              <span className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-medium">
                <Check size={16} /> Food Safe
              </span>
            )}
            {product.isMicrowaveSafe && (
              <span className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium">
                <Check size={16} /> Microwave Safe
              </span>
            )}
            {product.isDishwasherSafe && (
              <span className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-medium">
                <Check size={16} /> Dishwasher Safe
              </span>
            )}
          </div>

          {/* Stock Status */}
          {product.inStock ? (
            <div className="flex items-center gap-2 text-green-600">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              <span className="font-medium">In Stock - Ships within 2-3 days</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-red-600">
              <div className="w-3 h-3 bg-red-500 rounded-full" />
              <span className="font-medium">Currently Out of Stock</span>
            </div>
          )}

          {/* Quantity & Add to Cart */}
          <div className="space-y-4 pt-4 border-t border-soil/10">
            <div className="flex items-center gap-6">
              <span className="font-semibold text-soil">Quantity:</span>
              <div className="flex items-center bg-sand rounded-full">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-3 hover:text-clay transition-colors"
                >
                  <Minus size={18} />
                </button>
                <span className="px-6 py-2 font-semibold text-lg min-w-[60px] text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(Math.min(product.stockQuantity || 10, quantity + 1))}
                  className="p-3 hover:text-clay transition-colors"
                >
                  <Plus size={18} />
                </button>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleAddToCart}
                disabled={!product.inStock || addedToCart}
                className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-full font-semibold text-lg transition-all ${
                  addedToCart
                    ? "bg-green-500 text-white"
                    : product.inStock
                    ? "bg-clay text-white hover:bg-clay/90 hover:scale-[1.02]"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                {addedToCart ? (
                  <>
                    <Check size={22} /> Added to Cart
                  </>
                ) : (
                  <>
                    <ShoppingCart size={22} /> Add to Cart
                  </>
                )}
              </button>
              
              <button
                onClick={() => setWishlist(!wishlist)}
                className={`p-4 rounded-full border-2 transition-all ${
                  wishlist
                    ? "bg-red-50 border-red-300 text-red-500"
                    : "border-soil/20 text-soil hover:border-clay hover:text-clay"
                }`}
              >
                <Heart size={22} fill={wishlist ? "currentColor" : "none"} />
              </button>
              
              <button className="p-4 rounded-full border-2 border-soil/20 text-soil hover:border-clay hover:text-clay transition-all">
                <Share2 size={22} />
              </button>
            </div>
          </div>

          {/* Benefits */}
          <div className="grid grid-cols-2 gap-4 pt-6 border-t border-soil/10">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-clay/10 rounded-full text-clay">
                <Truck size={20} />
              </div>
              <div>
                <div className="font-semibold text-soil text-sm">Free Shipping</div>
                <div className="text-xs text-soil/50">On orders above ₹2000</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-clay/10 rounded-full text-clay">
                <RotateCcw size={20} />
              </div>
              <div>
                <div className="font-semibold text-soil text-sm">Easy Returns</div>
                <div className="text-xs text-soil/50">7-day return policy</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-clay/10 rounded-full text-clay">
                <Shield size={20} />
              </div>
              <div>
                <div className="font-semibold text-soil text-sm">Secure Payment</div>
                <div className="text-xs text-soil/50">100% secure checkout</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-clay/10 rounded-full text-clay">
                <Check size={20} />
              </div>
              <div>
                <div className="font-semibold text-soil text-sm">Handcrafted</div>
                <div className="text-xs text-soil/50">Each piece is unique</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Product Details Section */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8"
      >
        {/* Specifications */}
        <div className="bg-white rounded-2xl p-8 shadow-sm">
          <h3 className="text-2xl font-bold text-soil mb-6 font-serif">Specifications</h3>
          <div className="space-y-4">
            <div className="flex justify-between py-3 border-b border-soil/10">
              <span className="text-soil/60">Material</span>
              <span className="font-medium text-soil capitalize">{product.material}</span>
            </div>
            <div className="flex justify-between py-3 border-b border-soil/10">
              <span className="text-soil/60">Weight</span>
              <span className="font-medium text-soil">{product.weightGrams}g</span>
            </div>
            {product.dimensions && (
              <div className="flex justify-between py-3 border-b border-soil/10">
                <span className="text-soil/60">Dimensions</span>
                <span className="font-medium text-soil">
                  {product.dimensions.length} × {product.dimensions.width} × {product.dimensions.height} cm
                </span>
              </div>
            )}
            <div className="flex justify-between py-3 border-b border-soil/10">
              <span className="text-soil/60">Category</span>
              <span className="font-medium text-soil capitalize">{product.category}</span>
            </div>
          </div>
        </div>

        {/* Care Instructions */}
        <div className="bg-sand/50 rounded-2xl p-8">
          <h3 className="text-2xl font-bold text-soil mb-6 font-serif">Care Instructions</h3>
          <p className="text-soil/70 leading-relaxed mb-4">
            {product.careInstructions || "Hand wash recommended for best results. Avoid sudden temperature changes to preserve the beauty of the piece."}
          </p>
          <div className="space-y-3">
            {product.isFoodSafe && (
              <div className="flex items-center gap-3 text-green-700">
                <Check size={18} /> Safe for food contact
              </div>
            )}
            {product.isMicrowaveSafe && (
              <div className="flex items-center gap-3 text-blue-700">
                <Check size={18} /> Safe for microwave use
              </div>
            )}
            {product.isDishwasherSafe && (
              <div className="flex items-center gap-3 text-purple-700">
                <Check size={18} /> Dishwasher safe
              </div>
            )}
            {!product.isDishwasherSafe && (
              <div className="flex items-center gap-3 text-amber-700">
                <Check size={18} /> Hand wash recommended
              </div>
            )}
          </div>
        </div>
      </motion.section>

      {/* Tags */}
      {product.tags && product.tags.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="mt-8 flex flex-wrap gap-2"
        >
          {product.tags.map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 bg-sand text-soil/60 rounded-full text-sm"
            >
              #{tag}
            </span>
          ))}
        </motion.div>
      )}
    </div>
  );
}
