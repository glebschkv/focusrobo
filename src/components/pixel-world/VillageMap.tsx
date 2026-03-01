import { memo } from 'react';
import { BUILDINGS, type BuildingConfig } from './villageConfig';

interface VillageMapProps {
  currentLevel: number;
}

/**
 * Renders the village background and building overlays.
 * Buildings are separate pixel art sprites placed at configured positions.
 */
export const VillageMap = memo(function VillageMap({ currentLevel: _currentLevel }: VillageMapProps) {
  // Show all buildings for preview (bypass level gating)
  const unlockedBuildings = BUILDINGS;

  return (
    <div className="absolute inset-0">
      {/* Pixel art village ground */}
      <img
        src="/assets/pixel-world/village-ground.png"
        alt=""
        className="absolute inset-0 w-full h-full pixel-render"
        style={{ imageRendering: 'pixelated', objectFit: 'fill' }}
        draggable={false}
      />

      {/* Building overlays */}
      {unlockedBuildings.map((building) => (
        <BuildingSprite key={building.id} building={building} />
      ))}
    </div>
  );
});

// ── Building sprite ────────────────────────────────────────────────

interface BuildingSpriteProps {
  building: BuildingConfig;
}

const BuildingSprite = memo(function BuildingSprite({ building }: BuildingSpriteProps) {
  return (
    <img
      src={building.imagePath}
      alt={building.name}
      className="absolute pixel-render building-enter"
      style={{
        left: `${building.x}%`,
        top: `${building.y}%`,
        width: building.width,
        height: building.height,
        transform: 'translate(-50%, -50%)',
        imageRendering: 'pixelated',
        zIndex: Math.floor((building.y / 100) * 600),
      }}
      draggable={false}
    />
  );
});
