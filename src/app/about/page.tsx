"use client";
import { motion } from "framer-motion";

export default function About() {
  return (
    <main className="max-w-6xl mx-auto px-6 pt-32 pb-24">
      <motion.h1
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="font-serif text-5xl text-soil mb-10"
      >
        The Philosophy of Basho
      </motion.h1>

      <div className="grid md:grid-cols-2 gap-12 items-center">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-lg leading-relaxed"
        >
          Basho by Shivangi is inspired by the Japanese poet Matsuo Bashō,
          embracing minimalism, nature, imperfection, and soulful craftsmanship.
          Each ceramic piece is hand-shaped, slow-crafted, and infused with
          mindful artistry that honors ancient pottery traditions.
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-lg leading-relaxed"
        >
          We believe in raw textures, earthy tones, and timeless forms.
          Basho is not just tableware — it is a cultural experience,
          a meditative practice, and a celebration of handmade art.
        </motion.p>
      </div>
    </main>
  );
}
