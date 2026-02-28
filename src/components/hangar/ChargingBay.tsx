import { memo, useMemo } from 'react';
import { cn } from '@/lib/utils';

interface ChargingBayProps {
  robotImage?: string;
  robotName?: string;
  isCharging?: boolean;
  glowColor?: string;
}

/**
 * ChargingBay — Central display pod for the user's active robot.
 * Shows a large robot illustration with energy/glow effects.
 * When isCharging (timer running), the bay pulses faster.
 */
export const ChargingBay = memo(({ robotImage, robotName, isCharging = false, glowColor = '#06b6d4' }: ChargingBayProps) => {
  const glowStyle = useMemo(() => ({
    boxShadow: isCharging
      ? `0 0 40px ${glowColor}40, 0 0 80px ${glowColor}20, inset 0 0 30px ${glowColor}15`
      : `0 0 20px ${glowColor}20, 0 0 40px ${glowColor}10, inset 0 0 15px ${glowColor}08`,
  }), [isCharging, glowColor]);

  return (
    <div className="relative flex items-center justify-center">
      {/* Outer bay frame */}
      <div
        className={cn(
          "relative w-56 h-64 rounded-2xl border-2 flex items-center justify-center transition-all duration-700",
          isCharging ? "border-cyan-400/50" : "border-cyan-900/30"
        )}
        style={glowStyle}
      >
        {/* Corner accents */}
        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-cyan-400/60 rounded-tl-lg" />
        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-cyan-400/60 rounded-tr-lg" />
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-cyan-400/60 rounded-bl-lg" />
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-cyan-400/60 rounded-br-lg" />

        {/* Energy particles (when charging) */}
        {isCharging && (
          <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 rounded-full bg-cyan-400/60"
                style={{
                  left: `${15 + Math.random() * 70}%`,
                  bottom: '-4px',
                  animation: `float-up ${2 + Math.random() * 2}s ease-in-out infinite`,
                  animationDelay: `${Math.random() * 2}s`,
                }}
              />
            ))}
          </div>
        )}

        {/* Robot image or placeholder */}
        <div className="relative z-10 flex flex-col items-center gap-3">
          {robotImage ? (
            <img
              src={robotImage}
              alt={robotName || 'Robot'}
              className={cn(
                "w-32 h-32 object-contain pixelated transition-all duration-500",
                isCharging && "drop-shadow-[0_0_12px_rgba(6,182,212,0.6)]"
              )}
              style={{ imageRendering: 'pixelated' }}
              draggable={false}
            />
          ) : (
            <div
              className={cn(
                "w-32 h-32 rounded-xl flex items-center justify-center text-4xl transition-all duration-500",
                "bg-gradient-to-br from-cyan-900/40 to-slate-800/60 border border-cyan-800/30",
                isCharging && "shadow-[0_0_20px_rgba(6,182,212,0.3)]"
              )}
            >
              🤖
            </div>
          )}

          {robotName && (
            <div className="text-sm font-bold text-cyan-300/90 tracking-wider uppercase font-mono">
              {robotName}
            </div>
          )}
        </div>

        {/* Base platform glow */}
        <div
          className={cn(
            "absolute bottom-2 left-1/2 -translate-x-1/2 w-3/4 h-1 rounded-full transition-all duration-700",
            isCharging ? "bg-cyan-400/40" : "bg-cyan-900/20"
          )}
        />
      </div>

      {/* Float-up keyframes */}
      <style>{`
        @keyframes float-up {
          0% { transform: translateY(0) scale(1); opacity: 0; }
          10% { opacity: 0.8; }
          90% { opacity: 0.2; }
          100% { transform: translateY(-250px) scale(0.5); opacity: 0; }
        }
      `}</style>
    </div>
  );
});

ChargingBay.displayName = 'ChargingBay';
