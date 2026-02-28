import { memo, useMemo } from 'react';
import { cn } from '@/lib/utils';

interface ChargingBayProps {
  robotImage?: string;
  robotName?: string;
  isCharging?: boolean;
  glowColor?: string;
}

/**
 * ChargingBay — Atelier surrealist floating robot display.
 * Robot floats on white canvas with impossible shadow and soft aura.
 */
export const ChargingBay = memo(({ robotImage, robotName, isCharging = false, glowColor = '#0EA5E9' }: ChargingBayProps) => {
  const rarityAura = useMemo(() => {
    if (!glowColor) return {};
    return {
      background: `radial-gradient(circle, ${glowColor}08 0%, ${glowColor}03 50%, transparent 70%)`,
    };
  }, [glowColor]);

  return (
    <div className="relative flex items-center justify-center">
      {/* Surreal aura — subtle rarity glow bleeding into white space */}
      <div
        className="absolute w-72 h-72 rounded-full pointer-events-none"
        style={rarityAura}
      />

      {/* Main robot container — no frame, floating in white space */}
      <div className="relative flex flex-col items-center gap-4">
        <div className="relative">
          {robotImage ? (
            <img
              src={robotImage}
              alt={robotName || 'Robot'}
              className={cn(
                "w-44 h-44 object-contain transition-all duration-700",
                isCharging && "scale-[1.03]"
              )}
              style={{
                imageRendering: 'pixelated',
                animation: 'atelier-float 4s ease-in-out infinite',
                filter: isCharging ? `drop-shadow(0 0 20px ${glowColor}30)` : 'none',
              }}
              draggable={false}
            />
          ) : (
            <div className="w-44 h-44 rounded-2xl flex items-center justify-center text-5xl bg-stone-100 border border-stone-200">
              🤖
            </div>
          )}

          {/* Surreal shadow — detached, soft, slightly offset */}
          <div
            className="absolute pointer-events-none"
            style={{
              bottom: '-16px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '55%',
              height: '8px',
              borderRadius: '50%',
              background: 'hsla(24, 10%, 10%, 0.06)',
              filter: 'blur(6px)',
              animation: 'atelier-shadow-pulse 4s ease-in-out infinite',
            }}
          />
        </div>

        {/* Robot name — thin, uppercase, tracked */}
        {robotName && (
          <div className="text-xs font-medium tracking-[0.15em] uppercase text-stone-400">
            {robotName}
          </div>
        )}
      </div>

      <style>{`
        @keyframes atelier-float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
        @keyframes atelier-shadow-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
      `}</style>
    </div>
  );
});

ChargingBay.displayName = 'ChargingBay';
