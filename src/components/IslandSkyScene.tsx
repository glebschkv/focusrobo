/**
 * IslandSkyScene — Stunning atmospheric sky effects per biome.
 *
 * Each biome renders unique sky-only phenomena (light shafts, auroras,
 * bokeh, nebulae, shimmer bands) — NO landscape/terrain silhouettes.
 * The floating island sits in pure sky.
 *
 * All animations are CSS-only. The component is React.memo'd.
 */

import React from 'react';
import type { IslandTheme } from '@/data/IslandThemes';

interface IslandSkySceneProps {
  themeId: string;
  theme: IslandTheme;
}

/** Shared SVG filter definitions used across biomes */
function SharedFilters() {
  return (
    <svg style={{ position: 'absolute', width: 0, height: 0 }} aria-hidden="true">
      <defs>
        <filter id="sky-blur-far" x="-5%" y="-5%" width="110%" height="110%">
          <feGaussianBlur stdDeviation="2.5" />
        </filter>
        <filter id="sky-blur-mid" x="-3%" y="-3%" width="106%" height="106%">
          <feGaussianBlur stdDeviation="1.2" />
        </filter>
        <filter id="sky-blur-near" x="-2%" y="-2%" width="104%" height="104%">
          <feGaussianBlur stdDeviation="0.4" />
        </filter>
        <filter id="sky-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="4" />
        </filter>
        <filter id="desert-shimmer" x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence
            type="turbulence"
            baseFrequency="0.015 0.025"
            numOctaves="2"
            seed="3"
            result="turbulence"
          >
            <animate
              attributeName="baseFrequency"
              values="0.015 0.025;0.018 0.03;0.012 0.022;0.015 0.025"
              dur="8s"
              repeatCount="indefinite"
            />
          </feTurbulence>
          <feDisplacementMap
            in="SourceGraphic"
            in2="turbulence"
            scale="3"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
        <filter id="sky-soft-glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="8" />
        </filter>
      </defs>
    </svg>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MEADOW — Dreamy Light Cathedral
// ═══════════════════════════════════════════════════════════════════════════

function MeadowScene({ theme }: { theme: IslandTheme }) {
  const [tint1, tint2, tint3] = theme.skyScene.landscapeColors;
  return (
    <div className="sky-scene sky-scene--meadow">
      <SharedFilters />

      {/* Expanded golden horizon haze — warm radial gradient across bottom 40% */}
      <div
        className="sky-scene__atmo-glow"
        style={{
          background: `radial-gradient(ellipse 140% 70% at 65% 100%, rgba(255,240,180,0.3) 0%, rgba(255,230,150,0.18) 30%, rgba(255,248,220,0.08) 55%, transparent 80%)`,
          bottom: 0,
          height: '55%',
        }}
      />

      {/* Atmospheric depth band — warm-to-cool gradient across bottom third */}
      <div
        className="sky-scene__depth-band"
        style={{
          position: 'absolute',
          bottom: 0,
          left: '-5%',
          right: '-5%',
          height: '35%',
          background: `linear-gradient(to top, rgba(255,248,230,0.15) 0%, rgba(200,230,180,0.06) 40%, transparent 100%)`,
          pointerEvents: 'none',
        }}
      />

      {/* Volumetric light shafts from sun direction */}
      <div className="sky-scene__light-shaft sky-scene__light-shaft--1" />
      <div className="sky-scene__light-shaft sky-scene__light-shaft--2" />
      <div className="sky-scene__light-shaft sky-scene__light-shaft--3" />
      <div className="sky-scene__light-shaft sky-scene__light-shaft--4" />

      {/* Lens flare bokeh dots */}
      {[
        { left: '18%', top: '35%', size: 28, opacity: 0.08, delay: 0 },
        { left: '72%', top: '55%', size: 22, opacity: 0.06, delay: 2 },
        { left: '45%', top: '25%', size: 18, opacity: 0.07, delay: 4 },
        { left: '85%', top: '42%', size: 14, opacity: 0.05, delay: 1 },
      ].map((dot, i) => (
        <div
          key={`lens-${i}`}
          className="sky-scene__lens-dot"
          style={{
            left: dot.left,
            top: dot.top,
            width: `${dot.size}px`,
            height: `${dot.size}px`,
            opacity: dot.opacity,
            animationDelay: `${dot.delay}s`,
            background: `radial-gradient(circle, rgba(255,250,200,0.6) 0%, rgba(255,240,170,0.2) 40%, transparent 70%)`,
          }}
        />
      ))}

      {/* Subtle warm color wash bands */}
      <div
        className="sky-scene__color-wash"
        style={{
          position: 'absolute',
          bottom: '10%',
          left: '-10%',
          right: '-10%',
          height: '25%',
          background: `linear-gradient(135deg, transparent 20%, rgba(255,220,150,0.06) 40%, rgba(200,235,170,0.04) 60%, transparent 80%)`,
          pointerEvents: 'none',
        }}
      />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// BEACH — Tropical Light Show
// ═══════════════════════════════════════════════════════════════════════════

function BeachScene({ theme }: { theme: IslandTheme }) {
  const [tint1, tint2, tint3] = theme.skyScene.landscapeColors;
  return (
    <div className="sky-scene sky-scene--beach">
      <SharedFilters />

      {/* Horizon light band — warm peach/orange glow (simulates ocean reflection without water) */}
      <div
        className="sky-scene__atmo-glow"
        style={{
          background: `radial-gradient(ellipse 150% 60% at 55% 100%, rgba(255,200,140,0.35) 0%, rgba(255,180,120,0.18) 30%, rgba(255,220,180,0.08) 55%, transparent 80%)`,
          bottom: 0,
          height: '50%',
        }}
      />

      {/* Sun pillar — vertical light column */}
      <div className="sky-scene__sun-pillar" />

      {/* Iridescent cloud wisps — thin prismatic gradient bands */}
      <div className="sky-scene__iridescent-wisp sky-scene__iridescent-wisp--1" />
      <div className="sky-scene__iridescent-wisp sky-scene__iridescent-wisp--2" />
      <div className="sky-scene__iridescent-wisp sky-scene__iridescent-wisp--3" />

      {/* Light sparkle field — tiny refracting dots */}
      {Array.from({ length: 10 }, (_, i) => (
        <div
          key={`sparkle-${i}`}
          className="sky-scene__sparkle-dot"
          style={{
            left: `${8 + (i * 31 + 13) % 84}%`,
            top: `${35 + (i * 23 + 7) % 50}%`,
            animationDuration: `${2 + (i * 0.6) % 3}s`,
            animationDelay: `${(i * 0.7) % 4}s`,
            width: `${2 + (i % 2)}px`,
            height: `${2 + (i % 2)}px`,
          }}
        />
      ))}

      {/* Warm color wash at bottom */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: '-10%',
          right: '-10%',
          height: '30%',
          background: `linear-gradient(to top, rgba(255,220,180,0.12) 0%, rgba(200,230,255,0.04) 50%, transparent 100%)`,
          pointerEvents: 'none',
        }}
      />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// WINTER — Aurora & Diamond Dust
// ═══════════════════════════════════════════════════════════════════════════

function WinterScene({ theme }: { theme: IslandTheme }) {
  const [tint1, tint2, tint3] = theme.skyScene.landscapeColors;
  return (
    <div className="sky-scene sky-scene--winter">
      <SharedFilters />

      {/* Cold atmospheric glow at horizon */}
      <div
        className="sky-scene__atmo-glow"
        style={{
          background: `radial-gradient(ellipse 130% 55% at 50% 100%, rgba(140,200,255,0.2) 0%, rgba(100,170,240,0.1) 35%, rgba(80,120,200,0.04) 55%, transparent 75%)`,
          bottom: 0,
          height: '50%',
        }}
      />

      {/* Aurora curtain SVGs in lower sky — sweeping gradient paths */}
      <svg
        className="sky-scene__aurora-curtain"
        viewBox="0 0 800 400"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="aurora-grad-1" x1="0" y1="0" x2="1" y2="0.3">
            <stop offset="0%" stopColor="rgba(40,200,120,0)" />
            <stop offset="20%" stopColor="rgba(60,220,140,0.12)" />
            <stop offset="40%" stopColor="rgba(80,180,255,0.15)" />
            <stop offset="60%" stopColor="rgba(140,120,255,0.1)" />
            <stop offset="80%" stopColor="rgba(80,200,160,0.08)" />
            <stop offset="100%" stopColor="rgba(60,180,120,0)" />
          </linearGradient>
          <linearGradient id="aurora-grad-2" x1="0.2" y1="0" x2="0.8" y2="0.4">
            <stop offset="0%" stopColor="rgba(100,140,255,0)" />
            <stop offset="30%" stopColor="rgba(80,200,180,0.1)" />
            <stop offset="50%" stopColor="rgba(60,240,160,0.14)" />
            <stop offset="70%" stopColor="rgba(120,160,255,0.08)" />
            <stop offset="100%" stopColor="rgba(80,180,200,0)" />
          </linearGradient>
          <linearGradient id="aurora-grad-3" x1="0.1" y1="0.1" x2="0.9" y2="0.3">
            <stop offset="0%" stopColor="rgba(160,100,255,0)" />
            <stop offset="25%" stopColor="rgba(100,220,200,0.08)" />
            <stop offset="50%" stopColor="rgba(80,255,180,0.12)" />
            <stop offset="75%" stopColor="rgba(140,180,255,0.06)" />
            <stop offset="100%" stopColor="rgba(120,160,220,0)" />
          </linearGradient>
        </defs>
        {/* Aurora band 1 — wide sweeping curtain */}
        <path
          className="sky-scene__aurora-path sky-scene__aurora-path--1"
          d="M-50,280 Q100,200 200,240 Q300,180 400,220 Q500,160 600,200 Q700,180 850,250 L850,320 Q700,250 600,280 Q500,230 400,270 Q300,240 200,290 Q100,260 -50,320 Z"
          fill="url(#aurora-grad-1)"
        />
        {/* Aurora band 2 — narrower, offset */}
        <path
          className="sky-scene__aurora-path sky-scene__aurora-path--2"
          d="M-50,240 Q150,170 250,210 Q350,150 450,190 Q550,140 650,180 Q750,160 850,210 L850,270 Q750,220 650,250 Q550,200 450,240 Q350,200 250,260 Q150,220 -50,300 Z"
          fill="url(#aurora-grad-2)"
        />
        {/* Aurora band 3 — highest, most subtle */}
        <path
          className="sky-scene__aurora-path sky-scene__aurora-path--3"
          d="M-50,200 Q120,140 220,180 Q320,120 420,160 Q520,110 620,150 Q720,130 850,170 L850,230 Q720,190 620,220 Q520,170 420,210 Q320,170 220,230 Q120,190 -50,260 Z"
          fill="url(#aurora-grad-3)"
        />
      </svg>

      {/* Diamond dust sparkle field */}
      {Array.from({ length: 18 }, (_, i) => (
        <div
          key={`diamond-${i}`}
          className="sky-scene__diamond-dust"
          style={{
            left: `${5 + (i * 29 + 11) % 90}%`,
            top: `${10 + (i * 23 + 5) % 75}%`,
            animationDuration: `${2 + (i * 0.4) % 3}s`,
            animationDelay: `${(i * 0.6) % 5}s`,
            width: `${2 + (i % 3)}px`,
            height: `${2 + (i % 3)}px`,
          }}
        />
      ))}

      {/* Ice crystal halos — parhelia near sun */}
      <svg
        className="sky-scene__parhelia"
        viewBox="0 0 200 200"
        aria-hidden="true"
      >
        <circle cx="100" cy="100" r="60" fill="none" stroke="rgba(200,230,255,0.06)" strokeWidth="1.5" strokeDasharray="4,8" />
        <circle cx="100" cy="100" r="80" fill="none" stroke="rgba(180,210,240,0.04)" strokeWidth="1" strokeDasharray="3,12" />
      </svg>

      {/* Nacreous (polar stratospheric) cloud — iridescent pastel patch */}
      <div className="sky-scene__nacreous-cloud sky-scene__nacreous-cloud--1" />
      <div className="sky-scene__nacreous-cloud sky-scene__nacreous-cloud--2" />

      {/* Ice crystal sparkles (repositioned into open sky) */}
      <div className="sky-scene__ice-crystal sky-scene__ice-crystal--1" />
      <div className="sky-scene__ice-crystal sky-scene__ice-crystal--2" />
      <div className="sky-scene__ice-crystal sky-scene__ice-crystal--3" />

      {/* Mist layer (repositioned lower) */}
      <div className="sky-scene__mist" />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// DESERT — Mirages & Celestial Dust
// ═══════════════════════════════════════════════════════════════════════════

function DesertScene({ theme }: { theme: IslandTheme }) {
  const [tint1, tint2, tint3] = theme.skyScene.landscapeColors;
  return (
    <div className="sky-scene sky-scene--desert">
      <SharedFilters />

      {/* Massive sun corona — expanded radial gradient covering 50% of sky */}
      <div
        className="sky-scene__atmo-glow"
        style={{
          background: `radial-gradient(ellipse 120% 80% at 65% 15%, rgba(255,240,180,0.25) 0%, rgba(255,220,140,0.15) 25%, rgba(255,200,100,0.08) 45%, transparent 70%)`,
          top: 0,
          height: '70%',
        }}
      />

      {/* Horizon mirage glow */}
      <div
        className="sky-scene__atmo-glow"
        style={{
          background: `radial-gradient(ellipse 160% 50% at 50% 100%, rgba(255,210,130,0.35) 0%, rgba(255,200,120,0.18) 30%, rgba(255,230,170,0.06) 60%, transparent 85%)`,
          bottom: 0,
          height: '45%',
        }}
      />

      {/* Heat shimmer bands at different heights */}
      <div className="sky-scene__heat-band sky-scene__heat-band--1" />
      <div className="sky-scene__heat-band sky-scene__heat-band--2" />
      <div className="sky-scene__heat-band sky-scene__heat-band--3" />

      {/* Dust veil — sandy gradient across bottom */}
      <div className="sky-scene__dust-veil" />

      {/* Sun dogs (parhelia) — bright spots flanking the sun */}
      <div className="sky-scene__sun-dog sky-scene__sun-dog--left" />
      <div className="sky-scene__sun-dog sky-scene__sun-dog--right" />

      {/* Horizon mirage band — shimmering ribbon */}
      <div className="sky-scene__mirage-band" />

      {/* Blowing sand/dust particles (repositioned across full sky) */}
      {Array.from({ length: 12 }, (_, i) => (
        <div
          key={`sand-${i}`}
          className="sky-scene__sand-particle"
          style={{
            top: `${30 + (i * 17) % 55}%`,
            left: `${(i * 37 + 5) % 105}%`,
            animationDuration: `${3 + (i * 0.7) % 4}s`,
            animationDelay: `${(i * 0.4) % 5}s`,
            opacity: 0.15 + (i % 4) * 0.08,
          }}
        />
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// NIGHT — Deep Space Cathedral
// ═══════════════════════════════════════════════════════════════════════════

function NightScene({ theme }: { theme: IslandTheme }) {
  const [tint1, tint2, tint3] = theme.skyScene.landscapeColors;
  return (
    <div className="sky-scene sky-scene--night">
      <SharedFilters />

      {/* Milky Way band */}
      <div className="sky-scene__milky-way" />

      {/* Nebula patches — existing + additional lower-sky patches */}
      <div className="sky-scene__nebula sky-scene__nebula--1" />
      <div className="sky-scene__nebula sky-scene__nebula--2" />
      <div className="sky-scene__nebula sky-scene__nebula--3" />
      <div className="sky-scene__nebula sky-scene__nebula--4" />
      <div className="sky-scene__nebula sky-scene__nebula--5" />

      {/* Constellation lines */}
      <svg
        className="sky-scene__constellations"
        viewBox="0 0 400 200"
        preserveAspectRatio="xMidYMid meet"
        aria-hidden="true"
      >
        {/* Constellation 1 — triangle */}
        <line x1="65" y1="30" x2="85" y2="22" stroke="rgba(200,210,255,0.08)" strokeWidth="0.5" strokeDasharray="2,3" />
        <line x1="85" y1="22" x2="78" y2="45" stroke="rgba(200,210,255,0.08)" strokeWidth="0.5" strokeDasharray="2,3" />
        <line x1="78" y1="45" x2="65" y2="30" stroke="rgba(200,210,255,0.08)" strokeWidth="0.5" strokeDasharray="2,3" />
        {/* Constellation 2 — zigzag */}
        <line x1="200" y1="40" x2="215" y2="25" stroke="rgba(200,210,255,0.07)" strokeWidth="0.5" strokeDasharray="2,3" />
        <line x1="215" y1="25" x2="230" y2="38" stroke="rgba(200,210,255,0.07)" strokeWidth="0.5" strokeDasharray="2,3" />
        <line x1="230" y1="38" x2="248" y2="30" stroke="rgba(200,210,255,0.07)" strokeWidth="0.5" strokeDasharray="2,3" />
        {/* Constellation 3 — diamond */}
        <line x1="320" y1="50" x2="335" y2="35" stroke="rgba(200,210,255,0.06)" strokeWidth="0.5" strokeDasharray="2,3" />
        <line x1="335" y1="35" x2="350" y2="50" stroke="rgba(200,210,255,0.06)" strokeWidth="0.5" strokeDasharray="2,3" />
        <line x1="350" y1="50" x2="335" y2="65" stroke="rgba(200,210,255,0.06)" strokeWidth="0.5" strokeDasharray="2,3" />
        <line x1="335" y1="65" x2="320" y2="50" stroke="rgba(200,210,255,0.06)" strokeWidth="0.5" strokeDasharray="2,3" />
        {/* Constellation 4 — lower sky arc */}
        <line x1="140" y1="130" x2="160" y2="118" stroke="rgba(200,210,255,0.06)" strokeWidth="0.5" strokeDasharray="2,3" />
        <line x1="160" y1="118" x2="182" y2="125" stroke="rgba(200,210,255,0.06)" strokeWidth="0.5" strokeDasharray="2,3" />
        <line x1="182" y1="125" x2="195" y2="140" stroke="rgba(200,210,255,0.06)" strokeWidth="0.5" strokeDasharray="2,3" />
        {/* Star points at constellation vertices */}
        {[[65,30],[85,22],[78,45],[200,40],[215,25],[230,38],[248,30],[320,50],[335,35],[350,50],[335,65],[140,130],[160,118],[182,125],[195,140]].map(([cx,cy], i) => (
          <circle key={`star-${i}`} cx={cx} cy={cy} r="1" fill="rgba(220,230,255,0.4)" />
        ))}
      </svg>

      {/* Moonlight cone */}
      <div className="sky-scene__moonlight-cone" />

      {/* Zodiacal light — faint triangular gradient from horizon */}
      <div className="sky-scene__zodiacal-light" />

      {/* Airglow band — subtle green/yellow horizontal band */}
      <div className="sky-scene__airglow" />

      {/* Moon halo */}
      <svg
        className="sky-scene__moon-halo"
        viewBox="0 0 200 200"
        aria-hidden="true"
      >
        <circle cx="100" cy="100" r="70" fill="none" stroke="rgba(180,200,255,0.05)" strokeWidth="2" />
        <circle cx="100" cy="100" r="72" fill="none" stroke="rgba(160,180,240,0.03)" strokeWidth="4" />
      </svg>

      {/* Extended firefly field — fills the entire sky */}
      <div className="sky-scene__firefly-field">
        {Array.from({ length: 28 }, (_, i) => (
          <div
            key={`ff-${i}`}
            className="sky-scene__firefly"
            style={{
              left: `${(i * 29 + 8) % 92}%`,
              top: `${8 + (i * 19) % 82}%`,
              animationDuration: `${2 + (i * 0.5) % 3}s`,
              animationDelay: `${(i * 0.8) % 5}s`,
              width: `${2 + (i % 3)}px`,
              height: `${2 + (i % 3)}px`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SAKURA — Ethereal Blossom Sky
// ═══════════════════════════════════════════════════════════════════════════

function SakuraScene({ theme }: { theme: IslandTheme }) {
  const [tint1, tint2, tint3] = theme.skyScene.landscapeColors;
  return (
    <div className="sky-scene sky-scene--sakura">
      <SharedFilters />

      {/* Warm pink atmospheric glow */}
      <div
        className="sky-scene__atmo-glow"
        style={{
          background: `radial-gradient(ellipse 140% 65% at 55% 100%, rgba(255,180,200,0.3) 0%, rgba(255,160,180,0.15) 30%, rgba(255,200,220,0.06) 55%, transparent 80%)`,
          bottom: 0,
          height: '55%',
        }}
      />

      {/* Pink glow bands — dreamy horizontal rose/gold bands */}
      <div className="sky-scene__pink-glow-band sky-scene__pink-glow-band--1" />
      <div className="sky-scene__pink-glow-band sky-scene__pink-glow-band--2" />
      <div className="sky-scene__pink-glow-band sky-scene__pink-glow-band--3" />

      {/* Lens bokeh — large soft pink/white circles */}
      {[
        { left: '12%', top: '40%', size: 36, opacity: 0.06, delay: 0 },
        { left: '55%', top: '60%', size: 28, opacity: 0.05, delay: 2.5 },
        { left: '78%', top: '30%', size: 32, opacity: 0.04, delay: 1 },
        { left: '35%', top: '20%', size: 24, opacity: 0.05, delay: 3.5 },
        { left: '88%', top: '55%', size: 20, opacity: 0.04, delay: 4 },
        { left: '25%', top: '65%', size: 26, opacity: 0.05, delay: 1.5 },
      ].map((orb, i) => (
        <div
          key={`bokeh-${i}`}
          className="sky-scene__bokeh-orb"
          style={{
            left: orb.left,
            top: orb.top,
            width: `${orb.size}px`,
            height: `${orb.size}px`,
            opacity: orb.opacity,
            animationDelay: `${orb.delay}s`,
            background: `radial-gradient(circle, rgba(255,200,220,0.5) 0%, rgba(255,180,200,0.2) 40%, transparent 70%)`,
          }}
        />
      ))}

      {/* Floating petal vortex — loose spiral of petals */}
      <div className="sky-scene__petal-vortex">
        {Array.from({ length: 8 }, (_, i) => {
          const angle = (i / 8) * 360;
          const radius = 20 + (i % 3) * 12;
          return (
            <div
              key={`petal-v-${i}`}
              className="sky-scene__vortex-petal"
              style={{
                transform: `rotate(${angle}deg) translateY(-${radius}px)`,
                animationDelay: `${i * 0.3}s`,
                opacity: 0.15 + (i % 3) * 0.05,
              }}
            />
          );
        })}
      </div>

      {/* Light prismatic bands — faint diagonal rainbow strips */}
      <div className="sky-scene__prismatic-band sky-scene__prismatic-band--1" />
      <div className="sky-scene__prismatic-band sky-scene__prismatic-band--2" />

      {/* Blossom glow lanterns — floating pink orbs */}
      {[
        { left: '20%', top: '65%', size: 8, delay: 0 },
        { left: '70%', top: '58%', size: 6, delay: 1.5 },
        { left: '45%', top: '72%', size: 7, delay: 3 },
        { left: '85%', top: '68%', size: 5, delay: 2 },
      ].map((lantern, i) => (
        <div
          key={`lantern-${i}`}
          className="sky-scene__blossom-lantern"
          style={{
            left: lantern.left,
            top: lantern.top,
            width: `${lantern.size}px`,
            height: `${lantern.size}px`,
            animationDelay: `${lantern.delay}s`,
          }}
        />
      ))}

      {/* Wisteria vines framing top (kept from original) */}
      <div className="sky-scene__wisteria">
        <div className="sky-scene__vine sky-scene__vine--1" />
        <div className="sky-scene__vine sky-scene__vine--2" />
        <div className="sky-scene__vine sky-scene__vine--3" />
      </div>

      {/* Cherry branch framing top-right (kept from original) */}
      <svg className="sky-scene__branch" viewBox="0 0 80 60" aria-hidden="true">
        <path d="M80,0 Q60,8 45,15 Q30,22 20,35 Q15,42 18,48" fill="none" stroke="rgba(120,70,80,0.15)" strokeWidth="2" strokeLinecap="round" />
        <path d="M65,10 Q55,5 50,12" fill="none" stroke="rgba(120,70,80,0.1)" strokeWidth="1.2" />
        <path d="M42,18 Q32,14 28,20" fill="none" stroke="rgba(120,70,80,0.1)" strokeWidth="1" />
        <circle cx="62" cy="9" r="3" fill="rgba(255,180,200,0.3)" />
        <circle cx="48" cy="14" r="2.5" fill="rgba(255,160,190,0.25)" />
        <circle cx="35" cy="20" r="3" fill="rgba(255,180,200,0.28)" />
        <circle cx="24" cy="30" r="2.5" fill="rgba(255,170,195,0.25)" />
        <circle cx="20" cy="42" r="2" fill="rgba(255,160,190,0.2)" />
      </svg>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Main component — dispatches to biome-specific scene
// ═══════════════════════════════════════════════════════════════════════════

export const IslandSkyScene = React.memo(function IslandSkyScene({
  themeId,
  theme,
}: IslandSkySceneProps) {
  switch (themeId) {
    case 'day':
      return <MeadowScene theme={theme} />;
    case 'beach':
      return <BeachScene theme={theme} />;
    case 'winter':
      return <WinterScene theme={theme} />;
    case 'desert':
      return <DesertScene theme={theme} />;
    case 'night':
      return <NightScene theme={theme} />;
    case 'sakura':
      return <SakuraScene theme={theme} />;
    default:
      return <MeadowScene theme={theme} />;
  }
});
