import { memo } from 'react';

/**
 * HangarBackground — Pure CSS dark industrial background
 * No image assets needed. Uses gradients, scanlines, and glow effects.
 */
export const HangarBackground = memo(() => {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Base gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(180deg, #0a0a1a 0%, #0d1117 40%, #111827 70%, #0a0a1a 100%)',
        }}
      />

      {/* Subtle grid lines */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(6,182,212,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.5) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      {/* Scanline overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          background:
            'repeating-linear-gradient(0deg, transparent 0px, transparent 2px, rgba(255,255,255,1) 2px, rgba(255,255,255,1) 4px)',
        }}
      />

      {/* Central radial glow */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: '400px',
          height: '400px',
          top: '35%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background:
            'radial-gradient(circle, rgba(6,182,212,0.12) 0%, rgba(6,182,212,0.04) 40%, transparent 70%)',
        }}
      />

      {/* Top ambient light */}
      <div
        className="absolute top-0 left-0 right-0 h-32 pointer-events-none"
        style={{
          background: 'linear-gradient(180deg, rgba(6,182,212,0.06) 0%, transparent 100%)',
        }}
      />
    </div>
  );
});

HangarBackground.displayName = 'HangarBackground';
