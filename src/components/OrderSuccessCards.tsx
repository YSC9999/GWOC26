"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import Link from "next/link";

interface OrderSuccessCardsProps {
  customerEmail: string;
  orderId?: string;
  onClose?: () => void;
}

export default function OrderSuccessCards({
  customerEmail,
  orderId,
  onClose,
}: OrderSuccessCardsProps) {
  const [showModal, setShowModal] = useState(true);

  // Success sound and auto-send email on component mount
  useEffect(() => {
    // Play success sound
    const playSound = () => {
      const audio = new Audio("/sounds/success.mp3");
      audio.volume = 0.5;
      audio.play().catch(err => console.log("Sound play prevented by browser:", err));
    };

    playSound();

    const sendEmail = async () => {
      try {
        await fetch("/api/orders/send-cards", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: customerEmail }),
        });
      } catch (error) {
        console.log("Email sent in background");
      }
    };

    sendEmail();
  }, [customerEmail]);

  const handleClose = () => {
    setShowModal(false);
    onClose?.();
  };

  if (!showModal) return null;

  return (
    <AnimatePresence>
      {showModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 pt-20 sm:pt-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="bg-white rounded-3xl w-full max-w-lg sm:max-w-xl md:max-w-2xl max-h-[80vh] sm:max-h-[85vh] overflow-auto shadow-2xl flex flex-col relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg transition-all hover:scale-110 active:scale-95"
            >
              <X size={18} className="text-soil sm:w-5 sm:h-5" />
            </button>

            {/* Thank You Image */}
            <div className="flex-1 overflow-auto flex items-center justify-center p-4 sm:p-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full flex items-center justify-center"
              >
                <img
                  src="/thank-you-simple.jpeg"
                  alt="Thank You"
                  className="max-w-full max-h-[50vh] sm:max-h-[60vh] object-contain rounded-xl shadow-lg"
                />
              </motion.div>
            </div>

            {/* Continue Shopping Button */}
            <div className="px-6 py-6 bg-white border-t border-soil/10 flex flex-col sm:flex-row justify-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleClose}
                className="bg-sand text-soil hover:bg-sand/80 px-6 py-2.5 sm:px-8 sm:py-3 rounded-xl transition-colors font-semibold shadow-md text-sm sm:text-base order-2 sm:order-1"
              >
                Continue Shopping
              </motion.button>

              {orderId && (
                <Link
                  href={`/account/order-details?id=${orderId}`}
                  onClick={handleClose}
                  className="bg-clay hover:bg-clay/90 text-white px-6 py-2.5 sm:px-8 sm:py-3 rounded-xl transition-all font-semibold shadow-md text-sm sm:text-base flex items-center justify-center gap-2 order-1 sm:order-2 hover:shadow-xl hover:-translate-y-1"
                >
                  Track Order
                </Link>
              )}
            </div>

            {/* Celebration Animation (Framer Motion Particle effect) */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{
                    top: "50%",
                    left: "50%",
                    scale: 0,
                    x: 0,
                    y: 0,
                    rotate: 0,
                    opacity: 1
                  }}
                  animate={{
                    x: (Math.random() - 0.5) * 800,
                    y: (Math.random() - 0.5) * 800,
                    scale: [0, 1, 0],
                    rotate: Math.random() * 720,
                    opacity: [0, 1, 0]
                  }}
                  transition={{
                    duration: 1.5 + Math.random() * 2,
                    ease: "easeOut",
                    repeat: Infinity,
                    repeatDelay: Math.random() * 3
                  }}
                  className="absolute w-2 h-2 sm:w-3 sm:h-3"
                  style={{
                    backgroundColor: ['#D97757', '#652810', '#F5EDE4', '#FFD700', '#FF6347'][i % 5],
                    borderRadius: i % 2 === 0 ? "50%" : "2px"
                  }}
                />
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
