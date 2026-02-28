import { memo } from "react";
import { RobotData } from "@/data/RobotDatabase";

interface BotPreviewProps {
  robot: RobotData;
  scale?: number;
}

/**
 * BotPreview Component
 *
 * Renders a static robot illustration. Simplified from the old
 * animated sprite system — now just shows a single image.
 */
export const BotPreview = memo(({ robot, scale = 4 }: BotPreviewProps) => {
  const imagePath = robot.imageConfig?.imagePath;

  if (!imagePath) return null;

  const size = robot.imageConfig?.size || 64 * Math.min(scale, 3); // Use configured size or cap at 192px

  return (
    <div className="mx-auto flex items-center justify-center">
      <img
        src={imagePath}
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
});

BotPreview.displayName = 'BotPreview';

/** @deprecated Use BotPreview instead */
export const SpritePreview = BotPreview;
