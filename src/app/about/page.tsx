"use client";
import { motion } from "framer-motion";
import { fadeInUp, staggerContainer, hoverScale } from "@/lib/animations";
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
      {/* The Artist */}
      <section className="py-16 px-4 md:px-12 bg-sand/30 mb-16">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="flex flex-col items-center justify-center"
          >
            <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-10 items-start lg:items-center">
              <motion.div
                variants={fadeInUp}
                whileHover={hoverScale}
                className="relative w-full max-w-md mx-auto lg:mx-0 rounded-3xl overflow-hidden shadow-2xl border-4 border-soil"
              >
                <Image
                  src="/Shivangi-Frame1.jpeg"
                  alt="Shivangi - The Artist"
                  width={800}
                  height={600}
                  className="w-full h-auto object-cover"
                  priority
                />
              </motion.div>

              <motion.div
                variants={fadeInUp}
                className="px-2 lg:px-6 text-center flex flex-col items-center"
              >
                <h2 className="text-4xl md:text-5xl font-bold text-soil font-serif mb-8 text-center">
                  The Artist
                </h2>
                <p
                  className="text-2xl md:text-3xl text-soil font-semibold leading-relaxed"
                  style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
                >
                  Hi, I'm Shivangi — the hands and heart behind Basho.
                </p>
                <p
                  className="mt-6 text-base md:text-lg text-[#2b1b14] leading-relaxed"
                  style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
                >
                  My journey with clay began unexpectedly. After Spending years
                  in the world of Dentistry, I found myself searching for
                  something more meaningful — a craft that would connect me to
                  the earth and allow me to create with intention. That's when I
                  discovered pottery, and everything changed. <br/>
                  What started as a weekend hobby quickly became an
                  all-consuming passion. I trained under master potters, studied
                  Japanese ceramic traditions, and fell deeply in love with the
                  philosophy of
                  wabi-sabi — finding
                  beauty in imperfection and embracing the natural, the
                  authentic, and the handmade.
                </p>

                <div className="mt-8 bg-white/90 backdrop-blur-sm border border-sand/40 rounded-xl px-5 py-3 flex flex-col items-center text-center">
                  <p className="text-soil font-medium mb-2 text-sm">
                    Learn more or visit the studio
                  </p>
                  <Link href="/studio">
                    <motion.button
                      whileHover={hoverScale}
                      className="bg-clay text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-clay/90 transition-colors inline-flex items-center gap-2"
                    >
                      Visit The Studio <ArrowRight size={16} />
                    </motion.button>
                  </Link>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Philosophy */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-center border border-soil rounded-xl p-6 md:p-8 bg-white/90 shadow-md">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="border-l-2 border-clay pl-4"
        >
          <motion.span
            variants={fadeInUp}
            className="text-clay font-medium tracking-wider uppercase mb-1 block text-xs"
          >
            Our Philosophy
          </motion.span>
          <motion.h2
            variants={fadeInUp}
            className="text-2xl md:text-3xl font-bold text-soil font-serif mb-4"
          >
            Wabi-Sabi & The Art of Imperfection
          </motion.h2>
          <motion.div
            variants={staggerContainer}
            className="space-y-3 text-sm text-soil/70 leading-relaxed"
          >
            <motion.p variants={fadeInUp}>
              Named after Matsuo Bashō, the master of haiku, our studio embodies
              the principles of finding profound meaning in simple things. We
              believe that objects we use daily should carry a soul.
            </motion.p>
            <motion.p variants={fadeInUp}>
              Every bowl, cup, and vase is hand-thrown or hand-built, embracing
              the natural texture of clay and the unpredictable magic of
              glazing. No two pieces are identical, just as no two moments in
              life are the same.
            </motion.p>
            <motion.p variants={fadeInUp}>
              In a world of mass production, we choose to slow down. To feel the
              earth between our fingers. To create with intention.
            </motion.p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            className="mt-6 grid grid-cols-2 gap-3"
          >
            <motion.div
              variants={fadeInUp}
              whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
              className="border border-soil rounded-lg p-3 bg-sand/20 cursor-pointer"
            >
              <h4 className="font-bold text-soil mb-1 text-base">
                Sustainable
              </h4>
              <p className="text-soil/60 text-xs">
                Using locally sourced clay and eco-friendly practices.
              </p>
            </motion.div>
            <motion.div
              variants={fadeInUp}
              whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
              className="border border-soil rounded-lg p-3 bg-sand/20 cursor-pointer"
            >
              <h4 className="font-bold text-soil mb-1 text-base">Timeless</h4>
              <p className="text-soil/60 text-xs">
                Designs meant to be cherished for generations.
              </p>
            </motion.div>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          whileHover={{ scale: 1.02 }}
          className="relative h-[350px] rounded-xl overflow-hidden shadow-lg border border-soil"
        >
          <div className="absolute inset-0 bg-sand/10 z-10" />
          <img
            src="https://images.unsplash.com/photo-1493106641515-6b5631de4bb9?q=80&w=2694&auto=format&fit=crop"
            alt="Pottery making"
            className="absolute inset-0 w-full h-full object-cover"
          />
        </motion.div>
      </div>

      {/* Stats */}
      <section className="py-20 bg-soil text-white border-4 border-sand/50 m-8 rounded-2xl">
        <div className="max-w-7xl mx-auto px-4 md:px-12">
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            {stats.map((stat, idx) => (
              <motion.div
                key={stat.label}
                variants={fadeInUp}
                whileHover={hoverScale}
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
          </motion.div>
        </div>
      </section>
    </div>
  );
}
