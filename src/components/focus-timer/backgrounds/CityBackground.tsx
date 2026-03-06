import { memo, useMemo } from 'react';

// ============================================================================
// CITY BACKGROUND — "Neon Noir"
// Animated billboards, helicopter + searchlight, rain with neon reflections,
// manhole steam, antenna blink lights, airplane, more car variety,
// building top details
// ============================================================================
export const CityBackground = memo(() => {
  // Pre-generate stable random values for windows
  const windowData = useMemo(() => {
    const seed = 42;
    const pseudoRandom = (n: number) => {
      const x = Math.sin(seed + n) * 10000;
      return x - Math.floor(x);
    };
    return Array.from({ length: 200 }, (_, i) => ({
      lit: pseudoRandom(i) > 0.35,
      warm: pseudoRandom(i + 100) > 0.3,
      bright: pseudoRandom(i + 200) > 0.5,
    }));
  }, []);

  // Rain streaks
  const rainDrops = useMemo(() =>
    Array.from({ length: 25 }, (_, i) => ({
      left: `${(i * 8.3) % 100}%`,
      height: `${15 + (i % 4) * 3}px`,
      duration: `${1.5 + (i % 5) * 0.3}s`,
      delay: `${(i * 0.2) % 2.5}s`,
      opacity: 0.2 + (i % 4) * 0.05,
    })), []
  );

  // Steam plumes
  const steamPlumes = useMemo(() =>
    Array.from({ length: 4 }, (_, i) => ({
      left: `${15 + i * 22}%`,
      delay: `${i * 1.2}s`,
    })), []
  );

  // Antenna blink lights
  const antennaLights = useMemo(() => [
    { top: '24%', left: '36%', color: 'hsl(0 80% 50%)', delay: '0s' },
    { top: '18%', left: '41%', color: 'white', delay: '-0.8s' },
    { top: '20%', left: '53%', color: 'hsl(0 80% 50%)', delay: '-1.5s' },
    { top: '15%', left: '66%', color: 'hsl(0 80% 50%)', delay: '-0.3s' },
    { top: '22%', left: '80%', color: 'white', delay: '-1.2s' },
    { top: '19%', left: '87%', color: 'hsl(0 80% 50%)', delay: '-2s' },
  ], []);

  // Window generator helper
  const generateWindows = (
    bx: number, by: number, bw: number, bh: number, startIdx: number
  ) => {
    const ww = 4, wh = 6, px = 6, py = 8, gx = 8, gy = 12;
    const cols = Math.floor((bw - px * 2) / (ww + gx));
    const rows = Math.floor((bh - py * 2) / (wh + gy));
    const windows = [];
    let idx = startIdx;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const d = windowData[idx % windowData.length];
        if (d.lit) {
          const wx = bx + px + c * (ww + gx);
          const wy = by + py + r * (wh + gy);
          const color = d.warm ? 'hsl(45 80% 70%)' : 'hsl(200 70% 65%)';
          const opacity = d.bright ? 0.9 : 0.5;
          windows.push(
            <rect
              key={`w-${idx}`}
              x={wx} y={wy} width={ww} height={wh}
              fill={color} opacity={opacity}
              className="animate-window-flicker"
              style={{ animationDelay: `${(idx % 10) * 0.8}s` }}
            />
          );
        }
        idx++;
      }
    }
    return windows;
  };

  return (
    <div className="fixed inset-0 overflow-hidden focus-bg-transition">
      {/* Night city sky gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            linear-gradient(180deg,
              hsl(250 55% 8%) 0%,
              hsl(255 50% 12%) 25%,
              hsl(265 45% 16%) 50%,
              hsl(275 40% 20%) 75%,
              hsl(285 35% 25%) 100%
            )
          `
        }}
      />

      {/* City glow at horizon */}
      <div
        className="absolute bottom-0 left-0 right-0 h-72 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 100% 70% at 50% 100%, hsl(280 50% 35% / 0.5) 0%, hsl(270 40% 25% / 0.3) 40%, transparent 70%)'
        }}
      />

      {/* Distant stars (fewer due to light pollution) */}
      {Array.from({ length: 12 }, (_, i) => (
        <div
          key={`star-${i}`}
          className="absolute rounded-full bg-white/50 animate-twinkle pointer-events-none"
          style={{
            top: `${3 + (i * 7) % 20}%`,
            left: `${5 + (i * 13) % 90}%`,
            width: `${1 + (i % 2)}px`,
            height: `${1 + (i % 2)}px`,
            animationDelay: `${i * 0.4}s`,
            animationDuration: `${3 + (i % 3)}s`,
          }}
        />
      ))}

      {/* Moon */}
      <div
        className="absolute top-[6%] left-[12%] w-14 h-14 rounded-full opacity-60 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 35% 35%, hsl(45 20% 95%) 0%, hsl(45 15% 85%) 60%, hsl(260 20% 65%) 100%)',
          boxShadow: '0 0 40px hsl(45 25% 85% / 0.25)'
        }}
      />

      {/* Helicopter with searchlight */}
      <div className="absolute top-[8%] left-[-30px] animate-heli-traverse pointer-events-none">
        {/* Helicopter silhouette */}
        <svg width="14" height="10" viewBox="0 0 14 10">
          <ellipse cx="6" cy="5" rx="5" ry="3" fill="hsl(260 30% 20%)" />
          <rect x="9" y="4" width="5" height="1.5" fill="hsl(260 30% 20%)" />
          <path d="M13,4 L14,2 L14,4" fill="hsl(260 30% 20%)" />
          <line x1="2" y1="2" x2="10" y2="2" stroke="hsl(260 30% 25%)" strokeWidth="0.5" />
          <circle cx="4" cy="5" r="0.5" fill="hsl(0 80% 50%)" className="animate-beacon-blink" />
        </svg>
        {/* Searchlight beam */}
        <div
          className="absolute top-[10px] left-[4px] w-[6px] h-[60px] opacity-[0.04] animate-searchlight-sweep"
          style={{
            background: 'linear-gradient(180deg, hsl(45 60% 90% / 0.3) 0%, transparent 100%)',
            clipPath: 'polygon(30% 0%, 70% 0%, 100% 100%, 0% 100%)',
            transformOrigin: 'top center',
          }}
        />
      </div>

      {/* Airplane crossing sky */}
      <div className="absolute top-[3%] left-[-40px] animate-airplane-cross pointer-events-none">
        <div className="w-[2px] h-[2px] rounded-full bg-white" style={{ boxShadow: '0 0 4px 1px white' }} />
        <div className="absolute top-0 left-[4px] w-[2px] h-[2px] rounded-full animate-beacon-blink"
          style={{ backgroundColor: 'hsl(0 80% 50%)', animationDelay: '-0.5s' }} />
      </div>

      {/* Rain streaks */}
      {rainDrops.map((drop, i) => (
        <div
          key={i}
          className="absolute w-[1px] animate-rain-fall pointer-events-none"
          style={{
            left: drop.left,
            height: drop.height,
            background: `linear-gradient(180deg, transparent, hsl(280 30% 70% / ${drop.opacity}))`,
            ['--rain-duration' as string]: drop.duration,
            ['--rain-opacity' as string]: drop.opacity,
            animationDelay: drop.delay,
          }}
        />
      ))}

      {/* City skyline with integrated windows */}
      <div className="absolute bottom-0 w-full h-72">
        <svg viewBox="0 0 1200 290" className="w-full h-full" preserveAspectRatio="xMidYMax slice">
          <defs>
            <linearGradient id="cityBuildingBack" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="hsl(260 35% 14%)" />
              <stop offset="100%" stopColor="hsl(260 40% 10%)" />
            </linearGradient>
            <linearGradient id="cityBuildingFront" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="hsl(270 30% 20%)" />
              <stop offset="100%" stopColor="hsl(270 35% 14%)" />
            </linearGradient>
          </defs>

          {/* Back layer buildings */}
          <rect x="20" y="140" width="50" height="150" fill="url(#cityBuildingBack)" />
          {generateWindows(20, 140, 50, 150, 0)}

          <rect x="90" y="100" width="45" height="190" fill="url(#cityBuildingBack)" />
          {generateWindows(90, 100, 45, 190, 15)}
          {/* Antenna */}
          <line x1="112" y1="100" x2="112" y2="80" stroke="hsl(260 30% 20%)" strokeWidth="1" />

          <rect x="160" y="120" width="55" height="170" fill="url(#cityBuildingBack)" />
          {generateWindows(160, 120, 55, 170, 35)}

          <rect x="240" y="80" width="50" height="210" fill="url(#cityBuildingBack)" />
          {generateWindows(240, 80, 50, 210, 55)}
          {/* Antenna + spire */}
          <line x1="265" y1="80" x2="265" y2="55" stroke="hsl(260 30% 22%)" strokeWidth="1.5" />
          <circle cx="265" cy="55" r="1" fill="hsl(0 80% 50%)" className="animate-antenna-blink" />

          <rect x="320" y="130" width="60" height="160" fill="url(#cityBuildingBack)" />
          {generateWindows(320, 130, 60, 160, 80)}

          <rect x="410" y="60" width="55" height="230" fill="url(#cityBuildingBack)" />
          {generateWindows(410, 60, 55, 230, 100)}
          {/* Water tower */}
          <rect x="425" y="48" width="16" height="12" rx="2" fill="hsl(260 30% 16%)" />
          <line x1="428" y1="60" x2="428" y2="65" stroke="hsl(260 30% 18%)" strokeWidth="1" />
          <line x1="438" y1="60" x2="438" y2="65" stroke="hsl(260 30% 18%)" strokeWidth="1" />

          <rect x="500" y="110" width="50" height="180" fill="url(#cityBuildingBack)" />
          {generateWindows(500, 110, 50, 180, 125)}

          <rect x="580" y="70" width="60" height="220" fill="url(#cityBuildingBack)" />
          {generateWindows(580, 70, 60, 220, 145)}
          {/* Antenna */}
          <line x1="610" y1="70" x2="610" y2="48" stroke="hsl(260 30% 20%)" strokeWidth="1" />

          <rect x="670" y="125" width="45" height="165" fill="url(#cityBuildingBack)" />
          {generateWindows(670, 125, 45, 165, 170)}

          <rect x="745" y="90" width="55" height="200" fill="url(#cityBuildingBack)" />
          {generateWindows(745, 90, 55, 200, 190)}
          {/* AC units on roof */}
          <rect x="750" y="85" width="8" height="5" fill="hsl(260 28% 15%)" />
          <rect x="762" y="85" width="8" height="5" fill="hsl(260 28% 15%)" />

          <rect x="830" y="135" width="50" height="155" fill="url(#cityBuildingBack)" />
          {generateWindows(830, 135, 50, 155, 215)}

          <rect x="910" y="100" width="55" height="190" fill="url(#cityBuildingBack)" />
          {generateWindows(910, 100, 55, 190, 235)}
          {/* Spire */}
          <line x1="937" y1="100" x2="937" y2="65" stroke="hsl(260 30% 18%)" strokeWidth="1.5" />

          <rect x="995" y="75" width="45" height="215" fill="url(#cityBuildingBack)" />
          {generateWindows(995, 75, 45, 215, 260)}

          <rect x="1070" y="115" width="55" height="175" fill="url(#cityBuildingBack)" />
          {generateWindows(1070, 115, 55, 175, 285)}

          <rect x="1150" y="130" width="50" height="160" fill="url(#cityBuildingBack)" />
          {generateWindows(1150, 130, 50, 160, 305)}

          {/* Front layer buildings */}
          <rect x="55" y="170" width="60" height="120" fill="url(#cityBuildingFront)" />
          {generateWindows(55, 170, 60, 120, 330)}

          <rect x="140" y="155" width="50" height="135" fill="url(#cityBuildingFront)" />
          {generateWindows(140, 155, 50, 135, 350)}

          <rect x="280" y="165" width="55" height="125" fill="url(#cityBuildingFront)" />
          {generateWindows(280, 165, 55, 125, 370)}

          <rect x="370" y="150" width="65" height="140" fill="url(#cityBuildingFront)" />
          {generateWindows(370, 150, 65, 140, 390)}
          {/* Billboard on front building */}
          <rect x="380" y="155" width="12" height="8" className="animate-billboard-cycle" opacity="0.7" />

          <rect x="540" y="160" width="55" height="130" fill="url(#cityBuildingFront)" />
          {generateWindows(540, 160, 55, 130, 415)}

          <rect x="630" y="145" width="60" height="145" fill="url(#cityBuildingFront)" />
          {generateWindows(630, 145, 60, 145, 435)}
          {/* Billboard */}
          <rect x="642" y="150" width="10" height="6" className="animate-billboard-cycle" opacity="0.6" style={{ animationDelay: '-1.5s' }} />

          <rect x="790" y="165" width="50" height="125" fill="url(#cityBuildingFront)" />
          {generateWindows(790, 165, 50, 125, 460)}

          <rect x="870" y="155" width="55" height="135" fill="url(#cityBuildingFront)" />
          {generateWindows(870, 155, 55, 135, 480)}

          <rect x="1030" y="170" width="60" height="120" fill="url(#cityBuildingFront)" />
          {generateWindows(1030, 170, 60, 120, 505)}
          {/* Billboard with scrolling bar */}
          <rect x="1042" y="175" width="14" height="8" className="animate-billboard-cycle" opacity="0.65" style={{ animationDelay: '-3s' }} />

          <rect x="1120" y="160" width="50" height="130" fill="url(#cityBuildingFront)" />
          {generateWindows(1120, 160, 50, 130, 525)}

          {/* Neon signs on buildings */}
          <rect x="385" y="158" width="30" height="4" rx="2" fill="hsl(320 85% 60%)" opacity="0.8" className="animate-neon-pulse" />
          <rect x="650" y="152" width="25" height="3" rx="1.5" fill="hsl(180 85% 55%)" opacity="0.7" className="animate-neon-pulse" style={{ animationDelay: '-1.5s' }} />
          <rect x="895" y="162" width="28" height="4" rx="2" fill="hsl(280 80% 60%)" opacity="0.75" className="animate-neon-pulse" style={{ animationDelay: '-3s' }} />

          {/* Street level */}
          <rect x="0" y="285" width="1200" height="5" fill="hsl(260 30% 8%)" />
        </svg>
      </div>

      {/* Antenna blink lights overlaid on top of buildings */}
      {antennaLights.map((light, i) => (
        <div
          key={i}
          className="absolute w-[2px] h-[2px] rounded-full animate-antenna-blink pointer-events-none"
          style={{
            top: light.top,
            left: light.left,
            backgroundColor: light.color,
            boxShadow: `0 0 4px 1px ${light.color}`,
            animationDelay: light.delay,
          }}
        />
      ))}

      {/* Moving car lights on street level — more variety */}
      <div className="absolute bottom-[2%] left-0 w-full overflow-hidden h-3 pointer-events-none">
        {/* White headlights going left */}
        <div className="animate-car-left absolute">
          <div className="w-3 h-1.5 rounded-full bg-white" style={{ boxShadow: '0 0 8px 2px hsl(45 80% 75%)' }} />
        </div>
        {/* Red taillights going right */}
        <div className="animate-car-right absolute" style={{ animationDelay: '-4s' }}>
          <div className="w-3 h-1.5 rounded-full bg-red-400" style={{ boxShadow: '0 0 8px 2px hsl(0 70% 50%)' }} />
        </div>
        {/* White headlights going left — second car */}
        <div className="animate-car-left absolute" style={{ animationDelay: '-8s' }}>
          <div className="w-3 h-1.5 rounded-full bg-white" style={{ boxShadow: '0 0 8px 2px hsl(45 80% 75%)' }} />
        </div>
        {/* Yellow cab going right */}
        <div className="animate-car-right absolute" style={{ animationDelay: '-12s' }}>
          <div className="w-3 h-1.5 rounded-full" style={{ backgroundColor: 'hsl(50 90% 60%)', boxShadow: '0 0 6px 2px hsl(50 80% 55%)' }} />
        </div>
        {/* Blue-tinted headlights going left */}
        <div className="animate-car-left absolute" style={{ animationDelay: '-5s' }}>
          <div className="w-2.5 h-1.5 rounded-full" style={{ backgroundColor: 'hsl(210 60% 80%)', boxShadow: '0 0 6px 2px hsl(210 60% 70%)' }} />
        </div>
      </div>

      {/* Wet ground neon reflection */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[3%] opacity-[0.12] pointer-events-none"
        style={{
          background: 'linear-gradient(90deg, hsl(320 60% 50% / 0.3) 20%, hsl(180 60% 50% / 0.25) 50%, hsl(280 60% 50% / 0.3) 80%)',
          filter: 'blur(4px)',
        }}
      />

      {/* Manhole steam */}
      {steamPlumes.map((steam, i) => (
        <div
          key={i}
          className="absolute bottom-[3%] animate-steam-rise pointer-events-none"
          style={{
            left: steam.left,
            width: '10px',
            height: '15px',
            background: 'radial-gradient(ellipse, hsl(0 0% 80% / 0.2) 0%, transparent 70%)',
            animationDelay: steam.delay,
          }}
        />
      ))}

      {/* Urban vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 70% 60% at 50% 50%, transparent 30%, hsl(255 55% 6% / 0.5) 100%)'
        }}
      />
    </div>
  );
});
CityBackground.displayName = 'CityBackground';
