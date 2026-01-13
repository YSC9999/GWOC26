"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";

interface SealAnimationProps {
  onComplete: () => void;
}

export function SealAnimation({ onComplete }: SealAnimationProps) {
  const [sealRotation, setSealRotation] = useState(0);

  useEffect(() => {
    // Rotate seal 3D for 2 seconds
    const rotationInterval = setInterval(() => {
      setSealRotation((prev) => (prev + 5) % 360);
    }, 30);

    // After 4 seconds total (2 sec rotation + 2 sec display), trigger onComplete
    const timer = setTimeout(() => {
      clearInterval(rotationInterval);
      onComplete();
    }, 4000);

    return () => {
      clearInterval(rotationInterval);
      clearTimeout(timer);
    };
  }, [onComplete]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      {/* 3D Rotating Seal Container */}
      <div
        style={{
          perspective: "1200px",
          width: "340px",
          height: "340px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <motion.div
          animate={{ rotateY: sealRotation }}
          transition={{ duration: 0.03, ease: "linear" }}
          style={{
            transformStyle: "preserve-3d",
          }}
          className="w-full h-full"
        >
          <motion.img
            src="/handmade-seal.jpeg"
            alt="Handmade with Love"
            className="w-full h-full object-contain drop-shadow-2xl"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", duration: 0.6, delay: 0.2 }}
            style={{
              backfaceVisibility: "visible",
              WebkitBackfaceVisibility: "visible",
            }}
          />
        </motion.div>
      </div>
    </div>
  );
}
