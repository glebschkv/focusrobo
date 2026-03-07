import { useEffect, useState } from 'react';

/**
 * Branded splash/loading screen.
 * Sky gradient with floating island silhouette, baby pet parade,
 * and a rocking egg loading indicator.
 */

const SPLASH_PETS = [
  { id: 'bunny', src: '/assets/pets/bunny-baby.png', delay: 0 },
  { id: 'chick', src: '/assets/pets/chick-baby.png', delay: 0.3 },
  { id: 'cat', src: '/assets/pets/cat-baby.png', delay: 0.6 },
  { id: 'frog', src: '/assets/pets/frog-baby.png', delay: 0.9 },
  { id: 'capybara', src: '/assets/pets/capybara-baby.png', delay: 1.2 },
];

export const SplashScreen = () => {
  const [entered, setEntered] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setEntered(true));

    // Simulate loading progress — mark as loaded when content ready
    const timer = setTimeout(() => setLoaded(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #6BB8E0 0%, #A5D8EF 35%, #D0EAF5 65%, #EEF4F0 100%)',
        fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Inter', sans-serif",
      }}
    >
      {/* Sun glow — upper right */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: '8%',
          right: '12%',
          width: 24,
          height: 24,
          borderRadius: '50%',
          background: 'radial-gradient(circle, #FFFFFF 0%, #FFFDE7 20%, #FFF3C4 40%, rgba(255,224,130,0.4) 65%, transparent 100%)',
          boxShadow: '0 0 12px 4px rgba(255,250,230,0.8), 0 0 30px 12px rgba(255,220,100,0.3), 0 0 60px 24px rgba(255,200,80,0.12)',
          animation: 'splash-sun-breathe 5s ease-in-out infinite',
        }}
      />

      {/* Clouds */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: '14%',
          left: '8%',
          width: 80,
          height: 24,
          borderRadius: 40,
          background: 'rgba(255,255,255,0.65)',
          filter: 'blur(1px)',
          animation: 'cloud-drift-splash 8s ease-in-out infinite alternate',
        }}
      />
      <div
        className="absolute pointer-events-none"
        style={{
          top: '22%',
          right: '15%',
          width: 56,
          height: 18,
          borderRadius: 30,
          background: 'rgba(255,255,255,0.5)',
          filter: 'blur(1px)',
          animation: 'cloud-drift-splash 10s ease-in-out infinite alternate-reverse',
        }}
      />
      <div
        className="absolute pointer-events-none"
        style={{
          top: '10%',
          left: '45%',
          width: 44,
          height: 14,
          borderRadius: 20,
          background: 'rgba(255,255,255,0.4)',
          filter: 'blur(0.5px)',
          animation: 'cloud-drift-splash 12s ease-in-out infinite alternate',
        }}
      />

      {/* Content wrapper with entrance animation */}
      <div
        className="flex flex-col items-center relative z-10 transition-all duration-700 ease-out"
        style={{
          opacity: entered ? 1 : 0,
          transform: entered ? 'translateY(0)' : 'translateY(20px)',
        }}
      >
        {/* Island silhouette with pets */}
        <div
          className="relative mb-8"
          style={{ animation: entered ? 'island-rise 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) both' : 'none' }}
        >
          {/* Inline SVG island — simplified diamond with cliff */}
          <svg
            width="160"
            height="110"
            viewBox="0 0 160 110"
            fill="none"
            className="drop-shadow-lg"
          >
            {/* Grass diamond top surface */}
            <polygon
              points="80,8 152,48 80,88 8,48"
              fill="#7CB97A"
            />
            {/* Lighter checkerboard hint */}
            <polygon
              points="80,28 116,48 80,68 44,48"
              fill="#8AC888"
              opacity="0.5"
            />
            {/* Left cliff face */}
            <polygon
              points="8,48 80,88 80,108 8,68"
              fill="#8B6B4A"
            />
            {/* Right cliff face */}
            <polygon
              points="152,48 80,88 80,108 152,68"
              fill="#A0805C"
            />
            {/* Grass overhang — left edge */}
            <path
              d="M8,48 L80,88 L80,90 L6,49 Z"
              fill="#6DAF6B"
              opacity="0.6"
            />
            {/* Grass overhang — right edge */}
            <path
              d="M152,48 L80,88 L80,90 L154,49 Z"
              fill="#6DAF6B"
              opacity="0.4"
            />
          </svg>

          {/* Baby pets bobbing on the island */}
          <div className="absolute inset-0">
            {SPLASH_PETS.map((pet, i) => {
              // Position pets across the island surface
              const positions = [
                { left: '28%', top: '8%' },
                { left: '52%', top: '18%' },
                { left: '38%', top: '30%' },
                { left: '62%', top: '10%' },
                { left: '48%', top: '38%' },
              ];
              const pos = positions[i];
              return (
                <img
                  key={pet.id}
                  src={pet.src}
                  alt=""
                  width={28}
                  height={28}
                  className="absolute"
                  style={{
                    left: pos.left,
                    top: pos.top,
                    imageRendering: 'pixelated',
                    transform: 'translate(-50%, -60%)',
                    animation: `gentle-float 3s ease-in-out infinite ${pet.delay}s`,
                    filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.15))',
                  }}
                />
              );
            })}
          </div>

          {/* Soft shadow beneath island */}
          <div
            className="absolute left-1/2 -translate-x-1/2"
            style={{
              bottom: -8,
              width: 100,
              height: 12,
              borderRadius: '50%',
              background: 'radial-gradient(ellipse, rgba(0,0,0,0.08) 0%, transparent 70%)',
            }}
          />
        </div>

        {/* App name */}
        <h1
          className="text-2xl font-bold tracking-wide mb-1"
          style={{ color: '#1C211E' }}
        >
          PhoNo
        </h1>

        {/* Tagline */}
        <p
          className="text-[11px] font-medium tracking-[3px] uppercase mb-10"
          style={{ color: 'rgba(28, 33, 30, 0.45)' }}
        >
          Focus &middot; Grow &middot; Collect
        </p>

        {/* Egg loading indicator */}
        <div className="flex flex-col items-center">
          <div
            style={{
              animation: loaded
                ? 'egg-crack 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards'
                : 'egg-rock 1.5s ease-in-out infinite',
            }}
          >
            {/* CSS egg shape */}
            <div
              style={{
                width: 20,
                height: 26,
                background: 'linear-gradient(180deg, #E8F5E1 0%, #C5DFB8 40%, #A8C99B 100%)',
                borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
                boxShadow: '0 2px 6px rgba(64,133,106,0.2), inset 0 -2px 4px rgba(0,0,0,0.06)',
                border: '1px solid rgba(64,133,106,0.15)',
              }}
            >
              {/* Speckle dots */}
              <div
                className="absolute"
                style={{
                  width: 2,
                  height: 2,
                  borderRadius: '50%',
                  background: 'rgba(64,133,106,0.25)',
                  top: 8,
                  left: 6,
                }}
              />
              <div
                className="absolute"
                style={{
                  width: 1.5,
                  height: 1.5,
                  borderRadius: '50%',
                  background: 'rgba(64,133,106,0.2)',
                  top: 12,
                  left: 11,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes splash-sun-breathe {
          0%, 100% {
            box-shadow:
              0 0 12px 4px rgba(255,250,230,0.8),
              0 0 30px 12px rgba(255,220,100,0.3),
              0 0 60px 24px rgba(255,200,80,0.12);
          }
          50% {
            box-shadow:
              0 0 16px 6px rgba(255,250,230,0.9),
              0 0 36px 16px rgba(255,220,100,0.35),
              0 0 72px 30px rgba(255,200,80,0.15);
          }
        }
      `}</style>
    </div>
  );
};
