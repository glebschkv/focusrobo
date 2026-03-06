import { memo, useMemo } from 'react';

// ============================================================================
// SUNSET BACKGROUND — "Cinematic Golden Hour"
// Animated gradient shift, light leaks, water reflection, palm trees,
// appearing stars, enhanced birds, dramatic cloud wisps
// ============================================================================
export const SunsetBackground = memo(() => {
  // Stars that fade in during the "darker" phase
  const twilightStars = useMemo(() =>
    Array.from({ length: 10 }, (_, i) => ({
      top: `${3 + (i * 7) % 18}%`,
      left: `${8 + (i * 19) % 85}%`,
      size: 1 + (i % 2),
      maxOpacity: 0.15 + (i % 3) * 0.08,
      delay: `${i * 2}s`,
    })), []
  );

  return (
    <div className="fixed inset-0 overflow-hidden focus-bg-transition">
      {/* Rich sunset gradient with animated color shift */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            linear-gradient(180deg,
              hsl(270 45% 35%) 0%,
              hsl(300 50% 40%) 15%,
              hsl(340 60% 50%) 30%,
              hsl(15 75% 55%) 45%,
              hsl(35 85% 60%) 60%,
              hsl(45 90% 70%) 80%,
              hsl(50 85% 78%) 100%
            )
          `
        }}
      />

      {/* Light leak overlay — cinematic anamorphic lens */}
      <div
        className="absolute animate-light-leak pointer-events-none"
        style={{
          top: '15%',
          left: '55%',
          width: '40%',
          height: '50%',
          background: 'radial-gradient(ellipse at center, hsl(40 100% 75% / 0.12) 0%, transparent 70%)',
          filter: 'blur(20px)',
        }}
      />

      {/* Atmospheric glow near horizon */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse 100% 50% at 50% 85%, hsl(40 90% 70% / 0.4) 0%, transparent 60%)'
        }}
      />

      {/* Setting sun */}
      <div
        className="absolute bottom-[22%] left-1/2 -translate-x-1/2 w-28 h-28 rounded-full animate-pulse-subtle"
        style={{
          background: 'radial-gradient(circle, hsl(45 100% 80%) 0%, hsl(35 95% 65%) 40%, hsl(25 85% 55% / 0.6) 70%, transparent 100%)',
          boxShadow: '0 0 80px hsl(40 100% 70% / 0.6), 0 0 150px hsl(35 90% 60% / 0.4)'
        }}
      />

      {/* Sun reflection glow on water */}
      <div
        className="absolute bottom-[10%] left-1/2 -translate-x-1/2 w-56 h-20 rounded-full opacity-50 animate-water-ripple"
        style={{
          background: 'radial-gradient(ellipse, hsl(40 100% 75%) 0%, transparent 70%)'
        }}
      />

      {/* Twilight stars fading in at top */}
      {twilightStars.map((star, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-white animate-star-fade-in pointer-events-none"
          style={{
            top: star.top,
            left: star.left,
            width: `${star.size}px`,
            height: `${star.size}px`,
            ['--star-max-opacity' as string]: star.maxOpacity,
            animationDelay: star.delay,
          }}
        />
      ))}

      {/* Scattered clouds with sunset colors */}
      <div className="absolute top-[8%] left-[3%] w-32 h-10 rounded-full blur-md animate-cloud-drift-slow"
        style={{ background: 'linear-gradient(90deg, hsl(340 50% 65% / 0.5), hsl(25 70% 70% / 0.4))' }} />
      <div className="absolute top-[12%] left-[22%] w-24 h-7 rounded-full blur-md animate-cloud-drift-slow"
        style={{ background: 'linear-gradient(90deg, hsl(300 40% 60% / 0.4), hsl(340 60% 65% / 0.35))', animationDelay: '-6s' }} />
      <div className="absolute top-[6%] right-[15%] w-36 h-12 rounded-full blur-md animate-cloud-drift-slow"
        style={{ background: 'linear-gradient(90deg, hsl(280 45% 55% / 0.45), hsl(320 55% 60% / 0.4))', animationDelay: '-12s' }} />
      <div className="absolute top-[15%] right-[30%] w-20 h-6 rounded-full blur-sm animate-cloud-drift"
        style={{ background: 'linear-gradient(90deg, hsl(320 50% 60% / 0.5), hsl(350 60% 65% / 0.4))', animationDelay: '-4s' }} />

      {/* Additional dramatic thin cloud wisps */}
      <div className="absolute top-[20%] left-[10%] w-48 h-3 rounded-full blur-sm animate-cloud-drift-slow opacity-50"
        style={{ background: 'linear-gradient(90deg, transparent, hsl(350 65% 55% / 0.6), hsl(20 80% 65% / 0.5), transparent)', animationDelay: '-8s' }} />
      <div className="absolute top-[28%] right-[5%] w-40 h-2 rounded-full blur-sm animate-cloud-drift opacity-40"
        style={{ background: 'linear-gradient(90deg, transparent, hsl(15 70% 60% / 0.5), hsl(40 80% 68% / 0.4), transparent)', animationDelay: '-3s' }} />

      {/* Birds with wing flap — group 1 */}
      <div className="absolute top-[25%] left-[20%] opacity-60 animate-bird-drift">
        <svg width="60" height="20" viewBox="0 0 60 20">
          <g className="animate-bird-wing-flap" style={{ transformOrigin: '10px 10px' }}>
            <path d="M5,10 Q8,5 12,10 M8,10 Q11,5 15,10" stroke="hsl(280 30% 25%)" strokeWidth="1.5" fill="none" />
          </g>
          <g className="animate-bird-wing-flap" style={{ transformOrigin: '31px 8px', animationDelay: '-0.3s' }}>
            <path d="M25,8 Q29,3 34,8 M29,8 Q33,3 38,8" stroke="hsl(280 30% 25%)" strokeWidth="1.5" fill="none" />
          </g>
          <g className="animate-bird-wing-flap" style={{ transformOrigin: '50px 12px', animationDelay: '-0.6s' }}>
            <path d="M45,12 Q48,7 52,12 M48,12 Q51,7 55,12" stroke="hsl(280 30% 25%)" strokeWidth="1.5" fill="none" />
          </g>
        </svg>
      </div>

      {/* Birds — group 2 (higher, smaller) */}
      <div className="absolute top-[15%] right-[35%] opacity-40 animate-bird-drift" style={{ animationDelay: '-10s' }}>
        <svg width="35" height="12" viewBox="0 0 35 12">
          <g className="animate-bird-wing-flap" style={{ transformOrigin: '8px 6px', animationDelay: '-0.4s' }}>
            <path d="M3,6 Q6,2 10,6 M6,6 Q9,2 13,6" stroke="hsl(280 25% 30%)" strokeWidth="1" fill="none" />
          </g>
          <g className="animate-bird-wing-flap" style={{ transformOrigin: '25px 5px', animationDelay: '-0.1s' }}>
            <path d="M20,5 Q23,1 27,5 M23,5 Q26,1 30,5" stroke="hsl(280 25% 30%)" strokeWidth="1" fill="none" />
          </g>
        </svg>
      </div>

      {/* Water surface at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-[12%]">
        {/* Water base */}
        <div
          className="absolute inset-0 animate-water-ripple"
          style={{
            background: 'linear-gradient(180deg, hsl(280 30% 20% / 0.6) 0%, hsl(250 35% 15% / 0.8) 100%)'
          }}
        />
        {/* Sun streak reflection */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-full opacity-30"
          style={{
            background: 'linear-gradient(180deg, hsl(40 100% 75%) 0%, hsl(35 90% 65% / 0.3) 50%, transparent 100%)',
            filter: 'blur(4px)',
          }}
        />
      </div>

      {/* Palm tree silhouettes */}
      <div className="absolute bottom-[10%] left-[3%] animate-palm-sway pointer-events-none" style={{ transformOrigin: 'bottom center' }}>
        <svg width="50" height="80" viewBox="0 0 50 80">
          <path d="M25,80 L25,30" stroke="hsl(275 40% 10%)" strokeWidth="3" fill="none" />
          <path d="M25,30 Q15,15 5,20 Q15,18 25,28" fill="hsl(275 40% 10%)" />
          <path d="M25,30 Q35,15 45,20 Q35,18 25,28" fill="hsl(275 40% 10%)" />
          <path d="M25,28 Q20,10 10,8 Q18,12 25,26" fill="hsl(275 40% 10%)" />
          <path d="M25,28 Q30,10 40,8 Q32,12 25,26" fill="hsl(275 40% 10%)" />
        </svg>
      </div>
      <div className="absolute bottom-[10%] right-[5%] animate-palm-sway pointer-events-none" style={{ transformOrigin: 'bottom center', animationDelay: '-3s' }}>
        <svg width="40" height="65" viewBox="0 0 50 80">
          <path d="M25,80 L25,35" stroke="hsl(275 40% 10%)" strokeWidth="3" fill="none" />
          <path d="M25,35 Q15,20 8,25 Q16,22 25,33" fill="hsl(275 40% 10%)" />
          <path d="M25,35 Q35,20 42,25 Q34,22 25,33" fill="hsl(275 40% 10%)" />
          <path d="M25,33 Q18,15 12,12 Q20,16 25,31" fill="hsl(275 40% 10%)" />
        </svg>
      </div>

      {/* Silhouette hills behind water */}
      <div className="absolute bottom-[10%] w-full h-44">
        <svg viewBox="0 0 1200 180" className="w-full h-full" preserveAspectRatio="none">
          <defs>
            <linearGradient id="sunsetHillBack" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="hsl(280 35% 25%)" stopOpacity="0.7" />
              <stop offset="100%" stopColor="hsl(280 40% 18%)" stopOpacity="0.85" />
            </linearGradient>
            <linearGradient id="sunsetHillFront" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="hsl(275 40% 18%)" stopOpacity="0.9" />
              <stop offset="100%" stopColor="hsl(270 45% 12%)" stopOpacity="1" />
            </linearGradient>
          </defs>
          <path d="M0,180 L0,110 Q80,75 180,95 Q320,120 480,80 Q640,40 800,70 Q920,95 1080,55 L1200,80 L1200,180 Z" fill="url(#sunsetHillBack)" />
          <path d="M0,180 L0,130 Q100,95 220,115 Q380,140 540,100 Q700,60 860,90 Q980,115 1120,75 L1200,95 L1200,180 Z" fill="url(#sunsetHillFront)" />
        </svg>
      </div>

      {/* Warm vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 75% 65% at 50% 50%, transparent 40%, hsl(280 40% 25% / 0.2) 100%)'
        }}
      />
    </div>
  );
});
SunsetBackground.displayName = 'SunsetBackground';
