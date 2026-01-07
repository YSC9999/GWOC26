"use client";
import { motion } from "framer-motion";
import { Calendar, User, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function Blog() {
  const blogPosts = [
    {
      id: 1,
      title: "Getting Started with React Hooks",
      excerpt:
        "Learn how to use React Hooks to manage state and side effects in your functional components.",
      author: "Sarah Chen",
      date: "Jan 10, 2024",
      category: "React",
      readTime: "5 min read",
      image: "⚛️",
    },
    {
      id: 2,
      title: "10 Web Design Trends for 2024",
      excerpt:
        "Explore the latest design trends that are shaping the future of web design this year.",
      author: "Emma Wilson",
      date: "Jan 08, 2024",
      category: "Design",
      readTime: "8 min read",
      image: "🎨",
    },
    {
      id: 3,
      title: "The Future of Full-Stack Development",
      excerpt:
        "Discover the emerging technologies and practices that will define full-stack development.",
      author: "James Brown",
      date: "Jan 05, 2024",
      category: "Development",
      readTime: "6 min read",
      image: "🚀",
    },
    {
      id: 4,
      title: "Mastering CSS Grid Layout",
      excerpt:
        "A comprehensive guide to using CSS Grid for creating responsive and flexible layouts.",
      author: "Mike Johnson",
      date: "Jan 03, 2024",
      category: "CSS",
      readTime: "7 min read",
      image: "🎯",
    },
  ];

  return (
    <div className="space-y-12 pt-12">
      {/* Header */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className="text-5xl font-bold text-soil mb-4">Blog</h1>
        <p className="text-xl text-gray-700">
          Stay updated with the latest insights, tips, and trends in web
          development and design.
        </p>
      </motion.section>

      {/* Blog Posts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {blogPosts.map((post, idx) => (
          <motion.article
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="card overflow-hidden hover:shadow-2xl group"
          >
            {/* Image */}
            <div className="bg-sand h-48 flex items-center justify-center text-6xl overflow-hidden group-hover:scale-110 transition-transform duration-300">
              {post.image}
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Category */}
              <div className="inline-block bg-clay text-white px-3 py-1 rounded-full text-xs font-bold mb-3">
                {post.category}
              </div>

              {/* Title */}
              <h3 className="text-2xl font-bold text-soil mb-2 line-clamp-2">
                {post.title}
              </h3>

              {/* Excerpt */}
              <p className="text-gray-600 mb-4 line-clamp-2">{post.excerpt}</p>

              {/* Meta Info */}
              <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4 pb-4 border-b border-gray-200">
                <div className="flex items-center gap-1">
                  <User size={16} className="text-clay" />
                  <span>{post.author}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar size={16} className="text-clay" />
                  <span>{post.date}</span>
                </div>
                <span className="ml-auto font-semibold text-clay">
                  {post.readTime}
                </span>
              </div>

              {/* Read More */}
              <Link
                href={`/blog/${post.id}`}
                className="inline-flex items-center text-clay font-bold hover:gap-2 transition-all"
              >
                Read More <ArrowRight size={16} className="ml-1" />
              </Link>
            </div>
          </motion.article>
        ))}
      </div>

      {/* Pagination */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        className="flex justify-center gap-4 mt-12"
      >
        <button className="btn-outline">Previous</button>
        <button className="btn-primary">1</button>
        <button className="btn-outline">2</button>
        <button className="btn-outline">3</button>
        <button className="btn-outline">Next</button>
      </motion.div>

      {/* Newsletter */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        className="bg-gradient-clay text-white rounded-2xl p-12 text-center"
      >
        <h2 className="text-4xl font-bold mb-4">Subscribe to Our Newsletter</h2>
        <p className="text-lg mb-8 text-sand">
          Get the latest articles and insights delivered to your inbox
        </p>
        <form className="flex gap-3 max-w-md mx-auto">
          <input
            type="email"
            placeholder="Your email address"
            className="flex-1 px-4 py-3 rounded-lg text-soil focus:outline-none"
            required
          />
          <button type="submit" className="btn-primary bg-white text-clay">
            Subscribe
          </button>
        </form>
      </motion.section>
    </div>
  );
}
