"use client";

import { useState } from "react";
import Image from "next/image";
import { getOptimizedCloudinaryUrl } from "@/lib/image-utils";

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackSrc?: string;
  priority?: boolean;
  aspectRatio?: string;
  containerClassName?: string;
  width?: number;
  height?: number;
  fill?: boolean;
  sizes?: string;
  onError?: (e: any) => void;
  onLoad?: () => void;
}

export default function OptimizedImage({
  src,
  alt,
  className = "",
  fallbackSrc = "/Logo.png",
  priority = false,
  aspectRatio,
  containerClassName = "",
  width,
  height,
  fill = true,
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
  onError,
  onLoad,
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const validSrc = src || fallbackSrc;
  
  // Optimize Cloudinary URL if applicable
  const optimizedSrc = !hasError && validSrc.includes("res.cloudinary.com") 
    ? getOptimizedCloudinaryUrl(validSrc, { 
        width: width || (fill ? 1000 : 800), 
        height: height || (fill ? undefined : 800),
        quality: "auto",
        format: "auto"
      }) 
    : hasError ? fallbackSrc : validSrc;

  // We set unoptimized to true to bypass Next.js local image optimization proxy.
  // Cloudinary already handles optimization via the URL transformations above.
  const isUnoptimized = true;

  return (
    <div 
      className={`relative overflow-hidden ${containerClassName}`}
      style={aspectRatio ? { aspectRatio } : {}}
    >
      <Image
        src={optimizedSrc}
        alt={alt}
        width={fill ? undefined : width || 800}
        height={fill ? undefined : height || 800}
        fill={fill}
        priority={priority}
        sizes={sizes}
        unoptimized={isUnoptimized}
        className={`object-cover ${className}`}
        onLoad={() => {
          setIsLoaded(true);
          onLoad?.();
        }}
        onError={() => {
          setHasError(true);
          onError?.(new Error("Failed to load image"));
        }}
      />
      
      {/* Loading Shimmer Overlay */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-gray-200/50 animate-pulse z-10" />
      )}
    </div>
  );
}
