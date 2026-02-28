import { memo } from "react";
import { AnimalData } from "@/data/AnimalDatabase";

interface SpritePreviewProps {
  animal: AnimalData;
  scale?: number;
}

/**
 * SpritePreview Component
 *
 * Renders a static robot illustration. Simplified from the old
 * animated sprite system — now just shows a single image.
 */
export const SpritePreview = memo(({ animal, scale = 4 }: SpritePreviewProps) => {
  const imagePath = animal.spriteConfig?.idleSprite || animal.spriteConfig?.spritePath;

  if (!imagePath) return null;

  const size = 64 * Math.min(scale, 3); // Cap at 192px

  return (
    <div className="mx-auto flex items-center justify-center">
      <img
        src={imagePath}
        alt={animal.name}
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
});

SpritePreview.displayName = 'SpritePreview';
