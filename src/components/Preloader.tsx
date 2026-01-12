"use client";

import { motion } from "framer-motion";

export default function Preloader() {
    return (
        <div className="fixed inset-0 z-[100] bg-[#efe5d8] flex items-center justify-center flex-col">
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                    duration: 0.8,
                    repeat: Infinity,
                    repeatType: "reverse",
                    ease: "easeInOut",
                }}
                className="relative"
            >
                <img
                    src="/Logo.png"
                    alt="Basho Logo"
                    className="h-24 md:h-32 w-auto object-contain"
                />
            </motion.div>
            <motion.div
                initial={{ width: 0 }}
                animate={{ width: "100px" }}
                transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
                className="h-1 bg-[#c97c5d] mt-8 rounded-full"
            />
        </div>
    );
}
