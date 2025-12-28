"use client";

import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="w-full fixed top-0 left-0 bg-sand/90 backdrop-blur border-b border-soil/10 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <Link href="/" className="font-serif text-2xl text-soil">
          Basho
        </Link>

        <div className="space-x-6 text-sm uppercase tracking-widest">
          <Link href="/" className="hover:text-clay">Home</Link>
          <Link href="/about" className="hover:text-clay">About</Link>
          <Link href="/products" className="hover:text-clay">Products</Link>
          <Link href="/workshops" className="hover:text-clay">Workshops</Link>
          <Link href="/studio" className="hover:text-clay">Studio</Link>
          <Link href="/contact" className="hover:text-clay">Contact</Link>
        </div>
      </div>
    </nav>
  );
}
