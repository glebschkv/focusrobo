import { memo, useState, useCallback } from 'react';
import { BUILDINGS, getUnlockedBuildings, type BuildingConfig } from './villageConfig';

interface VillageMapProps {
  currentLevel: number;
}

// ── Asset paths ───────────────────────────────────────────────────

const GRASS_TILE = 'url("/assets/pixel-world/tiles/grass-bright.png")';
const DIRT_TILE = 'url("/assets/pixel-world/tiles/dirt-light.png")';
const FLOWER_GRASS_TILE = 'url("/assets/pixel-world/tiles/grass-flowers.png")';

const DECO = {
  oakTree: '/assets/pixel-world/decorations/oak-tree.png',
  pineTree: '/assets/pixel-world/decorations/pine-tree.png',
  bush: '/assets/pixel-world/decorations/bush.png',
  flowers: '/assets/pixel-world/decorations/flowers.png',
  rock: '/assets/pixel-world/decorations/rock.png',
  signpost: '/assets/pixel-world/decorations/signpost.png',
  barrel: '/assets/pixel-world/decorations/barrel.png',
} as const;

// ── Floating cloud definitions ───────────────────────────────────

const CLOUDS = [
  { top: '3%', duration: 48, delay: 0, width: 72 },
  { top: '9%', duration: 65, delay: -20, width: 52 },
  { top: '6%', duration: 55, delay: -35, width: 64 },
  { top: '14%', duration: 78, delay: -50, width: 40 },
];

// ── PixelLab image decorations (positioned as % of map) ──────────

interface DecoPlacement {
  src: string;
  x: number;     // % from left
  y: number;     // % from top
  width: number;  // display px
  height: number; // display px
}

const TREE_PLACEMENTS: DecoPlacement[] = [
  { src: DECO.oakTree,  x: 2,  y: 30, width: 56, height: 56 },
  { src: DECO.pineTree, x: 95, y: 26, width: 40, height: 40 },
  { src: DECO.oakTree,  x: 50, y: 82, width: 48, height: 48 },
  { src: DECO.pineTree, x: 93, y: 48, width: 36, height: 36 },
  { src: DECO.oakTree,  x: 4,  y: 54, width: 44, height: 44 },
  { src: DECO.pineTree, x: 90, y: 68, width: 38, height: 38 },
  { src: DECO.oakTree,  x: 96, y: 80, width: 50, height: 50 },
  { src: DECO.pineTree, x: 36, y: 26, width: 32, height: 32 },
];

const SMALL_DECO_PLACEMENTS: DecoPlacement[] = [
  // Bushes
  { src: DECO.bush, x: 8,  y: 43, width: 28, height: 28 },
  { src: DECO.bush, x: 60, y: 46, width: 24, height: 24 },
  { src: DECO.bush, x: 88, y: 42, width: 26, height: 26 },
  { src: DECO.bush, x: 32, y: 74, width: 22, height: 22 },
  // Flowers
  { src: DECO.flowers, x: 22, y: 56, width: 36, height: 26 },
  { src: DECO.flowers, x: 68, y: 62, width: 32, height: 22 },
  { src: DECO.flowers, x: 48, y: 40, width: 28, height: 20 },
  { src: DECO.flowers, x: 82, y: 34, width: 30, height: 22 },
  { src: DECO.flowers, x: 10, y: 70, width: 34, height: 24 },
  // Rocks
  { src: DECO.rock, x: 30, y: 46, width: 24, height: 24 },
  { src: DECO.rock, x: 64, y: 50, width: 20, height: 20 },
  { src: DECO.rock, x: 86, y: 76, width: 22, height: 22 },
  // Barrels (near buildings)
  { src: DECO.barrel, x: 52, y: 30, width: 20, height: 20 },
  { src: DECO.barrel, x: 22, y: 38, width: 18, height: 18 },
  // Signpost
  { src: DECO.signpost, x: 45, y: 44, width: 22, height: 34 },
];

// ── Dirt paths ───────────────────────────────────────────────────

const PATHS: { left: string; top: string; width: string; height: string }[] = [
  // Main horizontal road
  { left: '10%', top: '46%', width: '80%', height: '5%' },
  // Vertical connectors
  { left: '43%', top: '30%', width: '5%', height: '18%' },
  { left: '15%', top: '50%', width: '5%', height: '18%' },
  { left: '42%', top: '50%', width: '5%', height: '15%' },
  { left: '70%', top: '35%', width: '5%', height: '13%' },
  { left: '68%', top: '22%', width: '5%', height: '15%' },
];

// ── Buildings with chimney smoke ─────────────────────────────────

const SMOKE_BUILDINGS = ['cottage', 'bakery', 'forge'];

/**
 * VillageMap — Rich pixel art village scene with PixelLab-generated assets.
 * Supports building lock/unlock states based on player level.
 */
export const VillageMap = memo(function VillageMap({ currentLevel }: VillageMapProps) {
  const unlockedBuildings = getUnlockedBuildings(currentLevel);
  const unlockedIds = new Set(unlockedBuildings.map(b => b.id));

  return (
    <div className="absolute inset-0">
      {/* ── Sky gradient ── */}
      <div
        className="absolute inset-x-0 top-0"
        style={{
          height: '32%',
          background: 'linear-gradient(180deg, #87CEEB 0%, #A8DFF0 40%, #C5EEFA 70%, #D8F3FC 100%)',
        }}
      />

      {/* ── Sun ── */}
      <div
        className="absolute"
        style={{
          right: '15%',
          top: '5%',
          width: 22,
          height: 22,
          borderRadius: '50%',
          background: 'radial-gradient(circle, #FFFDE0 0%, #FFE680 45%, #FFD03B 100%)',
          boxShadow: '0 0 18px 8px rgba(255, 220, 60, 0.3), 0 0 45px 15px rgba(255, 220, 60, 0.12)',
          zIndex: 1,
        }}
      />

      {/* ── Floating pixel clouds ── */}
      {CLOUDS.map((cloud, i) => (
        <div
          key={`cloud-${i}`}
          className="village-cloud"
          style={{
            top: cloud.top,
            '--cloud-duration': `${cloud.duration}s`,
            '--cloud-delay': `${cloud.delay}s`,
            zIndex: 2,
          } as React.CSSProperties}
        >
          <PixelCloud width={cloud.width} />
        </div>
      ))}

      {/* ── Distant rolling hills ── */}
      <div
        className="absolute inset-x-0"
        style={{
          top: '20%',
          height: '14%',
          background: `
            radial-gradient(ellipse 50% 110% at 12% 100%, #5D9840 0%, transparent 100%),
            radial-gradient(ellipse 60% 100% at 45% 100%, #4E8835 0%, transparent 100%),
            radial-gradient(ellipse 45% 110% at 82% 100%, #5D9840 0%, transparent 100%)
          `,
        }}
      />
      <div
        className="absolute inset-x-0"
        style={{
          top: '24%',
          height: '10%',
          background: `
            radial-gradient(ellipse 55% 100% at 25% 100%, #6BA84A 0%, transparent 100%),
            radial-gradient(ellipse 50% 100% at 65% 100%, #6BA84A 0%, transparent 100%),
            radial-gradient(ellipse 40% 100% at 92% 100%, #60A042 0%, transparent 100%)
          `,
        }}
      />

      {/* ── Main grass ground (bright PixelLab tile) ── */}
      <div
        className="absolute inset-x-0 bottom-0 pixel-render"
        style={{
          top: '28%',
          backgroundImage: GRASS_TILE,
          backgroundSize: '32px 32px',
        }}
      />

      {/* ── Grass color variation patches (lighter, more vibrant) ── */}
      {[
        { left: '8%',  top: '38%', width: '28%', height: '12%', color: 'rgba(130,190,80,0.25)' },
        { left: '55%', top: '54%', width: '24%', height: '10%', color: 'rgba(130,190,80,0.2)' },
        { left: '28%', top: '70%', width: '30%', height: '12%', color: 'rgba(120,180,70,0.2)' },
        { left: '72%', top: '38%', width: '18%', height: '8%',  color: 'rgba(110,170,60,0.18)' },
      ].map((patch, i) => (
        <div
          key={`grass-${i}`}
          className="absolute"
          style={{
            left: patch.left,
            top: patch.top,
            width: patch.width,
            height: patch.height,
            background: `radial-gradient(ellipse, ${patch.color} 0%, transparent 70%)`,
          }}
        />
      ))}

      {/* ── Flower grass patches ── */}
      {[
        { left: '15%', top: '56%', width: '12%', height: '8%' },
        { left: '60%', top: '68%', width: '14%', height: '8%' },
        { left: '75%', top: '84%', width: '10%', height: '6%' },
      ].map((patch, i) => (
        <div
          key={`fgrass-${i}`}
          className="absolute pixel-render"
          style={{
            left: patch.left,
            top: patch.top,
            width: patch.width,
            height: patch.height,
            backgroundImage: FLOWER_GRASS_TILE,
            backgroundSize: '32px 32px',
            opacity: 0.7,
            borderRadius: '50%',
          }}
        />
      ))}

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
            backgroundSize: '32px 32px',
            borderRadius: '4px',
            zIndex: 3,
          }}
        />
      ))}

      {/* ── Path edge blending ── */}
      {PATHS.map((path, i) => (
        <div
          key={`path-edge-${i}`}
          className="absolute"
          style={{
            left: path.left,
            top: path.top,
            width: path.width,
            height: path.height,
            borderRadius: '6px',
            boxShadow: '0 0 6px 3px rgba(130,190,80,0.25)',
            zIndex: 3,
            pointerEvents: 'none',
          }}
        />
      ))}

      {/* ── Water pond ── */}
      <div
        className="absolute"
        style={{
          left: '0%',
          top: '78%',
          width: '26%',
          height: '22%',
          background: 'linear-gradient(180deg, #6BBCE0 0%, #58ACd0 35%, #4A9CC0 70%, #3E8CB5 100%)',
          borderRadius: '0 40% 0 0',
          zIndex: 2,
          overflow: 'hidden',
        }}
      >
        {/* Animated water shine lines */}
        {[
          { top: '18%', left: '10%', width: '55%', delay: 0, speed: 3 },
          { top: '38%', left: '20%', width: '40%', delay: 1.2, speed: 3.5 },
          { top: '56%', left: '8%', width: '50%', delay: 0.7, speed: 2.8 },
          { top: '72%', left: '25%', width: '35%', delay: 2, speed: 3.2 },
        ].map((shine, i) => (
          <div
            key={`shine-${i}`}
            className="absolute water-shine"
            style={{
              top: shine.top,
              left: shine.left,
              width: shine.width,
              height: '2px',
              backgroundColor: 'rgba(255, 255, 255, 0.35)',
              borderRadius: '1px',
              '--shimmer-speed': `${shine.speed}s`,
              '--shimmer-delay': `${shine.delay}s`,
            } as React.CSSProperties}
          />
        ))}

        {/* Water ripple circles */}
        {[
          { top: '30%', left: '40%', delay: 0 },
          { top: '60%', left: '20%', delay: 2 },
        ].map((ripple, i) => (
          <div
            key={`ripple-${i}`}
            className="absolute water-ripple"
            style={{
              top: ripple.top,
              left: ripple.left,
              width: 8,
              height: 8,
              border: '1px solid rgba(255,255,255,0.25)',
              borderRadius: '50%',
              '--ripple-delay': `${ripple.delay}s`,
            } as React.CSSProperties}
          />
        ))}
      </div>

      {/* ── Sandy shoreline ── */}
      <div
        className="absolute pixel-render"
        style={{
          left: '0%', top: '76%', width: '28%', height: '3.5%',
          background: 'linear-gradient(90deg, #E0CC96 0%, #D4C08A 30%, #E0CC96 60%, #D4C08A 100%)',
          borderRadius: '0 12px 0 0',
          zIndex: 3,
        }}
      />

      {/* ── PixelLab small decorations (flowers, bushes, rocks, barrels, signpost) ── */}
      {SMALL_DECO_PLACEMENTS.map((deco, i) => (
        <img
          key={`deco-${i}`}
          src={deco.src}
          alt=""
          className="absolute pointer-events-none pixel-render"
          style={{
            left: `${deco.x}%`,
            top: `${deco.y}%`,
            width: deco.width,
            height: deco.height,
            transform: 'translate(-50%, -50%)',
            zIndex: Math.floor((deco.y / 100) * 600),
            imageRendering: 'pixelated',
          }}
          draggable={false}
        />
      ))}

      {/* ── PixelLab trees (with gentle sway) ── */}
      {TREE_PLACEMENTS.map((tree, i) => (
        <img
          key={`tree-${i}`}
          src={tree.src}
          alt=""
          className="absolute pointer-events-none pixel-render tree-sway"
          style={{
            left: `${tree.x}%`,
            top: `${tree.y}%`,
            width: tree.width,
            height: tree.height,
            transform: 'translate(-50%, -100%)',
            zIndex: Math.floor((tree.y / 100) * 600),
            imageRendering: 'pixelated',
            '--sway-speed': `${5 + i * 0.8}s`,
          } as React.CSSProperties}
          draggable={false}
        />
      ))}

      {/* ── Buildings (unlocked + locked) ── */}
      {BUILDINGS.map((building) => {
        const isUnlocked = unlockedIds.has(building.id);
        return (
          <BuildingSprite
            key={building.id}
            building={building}
            isUnlocked={isUnlocked}
          />
        );
      })}

      {/* ── Chimney smoke on unlocked buildings ── */}
      {unlockedBuildings
        .filter(b => SMOKE_BUILDINGS.includes(b.id))
        .map(b => (
          <ChimneySmoke
            key={`smoke-${b.id}`}
            x={b.id === 'forge' ? b.x + 2 : b.x + 3}
            y={b.y - (b.id === 'forge' ? 6 : 8)}
          />
        ))}
    </div>
  );
});

// ── Sub-components ────────────────────────────────────────────────

/** Pixel cloud using scaled SVG */
const PixelCloud = memo(function PixelCloud({ width = 64 }: { width?: number }) {
  const scale = width / 12;
  return (
    <svg
      width={width}
      height={scale * 5}
      viewBox="0 0 12 5"
      style={{ imageRendering: 'pixelated', opacity: 0.9 }}
    >
      <rect x="3" y="0" width="4" height="1" fill="white" />
      <rect x="1" y="1" width="9" height="1" fill="white" />
      <rect x="0" y="2" width="12" height="1" fill="white" />
      <rect x="0" y="3" width="11" height="1" fill="white" />
      <rect x="2" y="4" width="7" height="1" fill="white" />
      <rect x="1" y="3" width="3" height="1" fill="rgba(210,230,250,0.4)" />
    </svg>
  );
});

/** Building sprite with lock/unlock state */
const BuildingSprite = memo(function BuildingSprite({
  building,
  isUnlocked,
}: {
  building: BuildingConfig;
  isUnlocked: boolean;
}) {
  const [tapped, setTapped] = useState(false);

  const handleTap = useCallback(() => {
    if (!isUnlocked) {
      setTapped(true);
      setTimeout(() => setTapped(false), 2000);
    }
  }, [isUnlocked]);

  return (
    <div
      className="absolute"
      style={{
        left: `${building.x}%`,
        top: `${building.y}%`,
        transform: 'translate(-50%, -50%)',
        zIndex: Math.floor((building.y / 100) * 600),
        cursor: isUnlocked ? 'default' : 'pointer',
      }}
      onClick={handleTap}
    >
      {/* Building image */}
      <img
        src={building.imagePath}
        alt={building.name}
        className={`pixel-render ${isUnlocked ? 'building-enter' : ''}`}
        style={{
          width: building.width,
          height: building.height,
          imageRendering: 'pixelated',
          filter: isUnlocked ? 'none' : 'brightness(0.35) grayscale(0.8)',
          opacity: isUnlocked ? 1 : 0.6,
          transition: 'filter 0.5s, opacity 0.5s',
        }}
        draggable={false}
      />

      {/* Lock overlay for locked buildings */}
      {!isUnlocked && (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center"
          style={{ pointerEvents: 'none' }}
        >
          <div
            style={{
              fontSize: 16,
              lineHeight: 1,
              marginBottom: 2,
              textShadow: '0 1px 3px rgba(0,0,0,0.5)',
            }}
          >
            {'\uD83D\uDD12'}
          </div>
          <div
            style={{
              fontSize: 9,
              fontWeight: 800,
              color: '#FFF',
              fontFamily: 'monospace',
              textShadow: '0 1px 3px rgba(0,0,0,0.7)',
              letterSpacing: '0.04em',
            }}
          >
            Lv.{building.unlockLevel}
          </div>
        </div>
      )}

      {/* Unlocked building name label */}
      {isUnlocked && (
        <div
          className="absolute left-1/2 text-center whitespace-nowrap pointer-events-none"
          style={{
            bottom: -12,
            transform: 'translateX(-50%)',
            fontSize: 8,
            fontWeight: 700,
            color: '#3D3D3D',
            fontFamily: 'monospace',
            textShadow: '0 0 4px rgba(255,255,255,0.95), 0 0 8px rgba(255,255,255,0.7)',
            letterSpacing: '0.03em',
          }}
        >
          {building.name}
        </div>
      )}

      {/* Tap feedback for locked buildings */}
      {!isUnlocked && tapped && (
        <div
          className="absolute left-1/2 speech-bubble"
          style={{
            bottom: building.height + 8,
            transform: 'translateX(-50%)',
            padding: '4px 10px',
            background: 'rgba(0,0,0,0.8)',
            borderRadius: 6,
            fontSize: 10,
            fontWeight: 700,
            color: '#FFD700',
            whiteSpace: 'nowrap',
            fontFamily: 'monospace',
            zIndex: 1000,
          }}
        >
          Reach Lv.{building.unlockLevel} to unlock!
          <div
            style={{
              position: 'absolute',
              bottom: -4,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 0,
              height: 0,
              borderLeft: '4px solid transparent',
              borderRight: '4px solid transparent',
              borderTop: '4px solid rgba(0,0,0,0.8)',
            }}
          />
        </div>
      )}
    </div>
  );
});

/** Chimney smoke particles */
const ChimneySmoke = memo(function ChimneySmoke({ x, y }: { x: number; y: number }) {
  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        zIndex: 500,
      }}
    >
      {[0, 1, 2, 3].map(i => (
        <div
          key={i}
          className="smoke-particle"
          style={{
            '--smoke-delay': `${i * 0.7}s`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
});
