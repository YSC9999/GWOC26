"use client";
import { motion } from "framer-motion";
import { fadeInUp, staggerContainer, hoverScale } from "@/lib/animations";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Utensils, Flame, Droplets, Heart } from "lucide-react";

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
                className="relative w-full max-w-md mx-auto lg:mx-0"
              >
                <Image
                  src="/Shivangi-Frame.jpeg"
                  alt="Shivangi - The Artist"
                  width={800}
                  height={600}
                  className="w-full h-auto object-cover rounded-3xl shadow-2xl"
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
                  discovered pottery, and everything changed. <br />
                  What started as a weekend hobby quickly became an
                  all-consuming passion. I trained under master potters, studied
                  Japanese ceramic traditions, and fell deeply in love with the
                  Japanese ceramic traditions, and fell deeply in love with the
                  philosophy of pottery.
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

      {/* Philosophy Section Removed */}

      {/* Process & Care Section */}
      <section className="py-24 bg-[#F9F5F0] my-24 -mx-4 md:-mx-12 px-4 md:px-12 relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">

          {/* New Full Width Header */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mb-32"
          >
            <h2 className="text-5xl md:text-7xl font-serif font-bold text-soil mb-4 leading-tight">
              The Journey of Artistry
            </h2>
            <span className="text-clay font-medium tracking-wide text-lg text-soil/60 font-serif italic block">
              Where Earth, Hand, and Fire Converse
            </span>
          </motion.div>

          {/* Zigzag Timeline */}
          <div className="relative mb-48">
            {/* Center Line (Desktop Only) */}
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-px bg-gradient-to-b from-transparent via-clay/30 to-transparent hidden md:block" />

            {[
              {
                id: "01",
                poster: "/pottery_clay_kneading.png",
                video: "/process-kneading.mp4.mp4",
                title: "The Artistry of Awakening Clay",
                desc: "Raw stoneware begins its transformation through rhythmic wedging and kneading. This foundational act awakens the clay’s memory, expelling air and aligning its body for creation."
              },
              {
                id: "02",
                poster: "/pottery_wheel_throwing.png",
                video: "/process-throwing.mp4.mp4",
                title: "The Artistry of Form in Motion",
                desc: "Centered on the spinning wheel, clay responds to the potter’s touch. Guided by intuition and steady rhythm, form rises as movement and stillness meet."
              },
              {
                id: "03",
                poster: "/pottery_trimming.png",
                video: "/process-trimming.mp4",
                title: "The Artistry of Refined Restraint",
                desc: "At the leather-hard stage, excess is carefully pared away. This deliberate subtraction sharpens silhouettes and reveals the vessel’s intended elegance."
              },
              {
                id: "04",
                poster: "/pottery_kiln_fire.png",
                video: "/process-firing.mp4",
                title: "The Artistry of First Fire",
                desc: "The initial firing tempers the piece at 900°C, shifting clay into bisqueware. Porous yet strong, it stands ready to receive color, depth, and surface expression."
              },
              {
                id: "05",
                poster: "/pottery_glazing.png",
                video: "/process-glazing.mp4",
                title: "The Artistry of Surface Alchemy",
                desc: "Glaze is applied by hand, flowing and settling like liquid poetry. Minerals and pigments cloak the form, preparing it for its final metamorphosis."
              },
              {
                id: "06",
                poster: "/pottery_finished_firing.png",
                video: "/process-finished.mp4",
                title: "The Artistry of Completion Through Flame",
                desc: "A high firing at 1200°C seals the journey. Fire crystallizes color, strengthens form, and completes the vessel’s artistic destiny."
              }
            ].map((step, idx) => {
              const isEven = idx % 2 === 0;
              return (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, y: 100 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  whileHover={{ scale: 1.02 }}
                  className={`relative flex flex-col md:flex-row items-center mb-48 last:mb-0 gap-12 md:gap-0 ${!isEven ? 'md:flex-row-reverse' : ''}`}
                >
                  {/* Center Dot (Desktop Only) */}
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-clay border-4 border-sand/50 shadow-sm z-10 hidden md:block" />

                  {/* Text Side */}
                  <div className={`w-full md:w-1/2 px-4 md:px-24 ${isEven ? 'text-center md:text-right' : 'text-center md:text-left'}`}>
                    <div className="flex flex-col gap-6">
                      <span className="text-clay font-bold tracking-[0.2em] text-sm uppercase">Step {step.id}</span>
                      <h3 className="text-3xl md:text-4xl font-bold text-soil font-serif leading-tight">
                        {step.title}
                      </h3>
                      <p className="text-soil/70 leading-relaxed text-lg md:text-xl font-serif">
                        {step.desc}
                      </p>
                    </div>
                  </div>

                  {/* Video/Visual Side */}
                  <div className={`w-full md:w-1/2 px-4 md:px-16 flex ${isEven ? 'justify-start' : 'justify-end'}`}>
                    <motion.div
                      className="w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl relative group bg-black"
                    >
                      <video
                        autoPlay
                        loop
                        muted
                        playsInline
                        poster={step.poster}
                        className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-700"
                      >
                        <source src={step.video} type="video/mp4" />
                        {/* Fallback image if video fails or not supported */}
                        <Image
                          src={step.poster}
                          alt={step.title}
                          fill
                          className="object-cover"
                        />
                      </video>

                      {/* Optional Overlay to dark slightly for text contrast if needed, but keeping clean for video */}
                      <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors duration-500 pointer-events-none" />
                    </motion.div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Material & Care Section (Refactored below) */}
          <div className="max-w-5xl mx-auto mt-32 border-t border-clay/20 pt-20">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
            >
              <div className="text-center mb-16">
                <span className="text-clay font-bold tracking-widest uppercase text-xs mb-2 block">Longevity</span>
                <h2 className="text-4xl md:text-5xl font-serif font-bold text-soil">
                  Material & Care
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                {[
                  { icon: <Utensils size={24} />, title: "Food Safe", desc: "Lead-free & certified safe" },
                  { icon: <Flame size={24} />, title: "Thermal Safe", desc: "Freezer to oven ready" },
                  { icon: <Droplets size={24} />, title: "Dishwasher Safe", desc: "Durable for daily wash" },
                  { icon: <Heart size={24} />, title: "Heirloom Quality", desc: "Built to last generations" }
                ].map((item, idx) => (
                  <motion.div
                    key={idx}
                    variants={fadeInUp}
                    whileHover={{ y: -5 }}
                    className="bg-white rounded-2xl p-6 shadow-sm border border-sand/30 hover:shadow-md hover:border-clay/30 transition-all duration-300 text-center"
                  >
                    <div className="w-12 h-12 rounded-full bg-sand/20 text-clay flex items-center justify-center mb-4 mx-auto">
                      {item.icon}
                    </div>
                    <h3 className="text-lg font-bold text-soil mb-2">{item.title}</h3>
                    <p className="text-soil/60 text-sm font-medium">{item.desc}</p>
                  </motion.div>
                ))}
              </div>

              <motion.div variants={fadeInUp} className="bg-white rounded-3xl p-8 md:p-12 border border-sand/30 shadow-sm relative overflow-hidden text-center max-w-3xl mx-auto">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                  <Utensils size={120} className="text-soil" />
                </div>
                <h4 className="text-xl md:text-2xl text-soil font-bold mb-6 font-serif">
                  Care Instructions
                </h4>
                <p className="text-soil/70 text-base md:text-lg leading-relaxed italic z-10 relative font-serif">
                  "While durable, hand washing with mild soap preserves the glaze's luster. Avoid sudden temperature changes. Each piece develops a unique patina with use—a beautiful record of shared meals and memories."
                </p>
              </motion.div>
            </motion.div>
          </div>

        </div>
      </section>

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
    </div >
  );
}
