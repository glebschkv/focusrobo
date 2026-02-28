import { memo } from 'react';

/**
 * HangarBackground — Atelier surrealist gallery space.
 * White canvas with architectural perspective lines, concentric display rings,
 * and floating geometric shapes that give depth and intentionality.
 */
export const HangarBackground = memo(() => {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Base warm white canvas with subtle vertical gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(180deg, #F5F5F4 0%, #FAFAF9 35%, #FAFAF9 60%, #F5F5F4 100%)',
        }}
      />

      {/* Paper grain texture */}
      <div className="absolute inset-0 opacity-[0.02]">
        <svg width="100%" height="100%">
          <filter id="grain">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" stitchTiles="stitch" />
          </filter>
          <rect width="100%" height="100%" filter="url(#grain)" />
        </svg>
      </div>

      {/* SVG architectural elements */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 390 844"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
      >
        {/* Horizon line — thin, at ~52% height */}
        <line
          x1="0" y1="440" x2="390" y2="440"
          stroke="hsl(24 10% 10% / 0.04)"
          strokeWidth="0.5"
        />

        {/* Perspective floor — converging lines from bottom vanishing at center */}
        {[-120, -80, -40, 0, 40, 80, 120].map((offset, i) => (
          <line
            key={`floor-${i}`}
            x1={195 + offset}
            y1="440"
            x2={195 + offset * 4.5}
            y2="844"
            stroke="hsl(24 10% 10% / 0.025)"
            strokeWidth="0.5"
          />
        ))}

        {/* Horizontal floor lines — receding perspective */}
        {[500, 560, 610, 650, 685, 715, 740, 762].map((y, i) => (
          <line
            key={`hfloor-${i}`}
            x1="0" y1={y} x2="390" y2={y}
            stroke={`hsl(24 10% 10% / ${0.03 - i * 0.003})`}
            strokeWidth="0.5"
          />
        ))}

        {/* Concentric display rings — behind robot center point (~340px) */}
        {[60, 110, 170].map((r, i) => (
          <circle
            key={`ring-${i}`}
            cx="195"
            cy="340"
            r={r}
            stroke={`hsl(24 10% 10% / ${0.035 - i * 0.01})`}
            strokeWidth="0.5"
            fill="none"
          />
        ))}

        {/* Subtle crosshair at center — gallery display marker */}
        <line
          x1="185" y1="340" x2="205" y2="340"
          stroke="hsl(24 10% 10% / 0.03)"
          strokeWidth="0.5"
        />
        <line
          x1="195" y1="330" x2="195" y2="350"
          stroke="hsl(24 10% 10% / 0.03)"
          strokeWidth="0.5"
        />

        {/* Floating geometric accents — thin circles */}
        <circle cx="62" cy="180" r="18" stroke="hsl(199 89% 48% / 0.06)" strokeWidth="0.5" fill="none" />
        <circle cx="340" cy="230" r="12" stroke="hsl(24 10% 10% / 0.04)" strokeWidth="0.5" fill="none" />
        <circle cx="52" cy="620" r="8" stroke="hsl(24 10% 10% / 0.03)" strokeWidth="0.5" fill="none" />
        <circle cx="345" cy="580" r="24" stroke="hsl(199 89% 48% / 0.04)" strokeWidth="0.5" fill="none" />

        {/* Floating dots — various sizes and opacities */}
        <circle cx="85" cy="290" r="1.5" fill="hsl(24 10% 10% / 0.05)" />
        <circle cx="310" cy="160" r="2" fill="hsl(199 89% 48% / 0.08)" />
        <circle cx="330" cy="400" r="1" fill="hsl(24 10% 10% / 0.04)" />
        <circle cx="60" cy="480" r="1.5" fill="hsl(199 89% 48% / 0.06)" />
        <circle cx="290" cy="710" r="1" fill="hsl(24 10% 10% / 0.03)" />

        {/* Diagonal accent line — surreal unexpected angle */}
        <line
          x1="320" y1="120" x2="370" y2="280"
          stroke="hsl(24 10% 10% / 0.02)"
          strokeWidth="0.5"
        />

        {/* Small square accent — gallery motif */}
        <rect
          x="42" y="370" width="10" height="10"
          stroke="hsl(24 10% 10% / 0.03)"
          strokeWidth="0.5"
          fill="none"
          transform="rotate(12, 47, 375)"
        />
      </svg>

      {/* Soft warm spotlight — focused on robot area */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: '400px',
          height: '400px',
          top: '28%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background:
            'radial-gradient(circle, hsla(40, 30%, 97%, 0.9) 0%, hsla(40, 20%, 96%, 0.4) 35%, transparent 65%)',
        }}
      />

      {/* Slow-drifting atmospheric particles */}
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            width: `${2 + (i % 2)}px`,
            height: `${2 + (i % 2)}px`,
            background: i % 2 === 0
              ? 'hsla(199, 89%, 48%, 0.08)'
              : 'hsla(24, 10%, 10%, 0.04)',
            left: `${20 + i * 20}%`,
            top: `${25 + i * 15}%`,
            animation: `atelier-drift ${30 + i * 8}s linear infinite`,
            animationDelay: `${-i * 7}s`,
          }}
        />
      ))}

      <style>{`
        @keyframes atelier-drift {
          0% { transform: translate(0, 0); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translate(40px, -80px); opacity: 0; }
        }
      `}</style>
    </div>
  );
});

HangarBackground.displayName = 'HangarBackground';
