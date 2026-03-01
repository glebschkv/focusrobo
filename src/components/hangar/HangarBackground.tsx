import { memo } from 'react';

/**
 * HangarBackground — Premium gallery space with layered depth.
 * Warm canvas with soft vignette, architectural grid, subtle noise,
 * and atmospheric particles for a high-end exhibition feel.
 */
export const HangarBackground = memo(() => {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Base — warm gradient with subtle center spotlight */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 70% 50% at 50% 40%, hsla(40, 30%, 98%, 1) 0%, transparent 70%),
            linear-gradient(180deg, #F3F2F0 0%, #FAFAF9 30%, #FAFAF9 60%, #F5F4F2 100%)
          `,
        }}
      />

      {/* Subtle noise texture — adds expensive paper feel */}
      <div className="absolute inset-0 opacity-[0.025]">
        <svg width="100%" height="100%">
          <filter id="premium-grain">
            <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="4" stitchTiles="stitch" />
          </filter>
          <rect width="100%" height="100%" filter="url(#premium-grain)" />
        </svg>
      </div>

      {/* SVG architectural elements — refined grid system */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 390 844"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
      >
        {/* Horizon line */}
        <line
          x1="0" y1="440" x2="390" y2="440"
          stroke="hsl(24 10% 10% / 0.03)"
          strokeWidth="0.5"
        />

        {/* Perspective floor — converging vanishing-point lines */}
        {[-140, -100, -60, -20, 20, 60, 100, 140].map((offset, i) => (
          <line
            key={`floor-${i}`}
            x1={195 + offset}
            y1="440"
            x2={195 + offset * 4}
            y2="844"
            stroke="hsl(24 10% 10% / 0.02)"
            strokeWidth="0.5"
          />
        ))}

        {/* Horizontal receding floor lines */}
        {[490, 540, 585, 625, 660, 690, 716, 738, 758].map((y, i) => (
          <line
            key={`hfloor-${i}`}
            x1="0" y1={y} x2="390" y2={y}
            stroke={`hsl(24 10% 10% / ${0.025 - i * 0.002})`}
            strokeWidth="0.5"
          />
        ))}

        {/* Concentric display rings — exhibition focus rings */}
        {[50, 100, 160, 230].map((r, i) => (
          <circle
            key={`ring-${i}`}
            cx="195"
            cy="340"
            r={r}
            stroke={`hsl(199 89% 48% / ${0.04 - i * 0.008})`}
            strokeWidth="0.5"
            fill="none"
            strokeDasharray={i > 1 ? "4 8" : "none"}
          />
        ))}

        {/* Crosshair — gallery display marker */}
        <line x1="180" y1="340" x2="210" y2="340" stroke="hsl(199 89% 48% / 0.04)" strokeWidth="0.5" />
        <line x1="195" y1="325" x2="195" y2="355" stroke="hsl(199 89% 48% / 0.04)" strokeWidth="0.5" />

        {/* Floating accent geometry */}
        <circle cx="55" cy="170" r="20" stroke="hsl(199 89% 48% / 0.05)" strokeWidth="0.5" fill="none" />
        <circle cx="345" cy="210" r="14" stroke="hsl(199 89% 48% / 0.04)" strokeWidth="0.5" fill="none" />
        <circle cx="48" cy="600" r="10" stroke="hsl(24 10% 10% / 0.025)" strokeWidth="0.5" fill="none" />
        <circle cx="350" cy="560" r="28" stroke="hsl(199 89% 48% / 0.03)" strokeWidth="0.5" fill="none" strokeDasharray="3 6" />

        {/* Accent dots */}
        <circle cx="82" cy="280" r="1.5" fill="hsl(199 89% 48% / 0.08)" />
        <circle cx="315" cy="150" r="2" fill="hsl(199 89% 48% / 0.06)" />
        <circle cx="335" cy="390" r="1" fill="hsl(24 10% 10% / 0.04)" />
        <circle cx="55" cy="470" r="1.5" fill="hsl(199 89% 48% / 0.05)" />
        <circle cx="300" cy="700" r="1" fill="hsl(24 10% 10% / 0.03)" />

        {/* Diagonal accent lines */}
        <line x1="325" y1="110" x2="365" y2="260" stroke="hsl(199 89% 48% / 0.02)" strokeWidth="0.5" />
        <line x1="25" y1="500" x2="65" y2="650" stroke="hsl(24 10% 10% / 0.015)" strokeWidth="0.5" />

        {/* Gallery motif — small rotated squares */}
        <rect x="38" y="365" width="10" height="10" stroke="hsl(199 89% 48% / 0.03)" strokeWidth="0.5" fill="none" transform="rotate(15, 43, 370)" />
        <rect x="340" y="440" width="8" height="8" stroke="hsl(24 10% 10% / 0.025)" strokeWidth="0.5" fill="none" transform="rotate(-10, 344, 444)" />
      </svg>

      {/* Center spotlight — warm, focused on robot area */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: '500px',
          height: '500px',
          top: '30%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: `
            radial-gradient(circle, hsla(40, 30%, 99%, 0.95) 0%, hsla(40, 20%, 97%, 0.5) 30%, transparent 60%)
          `,
        }}
      />

      {/* Edge vignette — adds depth and draws eye to center */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 75% 65% at 50% 45%, transparent 50%, hsla(24, 10%, 10%, 0.03) 100%)',
        }}
      />

      {/* Atmospheric particles — slow drift */}
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: `${1.5 + (i % 3) * 0.5}px`,
            height: `${1.5 + (i % 3) * 0.5}px`,
            background: i % 3 === 0
              ? 'hsla(199, 89%, 48%, 0.12)'
              : i % 3 === 1
              ? 'hsla(199, 89%, 48%, 0.06)'
              : 'hsla(24, 10%, 10%, 0.04)',
            left: `${15 + i * 14}%`,
            top: `${20 + (i * 12) % 50}%`,
            animation: `premium-drift ${25 + i * 6}s linear infinite`,
            animationDelay: `${-i * 5}s`,
          }}
        />
      ))}

      <style>{`
        @keyframes premium-drift {
          0% { transform: translate(0, 0) scale(0); opacity: 0; }
          8% { opacity: 1; transform: translate(5px, -10px) scale(1); }
          50% { opacity: 0.8; }
          92% { opacity: 1; transform: translate(35px, -70px) scale(1); }
          100% { transform: translate(45px, -90px) scale(0); opacity: 0; }
        }
      `}</style>
    </div>
  );
});

HangarBackground.displayName = 'HangarBackground';
