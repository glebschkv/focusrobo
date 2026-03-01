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
      {/* Base village ground — gradient sky + grass */}
      <div
        className="absolute inset-0"
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
