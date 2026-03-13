/**
 * IslandSkyScene — Rich SVG landscape backgrounds for each archipelago biome.
 *
 * Each biome renders a unique, layered inline SVG landscape with organic
 * Bezier-path silhouettes, atmospheric effects, and CSS-driven animations.
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
      {/* Far hills — misty, soft blue-grey silhouettes */}
      <svg
        className="sky-scene__layer sky-scene__layer--far"
        viewBox="0 0 800 200"
        preserveAspectRatio="xMidYMax slice"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="meadow-far-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={farColor} stopOpacity="0.55" />
            <stop offset="100%" stopColor={farColor} stopOpacity="0.3" />
          </linearGradient>
        </defs>
        <path
          d="M0,200 L0,130 Q60,95 120,115 Q180,75 240,100 Q300,55 360,85
             Q420,50 480,78 Q540,45 600,72 Q660,55 720,80 Q760,65 800,90 L800,200 Z"
          fill="url(#meadow-far-grad)"
        />
      </svg>

      {/* Mid hills — muted green with windmill silhouette */}
      <svg
        className="sky-scene__layer sky-scene__layer--mid"
        viewBox="0 0 800 200"
        preserveAspectRatio="xMidYMax slice"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="meadow-mid-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={midColor} stopOpacity="0.55" />
            <stop offset="100%" stopColor={midColor} stopOpacity="0.3" />
          </linearGradient>
        </defs>
        <path
          d="M0,200 L0,120 Q50,90 100,105 Q150,72 200,92 Q260,60 320,82
             Q380,55 440,76 Q500,62 560,80 Q620,58 680,78 Q740,65 800,75 L800,200 Z"
          fill="url(#meadow-mid-grad)"
        />
        {/* Windmill on the ridge */}
        <g className="sky-scene__windmill" transform="translate(530, 55)">
          <rect x="-2" y="0" width="4" height="20" fill={midColor} opacity="0.5" rx="1" />
          <g className="sky-scene__windmill-blades" transform="translate(0, 0)">
            <line x1="0" y1="0" x2="0" y2="-14" stroke={midColor} strokeWidth="2" opacity="0.45" />
            <line x1="0" y1="0" x2="12" y2="7" stroke={midColor} strokeWidth="2" opacity="0.45" />
            <line x1="0" y1="0" x2="-12" y2="7" stroke={midColor} strokeWidth="2" opacity="0.45" />
          </g>
        </g>
      </svg>

      {/* Near hills — green with tree bumps along ridge */}
      <svg
        className="sky-scene__layer sky-scene__layer--near"
        viewBox="0 0 800 200"
        preserveAspectRatio="xMidYMax slice"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="meadow-near-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={nearColor} stopOpacity="0.65" />
            <stop offset="100%" stopColor={nearColor} stopOpacity="0.35" />
          </linearGradient>
        </defs>
        {/* Ridge with tree-crown bumps — organic shapes */}
        <path
          d="M0,200 L0,105 Q20,90 40,96 C55,78 65,72 78,85 Q95,78 115,88
             C130,70 140,65 155,80 Q175,72 195,82 C210,64 222,58 235,72
             Q255,65 275,76 C290,58 302,52 315,68 Q335,60 355,72
             C370,55 382,50 395,65 Q415,58 435,68 C450,52 462,46 475,62
             Q495,55 515,66 C530,48 542,42 555,58 Q575,52 595,62
             C610,46 622,40 635,56 Q655,50 675,60 C690,44 700,40 715,54
             Q735,48 755,58 C770,44 780,40 790,52 L800,55 L800,200 Z"
          fill="url(#meadow-near-grad)"
        />
        {/* Wildflower dots scattered along the ridge */}
        <circle cx="110" cy="86" r="2.5" fill="#FF9EAA" opacity="0.6" />
        <circle cx="190" cy="78" r="2" fill="#FFD166" opacity="0.55" />
        <circle cx="270" cy="72" r="2.5" fill="#DDA0DD" opacity="0.55" />
        <circle cx="350" cy="68" r="2" fill="#A8E6CF" opacity="0.5" />
        <circle cx="450" cy="64" r="2.5" fill="#FF9EAA" opacity="0.55" />
        <circle cx="550" cy="56" r="2" fill="#FFD166" opacity="0.5" />
        <circle cx="650" cy="54" r="2.5" fill="#87CEEB" opacity="0.5" />
        <circle cx="740" cy="52" r="2" fill="#DDA0DD" opacity="0.5" />
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
        viewBox="0 0 800 300"
        preserveAspectRatio="xMidYMax slice"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="beach-deep" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={deepColor} stopOpacity="0.5" />
            <stop offset="100%" stopColor={deepColor} stopOpacity="0.65" />
          </linearGradient>
          <linearGradient id="beach-mid" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={midColor} stopOpacity="0.45" />
            <stop offset="100%" stopColor={midColor} stopOpacity="0.6" />
          </linearGradient>
          <linearGradient id="beach-shore" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={shoreColor} stopOpacity="0.35" />
            <stop offset="100%" stopColor={shoreColor} stopOpacity="0.5" />
          </linearGradient>
        </defs>

        {/* Deep water — slow roll */}
        <path
          className="sky-scene__wave sky-scene__wave--deep"
          d="M0,100 Q100,70 200,95 Q300,120 400,90 Q500,60 600,88 Q700,115 800,85 L800,300 L0,300 Z"
          fill="url(#beach-deep)"
        />

        {/* Mid water */}
        <path
          className="sky-scene__wave sky-scene__wave--mid"
          d="M0,155 Q100,130 200,150 Q300,170 400,145 Q500,120 600,148 Q700,168 800,140 L800,300 L0,300 Z"
          fill="url(#beach-mid)"
        />

        {/* Shore foam */}
        <path
          className="sky-scene__wave sky-scene__wave--shore"
          d="M0,210 Q100,190 200,205 Q300,220 400,200 Q500,185 600,202 Q700,218 800,195 L800,300 L0,300 Z"
          fill="url(#beach-shore)"
        />

        {/* Foam line highlights */}
        <path
          className="sky-scene__foam-line sky-scene__foam-line--1"
          d="M0,155 Q100,130 200,150 Q300,170 400,145 Q500,120 600,148 Q700,168 800,140"
          fill="none"
          stroke="rgba(255,255,255,0.35)"
          strokeWidth="2"
        />
        <path
          className="sky-scene__foam-line sky-scene__foam-line--2"
          d="M0,210 Q100,190 200,205 Q300,220 400,200 Q500,185 600,202 Q700,218 800,195"
          fill="none"
          stroke="rgba(255,255,255,0.25)"
          strokeWidth="1.5"
        />

        {/* Coral reef hints beneath shallow water */}
        <ellipse cx="250" cy="260" rx="30" ry="10" fill="rgba(255,127,80,0.15)" />
        <ellipse cx="500" cy="270" rx="25" ry="8" fill="rgba(255,100,70,0.12)" />
        <ellipse cx="680" cy="255" rx="35" ry="12" fill="rgba(255,140,90,0.1)" />
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
          stroke="rgba(30,60,25,0.35)"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        {/* Fronds */}
        <path d="M29,25 Q10,18 2,28" fill="none" stroke="rgba(30,70,25,0.3)" strokeWidth="2.5" />
        <path d="M29,25 Q15,12 5,15" fill="none" stroke="rgba(30,70,25,0.28)" strokeWidth="2.2" />
        <path d="M29,25 Q40,10 55,12" fill="none" stroke="rgba(30,70,25,0.3)" strokeWidth="2.5" />
        <path d="M29,25 Q45,18 58,24" fill="none" stroke="rgba(30,70,25,0.28)" strokeWidth="2.2" />
        <path d="M29,25 Q25,8 20,2" fill="none" stroke="rgba(30,70,25,0.25)" strokeWidth="2" />
      </svg>

      <svg
        className="sky-scene__palm-right"
        viewBox="0 0 50 80"
        aria-hidden="true"
      >
        <path
          d="M24,80 Q22,55 25,38 Q27,26 24,18"
          fill="none"
          stroke="rgba(30,60,25,0.3)"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path d="M24,18 Q8,12 2,20" fill="none" stroke="rgba(30,70,25,0.25)" strokeWidth="2" />
        <path d="M24,18 Q12,6 4,8" fill="none" stroke="rgba(30,70,25,0.22)" strokeWidth="1.8" />
        <path d="M24,18 Q35,8 48,10" fill="none" stroke="rgba(30,70,25,0.25)" strokeWidth="2" />
        <path d="M24,18 Q38,14 46,20" fill="none" stroke="rgba(30,70,25,0.22)" strokeWidth="1.8" />
      </svg>

      {/* Distant sailboat */}
      <svg
        className="sky-scene__sailboat"
        viewBox="0 0 20 18"
        aria-hidden="true"
      >
        <path d="M3,13 Q10,10 17,13" fill="none" stroke="rgba(40,50,60,0.4)" strokeWidth="1.5" />
        <path d="M10,13 L10,3 L15,10 Z" fill="rgba(255,255,255,0.45)" />
        <path d="M10,13 L10,4 L6,10 Z" fill="rgba(255,255,255,0.35)" />
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
        viewBox="0 0 800 250"
        preserveAspectRatio="xMidYMax slice"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="winter-far-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={farPeak} stopOpacity="0.55" />
            <stop offset="100%" stopColor={farPeak} stopOpacity="0.3" />
          </linearGradient>
          <linearGradient id="winter-snow-far" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={snowColor} stopOpacity="0.7" />
            <stop offset="30%" stopColor={snowColor} stopOpacity="0.3" />
            <stop offset="100%" stopColor={snowColor} stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* Mountain silhouette — sharp angular peaks */}
        <path
          d="M0,250 L0,170 L30,148 L50,165 L80,95 L105,130 L130,55 L155,100
             L190,30 L215,85 L240,60 L265,105 L300,20 L330,80 L360,45 L390,90
             L420,15 L450,75 L480,40 L510,88 L540,28 L570,78 L600,50 L630,92
             L660,25 L690,75 L720,48 L750,85 L780,60 L800,80 L800,250 Z"
          fill="url(#winter-far-grad)"
        />
        {/* Snow caps */}
        <path
          d="M0,250 L0,170 L30,148 L50,165 L80,95 L105,130 L130,55 L155,100
             L190,30 L215,85 L240,60 L265,105 L300,20 L330,80 L360,45 L390,90
             L420,15 L450,75 L480,40 L510,88 L540,28 L570,78 L600,50 L630,92
             L660,25 L690,75 L720,48 L750,85 L780,60 L800,80 L800,250 Z"
          fill="url(#winter-snow-far)"
        />
      </svg>

      {/* Near peaks with pine trees at base */}
      <svg
        className="sky-scene__layer sky-scene__layer--near"
        viewBox="0 0 800 200"
        preserveAspectRatio="xMidYMax slice"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="winter-near-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={nearPeak} stopOpacity="0.6" />
            <stop offset="100%" stopColor={nearPeak} stopOpacity="0.35" />
          </linearGradient>
        </defs>
        <path
          d="M0,200 L0,130 L40,105 L70,125 L110,70 L140,100 L180,50 L210,85
             L250,40 L280,75 L320,55 L360,85 L400,35 L440,72 L480,50 L520,82
             L560,42 L600,75 L640,55 L680,80 L720,60 L760,78 L800,65 L800,200 Z"
          fill="url(#winter-near-grad)"
        />
        {/* Pine tree silhouettes along the base */}
        {[90, 180, 300, 420, 540, 660, 750].map((x, i) => (
          <path
            key={`pine-${i}`}
            d={`M${x},${118 + (i % 3) * 5} L${x - 6},${132 + (i % 3) * 5} L${x - 3},${128 + (i % 3) * 5}
                L${x - 8},${140 + (i % 3) * 5} L${x + 8},${140 + (i % 3) * 5}
                L${x + 3},${128 + (i % 3) * 5} L${x + 6},${132 + (i % 3) * 5} Z`}
            fill={nearPeak}
            opacity={0.4 + (i % 3) * 0.08}
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

      {/* Far dunes — pale golden silhouettes */}
      <svg
        className="sky-scene__layer sky-scene__layer--far"
        viewBox="0 0 800 200"
        preserveAspectRatio="xMidYMax slice"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="desert-far-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={farDune} stopOpacity="0.4" />
            <stop offset="100%" stopColor={farDune} stopOpacity="0.2" />
          </linearGradient>
        </defs>
        <path
          d="M0,200 L0,130 Q80,90 160,112 Q260,70 360,100 Q460,65 560,95
             Q640,75 720,92 Q770,80 800,88 L800,200 Z"
          fill="url(#desert-far-grad)"
        />
      </svg>

      {/* Mid dunes — with shimmer filter applied */}
      <svg
        className="sky-scene__layer sky-scene__layer--mid sky-scene__shimmer-target"
        viewBox="0 0 800 200"
        preserveAspectRatio="xMidYMax slice"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="desert-mid-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={midDune} stopOpacity="0.5" />
            <stop offset="100%" stopColor={midDune} stopOpacity="0.28" />
          </linearGradient>
        </defs>
        <path
          d="M0,200 L0,110 Q60,70 130,92 Q210,48 300,78 Q390,40 480,72
             Q560,50 650,75 Q720,58 780,70 L800,68 L800,200 Z"
          fill="url(#desert-mid-grad)"
        />
        {/* Sand ripple patterns */}
        <path
          d="M40,145 Q100,138 160,145 Q220,138 280,145"
          fill="none"
          stroke={midDune}
          strokeWidth="0.8"
          opacity="0.18"
        />
        <path
          d="M360,135 Q420,128 480,135 Q540,128 600,135"
          fill="none"
          stroke={midDune}
          strokeWidth="0.8"
          opacity="0.15"
        />
      </svg>

      {/* Near dunes — deep sand */}
      <svg
        className="sky-scene__layer sky-scene__layer--near"
        viewBox="0 0 800 200"
        preserveAspectRatio="xMidYMax slice"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="desert-near-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={nearDune} stopOpacity="0.6" />
            <stop offset="100%" stopColor={nearDune} stopOpacity="0.35" />
          </linearGradient>
        </defs>
        <path
          d="M0,200 L0,100 Q50,60 110,82 Q190,38 280,68 Q370,30 460,60
             Q540,35 630,58 Q710,40 780,55 L800,52 L800,200 Z"
          fill="url(#desert-near-grad)"
        />
      </svg>

      {/* Oasis mirage — shimmering green on far horizon */}
      <div className="sky-scene__oasis-mirage">
        <svg viewBox="0 0 50 25" aria-hidden="true">
          <ellipse cx="25" cy="20" rx="20" ry="4" fill="rgba(60,180,220,0.2)" />
          <path d="M17,18 Q16,8 19,5" fill="none" stroke="rgba(40,100,50,0.25)" strokeWidth="1.5" />
          <path d="M33,18 Q32,7 35,4" fill="none" stroke="rgba(40,100,50,0.22)" strokeWidth="1.5" />
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
            opacity: 0.2 + (i % 4) * 0.1,
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
        <line x1="65" y1="30" x2="85" y2="22" stroke="rgba(200,210,255,0.12)" strokeWidth="0.8" strokeDasharray="3,4" />
        <line x1="85" y1="22" x2="78" y2="45" stroke="rgba(200,210,255,0.12)" strokeWidth="0.8" strokeDasharray="3,4" />
        <line x1="78" y1="45" x2="65" y2="30" stroke="rgba(200,210,255,0.12)" strokeWidth="0.8" strokeDasharray="3,4" />

        {/* Constellation 2 — zigzag */}
        <line x1="200" y1="40" x2="215" y2="25" stroke="rgba(200,210,255,0.1)" strokeWidth="0.8" strokeDasharray="3,4" />
        <line x1="215" y1="25" x2="230" y2="38" stroke="rgba(200,210,255,0.1)" strokeWidth="0.8" strokeDasharray="3,4" />
        <line x1="230" y1="38" x2="248" y2="30" stroke="rgba(200,210,255,0.1)" strokeWidth="0.8" strokeDasharray="3,4" />

        {/* Constellation 3 — diamond */}
        <line x1="320" y1="50" x2="335" y2="35" stroke="rgba(200,210,255,0.09)" strokeWidth="0.8" strokeDasharray="3,4" />
        <line x1="335" y1="35" x2="350" y2="50" stroke="rgba(200,210,255,0.09)" strokeWidth="0.8" strokeDasharray="3,4" />
        <line x1="350" y1="50" x2="335" y2="65" stroke="rgba(200,210,255,0.09)" strokeWidth="0.8" strokeDasharray="3,4" />
        <line x1="335" y1="65" x2="320" y2="50" stroke="rgba(200,210,255,0.09)" strokeWidth="0.8" strokeDasharray="3,4" />
      </svg>

      {/* Moonlight cone — fan of light below moon */}
      <div className="sky-scene__moonlight-cone" />

      {/* Dark cliff silhouettes — angular, dramatic */}
      <svg
        className="sky-scene__layer sky-scene__layer--far"
        viewBox="0 0 800 250"
        preserveAspectRatio="xMidYMax slice"
        aria-hidden="true"
      >
        <path
          d="M0,250 L0,160 L30,140 L60,165 L100,110 L130,145 L170,85 L200,125
             L240,75 L270,110 L310,68 L340,105 L380,55 L410,95 L450,60 L480,98
             L520,50 L550,88 L590,58 L620,92 L660,48 L690,82 L730,55 L760,85
             L790,65 L800,78 L800,250 Z"
          fill={farCliff}
          opacity="0.5"
        />
      </svg>

      <svg
        className="sky-scene__layer sky-scene__layer--near"
        viewBox="0 0 800 200"
        preserveAspectRatio="xMidYMax slice"
        aria-hidden="true"
      >
        <path
          d="M0,200 L0,125 L40,108 L80,130 L130,78 L160,108 L210,62 L240,95
             L290,50 L320,82 L370,42 L400,75 L450,35 L480,68 L530,30 L560,62
             L610,38 L640,68 L690,42 L720,65 L770,48 L800,58 L800,200 Z"
          fill={nearCliff}
          opacity="0.58"
        />
        {/* Bioluminescent moss dots along cliff edges */}
        {[82, 162, 242, 322, 402, 482, 562, 642, 722].map((x, i) => (
          <circle
            key={`glow-${i}`}
            cx={x}
            cy={85 + (i % 3) * 8}
            r="2.5"
            fill="rgba(100,255,200,0.55)"
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
              width: `${3 + (i % 3)}px`,
              height: `${3 + (i % 3)}px`,
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
        viewBox="0 0 800 200"
        preserveAspectRatio="xMidYMax slice"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="sakura-far-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={farColor} stopOpacity="0.45" />
            <stop offset="100%" stopColor={farColor} stopOpacity="0.2" />
          </linearGradient>
        </defs>
        <path
          d="M0,200 L0,130 Q60,100 120,115 Q180,80 240,102 Q300,65 360,90
             Q420,58 480,82 Q540,55 600,78 Q660,60 720,75 Q760,65 800,72 L800,200 Z"
          fill="url(#sakura-far-grad)"
        />
        {/* Torii gate silhouette on the far ridge */}
        <g transform="translate(380, 72)" opacity="0.18">
          <rect x="-10" y="0" width="20" height="3" rx="1" fill={farColor} />
          <rect x="-12" y="-4" width="24" height="3" rx="1" fill={farColor} />
          <rect x="-8" y="0" width="3" height="18" fill={farColor} />
          <rect x="5" y="0" width="3" height="18" fill={farColor} />
        </g>
      </svg>

      {/* Mid hills — mauve with cherry tree bumps */}
      <svg
        className="sky-scene__layer sky-scene__layer--mid"
        viewBox="0 0 800 200"
        preserveAspectRatio="xMidYMax slice"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="sakura-mid-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={midColor} stopOpacity="0.52" />
            <stop offset="100%" stopColor={midColor} stopOpacity="0.25" />
          </linearGradient>
        </defs>
        {/* Hill ridge with cherry tree crown bumps */}
        <path
          d="M0,200 L0,110 Q30,95 60,102 C75,78 85,72 98,88 Q120,80 145,90
             C160,68 170,62 183,78 Q210,70 235,82 C250,58 262,52 275,68
             Q300,60 325,72 C340,48 352,42 365,58 Q390,50 415,62
             C430,38 442,32 455,50 Q480,42 505,55 C520,32 530,28 545,44
             Q570,38 595,50 C610,28 620,24 635,40 Q660,34 685,46
             C700,26 710,22 725,38 Q750,32 775,44 L800,42 L800,200 Z"
          fill="url(#sakura-mid-grad)"
        />
        {/* Cherry blossom clusters on tree tops */}
        <circle cx="88" cy="72" r="9" fill="rgba(255,180,200,0.25)" />
        <circle cx="172" cy="62" r="8" fill="rgba(255,170,195,0.22)" />
        <circle cx="262" cy="52" r="10" fill="rgba(255,180,200,0.25)" />
        <circle cx="352" cy="42" r="9" fill="rgba(255,170,195,0.22)" />
        <circle cx="442" cy="32" r="8" fill="rgba(255,180,200,0.25)" />
        <circle cx="530" cy="28" r="9" fill="rgba(255,170,195,0.22)" />
        <circle cx="620" cy="24" r="8" fill="rgba(255,180,200,0.25)" />
        <circle cx="710" cy="22" r="9" fill="rgba(255,170,195,0.22)" />
      </svg>

      {/* Near hills — warm pink with detailed cherry tree shapes */}
      <svg
        className="sky-scene__layer sky-scene__layer--near"
        viewBox="0 0 800 200"
        preserveAspectRatio="xMidYMax slice"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="sakura-near-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={nearColor} stopOpacity="0.6" />
            <stop offset="100%" stopColor={nearColor} stopOpacity="0.3" />
          </linearGradient>
        </defs>
        <path
          d="M0,200 L0,90 Q35,68 70,78 C85,55 95,48 108,62 Q135,52 165,64
             C180,40 192,34 205,50 Q235,42 265,55 C280,32 292,26 305,42
             Q335,35 365,48 C380,25 392,20 405,36 Q435,28 465,42
             C480,20 492,15 505,32 Q535,25 565,38 C580,18 590,14 605,28
             Q635,22 665,35 C678,18 688,14 700,28 Q728,22 755,34
             C768,18 776,14 790,28 L800,30 L800,200 Z"
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
          stroke="rgba(120,70,80,0.2)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path d="M65,10 Q55,5 50,12" fill="none" stroke="rgba(120,70,80,0.15)" strokeWidth="1.5" />
        <path d="M42,18 Q32,14 28,20" fill="none" stroke="rgba(120,70,80,0.15)" strokeWidth="1.2" />
        {/* Flower dots on branch */}
        <circle cx="62" cy="9" r="4" fill="rgba(255,180,200,0.35)" />
        <circle cx="48" cy="14" r="3.5" fill="rgba(255,160,190,0.3)" />
        <circle cx="35" cy="20" r="4" fill="rgba(255,180,200,0.32)" />
        <circle cx="24" cy="30" r="3.5" fill="rgba(255,170,195,0.3)" />
        <circle cx="20" cy="42" r="3" fill="rgba(255,160,190,0.25)" />
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
