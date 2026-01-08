"use client";
import { useState, useEffect, useCallback } from "react";
import { ShoppingBag } from "lucide-react";
import CartContent from "@/components/CartContent";

export default function CartButton() {
  const [isOpen, setIsOpen] = useState(false);

  // Close modal on Escape key
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") setIsOpen(false);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-clay text-white p-4 rounded-full shadow-lg hover:bg-soil transition z-40"
        aria-label="Open cart"
      >
        <ShoppingBag size={28} />
      </button>

      {/* Popup Modal */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 flex justify-end z-50"
          onClick={() => setIsOpen(false)} // close on backdrop click
          aria-modal="true"
          role="dialog"
        >
          <div
            className="bg-white w-full sm:w-[450px] h-full shadow-xl overflow-y-auto"
            onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside
          >
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-xl font-bold">Your Cart</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-600 hover:text-red-500 transition"
                aria-label="Close cart"
              >
                ✕
              </button>
            </div>
            <CartContent />
          </div>
        </div>
      )}
    </>
  );
}
