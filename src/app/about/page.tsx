"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function About() {
  const stats = [
    { label: "Years of Practice", value: "5+" },
    { label: "Unique Pieces", value: "500+" },
    { label: "Students Taught", value: "100+" },
    { label: "Design Awards", value: "3" },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative h-[80vh] flex items-center justify-center overflow-hidden border-4 border-soil rounded-2xl m-4 mt-8"
      >
        <div className="absolute inset-0 bg-[url('/About-img.png')] bg-cover bg-center bg-scroll"></div>
        <div className="relative z-10 text-center text-white px-4"></div>
      </motion.section>

      {/* Philosophy */}
      <section className="py-24 px-4 md:px-12 bg-white border-4 border-soil rounded-2xl">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center border-4 border-soil rounded-2xl p-12 bg-white/90 shadow-lg">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="border-l-4 border-clay pl-8"
          >
            <span className="text-clay font-medium tracking-wider uppercase mb-2 block">
              Our Philosophy
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-soil font-serif mb-8">
              Wabi-Sabi & The Art of Imperfection
            </h2>
            <div className="space-y-6 text-lg text-soil/70 leading-relaxed">
              <p>
                Named after Matsuo Bashō, the master of haiku, our studio
                embodies the principles of finding profound meaning in simple
                things. We believe that objects we use daily should carry a
                soul.
              </p>
              <p>
                Every bowl, cup, and vase is hand-thrown or hand-built,
                embracing the natural texture of clay and the unpredictable
                magic of glazing. No two pieces are identical, just as no two
                moments in life are the same.
              </p>
              <p>
                In a world of mass production, we choose to slow down. To feel
                the earth between our fingers. To create with intention.
              </p>
            </div>

            <div className="mt-12 grid grid-cols-2 gap-6">
              <div className="border-2 border-soil rounded-lg p-6 bg-sand/20">
                <h4 className="font-bold text-soil mb-2 text-xl">
                  Sustainable
                </h4>
                <p className="text-soil/60">
                  Using locally sourced clay and eco-friendly practices.
                </p>
              </div>
              <div className="border-2 border-soil rounded-lg p-6 bg-sand/20">
                <h4 className="font-bold text-soil mb-2 text-xl">Timeless</h4>
                <p className="text-soil/60">
                  Designs meant to be cherished for generations.
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="relative h-[600px] rounded-3xl overflow-hidden shadow-2xl border-4 border-soil"
          >
            <div className="absolute inset-0 bg-sand/20 z-10" />
            <img
              src="https://images.unsplash.com/photo-1493106641515-6b5631de4bb9?q=80&w=2694&auto=format&fit=crop"
              alt="Pottery making"
              className="absolute inset-0 w-full h-full object-cover"
            />
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 bg-soil text-white border-4 border-sand/50 m-8 rounded-2xl">
        <div className="max-w-7xl mx-auto px-4 md:px-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, idx) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.05 }}
                transition={{ delay: idx * 0.1 }}
                className="border-2 border-sand/30 rounded-lg p-6 hover:shadow-xl transition-shadow duration-300 ease-out cursor-pointer bg-white/5"
              >
                <div className="text-5xl md:text-6xl font-bold text-clay mb-2">
                  {stat.value}
                </div>
                <div className="text-white/60 font-medium tracking-wide">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* The Artist */}
      <section className="py-32 px-4 md:px-12 bg-sand/30">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col items-center justify-center"
          >
            <h2 className="text-5xl md:text-6xl font-bold text-soil font-serif mb-12 text-center">
              The Artist
            </h2>

            <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-10 items-start lg:items-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.8 }}
                className="relative w-full rounded-3xl overflow-hidden shadow-2xl border-4 border-soil"
              >
                <Image
                  src="/Shivangi-Frame.jpeg"
                  alt="Shivangi - The Artist"
                  width={1400}
                  height={900}
                  className="w-full h-auto object-cover"
                  priority
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="px-2 lg:px-6 text-center flex flex-col items-center"
              >
                <p
                  className="text-3xl md:text-4xl text-soil font-semibold leading-relaxed"
                  style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
                >
                  Hi, I'm Shivangi — the hands and heart behind Basho.
                </p>

                <p
                  className="mt-6 text-lg md:text-xl text-[#2b1b14] leading-relaxed italic"
                  style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
                >
                  Basho, a Japanese word that means A Place. But for me, it's my
                  happy place, where every moment with place is cherished. Each
                  piece at Basho is crafted with love and individuality, making
                  it truly one of a kind. Basho was also the name of a legendary
                  Japanese poet known for haiku. Haiku is short, flowing verses
                  that captures life. Like poetry, pottery at Basho flows with
                  rhythm and soul. So come, discover Basho and create your own
                  poetry.
                </p>
                <p></p>
                <div className="bg-white/90 backdrop-blur-sm border border-sand/40 rounded-xl px-6 py-4 flex flex-col items-center text-center">
                  <p className="text-soil font-medium mb-3">
                    Learn more or visit the studio
                  </p>
                  <Link href="/studio">
                    <button className="btn-primary inline-flex items-center gap-2">
                      Visit The Studio <ArrowRight size={20} />
                    </button>
                  </Link>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
