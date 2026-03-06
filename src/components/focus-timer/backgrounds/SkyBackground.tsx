import { memo, useMemo } from 'react';

// ============================================================================
// SKY BACKGROUND — "Golden Hour Serenity"
// Layered clouds with volume, lens flare, pollen motes, animated grass,
// butterflies, and a faint rainbow arc
// ============================================================================
export const SkyBackground = memo(() => {
  // Pollen / dust motes
  const pollenMotes = useMemo(() =>
    Array.from({ length: 15 }, (_, i) => ({
      left: `${5 + (i * 17) % 90}%`,
      bottom: `${5 + (i * 11) % 40}%`,
      size: 1 + (i % 3) * 0.5,
      drift: `${-15 + (i % 5) * 8}px`,
      duration: `${15 + (i % 4) * 3}s`,
      delay: `${(i * 1.3) % 12}s`,
      opacity: 0.3 + (i % 4) * 0.1,
    })), []
  );

  // Grass blades
  const grassBlades = useMemo(() =>
    Array.from({ length: 25 }, (_, i) => ({
      x: (i / 25) * 100,
      height: 8 + (i % 5) * 2,
      delay: `${(i * 0.15) % 3}s`,
    })), []
  );

  return (
    <div className="fixed inset-0 overflow-hidden focus-bg-transition">
      {/* Base sky gradient - rich atmospheric layers */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            linear-gradient(180deg,
              hsl(200 75% 78%) 0%,
              hsl(200 60% 82%) 20%,
              hsl(195 50% 86%) 40%,
              hsl(45 45% 88%) 70%,
              hsl(40 55% 90%) 100%
            )
          `
        }}
      />

      {/* Atmospheric warm haze band */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background: 'radial-gradient(ellipse 120% 80% at 50% 100%, hsl(40 60% 85%) 0%, transparent 70%)'
        }}
      />

      {/* Warm atmospheric haze at 65-75% */}
      <div
        className="absolute left-0 right-0 h-[15%] top-[60%] opacity-40"
        style={{
          background: 'linear-gradient(180deg, transparent 0%, hsl(40 50% 88% / 0.4) 50%, transparent 100%)'
        }}
      />

      {/* Sun with glow + lens flare */}
      <div
        className="absolute top-[8%] right-[15%] w-24 h-24 rounded-full"
        style={{
          background: 'radial-gradient(circle, hsl(45 100% 92%) 0%, hsl(45 90% 85%) 30%, hsl(40 80% 75% / 0.4) 60%, transparent 80%)',
          boxShadow: '0 0 60px hsl(45 90% 80% / 0.5), 0 0 120px hsl(40 80% 75% / 0.3)'
        }}
      />

      {/* Lens flare hexagons */}
      <div className="absolute top-[12%] right-[22%] animate-flare-sway pointer-events-none">
        <div
          className="absolute w-3 h-3 opacity-20"
          style={{
            background: 'hsl(45 80% 85%)',
            clipPath: 'polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)',
          }}
        />
        <div
          className="absolute w-2 h-2 opacity-15"
          style={{
            top: 20,
            left: 15,
            background: 'hsl(45 80% 85%)',
            clipPath: 'polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)',
          }}
        />
        <div
          className="absolute w-5 h-5 opacity-10"
          style={{
            top: 35,
            left: 30,
            background: 'hsl(45 70% 90%)',
            clipPath: 'polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)',
          }}
        />
      </div>

      {/* Faint rainbow arc behind clouds */}
      <div
        className="absolute top-[5%] left-[10%] w-[60%] h-[40%] opacity-[0.06] pointer-events-none"
        style={{
          background: 'conic-gradient(from 180deg at 50% 100%, red, orange, yellow, green, cyan, blue, violet, transparent 80%)',
          borderRadius: '50% 50% 0 0',
          filter: 'blur(12px)',
        }}
      />

      {/* Cloud layer - back (volumetric SVG-style) */}
      <div className="absolute top-[10%] left-[3%] w-36 h-14 animate-cloud-drift-slow pointer-events-none">
        <div className="relative w-full h-full">
          <div className="absolute inset-0 rounded-full bg-white/50 blur-md" />
          <div className="absolute top-1 left-3 w-[70%] h-[80%] rounded-full bg-white/35 blur-sm" />
          <div className="absolute bottom-0 inset-x-2 h-[40%] rounded-b-full" style={{ boxShadow: 'inset 0 -4px 8px hsl(200 30% 70% / 0.2)' }} />
        </div>
      </div>
      <div className="absolute top-[7%] left-[28%] w-28 h-10 animate-cloud-drift-slow pointer-events-none" style={{ animationDelay: '-5s' }}>
        <div className="relative w-full h-full">
          <div className="absolute inset-0 rounded-full bg-white/40 blur-md" />
          <div className="absolute bottom-0 inset-x-1 h-[35%] rounded-b-full" style={{ boxShadow: 'inset 0 -3px 6px hsl(200 30% 70% / 0.15)' }} />
        </div>
      </div>
      <div className="absolute top-[14%] right-[6%] w-40 h-16 animate-cloud-drift-slow pointer-events-none" style={{ animationDelay: '-10s' }}>
        <div className="relative w-full h-full">
          <div className="absolute inset-0 rounded-full bg-white/45 blur-md" />
          <div className="absolute top-2 left-4 w-[60%] h-[70%] rounded-full bg-white/30 blur-sm" />
          <div className="absolute bottom-0 inset-x-3 h-[40%] rounded-b-full" style={{ boxShadow: 'inset 0 -4px 8px hsl(200 30% 70% / 0.2)' }} />
        </div>
      </div>

      {/* Cloud layer - front */}
      <div className="absolute top-[18%] left-[15%] w-28 h-10 rounded-full bg-white/60 blur-sm animate-cloud-drift" />
      <div className="absolute top-[22%] right-[20%] w-20 h-8 rounded-full bg-white/55 blur-sm animate-cloud-drift" style={{ animationDelay: '-8s' }} />

      {/* Butterflies */}
      <div className="absolute top-[30%] left-[15%] animate-butterfly-path pointer-events-none" style={{ animationDelay: '-5s' }}>
        <svg width="10" height="8" viewBox="0 0 10 8" className="animate-wing-flap">
          <path d="M5,4 Q2,0 0,2 Q2,4 5,4" fill="hsl(280 60% 65% / 0.7)" />
          <path d="M5,4 Q8,0 10,2 Q8,4 5,4" fill="hsl(280 55% 70% / 0.7)" />
        </svg>
      </div>
      <div className="absolute top-[25%] right-[25%] animate-butterfly-path pointer-events-none" style={{ animationDelay: '-15s' }}>
        <svg width="8" height="6" viewBox="0 0 10 8" className="animate-wing-flap" style={{ animationDelay: '-0.2s' }}>
          <path d="M5,4 Q2,0 0,2 Q2,4 5,4" fill="hsl(45 80% 65% / 0.6)" />
          <path d="M5,4 Q8,0 10,2 Q8,4 5,4" fill="hsl(45 75% 70% / 0.6)" />
        </svg>
      </div>

      {/* Pollen / dust motes */}
      {pollenMotes.map((mote, i) => (
        <div
          key={i}
          className="absolute rounded-full animate-pollen-float pointer-events-none"
          style={{
            left: mote.left,
            bottom: mote.bottom,
            width: `${mote.size}px`,
            height: `${mote.size}px`,
            backgroundColor: 'hsl(45 50% 90%)',
            ['--drift' as string]: mote.drift,
            ['--pollen-duration' as string]: mote.duration,
            ['--pollen-opacity' as string]: mote.opacity,
            animationDelay: mote.delay,
          }}
        />
      ))}

      {/* Distant hills - back layer */}
      <div className="absolute bottom-0 w-full h-56">
        <svg viewBox="0 0 1200 220" className="w-full h-full" preserveAspectRatio="none">
          <defs>
            <linearGradient id="skyHillBack" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="hsl(150 25% 70%)" stopOpacity="0.3" />
              <stop offset="100%" stopColor="hsl(150 30% 60%)" stopOpacity="0.4" />
            </linearGradient>
            <linearGradient id="skyHillMid" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="hsl(145 30% 65%)" stopOpacity="0.5" />
              <stop offset="100%" stopColor="hsl(145 35% 55%)" stopOpacity="0.6" />
            </linearGradient>
            <linearGradient id="skyHillFront" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="hsl(140 35% 58%)" stopOpacity="0.7" />
              <stop offset="100%" stopColor="hsl(140 40% 48%)" stopOpacity="0.85" />
            </linearGradient>
          </defs>
          <path d="M0,220 L0,160 Q100,130 200,145 Q350,165 500,140 Q650,115 800,135 Q950,155 1100,125 L1200,140 L1200,220 Z" fill="url(#skyHillBack)" />
          <path d="M0,220 L0,170 Q80,140 180,155 Q320,175 480,145 Q640,115 800,140 Q920,160 1050,130 L1200,150 L1200,220 Z" fill="url(#skyHillMid)" />
          <path d="M0,220 L0,180 Q120,150 260,165 Q400,180 560,155 Q720,130 880,155 Q1020,175 1150,145 L1200,160 L1200,220 Z" fill="url(#skyHillFront)" />
        </svg>
      </div>

      {/* Animated grass strip at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-5 pointer-events-none overflow-hidden">
        <svg viewBox="0 0 400 20" className="w-full h-full" preserveAspectRatio="none">
          {grassBlades.map((blade, i) => (
            <line
              key={i}
              x1={blade.x * 4}
              y1={20}
              x2={blade.x * 4 + (i % 2 === 0 ? 1 : -1)}
              y2={20 - blade.height}
              stroke="hsl(120 45% 45%)"
              strokeWidth="1.2"
              className="animate-grass-sway"
              style={{ animationDelay: blade.delay, transformOrigin: `${blade.x * 4}px 20px` }}
            />
          ))}
        </svg>
      </div>

      {/* Subtle vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 80% 70% at 50% 50%, transparent 50%, hsl(200 30% 70% / 0.15) 100%)'
        }}
      />
    </div>
  );
});
SkyBackground.displayName = 'SkyBackground';
