import { memo, useMemo } from 'react';
import { cn } from '@/lib/utils';

interface ChargingBayProps {
  robotImage?: string;
  robotName?: string;
  isCharging?: boolean;
  glowColor?: string;
}

/**
 * ChargingBay — Premium robot exhibition with layered glow,
 * animated aura ring, floating particles, and glass reflection.
 */
export const ChargingBay = memo(({ robotImage, robotName, isCharging = false, glowColor = '#0EA5E9' }: ChargingBayProps) => {
  const auraStyle = useMemo(() => {
    if (!glowColor) return {};
    const intensity = isCharging ? '18' : '0c';
    const midIntensity = isCharging ? '10' : '06';
    return {
      background: `radial-gradient(ellipse 80% 70% at 50% 50%, ${glowColor}${intensity} 0%, ${glowColor}${midIntensity} 40%, transparent 70%)`,
    };
  }, [glowColor, isCharging]);

  return (
    <div className="relative flex items-center justify-center py-2">
      {/* Outer ambient aura — large, soft, zone-colored */}
      <div
        className="absolute w-[340px] h-[340px] rounded-full pointer-events-none transition-all duration-1000"
        style={auraStyle}
      />

      {/* Animated aura ring — pulses gently */}
      <div
        className="absolute w-56 h-56 rounded-full pointer-events-none"
        style={{
          border: `1px solid ${glowColor}15`,
          animation: 'aura-ring-pulse 4s ease-in-out infinite',
        }}
      />
      <div
        className="absolute w-72 h-72 rounded-full pointer-events-none"
        style={{
          border: `1px solid ${glowColor}0a`,
          animation: 'aura-ring-pulse 4s ease-in-out infinite 1s',
        }}
      />

      {/* Floating sparkle particles around the robot */}
      {isCharging && (
        <>
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full pointer-events-none"
              style={{
                width: `${2 + (i % 3)}px`,
                height: `${2 + (i % 3)}px`,
                background: glowColor,
                opacity: 0.4,
                left: `${35 + Math.sin(i * 1.05) * 30}%`,
                top: `${20 + Math.cos(i * 0.87) * 30}%`,
                animation: `sparkle-float ${3 + i * 0.7}s ease-in-out infinite`,
                animationDelay: `${-i * 0.5}s`,
                filter: `blur(${i % 2 === 0 ? 0 : 0.5}px)`,
              }}
            />
          ))}
        </>
      )}

      {/* Main robot container */}
      <div className="relative flex flex-col items-center">
        {/* Robot sprite — floating with enhanced shadow */}
        <div className="relative">
          {robotImage ? (
            <img
              src={robotImage}
              alt={robotName || 'Robot'}
              className={cn(
                "w-52 h-52 object-contain transition-all duration-700",
                isCharging && "scale-[1.04]"
              )}
              style={{
                animation: 'charging-bay-float 5s ease-in-out infinite',
                filter: isCharging
                  ? `drop-shadow(0 0 32px ${glowColor}30) drop-shadow(0 4px 12px ${glowColor}20)`
                  : `drop-shadow(0 4px 8px rgba(0,0,0,0.06))`,
              }}
              draggable={false}
            />
          ) : (
            <div className="w-52 h-52 rounded-3xl flex items-center justify-center text-6xl bg-gradient-to-b from-stone-50 to-stone-100 border border-stone-200/60 shadow-inner">
              <span className="opacity-30">?</span>
            </div>
          )}
        </div>

        {/* Glass-effect reflection */}
        {robotImage && (
          <div
            className="relative overflow-hidden pointer-events-none"
            style={{
              height: '48px',
              width: '208px',
              marginTop: '-6px',
              maskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, transparent 100%)',
              WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, transparent 100%)',
            }}
          >
            <img
              src={robotImage}
              alt=""
              className="w-52 h-52 object-contain"
              style={{
                transform: 'scaleY(-1)',
                filter: 'blur(1px)',
                opacity: 0.12,
              }}
              draggable={false}
              aria-hidden="true"
            />
          </div>
        )}

        {/* Platform — glass-effect elliptical pedestal */}
        <svg
          width="200"
          height="20"
          viewBox="0 0 200 20"
          fill="none"
          className="pointer-events-none"
          style={{ marginTop: robotImage ? '-10px' : '8px' }}
        >
          {/* Outer glow */}
          <ellipse
            cx="100" cy="10" rx="90" ry="8"
            fill={`${glowColor}06`}
          />
          {/* Main pedestal ring */}
          <ellipse
            cx="100" cy="10" rx="80" ry="7"
            stroke={`${glowColor}18`}
            strokeWidth="0.75"
            fill="none"
          />
          {/* Inner accent ring */}
          <ellipse
            cx="100" cy="10" rx="50" ry="4.5"
            stroke={`${glowColor}10`}
            strokeWidth="0.5"
            fill="none"
          />
          {/* Bright center line */}
          <line
            x1="40" y1="10" x2="160" y2="10"
            stroke={`${glowColor}08`}
            strokeWidth="0.3"
          />
        </svg>

        {/* Soft ground shadow */}
        <div
          className="pointer-events-none"
          style={{
            width: '120px',
            height: '8px',
            borderRadius: '50%',
            background: `radial-gradient(ellipse, hsla(24, 10%, 10%, 0.06) 0%, transparent 70%)`,
            marginTop: '2px',
            animation: 'shadow-breathe 5s ease-in-out infinite',
          }}
        />

        {/* Robot name — refined typography */}
        {robotName && (
          <div
            className="mt-3 text-[11px] font-semibold tracking-[0.2em] uppercase"
            style={{
              color: glowColor,
              opacity: 0.5,
              textShadow: `0 0 20px ${glowColor}15`,
            }}
          >
            {robotName}
          </div>
        )}
      </div>

      <style>{`
        @keyframes charging-bay-float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes aura-ring-pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.08); opacity: 0.5; }
        }
        @keyframes sparkle-float {
          0%, 100% { transform: translateY(0px) scale(1); opacity: 0; }
          15% { opacity: 0.6; }
          50% { transform: translateY(-20px) scale(1.2); opacity: 0.3; }
          85% { opacity: 0.5; }
        }
        @keyframes shadow-breathe {
          0%, 100% { opacity: 1; transform: scaleX(1); }
          50% { opacity: 0.6; transform: scaleX(0.85); }
        }
      `}</style>
    </div>
  );
});

ChargingBay.displayName = 'ChargingBay';
