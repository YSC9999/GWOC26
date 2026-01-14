"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface OrderSuccessCardsProps {
  customerEmail: string;
  onClose?: () => void;
}

export default function OrderSuccessCards({
  customerEmail,
  onClose,
}: OrderSuccessCardsProps) {
  const [showModal, setShowModal] = useState(true);

  // Auto-send email on component mount
  useEffect(() => {
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
            <div className="px-4 py-4 sm:px-6 sm:py-6 bg-white border-t border-soil/10 flex justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleClose}
                className="bg-clay hover:bg-clay/90 text-white px-6 py-2.5 sm:px-8 sm:py-3 rounded-xl transition-colors font-semibold shadow-md text-sm sm:text-base"
              >
                Continue Shopping
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
