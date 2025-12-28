"use client";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6 pt-32">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="text-center max-w-3xl"
      >
        <h1 className="text-5xl md:text-7xl font-serif text-soil mb-6">
          Basho by Shivangi
        </h1>

        <p className="text-lg md:text-xl text-ink/80 mb-10">
          Japanese-inspired handcrafted pottery, studio experiences, and soulful tableware.
        </p>

        <button className="bg-clay text-white px-8 py-3 rounded-full hover:opacity-90 transition">
          Explore the Studio
        </button>
      </motion.div>
    </main>
  );
}
