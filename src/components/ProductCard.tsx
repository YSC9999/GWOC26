"use client";

import { Lock } from "lucide-react";
import { UserTier, isTierOrHigher } from "@/lib/tiers";

interface ProductCardProps {
  product: any;
  userTier: UserTier;
}

export default function ProductCard({
  product,
  userTier,
}: ProductCardProps) {
  const allowed = isTierOrHigher(userTier, product.tierRequired);

  return (
    <div className="card p-4 relative">
      <img
        src={product.image}
        alt={product.name}
        className="rounded-lg h-48 w-full object-cover mb-4"
      />

      <h3 className="font-bold text-lg">{product.name}</h3>
      <p className="text-sm text-gray-600 mb-2">
        {product.description}
      </p>

      <div className="flex justify-between items-center mt-3">
        <span className="text-clay font-bold">₹{product.price}</span>

        {allowed ? (
          <button className="btn-primary text-sm">
            Add to Cart
          </button>
        ) : (
          <div className="flex items-center gap-1 text-gray-400 text-sm">
            <Lock size={14} />
            Locked
          </div>
        )}
      </div>

      {!allowed && (
        <div className="absolute inset-0 bg-white/70 rounded-lg flex items-center justify-center">
          <span className="text-sm font-semibold text-gray-600">
            Requires {product.tierRequired}
          </span>
        </div>
      )}
    </div>
  );
}
