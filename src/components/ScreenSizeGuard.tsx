"use client";

import React from "react";
import { Smartphone, Monitor } from "lucide-react";

export default function ScreenSizeGuard() {
  return (
    <>
      <style jsx global>{`
        @media (max-width: 241px) {
          #screen-guard-overlay {
            display: flex !important;
          }
          /* Hide everything else to prevent scrollbars/rendering issues behind the guard */
          body > :not(#screen-guard-overlay) {
            display: none !important;
          }
          /* Restore body size for the guard */
          body, html {
            min-width: 0 !important;
            width: 100% !important;
            height: 100% !important;
            overflow: hidden !important;
          }
        }
      `}</style>
      <div
        id="screen-guard-overlay"
        className="fixed inset-0 z-[2147483647] bg-[#EFE5D8] hidden flex-col items-center justify-center p-4 text-center"
      >
        <div className="relative mb-6">
          <Smartphone className="w-12 h-12 text-[#5A3E36] animate-bounce" />
          <Monitor className="w-8 h-8 text-[#C97C5D] absolute -right-4 -bottom-1 opacity-50" />
        </div>

        <h2 className="text-xl font-serif font-bold text-[#5A3E36] mb-3">
          Screen Too Small
        </h2>

        <p className="text-[#5A3E36]/80 text-sm max-w-[180px] leading-relaxed font-sans mb-6">
          Please open in mobile or laptop
        </p>

        {/* Animation pulse simplified */}
        <div className="w-2 h-2 bg-[#5A3E36] rounded-full animate-ping" />
      </div>
    </>
  );
}
