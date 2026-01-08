"use client";
import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";

export default function About() {
  const values = [
    "Quality products sourced from trusted suppliers",
    "Expert-led workshops and training programs",
    "Community-driven approach and feedback",
    "Transparent pricing and policies",
  ];

  return (
    <div className="space-y-16 pt-12">
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className="text-5xl font-bold text-soil mb-6">About Basho</h1>
        <p className="text-xl text-gray-700 max-w-3xl">
          We are a dedicated platform committed to bringing quality products and
          expert knowledge to our community. Our mission is to empower
          individuals through education, products, and community engagement.
        </p>
      </motion.section>

      {/* Mission Section */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl font-bold text-soil mb-6">Our Mission</h2>
          <p className="text-lg text-gray-700 mb-4">
            At Basho, we believe in the power of knowledge and quality products
            to transform lives. We're dedicated to:
          </p>
          <ul className="space-y-4">
            {values.map((value, idx) => (
              <motion.li
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-center gap-3"
              >
                <CheckCircle className="text-clay flex-shrink-0" size={24} />
                <span className="text-gray-700">{value}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-sand rounded-xl p-8 h-full flex items-center justify-center"
        >
          <div className="text-center">
            <div className="text-6xl font-bold text-clay mb-2">Basho</div>
            <p className="text-gray-700 italic">
              Excellence in products and learning
            </p>
          </div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 bg-soil text-white rounded-xl p-12">
        {[
          { number: "5K+", label: "Happy Customers" },
          { number: "200+", label: "Products" },
          { number: "50+", label: "Expert Workshops" },
        ].map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="text-center"
          >
            <div className="text-5xl font-bold text-clay mb-2">
              {stat.number}
            </div>
            <p className="text-sand">{stat.label}</p>
          </motion.div>
        ))}
      </section>

      {/* Team Section */}
      <section>
        <h2 className="section-title">Our Commitment</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0 }}
            className="card p-8"
          >
            <h3 className="text-2xl font-bold text-soil mb-4">
              Quality Assurance
            </h3>
            <p className="text-gray-700">
              Every product is carefully curated and tested to ensure it meets
              our high standards of quality and customer satisfaction.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card p-8"
          >
            <h3 className="text-2xl font-bold text-soil mb-4">
              Customer Support
            </h3>
            <p className="text-gray-700">
              Our dedicated support team is always ready to help you with any
              questions or concerns. Your satisfaction is our priority.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card p-8"
          >
            <h3 className="text-2xl font-bold text-soil mb-4">Innovation</h3>
            <p className="text-gray-700">
              We constantly evolve our offerings and services to stay ahead of
              the curve and provide the best experience possible.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="card p-8"
          >
            <h3 className="text-2xl font-bold text-soil mb-4">Community</h3>
            <p className="text-gray-700">
              We foster a vibrant community where customers can connect, share
              experiences, and grow together.
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
