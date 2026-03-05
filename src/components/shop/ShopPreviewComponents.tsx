import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

// Background preview component for shop
export const BackgroundPreview = ({
  imagePath,
  size = 'medium',
  className = ''
}: {
  imagePath: string;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  const sizeClasses = {
    small: 'w-12 h-8',
    medium: 'w-20 h-14',
    large: 'w-full h-24',
  };

  return (
    <div className={cn(
      "relative overflow-hidden rounded-lg border-2 border-white/20",
      sizeClasses[size],
      className
    )}>
      {!loaded && !error && (
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-200 to-teal-300 animate-pulse" />
      )}
      {error && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
          <span className="text-xl">🖼️</span>
        </div>
      )}
      <img
        src={imagePath}
        alt="Background preview"
        className={cn(
          "w-full h-full object-cover transition-opacity duration-300",
          loaded ? "opacity-100" : "opacity-0"
        )}
        style={{ imageRendering: 'pixelated' }}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
      />
    </div>
  );
};

// Bundle preview carousel component
export const BundlePreviewCarousel = ({ images }: { images: string[] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 2000);
    return () => clearInterval(timer);
  }, [images.length]);

  return (
    <div className="relative w-full h-32 overflow-hidden rounded-xl">
      {images.map((img, idx) => (
        <div
          key={img}
          className={cn(
            "absolute inset-0 transition-opacity duration-500",
            idx === currentIndex ? "opacity-100" : "opacity-0"
          )}
        >
          <img
            src={img}
            alt={`Preview ${idx + 1}`}
            className="w-full h-full object-cover"
            style={{ imageRendering: 'pixelated' }}
          />
        </div>
      ))}
      <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-1">
        {images.map((_, idx) => (
          <div
            key={idx}
            className={cn(
              "w-1.5 h-1.5 rounded-full transition-all",
              idx === currentIndex ? "bg-white w-3" : "bg-white/50"
            )}
          />
        ))}
      </div>
    </div>
  );
};
