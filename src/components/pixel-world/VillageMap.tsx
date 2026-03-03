import { memo } from 'react';
import { BUILDINGS, type BuildingConfig } from './villageConfig';

interface VillageMapProps {
  currentLevel: number;
}

// ── PixelLab-generated 32×32 ground tiles (repeating) ────────────

const GRASS_TILE = 'url("/assets/pixel-world/tiles/grass.png")';
const DIRT_TILE = 'url("/assets/pixel-world/tiles/dirt.png")';

// ── Floating cloud definitions ───────────────────────────────────

const CLOUDS = [
  { top: '3%', duration: 45, delay: 0, width: 80 },
  { top: '10%', duration: 62, delay: -22, width: 56 },
  { top: '5%', duration: 53, delay: -38, width: 70 },
  { top: '15%', duration: 75, delay: -55, width: 44 },
];

// ── Decorative trees ─────────────────────────────────────────────

const TREES: { x: number; y: number; variant: 'oak' | 'pine'; size: number }[] = [
  { x: 3, y: 34, variant: 'oak', size: 2.5 },
  { x: 96, y: 50, variant: 'pine', size: 2.2 },
  { x: 52, y: 84, variant: 'oak', size: 2.0 },
  { x: 94, y: 28, variant: 'pine', size: 2.4 },
  { x: 5, y: 55, variant: 'oak', size: 1.8 },
  { x: 92, y: 72, variant: 'oak', size: 2.1 },
  { x: 35, y: 28, variant: 'pine', size: 1.6 },
  { x: 85, y: 60, variant: 'pine', size: 1.9 },
  { x: 58, y: 22, variant: 'oak', size: 1.5 },
];

// ── Flower clusters ──────────────────────────────────────────────

const FLOWERS: { x: number; y: number; colors: string[] }[] = [
  { x: 8, y: 45, colors: ['#E74C3C', '#F39C12', '#E74C3C'] },
  { x: 55, y: 43, colors: ['#F1C40F', '#E74C3C', '#F39C12'] },
  { x: 88, y: 48, colors: ['#9B59B6', '#E74C3C', '#F1C40F'] },
  { x: 20, y: 58, colors: ['#F1C40F', '#9B59B6', '#F39C12'] },
  { x: 65, y: 62, colors: ['#E74C3C', '#F1C40F', '#E74C3C'] },
  { x: 78, y: 32, colors: ['#F39C12', '#9B59B6', '#F1C40F'] },
  { x: 48, y: 78, colors: ['#9B59B6', '#F39C12', '#E74C3C'] },
  { x: 12, y: 72, colors: ['#F1C40F', '#E74C3C', '#9B59B6'] },
  { x: 92, y: 62, colors: ['#E74C3C', '#F1C40F', '#F39C12'] },
  { x: 32, y: 34, colors: ['#F1C40F', '#9B59B6', '#E74C3C'] },
  { x: 82, y: 68, colors: ['#9B59B6', '#F39C12', '#F1C40F'] },
  { x: 42, y: 90, colors: ['#E74C3C', '#F1C40F', '#9B59B6'] },
];

// ── Dirt paths ───────────────────────────────────────────────────

const PATHS: { left: string; top: string; width: string; height: string; radius?: string }[] = [
  { left: '10%', top: '46%', width: '80%', height: '5%' },
  { left: '43%', top: '30%', width: '5%', height: '18%' },
  { left: '15%', top: '50%', width: '5%', height: '18%' },
  { left: '42%', top: '50%', width: '5%', height: '15%' },
  { left: '70%', top: '35%', width: '5%', height: '13%' },
  // Extra path branching to tower
  { left: '68%', top: '22%', width: '5%', height: '15%' },
];

// ── Rock decorations ─────────────────────────────────────────────

const ROCKS: { x: number; y: number; size: number }[] = [
  { x: 28, y: 46, size: 1 },
  { x: 62, y: 50, size: 0.8 },
  { x: 88, y: 44, size: 1.2 },
  { x: 38, y: 75, size: 0.7 },
  { x: 78, y: 76, size: 1 },
];

// ── Buildings with chimney smoke ─────────────────────────────────

const SMOKE_BUILDINGS = ['cottage', 'bakery', 'forge'];

/**
 * VillageMap — Rich pixel art village scene with animated environment.
 * Sky with floating clouds, textured ground, water, trees, paths, and buildings.
 */
export const VillageMap = memo(function VillageMap({ currentLevel: _currentLevel }: VillageMapProps) {
  const unlockedBuildings = BUILDINGS;

  return (
    <div className="absolute inset-0">
      {/* ── Sky gradient with depth ── */}
      <div
        className="absolute inset-x-0 top-0"
        style={{
          height: '32%',
          background: 'linear-gradient(180deg, #5BA8D4 0%, #7EC8E3 30%, #A8DFF0 65%, #C8EBF7 100%)',
        }}
      />

      {/* ── Sun ── */}
      <div
        className="absolute"
        style={{
          right: '15%',
          top: '5%',
          width: 20,
          height: 20,
          borderRadius: '50%',
          background: 'radial-gradient(circle, #FFF8DC 0%, #FFE680 50%, #FFD03B 100%)',
          boxShadow: '0 0 16px 6px rgba(255, 220, 60, 0.35), 0 0 40px 12px rgba(255, 220, 60, 0.15)',
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

      {/* ── Distant hills (3 layers for depth) ── */}
      <div
        className="absolute inset-x-0"
        style={{
          top: '20%',
          height: '14%',
          background: `
            radial-gradient(ellipse 50% 110% at 12% 100%, #4A8030 0%, transparent 100%),
            radial-gradient(ellipse 60% 100% at 45% 100%, #3D7025 0%, transparent 100%),
            radial-gradient(ellipse 45% 110% at 80% 100%, #4A8030 0%, transparent 100%)
          `,
        }}
      />
      <div
        className="absolute inset-x-0"
        style={{
          top: '24%',
          height: '10%',
          background: `
            radial-gradient(ellipse 55% 100% at 25% 100%, #5D9040 0%, transparent 100%),
            radial-gradient(ellipse 50% 100% at 65% 100%, #5D9040 0%, transparent 100%),
            radial-gradient(ellipse 40% 100% at 92% 100%, #528838 0%, transparent 100%)
          `,
        }}
      />

      {/* ── Main grass ground ── */}
      <div
        className="absolute inset-x-0 bottom-0 pixel-render"
        style={{
          top: '28%',
          backgroundImage: GRASS_TILE,
          backgroundSize: '32px 32px',
        }}
      />

      {/* ── Grass color variation patches ── */}
      {[
        { left: '10%', top: '36%', width: '30%', height: '14%', color: 'rgba(107,156,78,0.5)' },
        { left: '55%', top: '52%', width: '25%', height: '12%', color: 'rgba(107,156,78,0.4)' },
        { left: '30%', top: '68%', width: '35%', height: '14%', color: 'rgba(91,140,62,0.35)' },
        { left: '70%', top: '36%', width: '20%', height: '10%', color: 'rgba(80,128,50,0.3)' },
        { left: '5%', top: '80%', width: '20%', height: '10%', color: 'rgba(75,120,48,0.35)' },
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
            borderRadius: path.radius || '4px',
            zIndex: 3,
          }}
        />
      ))}

      {/* ── Path edge softening (dirt-to-grass blending) ── */}
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
            boxShadow: '0 0 4px 2px rgba(91,140,62,0.3)',
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
          background: 'linear-gradient(180deg, #5AA8C8 0%, #4898B8 35%, #3888A8 70%, #2878A0 100%)',
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
              backgroundColor: 'rgba(255, 255, 255, 0.3)',
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
              border: '1px solid rgba(255,255,255,0.2)',
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
          background: 'linear-gradient(90deg, #D4BC86 0%, #C8B07A 30%, #D4BC86 60%, #C8B07A 100%)',
          borderRadius: '0 12px 0 0',
          zIndex: 3,
        }}
      />
      {/* Shore detail */}
      <div
        className="absolute"
        style={{
          left: '0%', top: '77.5%', width: '27%', height: '1%',
          background: 'linear-gradient(90deg, transparent 0%, rgba(90,168,200,0.3) 40%, rgba(90,168,200,0.2) 100%)',
          borderRadius: '0 8px 0 0',
          zIndex: 4,
        }}
      />

      {/* ── Flower clusters ── */}
      {FLOWERS.map((cluster, i) => (
        <FlowerCluster key={`flowers-${i}`} x={cluster.x} y={cluster.y} colors={cluster.colors} />
      ))}

      {/* ── Rock decorations ── */}
      {ROCKS.map((rock, i) => (
        <PixelRock key={`rock-${i}`} x={rock.x} y={rock.y} size={rock.size} />
      ))}

      {/* ── Pixel art trees ── */}
      {TREES.map((tree, i) => (
        <PixelTree key={`tree-${i}`} x={tree.x} y={tree.y} variant={tree.variant} size={tree.size} index={i} />
      ))}

      {/* ── Pixel fences ── */}
      <PixelFence x={8} y={44} width={5} />
      <PixelFence x={58} y={44} width={10} />
      <PixelFence x={88} y={44} width={4} />

      {/* ── Building overlays ── */}
      {unlockedBuildings.map((building) => (
        <BuildingSprite key={building.id} building={building} />
      ))}

      {/* ── Chimney smoke on select buildings ── */}
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

/** Pixel cloud using scaled SVG for authentic look */
const PixelCloud = memo(function PixelCloud({ width = 64 }: { width?: number }) {
  const scale = width / 12;
  return (
    <svg
      width={width}
      height={scale * 5}
      viewBox="0 0 12 5"
      style={{ imageRendering: 'pixelated', opacity: 0.92 }}
    >
      <rect x="3" y="0" width="4" height="1" fill="white" />
      <rect x="1" y="1" width="9" height="1" fill="white" />
      <rect x="0" y="2" width="12" height="1" fill="white" />
      <rect x="0" y="3" width="11" height="1" fill="white" />
      <rect x="2" y="4" width="7" height="1" fill="white" />
      {/* Subtle shading */}
      <rect x="1" y="3" width="3" height="1" fill="rgba(200,220,240,0.5)" />
    </svg>
  );
});

/** Pixel art tree with canopy, trunk, and highlight detail */
const PixelTree = memo(function PixelTree({
  x, y, variant, size, index,
}: {
  x: number; y: number; variant: 'oak' | 'pine'; size: number; index: number;
}) {
  const isOak = variant === 'oak';
  return (
    <div
      className="absolute pointer-events-none tree-sway"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        transform: 'translate(-50%, -100%)',
        zIndex: Math.floor((y / 100) * 600),
        '--sway-speed': `${5 + index * 0.7}s`,
      } as React.CSSProperties}
    >
      {isOak ? (
        <svg
          width={12 * size}
          height={18 * size}
          viewBox="0 0 12 18"
          style={{ imageRendering: 'pixelated' }}
        >
          {/* Canopy */}
          <rect x="3" y="0" width="6" height="1" fill="#3D7E24" />
          <rect x="2" y="1" width="8" height="1" fill="#3D7E24" />
          <rect x="1" y="2" width="10" height="1" fill="#3D7E24" />
          <rect x="1" y="3" width="10" height="1" fill="#3D7E24" />
          <rect x="0" y="4" width="12" height="1" fill="#3D7E24" />
          <rect x="0" y="5" width="12" height="1" fill="#3D7E24" />
          <rect x="1" y="6" width="10" height="1" fill="#3D7E24" />
          <rect x="1" y="7" width="10" height="1" fill="#3D7E24" />
          <rect x="2" y="8" width="8" height="1" fill="#3D7E24" />
          <rect x="3" y="9" width="6" height="1" fill="#3D7E24" />
          {/* Highlight patches */}
          <rect x="3" y="2" width="3" height="2" fill="#5B9C3E" />
          <rect x="7" y="4" width="3" height="2" fill="#5B9C3E" />
          <rect x="2" y="6" width="2" height="2" fill="#4A8E30" />
          {/* Dark patches */}
          <rect x="1" y="5" width="2" height="2" fill="#2D6E1E" />
          <rect x="8" y="7" width="2" height="2" fill="#2D6E1E" />
          {/* Trunk */}
          <rect x="5" y="10" width="2" height="6" fill="#6B4E23" />
          <rect x="5" y="10" width="1" height="4" fill="#8B6E3D" />
          {/* Base roots */}
          <rect x="4" y="16" width="4" height="1" fill="#5A3E18" />
          <rect x="3" y="17" width="1" height="1" fill="#4A7A32" />
          <rect x="8" y="17" width="1" height="1" fill="#4A7A32" />
        </svg>
      ) : (
        <svg
          width={8 * size}
          height={20 * size}
          viewBox="0 0 8 20"
          style={{ imageRendering: 'pixelated' }}
        >
          {/* Pine tree - triangular shape */}
          <rect x="3" y="0" width="2" height="1" fill="#2D6E1E" />
          <rect x="2" y="1" width="4" height="1" fill="#2D6E1E" />
          <rect x="2" y="2" width="4" height="1" fill="#3D7E24" />
          <rect x="1" y="3" width="6" height="1" fill="#2D6E1E" />
          <rect x="1" y="4" width="6" height="1" fill="#3D7E24" />
          <rect x="0" y="5" width="8" height="1" fill="#2D6E1E" />
          <rect x="1" y="6" width="6" height="1" fill="#2D6E1E" />
          <rect x="1" y="7" width="6" height="1" fill="#3D7E24" />
          <rect x="0" y="8" width="8" height="1" fill="#2D6E1E" />
          <rect x="0" y="9" width="8" height="1" fill="#3D7E24" />
          <rect x="1" y="10" width="6" height="1" fill="#2D6E1E" />
          <rect x="0" y="11" width="8" height="1" fill="#2D6E1E" />
          <rect x="1" y="12" width="6" height="1" fill="#3D7E24" />
          <rect x="2" y="13" width="4" height="1" fill="#2D6E1E" />
          {/* Highlight */}
          <rect x="2" y="3" width="2" height="2" fill="#4A8E30" />
          <rect x="2" y="8" width="2" height="2" fill="#4A8E30" />
          {/* Trunk */}
          <rect x="3" y="14" width="2" height="5" fill="#6B4E23" />
          <rect x="3" y="14" width="1" height="3" fill="#8B6E3D" />
          {/* Base */}
          <rect x="2" y="19" width="4" height="1" fill="#5A3E18" />
        </svg>
      )}
    </div>
  );
});

/** Cluster of pixel flowers with stems */
const FlowerCluster = memo(function FlowerCluster({
  x, y, colors,
}: {
  x: number; y: number; colors: string[];
}) {
  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        zIndex: 4,
      }}
    >
      {colors.map((color, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: i * 6 - 6,
            top: (i % 2) * 3,
          }}
        >
          {/* Stem */}
          <div style={{
            width: 1,
            height: 5,
            backgroundColor: '#3D6E24',
            margin: '0 auto',
          }} />
          {/* Flower head */}
          <div style={{
            width: 5,
            height: 5,
            backgroundColor: color,
            borderRadius: '1px',
            marginTop: -5,
            position: 'relative',
          }}>
            {/* Center dot */}
            <div style={{
              position: 'absolute',
              top: 1,
              left: 1,
              width: 3,
              height: 3,
              backgroundColor: '#F1C40F',
              borderRadius: '1px',
            }} />
          </div>
        </div>
      ))}
    </div>
  );
});

/** Pixel rock decoration */
const PixelRock = memo(function PixelRock({ x, y, size }: { x: number; y: number; size: number }) {
  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        zIndex: Math.floor((y / 100) * 600),
      }}
    >
      <svg
        width={10 * size}
        height={7 * size}
        viewBox="0 0 10 7"
        style={{ imageRendering: 'pixelated' }}
      >
        <rect x="2" y="0" width="6" height="1" fill="#9E9E9E" />
        <rect x="1" y="1" width="8" height="1" fill="#8E8E8E" />
        <rect x="0" y="2" width="10" height="1" fill="#8E8E8E" />
        <rect x="0" y="3" width="10" height="1" fill="#7E7E7E" />
        <rect x="1" y="4" width="8" height="1" fill="#7E7E7E" />
        <rect x="2" y="5" width="6" height="1" fill="#6E6E6E" />
        <rect x="3" y="6" width="4" height="1" fill="#6E6E6E" />
        {/* Highlight */}
        <rect x="3" y="1" width="3" height="1" fill="#B0B0B0" />
        <rect x="2" y="2" width="2" height="1" fill="#A0A0A0" />
      </svg>
    </div>
  );
});

/** Building sprite with enter animation */
const BuildingSprite = memo(function BuildingSprite({ building }: { building: BuildingConfig }) {
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

/** Pixel fence decoration */
const PixelFence = memo(function PixelFence({ x, y, width }: { x: number; y: number; width: number }) {
  const posts = Math.floor(width * 1.5);
  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        width: `${width}%`,
        height: 10,
        zIndex: Math.floor((y / 100) * 600),
        display: 'flex',
        gap: 6,
        alignItems: 'flex-end',
      }}
    >
      {Array.from({ length: posts }, (_, i) => (
        <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {/* Post */}
          <div style={{ width: 2, height: 10, backgroundColor: '#A07840' }} />
          {/* Rail top */}
          <div style={{ width: 8, height: 2, backgroundColor: '#B08850', marginTop: -9 }} />
          {/* Rail bottom */}
          <div style={{ width: 8, height: 2, backgroundColor: '#A07840', marginTop: 2 }} />
        </div>
      ))}
    </div>
  );
});
