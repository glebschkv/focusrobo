import { memo, useMemo } from 'react';

// ============================================================================
// SNOW BACKGROUND — "Arctic Aurora" (Hero Theme)
// Full northern lights aurora, ice crystal particles, distant cabin with
// firelight, frozen lake reflection, breath fog, enhanced pine trees
// ============================================================================
export const SnowBackground = memo(() => {
  // Ice crystal snowflakes with sparkle
  const crystals = useMemo(() =>
    Array.from({ length: 30 }, (_, i) => ({
      left: `${(i * 7) % 100}%`,
      size: 3 + (i % 3) * 1.5,
      delay: `${(i * 0.6) % 8}s`,
      duration: `${6 + (i % 4) * 2}s`,
      sway: `${15 + (i % 5) * 5}px`,
      opacity: 0.5 + (i % 4) * 0.12,
      sparkleDuration: `${4 + (i % 6)}s`,
      sparkleDelay: `${(i * 1.1) % 6}s`,
    })), []
  );

  return (
    <div className="fixed inset-0 overflow-hidden focus-bg-transition">
      {/* Winter sky gradient — deeper for aurora contrast */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            linear-gradient(180deg,
              hsl(220 40% 15%) 0%,
              hsl(218 38% 25%) 20%,
              hsl(215 35% 55%) 50%,
              hsl(212 32% 75%) 75%,
              hsl(210 28% 88%) 100%
            )
          `
        }}
      />

      {/* === FULL NORTHERN LIGHTS AURORA === */}
      {/* Aurora band 1 — dominant green */}
      <div
        className="absolute top-[5%] left-[-5%] right-[-5%] h-[35%] animate-aurora-wave pointer-events-none"
        style={{
          background: 'linear-gradient(90deg, transparent 5%, hsl(140 70% 55% / 0.2) 20%, hsl(155 65% 50% / 0.25) 40%, hsl(170 60% 50% / 0.2) 60%, hsl(140 70% 55% / 0.15) 80%, transparent 95%)',
          filter: 'blur(20px)',
          ['--aurora-duration' as string]: '10s',
        }}
      />
      {/* Aurora band 2 — teal to purple */}
      <div
        className="absolute top-[8%] left-[-3%] right-[-3%] h-[30%] animate-aurora-wave pointer-events-none"
        style={{
          background: 'linear-gradient(90deg, transparent 10%, hsl(180 60% 55% / 0.12) 25%, hsl(220 50% 55% / 0.15) 45%, hsl(260 50% 60% / 0.12) 65%, hsl(180 55% 50% / 0.08) 85%, transparent 95%)',
          filter: 'blur(25px)',
          ['--aurora-duration' as string]: '13s',
          animationDelay: '-3s',
        }}
      />
      {/* Aurora band 3 — purple to pink */}
      <div
        className="absolute top-[12%] left-0 right-0 h-[25%] animate-aurora-wave pointer-events-none"
        style={{
          background: 'linear-gradient(90deg, transparent 15%, hsl(280 55% 55% / 0.08) 30%, hsl(300 50% 55% / 0.1) 50%, hsl(320 50% 55% / 0.08) 70%, transparent 90%)',
          filter: 'blur(22px)',
          ['--aurora-duration' as string]: '16s',
          animationDelay: '-7s',
        }}
      />
      {/* Aurora band 4 — bright green accent streaks */}
      <div
        className="absolute top-[10%] left-[15%] right-[15%] h-[20%] animate-aurora-wave pointer-events-none"
        style={{
          background: 'linear-gradient(90deg, transparent 10%, hsl(160 75% 60% / 0.06) 30%, hsl(150 70% 55% / 0.08) 50%, hsl(160 75% 60% / 0.06) 70%, transparent 90%)',
          filter: 'blur(18px)',
          ['--aurora-duration' as string]: '8s',
          animationDelay: '-5s',
        }}
      />

      {/* Soft winter sun glow (dimmer for aurora theme) */}
      <div
        className="absolute top-[8%] right-[18%] w-20 h-20 rounded-full opacity-30 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, hsl(45 35% 95%) 0%, hsl(45 25% 90%) 40%, transparent 70%)',
          boxShadow: '0 0 40px hsl(45 30% 92% / 0.3)'
        }}
      />

      {/* Soft clouds */}
      <div className="absolute top-[5%] left-[3%] w-36 h-14 rounded-full bg-white/30 blur-lg pointer-events-none" />
      <div className="absolute top-[10%] left-[28%] w-28 h-10 rounded-full bg-white/25 blur-lg pointer-events-none" />
      <div className="absolute top-[3%] right-[25%] w-40 h-12 rounded-full bg-white/28 blur-lg pointer-events-none" />

      {/* Ice crystal snowflakes */}
      {crystals.map((c, i) => (
        <div
          key={i}
          className="absolute animate-snowfall animate-crystal-sparkle pointer-events-none"
          style={{
            left: c.left,
            width: `${c.size}px`,
            height: `${c.size}px`,
            opacity: c.opacity,
            animationDelay: c.delay,
            animationDuration: c.duration,
            ['--sway' as string]: c.sway,
            ['--sparkle-duration' as string]: c.sparkleDuration,
          }}
        >
          {/* Six-pointed star shape */}
          <div
            className="w-full h-full bg-white"
            style={{
              clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
              boxShadow: `0 0 ${c.size}px hsl(0 0% 100% / 0.5)`,
            }}
          />
        </div>
      ))}

      {/* Mountain layers with snow */}
      <div className="absolute bottom-0 w-full h-64">
        <svg viewBox="0 0 1200 260" className="w-full h-full" preserveAspectRatio="none">
          <defs>
            <linearGradient id="snowMtnBack" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="hsl(215 22% 88%)" />
              <stop offset="40%" stopColor="hsl(215 25% 80%)" />
              <stop offset="100%" stopColor="hsl(215 28% 72%)" />
            </linearGradient>
            <linearGradient id="snowMtnFront" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="hsl(212 20% 94%)" />
              <stop offset="30%" stopColor="hsl(212 24% 85%)" />
              <stop offset="100%" stopColor="hsl(212 28% 75%)" />
            </linearGradient>
            <linearGradient id="snowCap" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="hsl(0 0% 100%)" />
              <stop offset="100%" stopColor="hsl(210 15% 96%)" />
            </linearGradient>
            <linearGradient id="snowGround" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="hsl(210 18% 97%)" />
              <stop offset="100%" stopColor="hsl(210 22% 92%)" />
            </linearGradient>
            <linearGradient id="snowTreeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="hsl(155 28% 38%)" />
              <stop offset="100%" stopColor="hsl(155 32% 28%)" />
            </linearGradient>
            <linearGradient id="snowTreeFar" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="hsl(210 20% 70%)" />
              <stop offset="100%" stopColor="hsl(210 22% 62%)" />
            </linearGradient>
            <linearGradient id="frozenLake" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="hsl(200 25% 90%)" />
              <stop offset="100%" stopColor="hsl(200 20% 85%)" />
            </linearGradient>
          </defs>

          {/* Back mountains */}
          <path d="M0,260 L0,180 L80,120 L160,160 L280,70 L400,130 L520,50 L640,110 L760,60 L880,120 L1000,80 L1100,140 L1200,100 L1200,260 Z" fill="url(#snowMtnBack)" />
          <path d="M280,70 L250,95 L310,95 Z" fill="url(#snowCap)" />
          <path d="M520,50 L485,80 L555,80 Z" fill="url(#snowCap)" />
          <path d="M760,60 L725,90 L795,90 Z" fill="url(#snowCap)" />

          {/* Front mountains */}
          <path d="M0,260 L0,200 L100,140 L200,175 L340,95 L480,150 L600,85 L720,140 L840,100 L960,155 L1080,110 L1200,160 L1200,260 Z" fill="url(#snowMtnFront)" />
          <path d="M340,95 L305,125 L375,125 Z" fill="url(#snowCap)" />
          <path d="M600,85 L560,120 L640,120 Z" fill="url(#snowCap)" />
          <path d="M840,100 L805,130 L875,130 Z" fill="url(#snowCap)" />

          {/* Frozen lake section */}
          <path d="M300,260 L300,225 Q450,215 600,220 Q750,225 900,218 L900,260 Z" fill="url(#frozenLake)" opacity="0.6" />
          {/* Faint aurora reflection on lake */}
          <path d="M350,260 L350,235 Q500,230 650,233 Q800,237 850,232 L850,260 Z" fill="hsl(160 50% 60%)" opacity="0.04" />

          {/* Snowy ground */}
          <path d="M0,260 L0,210 Q150,190 300,205 Q450,220 600,200 Q750,180 900,198 Q1050,215 1200,195 L1200,260 Z" fill="url(#snowGround)" />

          {/* Back trees (smaller, bluer = atmospheric perspective) */}
          <g opacity="0.7">
            <path d="M50,260 L50,238 L38,238 L56,210 L44,210 L56,188 L68,210 L56,210 L74,238 L62,238 L62,260 Z" fill="url(#snowTreeFar)" />
            <path d="M210,260 L210,235 L195,235 L218,202 L203,202 L218,175 L233,202 L218,202 L241,235 L226,235 L226,260 Z" fill="url(#snowTreeFar)" />
            <path d="M1050,260 L1050,235 L1038,235 L1056,205 L1044,205 L1056,180 L1068,205 L1056,205 L1074,235 L1062,235 L1062,260 Z" fill="url(#snowTreeFar)" />
          </g>

          {/* Front snow-covered trees (8 total) — with snow weight sag */}
          <g>
            <path d="M100,260 L100,235 L82,235 L108,195 L90,195 L108,165 L126,195 L108,195 L134,235 L116,235 L116,260 Z" fill="url(#snowTreeGrad)" />
            <path d="M108,165 L102,175 L114,175 Z" fill="white" />
            <path d="M90,195 L100,205 L108,195 L116,205 L126,195 L108,195 Z" fill="hsl(210 20% 95%)" />
          </g>
          <g>
            <path d="M350,260 L350,230 L330,230 L358,185 L338,185 L358,150 L378,185 L358,185 L386,230 L366,230 L366,260 Z" fill="url(#snowTreeGrad)" />
            <path d="M358,150 L351,162 L365,162 Z" fill="white" />
            <path d="M338,185 L350,197 L358,185 L366,197 L378,185 L358,185 Z" fill="hsl(210 20% 95%)" />
          </g>

          {/* Cabin between trees */}
          <g>
            {/* Cabin body */}
            <rect x="460" y="222" width="22" height="16" fill="hsl(20 30% 25%)" />
            {/* Roof */}
            <path d="M456,222 L471,210 L486,222 Z" fill="hsl(20 25% 20%)" />
            {/* Window with warm glow */}
            <rect x="466" y="228" width="5" height="5" fill="hsl(40 80% 65%)" className="animate-firelight-flicker" />
            {/* Window glow */}
            <rect x="464" y="226" width="9" height="9" rx="1" fill="hsl(40 80% 60%)" opacity="0.15" className="animate-firelight-flicker" style={{ animationDelay: '-0.5s' }} />
            {/* Chimney */}
            <rect x="476" y="213" width="4" height="9" fill="hsl(20 25% 22%)" />
            {/* Snow on roof */}
            <path d="M455,223 L471,211 L487,223 L485,222 L471,212 L457,222 Z" fill="hsl(0 0% 95%)" />
          </g>

          <g>
            <path d="M530,260 L530,228 L510,228 L538,182 L518,182 L538,148 L558,182 L538,182 L566,228 L546,228 L546,260 Z" fill="url(#snowTreeGrad)" />
            <path d="M538,148 L530,160 L546,160 Z" fill="white" />
            <path d="M518,182 L530,194 L538,182 L546,194 L558,182 L538,182 Z" fill="hsl(210 20% 95%)" />
          </g>
          <g>
            <path d="M720,260 L720,232 L704,232 L728,190 L712,190 L728,158 L744,190 L728,190 L752,232 L736,232 L736,260 Z" fill="url(#snowTreeGrad)" />
            <path d="M728,158 L721,169 L735,169 Z" fill="white" />
            <path d="M712,190 L722,201 L728,190 L734,201 L744,190 Z" fill="hsl(210 20% 95%)" />
          </g>
          <g>
            <path d="M920,260 L920,238 L905,238 L928,200 L913,200 L928,172 L943,200 L928,200 L951,238 L936,238 L936,260 Z" fill="url(#snowTreeGrad)" />
            <path d="M928,172 L922,182 L934,182 Z" fill="white" />
          </g>
          <g>
            <path d="M1150,260 L1150,232 L1132,232 L1158,188 L1140,188 L1158,155 L1176,188 L1158,188 L1184,232 L1166,232 L1166,260 Z" fill="url(#snowTreeGrad)" />
            <path d="M1158,155 L1151,167 L1165,167 Z" fill="white" />
            <path d="M1140,188 L1150,200 L1158,188 L1166,200 L1176,188 Z" fill="hsl(210 20% 95%)" />
          </g>
        </svg>
      </div>

      {/* Breath fog effect in center-bottom */}
      <div
        className="absolute bottom-[35%] left-1/2 -translate-x-1/2 w-5 h-3 rounded-full animate-breath-fog pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse, hsl(0 0% 100% / 0.3) 0%, transparent 70%)',
        }}
      />

      {/* Soft cold vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 80% 70% at 50% 50%, transparent 50%, hsl(220 35% 15% / 0.25) 100%)'
        }}
      />
    </div>
  );
});
SnowBackground.displayName = 'SnowBackground';
