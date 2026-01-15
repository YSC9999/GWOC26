"use client";

import { Lock, Heart } from "lucide-react";
import { UserTier, isTierOrHigher } from "@/lib/tiers";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";

import { motion } from "framer-motion";
import { hoverScale, clickTap } from "@/lib/animations";

interface ProductCardProps {
  product: any;
  userTier: UserTier;
}

export default function ProductCard({
  product,
  userTier,
}: ProductCardProps) {
  const allowed = isTierOrHigher(userTier, product.tierRequired || UserTier.TIER_0);
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);

  // Check if product is in user's wishlist on mount
  useEffect(() => {
    if (user?.wishlist?.includes(product._id)) {
      setIsLiked(true);
    }
  }, [user, product._id]);

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      alert("Please login to add to wishlist");
      return;
    }

    // Optimistic update
    const previousState = isLiked;
    setIsLiked(!isLiked);

    try {
      const res = await fetch("/api/user/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product._id }),
      });

      if (!res.ok) {
        setIsLiked(previousState); // Revert on failure
      }
    } catch (err) {
      setIsLiked(previousState); // Revert on error
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Todo: Add to cart logic
  };

  return (
    <Link href={`/products/${product.slug || product._id}`} className="block group">
      <motion.div
        whileHover={hoverScale}
        className="card p-4 relative"
      >
        <motion.button
          whileTap={clickTap}
          onClick={handleLike}
          className="absolute top-4 right-4 z-10 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm hover:bg-white transition-all"
        >
          <Heart
            size={20}
            className={isLiked ? "fill-red-500 text-red-500" : "text-gray-400"}
          />
        </motion.button>

        <div className="relative overflow-hidden rounded-lg mb-4 h-48">
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

        <h3 className="font-serif font-bold text-base md:text-lg text-soil mb-1 line-clamp-1">{product.name}</h3>
        <p className="text-xs md:text-sm text-stone-500 mb-3 line-clamp-2 min-h-[32px] md:min-h-[40px]">
          {product.description}
        </p>

        <div className="flex justify-between items-center pt-2 border-t border-stone-100">
          <span className="text-clay font-bold text-base md:text-lg">₹{product.price}</span>

          {allowed ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={clickTap}
              onClick={handleAddToCart}
              className="btn-primary text-xs px-3 py-1.5 md:px-4 md:py-2"
            >
              Add to Cart
            </motion.button>
          ) : (
            <span className="text-xs text-stone-400 italic">Locked</span>
          )}
        </div>
      </motion.div>
    </Link>
  );
}
