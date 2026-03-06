import { memo, useMemo } from 'react';

// ============================================================================
// FOREST BACKGROUND — "Enchanted Woodland"
// Canopy leaf shadows, falling leaves, bioluminescent mushrooms, deer
// silhouette, creek glints, enhanced god rays with dust motes,
// improved tree silhouettes
// ============================================================================
export const ForestBackground = memo(() => {
  // Fireflies
  const fireflies = useMemo(() =>
    Array.from({ length: 12 }, (_, i) => ({
      top: `${40 + (i * 7) % 30}%`,
      left: `${3 + (i * 17) % 94}%`,
      delay: `${(i * 0.9) % 5}s`,
      duration: `${3 + (i % 3)}s`,
    })), []
  );

  // Falling leaves
  const leaves = useMemo(() =>
    Array.from({ length: 8 }, (_, i) => ({
      left: `${5 + (i * 23) % 90}%`,
      drift: `${-30 + (i % 4) * 15}px`,
      duration: `${18 + (i % 5) * 3}s`,
      delay: `${(i * 2.5) % 15}s`,
      color: ['hsl(25 60% 45%)', 'hsl(35 55% 50%)', 'hsl(80 40% 45%)', 'hsl(45 50% 48%)'][i % 4],
    })), []
  );

  // Canopy shadows
  const canopyShadows = useMemo(() =>
    Array.from({ length: 6 }, (_, i) => ({
      top: `${25 + (i * 13) % 30}%`,
      left: `${5 + (i * 19) % 80}%`,
      width: `${40 + (i % 3) * 15}px`,
      height: `${25 + (i % 4) * 10}px`,
      driftX: `${-3 + (i % 3) * 3}px`,
      driftY: `${-2 + (i % 2) * 4}px`,
      delay: `${i * 2.5}s`,
    })), []
  );

  // Creek glint spots
  const creekGlints = useMemo(() =>
    Array.from({ length: 7 }, (_, i) => ({
      left: `${8 + i * 13}%`,
      duration: `${5 + (i % 3) * 2}s`,
      delay: `${i * 0.8}s`,
    })), []
  );

  // God ray dust motes
  const dustMotes = useMemo(() =>
    Array.from({ length: 8 }, (_, i) => ({
      top: `${10 + (i * 13) % 45}%`,
      left: `${20 + (i * 11) % 50}%`,
      delay: `${(i * 1.7) % 10}s`,
      duration: `${12 + (i % 4) * 3}s`,
    })), []
  );

  return (
    <div className="fixed inset-0 overflow-hidden focus-bg-transition">
      {/* Forest sky gradient — filtered through canopy */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            linear-gradient(180deg,
              hsl(175 45% 72%) 0%,
              hsl(165 50% 68%) 25%,
              hsl(155 45% 62%) 50%,
              hsl(145 40% 55%) 75%,
              hsl(140 38% 48%) 100%
            )
          `
        }}
      />

      {/* God rays / dappled light — wider, enhanced */}
      <div
        className="absolute top-0 left-[20%] w-44 h-[70%] opacity-25 animate-ray-sway pointer-events-none"
        style={{
          background: 'linear-gradient(180deg, hsl(50 70% 90%) 0%, transparent 100%)',
          clipPath: 'polygon(30% 0%, 70% 0%, 100% 100%, 0% 100%)',
          filter: 'blur(8px)'
        }}
      />
      <div
        className="absolute top-0 right-[25%] w-36 h-[60%] opacity-20 animate-ray-sway pointer-events-none"
        style={{
          background: 'linear-gradient(180deg, hsl(50 65% 88%) 0%, transparent 100%)',
          clipPath: 'polygon(25% 0%, 75% 0%, 100% 100%, 0% 100%)',
          filter: 'blur(10px)',
          animationDelay: '-2s'
        }}
      />
      <div
        className="absolute top-0 left-[55%] w-32 h-[55%] opacity-[0.18] animate-ray-sway pointer-events-none"
        style={{
          background: 'linear-gradient(180deg, hsl(55 60% 85%) 0%, transparent 100%)',
          clipPath: 'polygon(25% 0%, 75% 0%, 100% 100%, 0% 100%)',
          filter: 'blur(12px)',
          animationDelay: '-4s'
        }}
      />
      <div
        className="absolute top-0 left-[40%] w-24 h-[45%] opacity-[0.15] animate-ray-sway pointer-events-none"
        style={{
          background: 'linear-gradient(180deg, hsl(50 60% 88%) 0%, transparent 100%)',
          clipPath: 'polygon(30% 0%, 70% 0%, 100% 100%, 0% 100%)',
          filter: 'blur(14px)',
          animationDelay: '-6s'
        }}
      />
      <div
        className="absolute top-0 right-[10%] w-28 h-[50%] opacity-[0.12] animate-ray-sway pointer-events-none"
        style={{
          background: 'linear-gradient(180deg, hsl(55 55% 86%) 0%, transparent 100%)',
          clipPath: 'polygon(28% 0%, 72% 0%, 100% 100%, 0% 100%)',
          filter: 'blur(15px)',
          animationDelay: '-8s'
        }}
      />

      {/* Dust motes floating in god rays */}
      {dustMotes.map((mote, i) => (
        <div
          key={i}
          className="absolute w-[1px] h-[1px] rounded-full animate-pollen-float pointer-events-none"
          style={{
            top: mote.top,
            left: mote.left,
            backgroundColor: 'hsl(50 60% 90% / 0.7)',
            boxShadow: '0 0 3px hsl(50 60% 90% / 0.5)',
            ['--drift' as string]: `${5 + (i % 3) * 3}px`,
            ['--pollen-duration' as string]: mote.duration,
            ['--pollen-opacity' as string]: '0.7',
            animationDelay: mote.delay,
          }}
        />
      ))}

      {/* Canopy leaf shadows */}
      {canopyShadows.map((shadow, i) => (
        <div
          key={i}
          className="absolute opacity-[0.1] animate-canopy-shadow pointer-events-none"
          style={{
            top: shadow.top,
            left: shadow.left,
            width: shadow.width,
            height: shadow.height,
            backgroundColor: 'hsl(140 40% 25%)',
            borderRadius: '40% 60% 55% 45%',
            filter: 'blur(6px)',
            ['--shadow-drift-x' as string]: shadow.driftX,
            ['--shadow-drift-y' as string]: shadow.driftY,
            animationDelay: shadow.delay,
          }}
        />
      ))}

      {/* Mist layers */}
      <div className="absolute top-[35%] left-0 right-0 h-32 bg-white/10 blur-2xl animate-mist-drift pointer-events-none" />
      <div className="absolute top-[50%] left-0 right-0 h-24 bg-white/[0.06] blur-xl animate-mist-drift pointer-events-none" style={{ animationDelay: '-5s' }} />

      {/* Falling leaves */}
      {leaves.map((leaf, i) => (
        <div
          key={i}
          className="absolute animate-leaf-tumble pointer-events-none"
          style={{
            left: leaf.left,
            top: '-5%',
            ['--leaf-drift' as string]: leaf.drift,
            ['--leaf-duration' as string]: leaf.duration,
            animationDelay: leaf.delay,
          }}
        >
          <svg width="6" height="8" viewBox="0 0 6 8">
            <path d="M3,0 Q6,2 3,8 Q0,2 3,0" fill={leaf.color} />
          </svg>
        </div>
      ))}

      {/* Fireflies */}
      {fireflies.map((fly, i) => (
        <div
          key={i}
          className="absolute w-1.5 h-1.5 rounded-full animate-firefly pointer-events-none"
          style={{
            top: fly.top,
            left: fly.left,
            backgroundColor: 'hsl(60 100% 75%)',
            boxShadow: '0 0 8px 3px hsl(60 100% 70% / 0.7), 0 0 15px 5px hsl(60 90% 65% / 0.4)',
            animationDelay: fly.delay,
            animationDuration: fly.duration,
          }}
        />
      ))}

      {/* Multi-layer forest trees — improved natural shapes */}
      <div className="absolute bottom-0 w-full h-72">
        <svg viewBox="0 0 1200 300" className="w-full h-full" preserveAspectRatio="none">
          <defs>
            <linearGradient id="forestBack" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="hsl(155 35% 48%)" stopOpacity="0.5" />
              <stop offset="100%" stopColor="hsl(155 40% 38%)" stopOpacity="0.65" />
            </linearGradient>
            <linearGradient id="forestMid" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="hsl(150 40% 40%)" stopOpacity="0.7" />
              <stop offset="100%" stopColor="hsl(150 45% 30%)" stopOpacity="0.85" />
            </linearGradient>
            <linearGradient id="forestFront" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="hsl(145 45% 32%)" stopOpacity="0.9" />
              <stop offset="100%" stopColor="hsl(145 50% 22%)" stopOpacity="1" />
            </linearGradient>
          </defs>
          {/* Back trees — rounded deciduous crowns mixed with pointed conifers */}
          <path d="M0,300 L0,180 Q30,130 60,170 Q80,100 100,140 L120,160 Q140,90 160,140 Q190,110 220,155 Q250,80 280,140 Q310,100 340,155 Q370,75 400,145 Q430,110 460,160 Q490,85 520,150 Q550,105 580,165 Q610,80 640,150 Q670,95 700,155 Q730,70 760,140 Q790,100 820,160 Q850,75 880,145 Q910,105 940,165 Q970,80 1000,150 Q1030,95 1060,160 Q1090,85 1120,150 Q1150,100 1180,165 L1200,150 L1200,300 Z" fill="url(#forestBack)" />
          {/* Mid trees */}
          <path d="M0,300 L0,200 Q25,145 50,190 Q75,120 100,175 Q125,95 150,170 Q180,130 210,195 Q240,90 270,180 Q300,120 330,195 Q360,85 390,180 Q420,130 450,200 Q480,95 510,185 Q540,120 570,195 Q600,90 630,180 Q660,130 690,200 Q720,85 750,185 Q780,120 810,200 Q840,95 870,185 Q900,130 930,200 Q960,90 990,185 Q1020,120 1050,200 Q1080,95 1110,185 Q1140,125 1170,200 L1200,185 L1200,300 Z" fill="url(#forestMid)" />
          {/* Front trees — with trunk shapes visible */}
          <path d="M0,300 L0,220 Q20,160 40,210 Q55,130 75,200 L85,250 L95,200 Q110,120 130,195 Q150,90 170,190 L180,260 L190,190 Q210,110 230,200 Q250,80 270,190 L280,260 L290,190 Q310,110 330,200 Q350,85 370,195 Q390,100 410,200 Q430,80 450,190 L460,260 L470,190 Q490,105 510,195 Q530,80 550,190 Q570,100 590,205 L600,260 L610,205 Q630,90 650,195 Q670,80 690,190 Q710,100 730,200 Q750,75 770,190 L780,260 L790,190 Q810,100 830,200 Q850,80 870,190 Q890,105 910,200 L920,260 L930,200 Q950,90 970,195 Q990,80 1010,190 Q1030,100 1050,200 L1060,260 L1070,200 Q1090,85 1110,190 Q1130,100 1150,200 Q1170,90 1190,195 L1200,200 L1200,300 Z" fill="url(#forestFront)" />

          {/* Deer silhouette between mid and front layers */}
          <g opacity="0.85">
            {/* Body */}
            <ellipse cx="850" cy="215" rx="12" ry="8" fill="hsl(145 40% 20%)" />
            {/* Neck + Head */}
            <path d="M858,215 Q863,200 860,195" stroke="hsl(145 40% 20%)" strokeWidth="3" fill="none" />
            <circle cx="860" cy="193" r="3.5" fill="hsl(145 40% 20%)" />
            {/* Legs */}
            <line x1="843" y1="222" x2="842" y2="240" stroke="hsl(145 40% 20%)" strokeWidth="1.5" />
            <line x1="848" y1="222" x2="847" y2="238" stroke="hsl(145 40% 20%)" strokeWidth="1.5" />
            <line x1="854" y1="222" x2="855" y2="238" stroke="hsl(145 40% 20%)" strokeWidth="1.5" />
            <line x1="859" y1="220" x2="860" y2="240" stroke="hsl(145 40% 20%)" strokeWidth="1.5" />
            {/* Tail */}
            <path d="M838,213 Q835,208 836,212" stroke="hsl(145 40% 20%)" strokeWidth="1.5" fill="none" />
          </g>
        </svg>
      </div>

      {/* Mushroom glow spots at tree base */}
      <div className="absolute bottom-[16%] left-[12%] w-1.5 h-1.5 rounded-full animate-mushroom-glow pointer-events-none"
        style={{ backgroundColor: 'hsl(160 80% 60%)', boxShadow: '0 0 12px 4px hsl(160 80% 60% / 0.6)' }} />
      <div className="absolute bottom-[18%] left-[35%] w-1 h-1 rounded-full animate-mushroom-glow pointer-events-none"
        style={{ backgroundColor: 'hsl(160 75% 55%)', boxShadow: '0 0 10px 3px hsl(160 75% 55% / 0.5)', animationDelay: '-1s' }} />
      <div className="absolute bottom-[15%] right-[25%] w-1.5 h-1.5 rounded-full animate-mushroom-glow pointer-events-none"
        style={{ backgroundColor: 'hsl(165 80% 58%)', boxShadow: '0 0 12px 4px hsl(165 80% 58% / 0.55)', animationDelay: '-2s' }} />
      <div className="absolute bottom-[17%] right-[10%] w-1 h-1 rounded-full animate-mushroom-glow pointer-events-none"
        style={{ backgroundColor: 'hsl(155 75% 55%)', boxShadow: '0 0 8px 3px hsl(155 75% 55% / 0.5)', animationDelay: '-0.5s' }} />

      {/* Creek glints at bottom */}
      <div className="absolute bottom-[10%] left-0 right-0 h-[3px] pointer-events-none">
        {creekGlints.map((glint, i) => (
          <div
            key={i}
            className="absolute w-[2px] h-full animate-creek-glint"
            style={{
              left: glint.left,
              backgroundColor: 'hsl(180 50% 80% / 0.6)',
              boxShadow: '0 0 3px hsl(180 50% 80% / 0.4)',
              ['--glint-duration' as string]: glint.duration,
              animationDelay: glint.delay,
            }}
          />
        ))}
      </div>

      {/* Subtle forest vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 75% 65% at 50% 50%, transparent 40%, hsl(145 40% 20% / 0.25) 100%)'
        }}
      />
    </div>
  );
});
ForestBackground.displayName = 'ForestBackground';
