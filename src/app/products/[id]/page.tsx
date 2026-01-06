"use client";
import Image from "next/image";
import { PRODUCTS } from "@/lib/products";
import { useCart } from "@/lib/cart";
import { useParams } from "next/navigation";

export default function ProductDetail() {
  const params = useParams();
  const add = useCart(s => s.add);

  // 🔥 FIX: convert id correctly
  const id = Array.isArray(params.id) ? Number(params.id[0]) : Number(params.id);
  const product = PRODUCTS.find(p => p.id === id);

  if (!product) return <div className="p-32 text-center">Product not found</div>;

  return (
    <main className="max-w-6xl mx-auto px-6 py-32 grid md:grid-cols-2 gap-20 items-center">
      <Image src={product.img} width={600} height={600} alt={product.name} className="rounded-3xl" />

      <div>
        <h1 className="font-serif text-4xl mb-4">{product.name}</h1>
        <p className="text-[#6d4c3d] mb-4">{product.desc}</p>
        <p className="text-2xl mb-8">₹{product.price}</p>

        <button
          onClick={() => add({ id: product.id, name: product.name, price: product.price, qty: 1 })}
          className="border border-[#6d4c3d] px-8 py-3 rounded-full hover:bg-[#6d4c3d] hover:text-white transition"
        >
          Add to Cart
        </button>
      </div>
    </main>
  );
}
