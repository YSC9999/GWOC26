"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ShoppingCart, Star, Check, Loader2, Minus, Plus } from "lucide-react";
import { useCart } from "@/lib/cart";
import Modal from "@/components/Modal";

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
  inStock: boolean;
  stockQuantity: number;
  rating: number;
}

export default function ProductModal() {
  const params = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const cart = useCart();

  useEffect(() => {
    if (params.id) {
      fetchProduct();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        id: product._id,
        name: product.name,
        price: product.price,
        qty: 1,
        stock: product.stockQuantity || 0,
      });
    }
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  return (
    <Modal>
      {loading ? (
        <div className="flex w-full h-96 items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-clay" />
        </div>
      ) : !product ? (
        <div className="p-8 text-center w-full">Product not found</div>
      ) : (
        <div className="flex flex-col md:flex-row w-full h-full overflow-y-auto md:overflow-hidden">
          {/* Image Side */}
          <div className="w-full md:w-1/2 bg-sand/20 min-h-[300px] md:min-h-full relative flex items-center justify-center p-6">
            {product.images?.[0] ? (
              <img
                src={product.images[0]}
                alt={product.name}
                className="max-h-full max-w-full object-contain drop-shadow-xl"
              />
            ) : (
              <div className="text-9xl">🏺</div>
            )}
          </div>

          {/* Content Side */}
          <div className="w-full md:w-1/2 p-8 md:p-10 flex flex-col h-full overflow-y-auto">
            <div className="mb-auto">
              <span className="text-xs font-bold text-clay uppercase tracking-widest mb-2 block">
                {product.category}
              </span>
              <h2 className="text-3xl font-bold text-soil font-serif mb-2 leading-tight">
                {product.name}
              </h2>

              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-clay">
                    ₹{product.price.toLocaleString()}
                  </span>
                  {product.originalPrice && (
                    <span className="text-sm text-soil/40 line-through">
                      ₹{product.originalPrice}
                    </span>
                  )}
                </div>
                {product.rating > 0 && (
                  <div className="flex items-center gap-1 text-sm bg-sand/30 px-2 py-1 rounded-lg">
                    <Star
                      size={14}
                      className="fill-yellow-400 text-yellow-400"
                    />
                    <span className="text-soil/70">{product.rating}</span>
                  </div>
                )}
              </div>

              <p className="text-soil/70 leading-relaxed mb-6">
                {product.description}
              </p>

              {/* Stock Check */}
              {product.inStock ? (
                <div className="flex items-center gap-2 text-green-600 text-sm font-medium mb-6">
                  <div className="w-2 h-2 bg-green-500 rounded-full" /> In Stock
                </div>
              ) : (
                <div className="text-red-500 mb-6">Out of Stock</div>
              )}

              {/* Controls */}
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-soil/20 rounded-full h-12">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 hover:text-clay transition"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="w-8 text-center font-semibold">
                    {quantity}
                  </span>
                  <button
                    onClick={() =>
                      setQuantity(
                        Math.min(product.stockQuantity || 10, quantity + 1)
                      )
                    }
                    className="px-4 hover:text-clay transition"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                <button
                  onClick={handleAddToCart}
                  disabled={!product.inStock || addedToCart}
                  className={`flex-1 h-12 rounded-full font-bold flex items-center justify-center gap-2 transition-all ${
                    addedToCart
                      ? "bg-green-500 text-white"
                      : "bg-soil text-white hover:bg-clay"
                  }`}
                >
                  {addedToCart ? (
                    <Check size={18} />
                  ) : (
                    <ShoppingCart size={18} />
                  )}
                  {addedToCart ? "Added" : "Add to Cart"}
                </button>
              </div>
            </div>

            {/* Footer Link */}
            <div className="mt-8 pt-6 border-t border-soil/10 text-center">
              <Link
                href={`/products/${params.id}`}
                className="text-sm text-soil/60 hover:text-clay hover:underline"
              >
                View Full Details
              </Link>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
