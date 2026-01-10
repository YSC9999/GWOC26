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
        className="relative h-[80vh] flex items-center justify-center overflow-hidden"
      >
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1565193566173-7a64b2787686?q=80&w=2670&auto=format&fit=crop')] bg-cover bg-center bg-fixed">
          <div className="absolute inset-0 bg-black/40" />
        </div>
        <div className="relative z-10 text-center text-white px-4">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-block px-4 py-2 border border-white/30 rounded-full text-sm font-medium mb-6 uppercase tracking-wider backdrop-blur-sm"
          >
            Since 2021
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-5xl md:text-7xl font-bold font-serif mb-6 leading-tight"
          >
            Crafting Stillness
            <br />
            <span className="italic font-light">in a chaotic world</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto font-light leading-relaxed"
          >
            Basho is an ode to the slow, the imperfect, and the enduring beauty 
            of handcrafted ceramics.
          </motion.p>
        </div>
      </motion.section>

      {/* Philosophy */}
      <section className="py-24 px-4 md:px-12 bg-white">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="text-clay font-medium tracking-wider uppercase mb-2 block">Our Philosophy</span>
            <h2 className="text-4xl md:text-5xl font-bold text-soil font-serif mb-8">
              Wabi-Sabi & The Art of Imperfection
            </h2>
            <div className="space-y-6 text-lg text-soil/70 leading-relaxed">
              <p>
                Named after Matsuo Bashō, the master of haiku, our studio embodies the 
                principles of finding profound meaning in simple things. We believe 
                that objects we use daily should carry a soul.
              </p>
              <p>
                Every bowl, cup, and vase is hand-thrown or hand-built, embracing the 
                natural texture of clay and the unpredictable magic of glazing. No two 
                pieces are identical, just as no two moments in life are the same.
              </p>
              <p>
                In a world of mass production, we choose to slow down. To feel the 
                earth between our fingers. To create with intention.
              </p>
            </div>
            
            <div className="mt-12 grid grid-cols-2 gap-12">
              <div>
                <h4 className="font-bold text-soil mb-2 text-xl">Sustainable</h4>
                <p className="text-soil/60">Using locally sourced clay and eco-friendly practices.</p>
              </div>
              <div>
                <h4 className="font-bold text-soil mb-2 text-xl">Timeless</h4>
                <p className="text-soil/60">Designs meant to be cherished for generations.</p>
              </div>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="relative h-[600px] rounded-3xl overflow-hidden shadow-2xl"
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
      <section className="py-20 bg-soil text-white">
        <div className="max-w-7xl mx-auto px-4 md:px-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, idx) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <div className="text-5xl md:text-6xl font-bold text-clay mb-2">{stat.value}</div>
                <div className="text-white/60 font-medium tracking-wide">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* The Artist */}
      <section className="py-24 px-4 md:px-12 bg-sand/30">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="w-40 h-40 mx-auto rounded-full overflow-hidden border-4 border-white shadow-xl mb-8"
          >
            {/* Placeholder for founder image */}
            <div className="w-full h-full bg-clay/20 flex items-center justify-center text-5xl">👩‍🎨</div>
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-4xl font-bold text-soil mb-8 font-serif"
          >
            Meet Shivangi
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-soil/70 leading-relaxed italic max-w-3xl mx-auto mb-12"
          >
            "Pottery for me isn't just about making objects. It's a meditation. 
            It's about surrendering control and finding beauty in the unexpected. 
            Each piece I make carries a part of my journey, a quiet conversation 
            between my hands and the earth."
          </motion.p>
          
          <Link href="/studio">
            <button className="btn-primary inline-flex items-center gap-2">
              Visit The Studio <ArrowRight size={20} />
            </button>
          </Link>
        </div>
      </section>
    </div>
  );
}
