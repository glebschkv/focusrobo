import { memo } from 'react';
import { BUILDINGS, type BuildingConfig } from './villageConfig';

interface VillageMapProps {
  currentLevel: number;
}

// Inline SVG data URIs for pixel-art-style ground textures (8×8 dithered tiles)
const GRASS_TILE = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='8'%3E%3Crect width='8' height='8' fill='%235B8C3E'/%3E%3Crect x='0' y='0' width='2' height='2' fill='%234A7A32'/%3E%3Crect x='4' y='4' width='2' height='2' fill='%234A7A32'/%3E%3Crect x='2' y='6' width='2' height='2' fill='%236B9C4E'/%3E%3Crect x='6' y='2' width='2' height='2' fill='%236B9C4E'/%3E%3C/svg%3E")`;

const DIRT_TILE = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='8'%3E%3Crect width='8' height='8' fill='%23A0845C'/%3E%3Crect x='0' y='4' width='2' height='2' fill='%23917548'/%3E%3Crect x='4' y='0' width='2' height='2' fill='%23917548'/%3E%3Crect x='6' y='6' width='2' height='2' fill='%23B0946C'/%3E%3Crect x='2' y='2' width='2' height='2' fill='%23B0946C'/%3E%3C/svg%3E")`;

// Decorative flower patches scattered across the village
const FLOWERS: { x: number; y: number; color: string }[] = [
  { x: 8, y: 45, color: '#E74C3C' },
  { x: 35, y: 48, color: '#F39C12' },
  { x: 55, y: 43, color: '#E74C3C' },
  { x: 88, y: 48, color: '#9B59B6' },
  { x: 20, y: 58, color: '#F1C40F' },
  { x: 65, y: 62, color: '#E74C3C' },
  { x: 78, y: 32, color: '#F39C12' },
  { x: 48, y: 78, color: '#9B59B6' },
  { x: 12, y: 72, color: '#F1C40F' },
  { x: 92, y: 60, color: '#E74C3C' },
  { x: 32, y: 34, color: '#F1C40F' },
  { x: 82, y: 68, color: '#9B59B6' },
];

// Dirt path segments connecting buildings
const PATHS: { left: string; top: string; width: string; height: string }[] = [
  // Main horizontal path
  { left: '10%', top: '46%', width: '80%', height: '5%' },
  // Vertical path to cottage
  { left: '43%', top: '30%', width: '5%', height: '18%' },
  // Down to fishing dock
  { left: '15%', top: '50%', width: '5%', height: '18%' },
  // Down to town square
  { left: '42%', top: '50%', width: '5%', height: '15%' },
  // Right side path to forge area
  { left: '70%', top: '35%', width: '5%', height: '13%' },
];

/**
 * Renders the village background and building overlays.
 * Creates a Stardew Valley-style scene with sky, textured grass,
 * dirt paths, water, and pixel art buildings.
 */
export const VillageMap = memo(function VillageMap({ currentLevel: _currentLevel }: VillageMapProps) {
  const unlockedBuildings = BUILDINGS;

  return (
    <div className="absolute inset-0">
      {/* ── Sky gradient ── */}
      <div
        className="absolute inset-x-0 top-0"
        style={{
          height: '30%',
          background: 'linear-gradient(180deg, #7EC8E3 0%, #A8DFF0 60%, #C8EBF7 100%)',
        }}
      />

      {/* ── Distant hills ── */}
      <div
        className="absolute inset-x-0"
        style={{
          top: '22%',
          height: '12%',
          background: `
            radial-gradient(ellipse 45% 100% at 15% 100%, #5D9040 0%, transparent 100%),
            radial-gradient(ellipse 55% 100% at 50% 100%, #4A8030 0%, transparent 100%),
            radial-gradient(ellipse 40% 100% at 82% 100%, #5D9040 0%, transparent 100%)
          `,
        }}
      />

      {/* ── Main grass ground ── */}
      <div
        className="absolute inset-x-0 bottom-0 pixel-render"
        style={{
          top: '28%',
          backgroundImage: GRASS_TILE,
          backgroundSize: '8px 8px',
        }}
      />

      {/* ── Lighter grass patches for natural variation ── */}
      <div
        className="absolute"
        style={{
          left: '15%', top: '38%', width: '28%', height: '14%',
          background: 'radial-gradient(ellipse, rgba(107,156,78,0.5) 0%, transparent 70%)',
        }}
      />
      <div
        className="absolute"
        style={{
          left: '58%', top: '55%', width: '22%', height: '10%',
          background: 'radial-gradient(ellipse, rgba(107,156,78,0.45) 0%, transparent 70%)',
        }}
      />
      <div
        className="absolute"
        style={{
          left: '35%', top: '70%', width: '30%', height: '12%',
          background: 'radial-gradient(ellipse, rgba(91,140,62,0.4) 0%, transparent 70%)',
        }}
      />

      {/* ── Dirt paths ── */}
      {PATHS.map((path, i) => (
        <div
          key={`path-${i}`}
          className="absolute pixel-render"
          style={{
            left: path.left,
            top: path.top,
            width: path.width,
            height: path.height,
            backgroundImage: DIRT_TILE,
            backgroundSize: '8px 8px',
            borderRadius: '3px',
            zIndex: 3,
          }}
        />
      ))}

      {/* ── Water pond near fishing dock ── */}
      <div
        className="absolute"
        style={{
          left: '0%',
          top: '78%',
          width: '25%',
          height: '22%',
          background: 'linear-gradient(180deg, #5AA0C0 0%, #4890B0 40%, #3880A0 100%)',
          borderRadius: '0 40px 0 0',
          zIndex: 2,
        }}
      >
        {/* Water shine lines */}
        <div style={{
          position: 'absolute', top: '25%', left: '15%',
          width: '50%', height: '2px',
          backgroundColor: 'rgba(255,255,255,0.2)',
        }} />
        <div style={{
          position: 'absolute', top: '50%', left: '25%',
          width: '35%', height: '2px',
          backgroundColor: 'rgba(255,255,255,0.15)',
        }} />
        <div style={{
          position: 'absolute', top: '70%', left: '10%',
          width: '45%', height: '2px',
          backgroundColor: 'rgba(255,255,255,0.1)',
        }} />
      </div>

      {/* ── Shoreline edge ── */}
      <div
        className="absolute pixel-render"
        style={{
          left: '0%', top: '76%', width: '26%', height: '3%',
          background: 'linear-gradient(90deg, #C8B07A 0%, #D4BC86 50%, #C8B07A 100%)',
          borderRadius: '0 8px 0 0',
          zIndex: 3,
        }}
      />

      {/* ── Small pixel flower decorations ── */}
      {FLOWERS.map((flower, i) => (
        <div
          key={`flower-${i}`}
          className="absolute"
          style={{
            left: `${flower.x}%`,
            top: `${flower.y}%`,
            width: 4,
            height: 4,
            backgroundColor: flower.color,
            borderRadius: '1px',
            zIndex: 4,
            boxShadow: `0 2px 0 #3D6E24`,
          }}
        />
      ))}

      {/* ── Small decorative trees at map edges ── */}
      <PixelTree x={3} y={32} />
      <PixelTree x={96} y={55} />
      <PixelTree x={52} y={85} />
      <PixelTree x={94} y={28} />
      <PixelTree x={5} y={55} />
      <PixelTree x={92} y={75} />

      {/* ── Pixel fence segments along path ── */}
      <PixelFence x={8} y={44} width={5} />
      <PixelFence x={60} y={44} width={8} />

      {/* ── Building overlays ── */}
      {unlockedBuildings.map((building) => (
        <BuildingSprite key={building.id} building={building} />
      ))}
    </div>
  );
});

// ── Sub-components ────────────────────────────────────────────────

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

/** Small pixel art tree decoration */
const PixelTree = memo(function PixelTree({ x, y }: { x: number; y: number }) {
  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        transform: 'translate(-50%, -100%)',
        zIndex: Math.floor((y / 100) * 600),
      }}
    >
      {/* Canopy */}
      <div style={{
        width: 14, height: 14,
        backgroundColor: '#3D6E24',
        borderRadius: '2px',
        position: 'relative',
        imageRendering: 'pixelated',
      }}>
        <div style={{
          position: 'absolute', top: 2, left: 2,
          width: 6, height: 6,
          backgroundColor: '#4A8030',
          borderRadius: '1px',
        }} />
        <div style={{
          position: 'absolute', top: 6, left: 8,
          width: 4, height: 4,
          backgroundColor: '#5B8C3E',
          borderRadius: '1px',
        }} />
      </div>
      {/* Trunk */}
      <div style={{
        width: 4, height: 6,
        backgroundColor: '#8B6914',
        margin: '0 auto',
      }} />
    </div>
  );
});

/** Small pixel art fence decoration */
const PixelFence = memo(function PixelFence({ x, y, width }: { x: number; y: number; width: number }) {
  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        width: `${width}%`,
        height: 8,
        zIndex: Math.floor((y / 100) * 600),
        display: 'flex',
        gap: 6,
        alignItems: 'flex-end',
      }}
    >
      {Array.from({ length: Math.floor(width * 1.5) }, (_, i) => (
        <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ width: 2, height: 8, backgroundColor: '#A07840' }} />
          <div style={{ width: 6, height: 2, backgroundColor: '#A07840', marginTop: -6 }} />
        </div>
      ))}
    </div>
  );
});
