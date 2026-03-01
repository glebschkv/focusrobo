import { memo, useMemo } from 'react';
import { cn } from '@/lib/utils';

interface ChargingBayProps {
  robotImage?: string;
  robotName?: string;
  isCharging?: boolean;
  glowColor?: string;
}

/**
 * ChargingBay — Atelier surrealist robot exhibition.
 * Robot floats on a thin circular pedestal with mirror reflection
 * and impossible detached shadow.
 */
export const ChargingBay = memo(({ robotImage, robotName, isCharging = false, glowColor = '#0EA5E9' }: ChargingBayProps) => {
  const rarityAura = useMemo(() => {
    if (!glowColor) return {};
    return {
      background: `radial-gradient(circle, ${glowColor}10 0%, ${glowColor}05 45%, transparent 65%)`,
    };
  }, [glowColor]);

  return (
    <div className="relative flex items-center justify-center">
      {/* Surreal aura — subtle rarity color bleeding into white space */}
      <div
        className="absolute w-80 h-80 rounded-full pointer-events-none"
        style={rarityAura}
      />

      {/* Main robot container */}
      <div className="relative flex flex-col items-center">
        {/* Robot sprite — floating */}
        <div className="relative">
          {robotImage ? (
            <img
              src={robotImage}
              alt={robotName || 'Robot'}
              className={cn(
                "w-48 h-48 object-contain transition-all duration-700",
                isCharging && "scale-[1.03]"
              )}
              style={{
                imageRendering: 'pixelated',
                animation: 'atelier-float 5s ease-in-out infinite',
                filter: isCharging ? `drop-shadow(0 0 24px ${glowColor}25)` : 'none',
              }}
              draggable={false}
            />
          ) : (
            <div className="w-48 h-48 rounded-2xl flex items-center justify-center text-5xl bg-stone-50 border border-stone-200">
              🤖
            </div>
          )}
        </div>

        {/* Mirror reflection — flipped, faded, clipped */}
        {robotImage && (
          <div
            className="relative overflow-hidden pointer-events-none"
            style={{
              height: '40px',
              width: '192px',
              marginTop: '-4px',
              maskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.12) 0%, transparent 100%)',
              WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.12) 0%, transparent 100%)',
            }}
          >
            <img
              src={robotImage}
              alt=""
              className="w-48 h-48 object-contain"
              style={{
                imageRendering: 'pixelated',
                transform: 'scaleY(-1)',
                filter: 'blur(0.5px)',
                opacity: 0.15,
              }}
              draggable={false}
              aria-hidden="true"
            />
          </div>
        )}

        {/* Thin pedestal ellipse — gallery display base */}
        <svg
          width="160"
          height="16"
          viewBox="0 0 160 16"
          fill="none"
          className="pointer-events-none"
          style={{ marginTop: robotImage ? '-8px' : '8px' }}
        >
          <ellipse
            cx="80" cy="8" rx="70" ry="6"
            stroke="hsl(24 10% 10% / 0.06)"
            strokeWidth="0.75"
            fill="none"
          />
          {/* Inner ring */}
          <ellipse
            cx="80" cy="8" rx="40" ry="3.5"
            stroke="hsl(24 10% 10% / 0.04)"
            strokeWidth="0.5"
            fill="none"
          />
        </svg>

        {/* Surreal shadow — detached, soft, offset at impossible angle */}
        <div
          className="pointer-events-none"
          style={{
            width: '100px',
            height: '6px',
            borderRadius: '50%',
            background: 'hsla(24, 10%, 10%, 0.05)',
            filter: 'blur(8px)',
            marginTop: '4px',
            animation: 'atelier-shadow-pulse 5s ease-in-out infinite',
          }}
        />

        {/* Robot name — thin, tracked, lowercase-feeling uppercase */}
        {robotName && (
          <div className="mt-4 text-[11px] font-medium tracking-[0.2em] uppercase text-stone-300">
            {robotName}
          </div>
        )}
      </div>

      <style>{`
        @keyframes atelier-float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        @keyframes atelier-shadow-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.85); }
        }
      `}</style>
    </div>
  );
});

ChargingBay.displayName = 'ChargingBay';
