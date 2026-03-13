/**
 * IslandSkyScene — Rich SVG landscape backgrounds for each archipelago biome.
 *
 * Each biome renders a unique, layered inline SVG landscape with organic
 * Bezier-path silhouettes, atmospheric effects, and CSS-driven animations.
 * Replaces the old radial-gradient-blob approach with proper depth and detail.
 *
 * All animations are CSS-only (no JS timers). The component is React.memo'd
 * since the theme rarely changes.
 */

import React from 'react';
import type { IslandTheme } from '@/data/IslandThemes';

interface IslandSkySceneProps {
  themeId: string;
  theme: IslandTheme;
}

// ═══════════════════════════════════════════════════════════════════════════
// MEADOW — Studio Ghibli pastoral rolling hills with treeline & wildflowers
// ═══════════════════════════════════════════════════════════════════════════

function MeadowScene({ theme }: { theme: IslandTheme }) {
  const [farColor, midColor, nearColor] = theme.skyScene.landscapeColors;
  return (
    <div className="sky-scene sky-scene--meadow">
      {/* Far hills — misty, blurred, blue-grey */}
      <svg
        className="sky-scene__layer sky-scene__layer--far"
        viewBox="0 0 400 120"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="meadow-far-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={farColor} stopOpacity="0.35" />
            <stop offset="100%" stopColor={farColor} stopOpacity="0.12" />
          </linearGradient>
        </defs>
        <path
          d="M0,120 L0,72 Q30,55 60,65 Q90,48 120,58 Q150,38 180,50 Q210,30 240,45 Q270,35 300,48 Q330,40 360,52 Q385,44 400,55 L400,120 Z"
          fill="url(#meadow-far-grad)"
        />
      </svg>

      {/* Mid hills — muted green, windmill silhouette */}
      <svg
        className="sky-scene__layer sky-scene__layer--mid"
        viewBox="0 0 400 100"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="meadow-mid-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={midColor} stopOpacity="0.4" />
            <stop offset="100%" stopColor={midColor} stopOpacity="0.15" />
          </linearGradient>
        </defs>
        <path
          d="M0,100 L0,62 Q25,50 55,56 Q80,42 110,52 Q140,38 170,48 Q200,34 230,44 Q260,38 290,46 Q320,42 350,50 Q375,44 400,48 L400,100 Z"
          fill="url(#meadow-mid-grad)"
        />
        {/* Windmill on the ridge */}
        <g className="sky-scene__windmill" transform="translate(265, 32)">
          <rect x="-1" y="0" width="2" height="10" fill={midColor} opacity="0.35" rx="0.5" />
          <g className="sky-scene__windmill-blades" transform="translate(0, 0)">
            <line x1="0" y1="0" x2="0" y2="-7" stroke={midColor} strokeWidth="0.8" opacity="0.3" />
            <line x1="0" y1="0" x2="6" y2="3.5" stroke={midColor} strokeWidth="0.8" opacity="0.3" />
            <line x1="0" y1="0" x2="-6" y2="3.5" stroke={midColor} strokeWidth="0.8" opacity="0.3" />
          </g>
        </g>
      </svg>

      {/* Near hills — green with tree bumps along ridge */}
      <svg
        className="sky-scene__layer sky-scene__layer--near"
        viewBox="0 0 400 80"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="meadow-near-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={nearColor} stopOpacity="0.5" />
            <stop offset="100%" stopColor={nearColor} stopOpacity="0.18" />
          </linearGradient>
        </defs>
        {/* Ridge with tree-crown bumps */}
        <path
          d="M0,80 L0,52 Q15,45 30,48 C38,40 42,38 48,44 Q55,42 62,46
             C70,38 76,36 82,42 Q95,38 110,44 C118,36 124,34 130,40
             Q145,36 160,42 C168,34 174,32 180,38 Q195,35 210,40
             C218,32 224,30 230,36 Q245,33 260,38 C268,30 274,28 280,34
             Q295,30 310,36 C318,28 324,26 330,32 Q345,30 360,35
             C368,28 374,26 380,32 Q390,30 400,34 L400,80 Z"
          fill="url(#meadow-near-grad)"
        />
        {/* Wildflower dots scattered along the ridge */}
        <circle cx="55" cy="44" r="1.2" fill="#FF9EAA" opacity="0.6" />
        <circle cx="92" cy="40" r="1" fill="#FFD166" opacity="0.55" />
        <circle cx="128" cy="38" r="1.3" fill="#DDA0DD" opacity="0.5" />
        <circle cx="175" cy="36" r="1" fill="#A8E6CF" opacity="0.55" />
        <circle cx="225" cy="34" r="1.2" fill="#FF9EAA" opacity="0.5" />
        <circle cx="278" cy="32" r="1" fill="#FFD166" opacity="0.55" />
        <circle cx="325" cy="30" r="1.3" fill="#87CEEB" opacity="0.5" />
        <circle cx="372" cy="30" r="1" fill="#DDA0DD" opacity="0.55" />
      </svg>

      {/* Sun corona — conic light burst */}
      <div className="sky-scene__corona" />

      {/* Lens flare accent */}
      <div className="sky-scene__lens-flare" />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// BEACH — Tropical paradise with layered ocean waves, palms, sailboat
// ═══════════════════════════════════════════════════════════════════════════

function BeachScene({ theme }: { theme: IslandTheme }) {
  const [deepColor, midColor, shoreColor] = theme.skyScene.landscapeColors;
  return (
    <div className="sky-scene sky-scene--beach">
      {/* Horizon line glow */}
      <div className="sky-scene__horizon-glow" />

      {/* Sun reflection on water — shimmering column */}
      <div className="sky-scene__sun-reflection" />

      {/* Layered ocean SVG — 3 wave bands */}
      <svg
        className="sky-scene__ocean-svg"
        viewBox="0 0 800 200"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="beach-deep" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={deepColor} stopOpacity="0.35" />
            <stop offset="100%" stopColor={deepColor} stopOpacity="0.5" />
          </linearGradient>
          <linearGradient id="beach-mid" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={midColor} stopOpacity="0.3" />
            <stop offset="100%" stopColor={midColor} stopOpacity="0.45" />
          </linearGradient>
          <linearGradient id="beach-shore" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={shoreColor} stopOpacity="0.2" />
            <stop offset="100%" stopColor={shoreColor} stopOpacity="0.35" />
          </linearGradient>
        </defs>

        {/* Deep water — slow roll */}
        <path
          className="sky-scene__wave sky-scene__wave--deep"
          d="M0,80 Q100,60 200,78 Q300,95 400,75 Q500,55 600,73 Q700,90 800,70 L800,200 L0,200 Z"
          fill="url(#beach-deep)"
        />

        {/* Mid water */}
        <path
          className="sky-scene__wave sky-scene__wave--mid"
          d="M0,110 Q100,95 200,108 Q300,120 400,102 Q500,88 600,105 Q700,118 800,100 L800,200 L0,200 Z"
          fill="url(#beach-mid)"
        />

        {/* Shore foam */}
        <path
          className="sky-scene__wave sky-scene__wave--shore"
          d="M0,145 Q100,135 200,143 Q300,150 400,138 Q500,130 600,140 Q700,148 800,135 L800,200 L0,200 Z"
          fill="url(#beach-shore)"
        />

        {/* Foam line highlights */}
        <path
          className="sky-scene__foam-line sky-scene__foam-line--1"
          d="M0,110 Q100,95 200,108 Q300,120 400,102 Q500,88 600,105 Q700,118 800,100"
          fill="none"
          stroke="rgba(255,255,255,0.25)"
          strokeWidth="1.5"
        />
        <path
          className="sky-scene__foam-line sky-scene__foam-line--2"
          d="M0,145 Q100,135 200,143 Q300,150 400,138 Q500,130 600,140 Q700,148 800,135"
          fill="none"
          stroke="rgba(255,255,255,0.18)"
          strokeWidth="1"
        />

        {/* Coral reef hints beneath shallow water */}
        <ellipse cx="180" cy="170" rx="18" ry="6" fill="rgba(255,127,80,0.12)" />
        <ellipse cx="350" cy="178" rx="14" ry="5" fill="rgba(255,100,70,0.1)" />
        <ellipse cx="550" cy="172" rx="20" ry="7" fill="rgba(255,140,90,0.08)" />
      </svg>

      {/* Palm trees — proper SVG silhouettes */}
      <svg
        className="sky-scene__palm-left"
        viewBox="0 0 60 100"
        aria-hidden="true"
      >
        <path
          d="M28,100 Q26,70 30,50 Q32,35 29,25"
          fill="none"
          stroke="rgba(30,60,25,0.25)"
          strokeWidth="3"
          strokeLinecap="round"
        />
        {/* Fronds */}
        <path d="M29,25 Q10,18 2,28" fill="none" stroke="rgba(30,70,25,0.2)" strokeWidth="2" />
        <path d="M29,25 Q15,12 5,15" fill="none" stroke="rgba(30,70,25,0.18)" strokeWidth="1.8" />
        <path d="M29,25 Q40,10 55,12" fill="none" stroke="rgba(30,70,25,0.2)" strokeWidth="2" />
        <path d="M29,25 Q45,18 58,24" fill="none" stroke="rgba(30,70,25,0.18)" strokeWidth="1.8" />
        <path d="M29,25 Q25,8 20,2" fill="none" stroke="rgba(30,70,25,0.16)" strokeWidth="1.5" />
      </svg>

      <svg
        className="sky-scene__palm-right"
        viewBox="0 0 50 80"
        aria-hidden="true"
      >
        <path
          d="M24,80 Q22,55 25,38 Q27,26 24,18"
          fill="none"
          stroke="rgba(30,60,25,0.2)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path d="M24,18 Q8,12 2,20" fill="none" stroke="rgba(30,70,25,0.16)" strokeWidth="1.5" />
        <path d="M24,18 Q12,6 4,8" fill="none" stroke="rgba(30,70,25,0.14)" strokeWidth="1.3" />
        <path d="M24,18 Q35,8 48,10" fill="none" stroke="rgba(30,70,25,0.16)" strokeWidth="1.5" />
        <path d="M24,18 Q38,14 46,20" fill="none" stroke="rgba(30,70,25,0.14)" strokeWidth="1.3" />
      </svg>

      {/* Distant sailboat */}
      <svg
        className="sky-scene__sailboat"
        viewBox="0 0 16 14"
        aria-hidden="true"
      >
        <path d="M3,10 Q8,8 13,10" fill="none" stroke="rgba(40,50,60,0.3)" strokeWidth="1.2" />
        <path d="M8,10 L8,2 L12,8 Z" fill="rgba(255,255,255,0.35)" />
        <path d="M8,10 L8,3 L5,8 Z" fill="rgba(255,255,255,0.25)" />
      </svg>

      {/* Tiny island on horizon */}
      <div className="sky-scene__horizon-island" />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// WINTER — Jagged peaks, pine trees, frozen lake, enhanced aurora
// ═══════════════════════════════════════════════════════════════════════════

function WinterScene({ theme }: { theme: IslandTheme }) {
  const [farPeak, nearPeak, snowColor] = theme.skyScene.landscapeColors;
  return (
    <div className="sky-scene sky-scene--winter">
      {/* Far jagged peaks */}
      <svg
        className="sky-scene__layer sky-scene__layer--far"
        viewBox="0 0 400 140"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="winter-far-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={farPeak} stopOpacity="0.4" />
            <stop offset="100%" stopColor={farPeak} stopOpacity="0.15" />
          </linearGradient>
          <linearGradient id="winter-snow-far" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={snowColor} stopOpacity="0.55" />
            <stop offset="40%" stopColor={snowColor} stopOpacity="0.2" />
            <stop offset="100%" stopColor={snowColor} stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* Mountain silhouette — sharp angular peaks */}
        <path
          d="M0,140 L0,95 L15,80 L25,90 L40,55 L52,75 L65,35 L78,60 L95,25
             L108,55 L120,40 L135,65 L150,20 L165,50 L180,30 L195,60 L210,15
             L225,48 L240,28 L255,55 L270,22 L285,50 L300,35 L315,58 L330,18
             L345,48 L360,32 L375,55 L390,40 L400,50 L400,140 Z"
          fill="url(#winter-far-grad)"
        />
        {/* Snow caps */}
        <path
          d="M0,140 L0,95 L15,80 L25,90 L40,55 L52,75 L65,35 L78,60 L95,25
             L108,55 L120,40 L135,65 L150,20 L165,50 L180,30 L195,60 L210,15
             L225,48 L240,28 L255,55 L270,22 L285,50 L300,35 L315,58 L330,18
             L345,48 L360,32 L375,55 L390,40 L400,50 L400,140 Z"
          fill="url(#winter-snow-far)"
        />
      </svg>

      {/* Near peaks with pine trees at base */}
      <svg
        className="sky-scene__layer sky-scene__layer--near"
        viewBox="0 0 400 100"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="winter-near-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={nearPeak} stopOpacity="0.45" />
            <stop offset="100%" stopColor={nearPeak} stopOpacity="0.18" />
          </linearGradient>
        </defs>
        <path
          d="M0,100 L0,70 L20,58 L35,68 L55,42 L70,58 L90,35 L105,52 L125,30
             L140,50 L160,38 L180,55 L200,28 L220,48 L240,35 L260,52 L280,30
             L300,50 L320,38 L340,55 L360,42 L380,52 L400,45 L400,100 Z"
          fill="url(#winter-near-grad)"
        />
        {/* Pine tree silhouettes along the base */}
        {[45, 95, 155, 220, 280, 340, 380].map((x, i) => (
          <path
            key={`pine-${i}`}
            d={`M${x},${65 + (i % 3) * 3} L${x - 3},${72 + (i % 3) * 3} L${x - 1.5},${70 + (i % 3) * 3}
                L${x - 4},${76 + (i % 3) * 3} L${x + 4},${76 + (i % 3) * 3}
                L${x + 1.5},${70 + (i % 3) * 3} L${x + 3},${72 + (i % 3) * 3} Z`}
            fill={nearPeak}
            opacity={0.3 + (i % 3) * 0.05}
          />
        ))}
      </svg>

      {/* Frozen lake reflection */}
      <div className="sky-scene__frozen-lake" />

      {/* Mist layer at mountain base */}
      <div className="sky-scene__mist" />

      {/* Ice crystal sparkles */}
      <div className="sky-scene__ice-crystal sky-scene__ice-crystal--1" />
      <div className="sky-scene__ice-crystal sky-scene__ice-crystal--2" />
      <div className="sky-scene__ice-crystal sky-scene__ice-crystal--3" />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// DESERT — Rolling dunes, heat shimmer distortion, oasis mirage, caravan
// ═══════════════════════════════════════════════════════════════════════════

function DesertScene({ theme }: { theme: IslandTheme }) {
  const [farDune, midDune, nearDune] = theme.skyScene.landscapeColors;
  return (
    <div className="sky-scene sky-scene--desert">
      {/* SVG filter for heat shimmer distortion */}
      <svg className="sky-scene__filters" aria-hidden="true" style={{ position: 'absolute', width: 0, height: 0 }}>
        <defs>
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
        </defs>
      </svg>

      {/* Far dunes — pale, barely visible */}
      <svg
        className="sky-scene__layer sky-scene__layer--far"
        viewBox="0 0 400 100"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="desert-far-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={farDune} stopOpacity="0.25" />
            <stop offset="100%" stopColor={farDune} stopOpacity="0.1" />
          </linearGradient>
        </defs>
        <path
          d="M0,100 L0,70 Q50,52 100,62 Q160,48 220,58 Q280,45 340,55 Q370,48 400,52 L400,100 Z"
          fill="url(#desert-far-grad)"
        />
      </svg>

      {/* Mid dunes — with shimmer filter applied */}
      <svg
        className="sky-scene__layer sky-scene__layer--mid sky-scene__shimmer-target"
        viewBox="0 0 400 80"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="desert-mid-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={midDune} stopOpacity="0.35" />
            <stop offset="100%" stopColor={midDune} stopOpacity="0.15" />
          </linearGradient>
        </defs>
        <path
          d="M0,80 L0,50 Q40,35 80,44 Q130,28 180,40 Q230,26 280,38 Q330,30 380,40 L400,38 L400,80 Z"
          fill="url(#desert-mid-grad)"
        />
        {/* Sand ripple patterns */}
        <path
          d="M20,60 Q60,56 100,60 Q140,56 180,60"
          fill="none"
          stroke={midDune}
          strokeWidth="0.5"
          opacity="0.12"
        />
        <path
          d="M200,55 Q240,51 280,55 Q320,51 360,55"
          fill="none"
          stroke={midDune}
          strokeWidth="0.5"
          opacity="0.1"
        />
      </svg>

      {/* Near dunes — deep sand */}
      <svg
        className="sky-scene__layer sky-scene__layer--near"
        viewBox="0 0 400 60"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="desert-near-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={nearDune} stopOpacity="0.45" />
            <stop offset="100%" stopColor={nearDune} stopOpacity="0.2" />
          </linearGradient>
        </defs>
        <path
          d="M0,60 L0,35 Q30,22 70,30 Q120,18 170,28 Q220,15 270,25 Q320,18 370,26 L400,24 L400,60 Z"
          fill="url(#desert-near-grad)"
        />
      </svg>

      {/* Oasis mirage — shimmering green on far horizon */}
      <div className="sky-scene__oasis-mirage">
        <svg viewBox="0 0 40 20" aria-hidden="true">
          <ellipse cx="20" cy="16" rx="16" ry="3" fill="rgba(60,180,220,0.15)" />
          <path d="M14,14 Q13,6 16,4" fill="none" stroke="rgba(40,100,50,0.2)" strokeWidth="1" />
          <path d="M26,14 Q25,5 28,3" fill="none" stroke="rgba(40,100,50,0.18)" strokeWidth="1" />
        </svg>
      </div>

      {/* Distant caravan — 3 tiny shapes drifting */}
      <div className="sky-scene__caravan">
        <div className="sky-scene__caravan-figure" />
        <div className="sky-scene__caravan-figure" />
        <div className="sky-scene__caravan-figure" />
      </div>

      {/* Blowing sand particles */}
      {Array.from({ length: 12 }, (_, i) => (
        <div
          key={`sand-${i}`}
          className="sky-scene__sand-particle"
          style={{
            top: `${60 + (i * 17) % 30}%`,
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
// NIGHT — Milky Way, constellations, dramatic cliffs, bioluminescence
// ═══════════════════════════════════════════════════════════════════════════

function NightScene({ theme }: { theme: IslandTheme }) {
  const [farCliff, nearCliff] = theme.skyScene.landscapeColors;
  return (
    <div className="sky-scene sky-scene--night">
      {/* Milky Way band — diagonal gradient stripe */}
      <div className="sky-scene__milky-way" />

      {/* Nebula patches */}
      <div className="sky-scene__nebula sky-scene__nebula--1" />
      <div className="sky-scene__nebula sky-scene__nebula--2" />

      {/* Constellation lines — connecting star groups */}
      <svg
        className="sky-scene__constellations"
        viewBox="0 0 400 200"
        preserveAspectRatio="xMidYMid meet"
        aria-hidden="true"
      >
        {/* Constellation 1 — small triangle */}
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
      </svg>

      {/* Moonlight cone — fan of light below moon */}
      <div className="sky-scene__moonlight-cone" />

      {/* Dark cliff silhouettes — angular, dramatic */}
      <svg
        className="sky-scene__layer sky-scene__layer--far"
        viewBox="0 0 400 120"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          d="M0,120 L0,85 L15,78 L30,88 L50,65 L65,80 L85,55 L100,72
             L120,50 L135,68 L155,48 L170,65 L185,42 L200,60 L220,38
             L235,55 L255,40 L270,58 L290,35 L305,55 L325,42 L340,58
             L360,45 L375,56 L390,48 L400,52 L400,120 Z"
          fill={farCliff}
          opacity="0.35"
        />
      </svg>

      <svg
        className="sky-scene__layer sky-scene__layer--near"
        viewBox="0 0 400 90"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          d="M0,90 L0,68 L20,60 L40,72 L65,48 L80,62 L105,42 L120,58
             L145,38 L160,52 L185,35 L200,50 L225,32 L240,48 L265,30
             L280,45 L305,28 L320,42 L345,32 L360,45 L380,38 L400,42 L400,90 Z"
          fill={nearCliff}
          opacity="0.42"
        />
        {/* Bioluminescent moss dots along cliff edges */}
        {[42, 82, 122, 162, 202, 242, 282, 322, 362].map((x, i) => (
          <circle
            key={`glow-${i}`}
            cx={x}
            cy={52 + (i % 3) * 5}
            r="1.5"
            fill="rgba(100,255,200,0.5)"
            className="sky-scene__bio-dot"
            style={{ animationDelay: `${i * 0.7}s` } as React.CSSProperties}
          />
        ))}
      </svg>

      {/* Enhanced firefly layer */}
      <div className="sky-scene__firefly-field">
        {Array.from({ length: 18 }, (_, i) => (
          <div
            key={`ff-${i}`}
            className="sky-scene__firefly"
            style={{
              left: `${(i * 29 + 8) % 92}%`,
              top: `${25 + (i * 23) % 55}%`,
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
// SAKURA — Cherry blossom hills, torii gate, wisteria, lanterns
// ═══════════════════════════════════════════════════════════════════════════

function SakuraScene({ theme }: { theme: IslandTheme }) {
  const [farColor, midColor, nearColor] = theme.skyScene.landscapeColors;
  return (
    <div className="sky-scene sky-scene--sakura">
      {/* Far hills — misty lavender */}
      <svg
        className="sky-scene__layer sky-scene__layer--far"
        viewBox="0 0 400 120"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="sakura-far-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={farColor} stopOpacity="0.3" />
            <stop offset="100%" stopColor={farColor} stopOpacity="0.1" />
          </linearGradient>
        </defs>
        <path
          d="M0,120 L0,75 Q35,60 70,68 Q105,52 140,62 Q175,45 210,55
             Q245,42 280,52 Q315,40 350,50 Q375,44 400,48 L400,120 Z"
          fill="url(#sakura-far-grad)"
        />
        {/* Torii gate silhouette on the far ridge */}
        <g transform="translate(190, 46)" opacity="0.12">
          <rect x="-6" y="0" width="12" height="1.5" rx="0.5" fill={farColor} />
          <rect x="-7" y="-2" width="14" height="1.5" rx="0.5" fill={farColor} />
          <rect x="-4.5" y="0" width="1.5" height="10" fill={farColor} />
          <rect x="3" y="0" width="1.5" height="10" fill={farColor} />
        </g>
      </svg>

      {/* Mid hills — mauve with cherry tree bumps */}
      <svg
        className="sky-scene__layer sky-scene__layer--mid"
        viewBox="0 0 400 100"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="sakura-mid-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={midColor} stopOpacity="0.38" />
            <stop offset="100%" stopColor={midColor} stopOpacity="0.12" />
          </linearGradient>
        </defs>
        {/* Hill ridge with cherry tree crown bumps */}
        <path
          d="M0,100 L0,60 Q20,52 45,56 C55,45 60,42 68,50 Q85,46 105,52
             C115,40 120,38 128,46 Q150,42 170,48 C180,36 186,34 194,42
             Q215,38 235,44 C245,32 252,30 260,38 Q280,34 300,40
             C310,28 316,26 324,34 Q345,30 365,38 C375,28 380,26 388,34 L400,36 L400,100 Z"
          fill="url(#sakura-mid-grad)"
        />
        {/* Cherry blossom clusters on tree tops */}
        <circle cx="62" cy="42" r="5" fill="rgba(255,180,200,0.2)" />
        <circle cx="122" cy="38" r="4.5" fill="rgba(255,170,195,0.18)" />
        <circle cx="188" cy="34" r="5.5" fill="rgba(255,180,200,0.2)" />
        <circle cx="254" cy="30" r="5" fill="rgba(255,170,195,0.18)" />
        <circle cx="318" cy="26" r="4.5" fill="rgba(255,180,200,0.2)" />
        <circle cx="382" cy="26" r="5" fill="rgba(255,170,195,0.18)" />
      </svg>

      {/* Near hills — warm pink with detailed cherry tree shapes */}
      <svg
        className="sky-scene__layer sky-scene__layer--near"
        viewBox="0 0 400 70"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="sakura-near-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={nearColor} stopOpacity="0.45" />
            <stop offset="100%" stopColor={nearColor} stopOpacity="0.15" />
          </linearGradient>
        </defs>
        <path
          d="M0,70 L0,42 Q25,34 55,38 C65,28 70,25 78,32 Q100,28 125,34
             C135,22 142,20 150,28 Q175,24 200,30 C210,18 218,16 226,24
             Q250,20 275,28 C285,16 292,14 300,22 Q325,18 350,26
             C358,16 364,14 372,22 Q388,20 400,24 L400,70 Z"
          fill="url(#sakura-near-grad)"
        />
      </svg>

      {/* Wisteria vines hanging from top */}
      <div className="sky-scene__wisteria">
        <div className="sky-scene__vine sky-scene__vine--1" />
        <div className="sky-scene__vine sky-scene__vine--2" />
        <div className="sky-scene__vine sky-scene__vine--3" />
      </div>

      {/* Stone lanterns with warm glow */}
      <div className="sky-scene__lantern sky-scene__lantern--1" />
      <div className="sky-scene__lantern sky-scene__lantern--2" />

      {/* Cherry blossom branch framing top-right */}
      <svg
        className="sky-scene__branch"
        viewBox="0 0 80 60"
        aria-hidden="true"
      >
        <path
          d="M80,0 Q60,8 45,15 Q30,22 20,35 Q15,42 18,48"
          fill="none"
          stroke="rgba(120,70,80,0.15)"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path d="M65,10 Q55,5 50,12" fill="none" stroke="rgba(120,70,80,0.1)" strokeWidth="1.2" />
        <path d="M42,18 Q32,14 28,20" fill="none" stroke="rgba(120,70,80,0.1)" strokeWidth="1" />
        {/* Flower dots on branch */}
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
