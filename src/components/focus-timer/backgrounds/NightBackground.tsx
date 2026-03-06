import { memo, useMemo } from 'react';

// ============================================================================
// NIGHT BACKGROUND — "Celestial Wonder"
// Constellation patterns, nebula clouds, moonlight path, multiple shooting
// stars, owl silhouette, cricket bioluminescence, enhanced moon
// ============================================================================

// Real constellation coordinate data (normalized 0-1 within their bounding box)
const CONSTELLATIONS = [
  { // Orion
    name: 'orion',
    x: 15, y: 5, w: 18, h: 28,
    stars: [[9,0],[0,8],[4,10],[9,12],[14,10],[18,8],[9,16],[7,22],[11,22],[5,28],[13,28]],
    lines: [[0,1],[0,5],[1,2],[2,3],[3,4],[4,5],[3,6],[6,7],[6,8],[7,9],[8,10]],
  },
  { // Ursa Major (Big Dipper part)
    name: 'ursa',
    x: 55, y: 3, w: 22, h: 15,
    stars: [[0,15],[5,12],[10,10],[16,9],[18,5],[22,3],[22,0]],
    lines: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,3]],
  },
  { // Cassiopeia (W shape)
    name: 'cassiopeia',
    x: 35, y: 2, w: 14, h: 8,
    stars: [[0,4],[3,0],[7,6],[11,2],[14,8]],
    lines: [[0,1],[1,2],[2,3],[3,4]],
  },
  { // Lyra (small harp)
    name: 'lyra',
    x: 78, y: 8, w: 8, h: 10,
    stars: [[4,0],[0,4],[8,4],[2,8],[6,8]],
    lines: [[0,1],[0,2],[1,3],[2,4],[3,4]],
  },
  { // Scorpius (partial - hook shape)
    name: 'scorpius',
    x: 88, y: 15, w: 10, h: 20,
    stars: [[5,0],[3,4],[2,8],[3,12],[5,16],[7,18],[10,20]],
    lines: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6]],
  },
];

export const NightBackground = memo(() => {
  // Field stars (between constellations)
  const fieldStars = useMemo(() =>
    Array.from({ length: 15 }, (_, i) => ({
      top: `${2 + (i * 11) % 40}%`,
      left: `${3 + (i * 17) % 94}%`,
      size: 1 + (i % 2) * 0.5,
      delay: `${(i * 0.7) % 4}s`,
      duration: `${2.5 + (i % 3)}s`,
      brightness: 0.4 + (i % 4) * 0.15,
    })), []
  );

  // Fireflies near ground (cyan-green, cooler than forest)
  const fireflies = useMemo(() =>
    Array.from({ length: 8 }, (_, i) => ({
      top: `${62 + (i * 7) % 18}%`,
      left: `${5 + (i * 23) % 90}%`,
      delay: `${(i * 0.9) % 5}s`,
      duration: `${3 + (i % 3)}s`,
    })), []
  );

  // Crickets at hill base
  const crickets = useMemo(() =>
    Array.from({ length: 4 }, (_, i) => ({
      bottom: `${18 + (i * 3)}%`,
      left: `${15 + i * 22}%`,
      delay: `${i * 1.5}s`,
    })), []
  );

  return (
    <div className="fixed inset-0 overflow-hidden focus-bg-transition">
      {/* Deep night gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            linear-gradient(180deg,
              hsl(230 55% 8%) 0%,
              hsl(235 50% 12%) 25%,
              hsl(245 45% 16%) 50%,
              hsl(255 40% 20%) 75%,
              hsl(260 35% 24%) 100%
            )
          `
        }}
      />

      {/* Nebula clouds — faint colored patches */}
      <div
        className="absolute top-[10%] left-[20%] w-48 h-36 rounded-full opacity-[0.06] animate-nebula-drift pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse, hsl(280 60% 50%) 0%, transparent 70%)',
          filter: 'blur(30px)',
        }}
      />
      <div
        className="absolute top-[5%] right-[15%] w-40 h-32 rounded-full opacity-[0.05] animate-nebula-drift pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse, hsl(200 50% 60%) 0%, transparent 70%)',
          filter: 'blur(30px)',
          animationDelay: '-12s',
        }}
      />
      <div
        className="absolute top-[22%] left-[55%] w-36 h-28 rounded-full opacity-[0.04] animate-nebula-drift pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse, hsl(330 40% 55%) 0%, transparent 70%)',
          filter: 'blur(25px)',
          animationDelay: '-25s',
        }}
      />

      {/* Aurora hint at horizon */}
      <div
        className="absolute bottom-[20%] left-0 right-0 h-48 opacity-20 animate-aurora pointer-events-none"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, hsl(160 60% 50% / 0.3) 25%, hsl(200 70% 55% / 0.4) 50%, hsl(280 50% 55% / 0.3) 75%, transparent 100%)',
          filter: 'blur(40px)'
        }}
      />

      {/* Moon with crater details */}
      <div
        className="absolute top-[6%] right-[12%] w-20 h-20 rounded-full"
        style={{
          background: 'radial-gradient(circle at 35% 35%, hsl(45 25% 98%) 0%, hsl(45 20% 92%) 40%, hsl(45 15% 85%) 70%, hsl(220 20% 70%) 100%)',
          boxShadow: `
            0 0 50px hsl(45 30% 90% / 0.4),
            0 0 100px hsl(45 25% 85% / 0.25),
            inset -8px -5px 15px hsl(220 30% 60% / 0.3),
            inset 6px 3px 8px hsl(220 20% 75% / 0.2),
            inset -3px 6px 4px hsl(220 25% 70% / 0.15)
          `
        }}
      />

      {/* Moon outer glow */}
      <div
        className="absolute top-[4%] right-[10%] w-28 h-28 rounded-full opacity-30 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, hsl(45 30% 90%) 0%, transparent 70%)'
        }}
      />

      {/* Moonlight path — faint cone toward hills */}
      <div
        className="absolute top-[15%] right-[18%] w-32 h-[50%] opacity-[0.06] pointer-events-none"
        style={{
          background: 'linear-gradient(180deg, hsl(45 25% 90% / 0.3) 0%, transparent 100%)',
          clipPath: 'polygon(40% 0%, 60% 0%, 85% 100%, 15% 100%)',
          filter: 'blur(8px)',
        }}
      />

      {/* Constellation patterns */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 50" preserveAspectRatio="xMidYMid slice">
        {CONSTELLATIONS.map((c) => (
          <g key={c.name}>
            {/* Constellation lines */}
            {c.lines.map(([from, to], li) => (
              <line
                key={`${c.name}-l-${li}`}
                x1={c.x + c.stars[from][0] * (c.w / Math.max(...c.stars.map(s => s[0]), 1))}
                y1={c.y + c.stars[from][1] * (c.h / Math.max(...c.stars.map(s => s[1]), 1))}
                x2={c.x + c.stars[to][0] * (c.w / Math.max(...c.stars.map(s => s[0]), 1))}
                y2={c.y + c.stars[to][1] * (c.h / Math.max(...c.stars.map(s => s[1]), 1))}
                stroke="hsl(0 0% 90% / 0.12)"
                strokeWidth="0.15"
              />
            ))}
            {/* Constellation stars (brighter than field) */}
            {c.stars.map((s, si) => (
              <circle
                key={`${c.name}-s-${si}`}
                cx={c.x + s[0] * (c.w / Math.max(...c.stars.map(st => st[0]), 1))}
                cy={c.y + s[1] * (c.h / Math.max(...c.stars.map(st => st[1]), 1))}
                r={si === 0 ? 0.4 : 0.25}
                fill="hsl(45 15% 95%)"
                className="animate-twinkle"
                style={{ animationDelay: `${si * 0.5}s`, animationDuration: `${3 + (si % 2)}s` }}
              />
            ))}
          </g>
        ))}
      </svg>

      {/* Field stars */}
      {fieldStars.map((star, i) => (
        <div
          key={i}
          className="absolute rounded-full animate-twinkle pointer-events-none"
          style={{
            top: star.top,
            left: star.left,
            width: `${star.size}px`,
            height: `${star.size}px`,
            backgroundColor: `hsl(45 15% 92%)`,
            boxShadow: `0 0 ${star.size * 3}px hsl(45 20% 95% / ${star.brightness})`,
            animationDelay: star.delay,
            animationDuration: star.duration,
          }}
        />
      ))}

      {/* Multiple shooting stars */}
      <div className="absolute top-[12%] left-[55%] animate-shooting-star pointer-events-none">
        <div
          className="w-1.5 h-1.5 bg-white rounded-full"
          style={{
            boxShadow: '0 0 6px 2px hsl(200 80% 90%), -20px 0 15px 1px hsl(200 60% 80% / 0.5), -40px 0 20px 0 hsl(200 40% 70% / 0.3)'
          }}
        />
      </div>
      <div className="absolute top-[8%] left-[30%] animate-shooting-star-2 pointer-events-none" style={{ animationDelay: '8s' }}>
        <div
          className="w-1 h-1 bg-white rounded-full"
          style={{
            boxShadow: '0 0 5px 2px hsl(200 80% 90%), -15px 0 12px 1px hsl(200 60% 80% / 0.4)'
          }}
        />
      </div>
      <div className="absolute top-[18%] left-[72%] animate-shooting-star-3 pointer-events-none" style={{ animationDelay: '15s' }}>
        <div
          className="w-1 h-1 bg-white rounded-full"
          style={{
            boxShadow: '0 0 4px 1px hsl(200 80% 90%), -12px 0 10px 1px hsl(200 60% 80% / 0.3)'
          }}
        />
      </div>

      {/* Fireflies near ground (cyan-green) */}
      {fireflies.map((fly, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 rounded-full animate-firefly pointer-events-none"
          style={{
            top: fly.top,
            left: fly.left,
            backgroundColor: 'hsl(180 70% 65%)',
            boxShadow: '0 0 10px 4px hsl(180 70% 60% / 0.6), 0 0 20px 6px hsl(180 60% 55% / 0.3)',
            animationDelay: fly.delay,
            animationDuration: fly.duration,
          }}
        />
      ))}

      {/* Cricket bioluminescence at hill base */}
      {crickets.map((c, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 rounded-full animate-cricket-pulse pointer-events-none"
          style={{
            bottom: c.bottom,
            left: c.left,
            backgroundColor: 'hsl(65 70% 55%)',
            boxShadow: '0 0 4px 2px hsl(65 70% 55% / 0.5)',
            animationDelay: c.delay,
          }}
        />
      ))}

      {/* Night hills with owl */}
      <div className="absolute bottom-0 w-full h-52">
        <svg viewBox="0 0 1200 200" className="w-full h-full" preserveAspectRatio="none">
          <defs>
            <linearGradient id="nightHillBack" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="hsl(250 35% 18%)" stopOpacity="0.8" />
              <stop offset="100%" stopColor="hsl(250 40% 12%)" stopOpacity="0.95" />
            </linearGradient>
            <linearGradient id="nightHillFront" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="hsl(245 40% 12%)" stopOpacity="0.95" />
              <stop offset="100%" stopColor="hsl(240 45% 8%)" stopOpacity="1" />
            </linearGradient>
          </defs>
          <path d="M0,200 L0,140 Q120,100 260,120 Q420,145 580,110 Q740,75 900,100 Q1040,125 1180,85 L1200,95 L1200,200 Z" fill="url(#nightHillBack)" />
          <path d="M0,200 L0,155 Q100,120 220,140 Q380,165 540,130 Q700,95 860,120 Q1000,145 1140,105 L1200,115 L1200,200 Z" fill="url(#nightHillFront)" />

          {/* Owl silhouette on rightmost hill peak */}
          <g className="animate-owl-head" style={{ transformOrigin: '1160px 92px' }}>
            {/* Body */}
            <ellipse cx="1160" cy="100" rx="6" ry="8" fill="hsl(245 40% 12%)" />
            {/* Head */}
            <circle cx="1160" cy="91" r="5" fill="hsl(245 40% 12%)" />
            {/* Ear tufts */}
            <path d="M1156,87 L1154,83 L1157,87" fill="hsl(245 40% 12%)" />
            <path d="M1164,87 L1166,83 L1163,87" fill="hsl(245 40% 12%)" />
            {/* Eyes */}
            <circle cx="1158" cy="91" r="1.5" fill="hsl(45 60% 65%)" opacity="0.7" />
            <circle cx="1162" cy="91" r="1.5" fill="hsl(45 60% 65%)" opacity="0.7" />
          </g>
        </svg>
      </div>

      {/* Deep vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 70% 60% at 50% 50%, transparent 30%, hsl(230 50% 5% / 0.4) 100%)'
        }}
      />
    </div>
  );
});
NightBackground.displayName = 'NightBackground';
