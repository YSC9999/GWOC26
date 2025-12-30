"use client";
import Image from "next/image";
import Link from "next/link";
import { PRODUCTS } from "@/lib/products";
import { useCart } from "@/lib/cart";

export default function ProductsPage() {
  const add = useCart(s => s.add);

  return (
    <main className="max-w-7xl mx-auto px-6 py-32">
      <h1 className="font-serif text-5xl text-center mb-16">Basho Collections</h1>

      <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10">
        {PRODUCTS.map(p => (
          <div key={p.id} className="bg-white rounded-3xl shadow-md p-5 text-center hover:shadow-xl transition">
            <Image src={p.img} width={400} height={400} alt={p.name} className="rounded-xl mb-4" />
            <h3 className="font-serif text-lg">{p.name}</h3>
            <p className="text-xs uppercase tracking-widest text-[#8a6b52]">{p.category}</p>
            <p className="my-2 font-medium">₹{p.price}</p>

            <div className="flex justify-center gap-3">
              <button
                onClick={() => add({ id: p.id, name: p.name, price: p.price, qty: 1 })}
                className="border border-[#6d4c3d] px-4 py-1 rounded-full hover:bg-[#6d4c3d] hover:text-white"
              >
                Add
              </button>

              <Link
                href={`/products/${p.id}`}
                className="border border-[#6d4c3d] px-4 py-1 rounded-full hover:bg-[#6d4c3d] hover:text-white"
              >
                View
              </Link>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
