"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, CheckCircle } from "lucide-react";

interface ToastProps {
  email: string;
  duration?: number;
}

export function EmailConfirmationToast({ email, duration = 3000 }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ type: "spring", duration: 0.4 }}
          className="fixed top-8 left-1/2 -translate-x-1/2 z-[999]"
          style={{ pointerEvents: "none" }}
        >
          <div className="bg-white shadow-xl rounded-2xl px-6 py-4 flex items-center gap-3 border-2 border-clay">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <CheckCircle size={20} className="text-clay" />
            </motion.div>

            <div className="flex flex-col gap-1">
              <p className="text-sm font-semibold text-soil">
                Confirmation mail sent!
              </p>
              <p className="text-xs text-soil/70">to {email}</p>
            </div>

            <Mail size={18} className="text-clay ml-2 opacity-60" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
