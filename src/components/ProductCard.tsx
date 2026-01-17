"use client";

import { Lock, Heart, Minus, Plus } from "lucide-react";
import { UserTier, isTierOrHigher } from "@/lib/tiers";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { useCart } from "@/lib/cart";

import { motion, AnimatePresence } from "framer-motion";
import { hoverScale, clickTap } from "@/lib/animations";

interface ProductCardProps {
  product: any;
  userTier: UserTier;
  onProductClick?: (product: any) => void;
}

export default function ProductCard({ product, userTier, onProductClick }: ProductCardProps) {
  const allowed = isTierOrHigher(
    userTier,
    product.tierRequired || UserTier.TIER_0
  );
  const { user } = useAuth();
  const { add, items, updateQty } = useCart();
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState("");

  const qtyInCart = items.find((i) => i.id === product._id)?.qty || 0;

  // Check if product is in user's wishlist on mount
  useEffect(() => {
    if (user?.wishlist) {
      const isInWishlist = user.wishlist.some((item: any) => {
        const itemId = typeof item === "string" ? item : item._id;
        return itemId === product._id;
      });
      setIsLiked(isInWishlist);
    }
  }, [user, product._id]);

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      setToastMessage("Please login to add to wishlist");
      setTimeout(() => setToastMessage(""), 3000);
      return;
    }

    // Optimistic update
    const previousState = isLiked;
    setIsLiked(!isLiked);

    try {
      // Update global state optimistically
      const startWishlist = user.wishlist || [];
      const newWishlist = isLiked
        ? startWishlist.filter((item: any) => (typeof item === 'string' ? item : item._id) !== product._id)
        : [...startWishlist, product._id];

      // We need to access login from useAuth, but we destructured only user. 
      // Need to update the hook usage first.
      useAuth.getState().login({ ...user, wishlist: newWishlist });

      const res = await fetch("/api/user/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product._id }),
      });

      if (!res.ok) {
        setIsLiked(previousState); // Revert on failure
        useAuth.getState().login({ ...user, wishlist: startWishlist });
      } else {
        const data = await res.json();
        useAuth.getState().login({ ...user, wishlist: data.wishlist });
      }
    } catch (err) {
      setIsLiked(previousState); // Revert on error
      useAuth.getState().login({ ...user, wishlist: user.wishlist || [] });
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const result = add({
      id: product._id,
      name: product.name,
      price: product.price,
      image: product.images?.[0] || product.image,
      qty: 1,
      stock: product.stockQuantity ?? (product.inStock ? 100 : 0),
    });

    if (result.success) {
      // Success feedback handled by UI state update
      if (result.message) {
        // Show message for max stock reached
        setToastMessage("All remaining products added to cart");
        setTimeout(() => setToastMessage(""), 3000);
      }
    } else {
      setToastMessage(result.message || "Failed to add to cart");
      setTimeout(() => setToastMessage(""), 3000);
    }
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    updateQty(product._id, qtyInCart - 1);
  };

  return (
    <div
      onClick={(e) => {
        if (onProductClick) {
          e.preventDefault();
          onProductClick(product);
        }
      }}
      className="cursor-pointer h-full"
    >
      <Link
        href={`/products/${product.slug || product._id}`}
        className="block group h-full"
        onClick={(e) => {
          if (onProductClick) {
            e.preventDefault();
          }
        }}
      >
        <motion.div whileHover={hoverScale} className="card p-3 relative h-full flex flex-col">
          <motion.button
            whileTap={clickTap}
            onClick={handleLike}
            className="absolute top-3 right-3 z-10 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm hover:bg-white transition-all"
          >
            <Heart
              size={18}
              className={isLiked ? "fill-red-500 text-red-500" : "text-gray-400"}
            />
          </motion.button>

          <div className="relative overflow-hidden rounded-lg mb-3 h-40">
            <img
              src={product.images?.[0] || product.image}
              alt={product.name}
              className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
            />
            {!allowed && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[2px]">
                <div className="bg-white/90 px-3 py-1.5 rounded-full flex items-center gap-1.5 text-xs font-semibold text-gray-800 shadow-lg">
                  <Lock size={12} />
                  <span>Requires {product.tierRequired}</span>
                </div>
              </div>
            )}
          </div>

          <div className="flex-1 flex flex-col min-h-0">
            <h3 className="font-serif font-bold text-base md:text-lg text-soil mb-1 line-clamp-1">
              {product.name}
            </h3>
            <p className="text-xs text-stone-500 mb-2 line-clamp-2 h-8">
              {product.description}
            </p>

            {/* Low Stock Warning - Reserved Height */}
            <div className="h-4 mb-1">
              {product.stockQuantity !== undefined && product.stockQuantity <= 5 && product.stockQuantity > 0 && (
                <p className="text-[10px] text-amber-600 font-bold animate-pulse">
                  🔥 Hurry! Only {product.stockQuantity} left!
                </p>
              )}
            </div>

            <div className="mt-auto flex justify-between items-center pt-2 border-t border-stone-100 gap-2">
              <span className="text-clay font-bold text-base md:text-lg whitespace-nowrap">
                ₹{product.price}
              </span>

              {allowed ? (
                qtyInCart > 0 ? (
                  <div 
                    className="flex items-center gap-3 bg-[#C88265] text-white px-3 py-1.5 md:px-4 md:py-2 rounded-lg shadow-sm"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }} // Prevent card click
                  >
                    <motion.button 
                      whileTap={clickTap} 
                      onClick={handleDecrement} 
                      className="p-0.5 hover:bg-white/20 rounded-full transition-colors"
                    >
                      <Minus size={14} strokeWidth={3} />
                    </motion.button>
                    
                    <span className="text-xs font-bold w-4 text-center select-none pt-[1px]">
                      {qtyInCart}
                    </span>
                    
                    <motion.button 
                      whileTap={clickTap} 
                      onClick={handleAddToCart} 
                      className="p-0.5 hover:bg-white/20 rounded-full transition-colors"
                    >
                      <Plus size={14} strokeWidth={3} />
                    </motion.button>
                  </div>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={clickTap}
                    onClick={handleAddToCart}
                    className="btn-primary text-xs px-3 py-1.5 md:px-4 md:py-2 whitespace-nowrap"
                  >
                    Add to Cart
                  </motion.button>
                )
              ) : (
                <span className="text-xs text-stone-400 italic">Locked</span>
              )}
            </div>
          </div>
        </motion.div>
      </Link>

      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-24 right-4 z-50 bg-white text-soil border-[3px] border-clay px-6 py-3 rounded-full shadow-2xl text-sm font-bold max-w-[90vw] md:max-w-sm"
          >
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
