import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { RobotData, getRobotById } from "@/data/RobotDatabase";

// Static robot image preview component for shop
export const SpritePreview = ({ robot, scale = 4 }: { robot: RobotData; scale?: number }) => {
  const imageConfig = robot.imageConfig;

  if (!imageConfig) return null;

  const size = imageConfig.size || 64 * Math.min(scale, 3);

  return (
    <div className="mx-auto flex items-center justify-center">
      <img
        src={imageConfig.imagePath}
        alt={robot.name}
        className="object-contain"
        style={{
          width: `${size}px`,
          height: `${size}px`,
          imageRendering: 'pixelated',
        }}
        draggable={false}
      />
    </div>
  );
};

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
        <div className="absolute inset-0 bg-gradient-to-br from-sky-200 to-blue-300 animate-pulse" />
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

// Bot bundle preview carousel - shows all bots in the bundle
export const BotBundlePreviewCarousel = ({ botIds }: { botIds: string[] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const bots = botIds.map(id => getRobotById(id)).filter(Boolean) as RobotData[];

  useEffect(() => {
    if (bots.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % bots.length);
    }, 1500);
    return () => clearInterval(timer);
  }, [bots.length]);

  if (bots.length === 0) return null;

  const currentBot = bots[currentIndex];

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center">
      <div className="flex-1 flex items-center justify-center min-h-0">
        {currentBot?.imageConfig ? (
          <SpritePreview robot={currentBot} scale={2.5} />
        ) : (
          <span className="text-4xl">{currentBot?.icon}</span>
        )}
      </div>
      <div className="text-xs text-white/80 font-medium mb-1">{currentBot?.name}</div>
      <div className="flex gap-1">
        {bots.map((_, idx) => (
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

/** @deprecated Use BotBundlePreviewCarousel instead */
export const PetBundlePreviewCarousel = BotBundlePreviewCarousel;
