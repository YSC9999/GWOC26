import { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="w-full h-screen flex flex-col md:flex-row overflow-hidden">
      {/* Left Side - Video Loop (Hidden on Mobile) */}
      <div className="hidden md:block relative w-full md:w-1/2 bg-black overflow-hidden h-full">
        <video
          className="absolute inset-0 w-full h-full object-cover opacity-90"
          autoPlay
          loop
          muted
          playsInline
        >
          <source src="/video.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <div className="absolute inset-0 bg-black/10" />
      </div>

      {/* Right Side - Auth Components */}
      <div className="w-full md:w-1/2 bg-brick h-full overflow-y-auto border-l-4 border-sand/30">
        <div className="min-h-full w-full flex items-center justify-center p-4 py-8">
          {children}
        </div>
      </div>
    </div>
  );
}
