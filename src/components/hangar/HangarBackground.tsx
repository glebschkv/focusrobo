import { memo } from 'react';

/**
 * HangarBackground — Atelier white surrealist canvas.
 * Warm white with subtle grain texture and drifting particles.
 */
export const HangarBackground = memo(() => {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Base warm white canvas */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(180deg, #FAFAF9 0%, #F5F5F4 50%, #FAFAF9 100%)',
        }}
      />

      {/* Subtle paper grain texture */}
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: '128px 128px',
        }}
      />

      {/* Floating atmospheric particles — glacial speed */}
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            width: `${2 + (i % 3)}px`,
            height: `${2 + (i % 3)}px`,
            background: `hsla(24, 10%, 10%, ${0.03 + (i % 3) * 0.015})`,
            left: `${15 + i * 14}%`,
            top: `${20 + i * 12}%`,
            animation: `atelier-drift ${28 + i * 6}s linear infinite`,
            animationDelay: `${-i * 5}s`,
          }}
        />
      ))}

      {/* Soft center radial light — gallery spotlight */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: '500px',
          height: '500px',
          top: '30%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background:
            'radial-gradient(circle, hsla(40, 20%, 98%, 0.9) 0%, hsla(40, 15%, 96%, 0.3) 40%, transparent 70%)',
        }}
      />

      <style>{`
        @keyframes atelier-drift {
          0% { transform: translate(0, 0); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translate(60px, -100px); opacity: 0; }
        }
      `}</style>
    </div>
  );
});

HangarBackground.displayName = 'HangarBackground';
