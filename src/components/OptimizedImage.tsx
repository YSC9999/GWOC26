"use client";

import { useState, useEffect, useRef } from "react";

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackSrc?: string;
  priority?: boolean;
  aspectRatio?: string;
  containerClassName?: string;
  onError?: (e: React.SyntheticEvent<HTMLImageElement>) => void;
}

export default function OptimizedImage({
  src,
  alt,
  className = "",
  fallbackSrc = "/Logo.png",
  priority = false,
  aspectRatio,
  containerClassName = "",
  onError,
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);
  const imgRef = useRef<HTMLImageElement>(null);

  // Reset state when src changes
  useEffect(() => {
    setIsLoaded(false);
    setHasError(false);
    setCurrentSrc(src);
  }, [src]);

  // Check if image is already cached
  useEffect(() => {
    if (imgRef.current?.complete && imgRef.current?.naturalWidth > 0) {
      setIsLoaded(true);
    }
  }, [currentSrc]);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    if (!hasError) {
      setHasError(true);
      setCurrentSrc(fallbackSrc);
      onError?.(e);
    }
  };

  return (
    <div 
      className={`relative overflow-hidden ${containerClassName}`}
      style={aspectRatio ? { aspectRatio, contain: "size layout" } : { contain: "layout" }}
    >
      {/* Skeleton placeholder */}
      <div
        className={`absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 transition-opacity duration-300 ${
          isLoaded ? "opacity-0" : "opacity-100"
        }`}
        style={{
          backgroundSize: "200% 100%",
          animation: isLoaded ? "none" : "shimmer 1.5s infinite linear",
          willChange: "opacity, background-position",
        }}
      />

      {/* Actual image */}
      <img
        ref={imgRef}
        src={currentSrc}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        decoding={priority ? "sync" : "async"}
        fetchPriority={priority ? "high" : "auto"}
        onLoad={handleLoad}
        onError={handleError}
        className={`transition-opacity duration-300 ${
          isLoaded ? "opacity-100" : "opacity-0"
        } ${className}`}
        style={{
          willChange: "opacity",
        }}
      />

      <style jsx>{`
        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
      `}</style>
    </div>
  );
}
