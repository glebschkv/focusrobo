import { memo, useMemo } from 'react';
import { BUILDINGS, type BuildingConfig } from './villageConfig';

interface VillageMapProps {
  currentLevel: number;
}

/**
 * VillageMap — Rich layered pixel-art-style village scene.
 * Bright morning mood with depth layers: sky → hills → ground → details.
 * Buildings appear as overlays based on player level.
 */
export const VillageMap = memo(function VillageMap({ currentLevel }: VillageMapProps) {
  const unlockedBuildings = useMemo(
    () => BUILDINGS.filter(b => b.unlockLevel <= currentLevel),
    [currentLevel],
  );

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* ── Sky layer ────────────────────────────────────── */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(180deg, #7EC8E3 0%, #A8DEF0 25%, #C5E8F7 40%, #E8F4E2 55%, #78B856 55.5%, #6AAF45 65%, #5DA03A 80%, #4E8F30 100%)',
        }}
      />

      {/* ── Distant hills ────────────────────────────────── */}
      <div className="absolute w-full" style={{ top: '38%', height: '20%' }}>
        <svg viewBox="0 0 400 80" className="w-full h-full" preserveAspectRatio="none">
          <ellipse cx="80" cy="70" rx="120" ry="55" fill="#8CC46A" opacity="0.6" />
          <ellipse cx="300" cy="65" rx="140" ry="50" fill="#7DB85E" opacity="0.5" />
          <ellipse cx="190" cy="75" rx="100" ry="40" fill="#92CA72" opacity="0.4" />
        </svg>
      </div>

      {/* ── Sun ──────────────────────────────────────────── */}
      <div
        className="absolute rounded-full"
        style={{
          top: '6%',
          right: '12%',
          width: 44,
          height: 44,
          background: 'radial-gradient(circle, #FFF9C4 0%, #FFE082 40%, #FFD54F 70%, transparent 100%)',
          boxShadow: '0 0 40px 15px rgba(255,235,59,0.2), 0 0 80px 30px rgba(255,235,59,0.1)',
        }}
      />

      {/* ── Clouds ───────────────────────────────────────── */}
      <Cloud x={8} y={8} width={70} opacity={0.7} speed={45} />
      <Cloud x={55} y={4} width={55} opacity={0.5} speed={60} />
      <Cloud x={30} y={15} width={45} opacity={0.4} speed={50} />
      <Cloud x={80} y={12} width={35} opacity={0.3} speed={55} />

      {/* ── Ground texture patches ───────────────────────── */}
      <GrassPatch x={5} y={58} size={60} color="#7FC455" />
      <GrassPatch x={65} y={62} size={50} color="#82C859" />
      <GrassPatch x={35} y={75} size={70} color="#7AC050" />
      <GrassPatch x={15} y={85} size={55} color="#85CB5E" />
      <GrassPatch x={75} y={80} size={45} color="#7DC453" />

      {/* ── Dirt path ────────────────────────────────────── */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 390 600" preserveAspectRatio="none">
        {/* Main winding path */}
        <path
          d="M195 330 C195 370, 160 380, 150 410 C140 440, 170 460, 195 470 C220 480, 260 490, 250 520 C240 550, 180 560, 170 580"
          fill="none"
          stroke="#C9A96E"
          strokeWidth="28"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Path highlight (lighter center) */}
        <path
          d="M195 330 C195 370, 160 380, 150 410 C140 440, 170 460, 195 470 C220 480, 260 490, 250 520 C240 550, 180 560, 170 580"
          fill="none"
          stroke="#D4B87E"
          strokeWidth="16"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.5"
        />
        {/* Branch paths to buildings */}
        <path d="M170 400 C130 390, 80 385, 60 380" fill="none" stroke="#C9A96E" strokeWidth="18" strokeLinecap="round" />
        <path d="M210 400 C250 390, 290 385, 310 375" fill="none" stroke="#C9A96E" strokeWidth="18" strokeLinecap="round" />
        <path d="M150 450 C110 460, 60 470, 40 480" fill="none" stroke="#C9A96E" strokeWidth="16" strokeLinecap="round" />
        <path d="M240 500 C270 505, 310 500, 330 490" fill="none" stroke="#C9A96E" strokeWidth="16" strokeLinecap="round" />
      </svg>

      {/* ── Pond ─────────────────────────────────────────── */}
      <div
        className="absolute"
        style={{
          left: '6%',
          top: '70%',
          width: 80,
          height: 50,
        }}
      >
        <div className="w-full h-full rounded-[50%] relative overflow-hidden"
          style={{
            background: 'radial-gradient(ellipse at 40% 30%, #7EC8E3 0%, #5BA8D4 40%, #4A95C4 70%, #3D85B5 100%)',
            boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.15), 0 1px 3px rgba(0,0,0,0.1)',
          }}
        >
          {/* Water shimmer */}
          <div className="absolute inset-0 rounded-[50%]"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, transparent 40%, rgba(255,255,255,0.15) 70%, transparent 100%)',
              animation: 'water-shimmer 4s ease-in-out infinite',
            }}
          />
          {/* Lily pad */}
          <div className="absolute rounded-full"
            style={{
              width: 10, height: 8, background: '#5DA03A',
              left: '55%', top: '40%',
              boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
            }}
          />
          <div className="absolute rounded-full"
            style={{
              width: 8, height: 6, background: '#6AAF45',
              left: '30%', top: '55%',
            }}
          />
        </div>
      </div>

      {/* ── Trees ────────────────────────────────────────── */}
      <Tree x={3} y={52} size={1.2} shade="dark" />
      <Tree x={88} y={55} size={1.0} shade="medium" />
      <Tree x={75} y={44} size={0.8} shade="light" />
      <Tree x={18} y={90} size={1.1} shade="dark" />
      <Tree x={90} y={82} size={0.9} shade="medium" />
      <Tree x={50} y={42} size={0.6} shade="light" />

      {/* ── Flowers ──────────────────────────────────────── */}
      <Flower x={28} y={60} color="#FF7EB3" />
      <Flower x={32} y={62} color="#FFD93D" />
      <Flower x={70} y={68} color="#B088F9" />
      <Flower x={73} y={70} color="#FF7EB3" />
      <Flower x={12} y={65} color="#FFD93D" />
      <Flower x={85} y={72} color="#FF7EB3" />
      <Flower x={45} y={88} color="#B088F9" />
      <Flower x={55} y={86} color="#FFD93D" />
      <Flower x={20} y={78} color="#FF7EB3" />
      <Flower x={60} y={58} color="#FFD93D" />

      {/* ── Fence ────────────────────────────────────────── */}
      <div className="absolute" style={{ left: '30%', top: '47%', width: 120, height: 14 }}>
        {[0, 20, 40, 60, 80, 100].map(offset => (
          <div key={offset} className="absolute" style={{
            left: offset, width: 4, height: 14,
            background: 'linear-gradient(180deg, #B8903E, #8B6914)',
            borderRadius: 1,
          }} />
        ))}
        <div className="absolute" style={{ left: 0, top: 3, width: 104, height: 3, background: '#A07A1E', borderRadius: 1 }} />
        <div className="absolute" style={{ left: 0, top: 9, width: 104, height: 2, background: '#96701A', borderRadius: 1 }} />
      </div>

      {/* ── Building overlays ────────────────────────────── */}
      {unlockedBuildings.map((building) => (
        <BuildingSprite key={building.id} building={building} />
      ))}

      {/* ── Foreground grass blades (depth layer) ────────── */}
      <div className="absolute inset-x-0 bottom-0 h-20 pointer-events-none" style={{ zIndex: 900 }}>
        <svg viewBox="0 0 390 80" className="w-full h-full" preserveAspectRatio="none">
          {Array.from({ length: 30 }).map((_, i) => {
            const x = (i / 30) * 390 + Math.sin(i * 7) * 10;
            const h = 15 + Math.sin(i * 3) * 10;
            return (
              <line key={i} x1={x} y1={80} x2={x + 3} y2={80 - h}
                stroke="#4A8F30" strokeWidth="3" strokeLinecap="round" opacity={0.6}
              />
            );
          })}
        </svg>
      </div>
    </div>
  );
});

// ── Sub-components ─────────────────────────────────────────────────

const Cloud = memo(function Cloud({ x, y, width, opacity, speed }: {
  x: number; y: number; width: number; opacity: number; speed: number;
}) {
  return (
    <div
      className="absolute"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        width,
        height: width * 0.35,
        borderRadius: '50%',
        background: `radial-gradient(ellipse, rgba(255,255,255,${opacity}) 0%, rgba(255,255,255,${opacity * 0.3}) 70%, transparent 100%)`,
        animation: `cloud-drift ${speed}s linear infinite`,
      }}
    />
  );
});

const Tree = memo(function Tree({ x, y, size, shade }: {
  x: number; y: number; size: number; shade: 'dark' | 'medium' | 'light';
}) {
  const colors = {
    dark: { crown: '#3D7A2A', highlight: '#4A8C35', trunk: '#6B4226' },
    medium: { crown: '#4A8C35', highlight: '#5DA03A', trunk: '#7A5230' },
    light: { crown: '#5DA03A', highlight: '#6AAF45', trunk: '#8B6234' },
  }[shade];

  const s = 32 * size;
  return (
    <div className="absolute" style={{
      left: `${x}%`, top: `${y}%`,
      width: s, height: s * 1.4,
      zIndex: Math.floor((y / 100) * 600) + 10,
    }}>
      {/* Trunk */}
      <div className="absolute" style={{
        left: '40%', bottom: 0, width: '20%', height: '35%',
        background: colors.trunk, borderRadius: 2,
      }} />
      {/* Crown */}
      <div className="absolute rounded-full" style={{
        left: '5%', top: 0, width: '90%', height: '70%',
        background: `radial-gradient(ellipse at 40% 40%, ${colors.highlight}, ${colors.crown})`,
        boxShadow: `inset -4px -4px 8px rgba(0,0,0,0.15)`,
      }} />
      {/* Highlight spot */}
      <div className="absolute rounded-full" style={{
        left: '20%', top: '10%', width: '30%', height: '25%',
        background: colors.highlight, opacity: 0.5,
      }} />
    </div>
  );
});

const GrassPatch = memo(function GrassPatch({ x, y, size, color }: {
  x: number; y: number; size: number; color: string;
}) {
  return (
    <div
      className="absolute rounded-[40%]"
      style={{
        left: `${x}%`, top: `${y}%`,
        width: size, height: size * 0.5,
        background: `radial-gradient(ellipse, ${color} 0%, transparent 70%)`,
        opacity: 0.5,
      }}
    />
  );
});

const Flower = memo(function Flower({ x, y, color }: {
  x: number; y: number; color: string;
}) {
  return (
    <div
      className="absolute"
      style={{
        left: `${x}%`, top: `${y}%`,
        width: 6, height: 6,
        zIndex: Math.floor((y / 100) * 600),
      }}
    >
      <div className="w-full h-full rounded-full" style={{
        background: `radial-gradient(circle, ${color} 30%, transparent 100%)`,
        boxShadow: `0 0 4px ${color}40`,
      }} />
    </div>
  );
});

const BuildingSprite = memo(function BuildingSprite({ building }: { building: BuildingConfig }) {
  return (
    <img
      src={building.imagePath}
      alt={building.name}
      className="absolute pixel-render building-enter"
      style={{
        left: `${building.x}%`,
        top: `${building.y}%`,
        width: building.width * 1.3,
        height: building.height * 1.3,
        transform: 'translate(-50%, -50%)',
        imageRendering: 'pixelated',
        zIndex: Math.floor((building.y / 100) * 600) + 5,
        filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.2))',
      }}
      draggable={false}
    />
  );
});
