import { memo, useMemo } from 'react';
import { BUILDINGS, type BuildingConfig } from './villageConfig';

interface VillageMapProps {
  currentLevel: number;
}

/**
 * Renders the village background and building overlays.
 * Base map is a single pixel art image. Buildings are separate sprites
 * that appear/disappear based on the player's level.
 */
export const VillageMap = memo(function VillageMap({ currentLevel }: VillageMapProps) {
  const unlockedBuildings = useMemo(
    () => BUILDINGS.filter(b => b.unlockLevel <= currentLevel),
    [currentLevel],
  );

  return (
    <div className="absolute inset-0">
      {/* Base village ground — grass, paths, trees, terrain */}
      <div
        className="absolute inset-0 pixel-render"
        style={{
          backgroundImage: 'url(/assets/pixel-world/village-base.svg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          imageRendering: 'pixelated',
        }}
      />

      {/* Fallback gradient if image hasn't loaded */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          background: 'linear-gradient(180deg, #87CEEB 0%, #87CEEB 30%, #5B8C3E 30%, #5B8C3E 45%, #4A7A32 45%, #4A7A32 100%)',
        }}
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
