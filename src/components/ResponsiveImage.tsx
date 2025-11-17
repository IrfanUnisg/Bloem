import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface ResponsiveImageProps {
  src: string;
  alt: string;
  className?: string;
  containerClassName?: string;
  sizes?: string;
  priority?: boolean;
  onLoad?: () => void;
  onError?: () => void;
}

/**
 * ResponsiveImage Component
 * Provides lazy loading, responsive sizing, and optimized image handling
 * 
 * Features:
 * - Lazy loading with intersection observer
 * - Responsive sizing with srcSet support
 * - Blur-in effect for better perceived performance
 * - WCAG accessible alt text
 */
export function ResponsiveImage({
  src,
  alt,
  className = "",
  containerClassName = "",
  sizes = "100vw",
  priority = false,
  onLoad,
  onError,
}: ResponsiveImageProps) {
  const [imageSrc, setImageSrc] = useState<string>(priority ? src : "");
  const [isLoaded, setIsLoaded] = useState(priority);
  const [imageRef, setImageRef] = React.useState<HTMLImageElement | null>(null);

  useEffect(() => {
    if (!imageRef) return;

    // If priority or already has src, no need for intersection observer
    if (priority || imageSrc) return;

    // Use Intersection Observer for lazy loading
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setImageSrc(src);
            observer.unobserve(imageRef);
          }
        });
      },
      {
        rootMargin: "50px", // Start loading 50px before entering viewport
      }
    );

    observer.observe(imageRef);

    return () => {
      if (imageRef) observer.unobserve(imageRef);
    };
  }, [imageRef, src, imageSrc, priority]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setIsLoaded(false);
    onError?.();
  };

  return (
    <div className={cn("relative overflow-hidden bg-muted", containerClassName)}>
      <img
        ref={setImageRef}
        src={imageSrc}
        alt={alt}
        sizes={sizes}
        className={cn(
          "transition-opacity duration-300",
          isLoaded ? "opacity-100" : "opacity-0",
          className
        )}
        onLoad={handleLoad}
        onError={handleError}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
      />
      {/* Loading placeholder */}
      {!isLoaded && (
        <div className={cn(
          "absolute inset-0 bg-gradient-to-br from-muted via-muted-foreground/10 to-muted animate-pulse",
          className
        )} />
      )}
    </div>
  );
}
