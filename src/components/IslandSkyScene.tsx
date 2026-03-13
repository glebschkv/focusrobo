/**
 * IslandSkyScene — Stunning multi-layer SVG landscape backgrounds per biome.
 *
 * Each biome renders 4-5 depth layers with SVG blur filters for atmospheric
 * perspective. Farther layers are more blurred and faded, creating rich depth.
 *
 * All animations are CSS-only. The component is React.memo'd.
 */

import React from 'react';
import type { IslandTheme } from '@/data/IslandThemes';

interface IslandSkySceneProps {
  themeId: string;
  theme: IslandTheme;
}

/** Shared SVG filter definitions used across all biomes */
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
      </defs>
    </svg>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MEADOW — Ghibli-inspired pastoral landscape with golden light
// ═══════════════════════════════════════════════════════════════════════════

function MeadowScene({ theme }: { theme: IslandTheme }) {
  const [farColor, midColor, nearColor] = theme.skyScene.landscapeColors;
  return (
    <div className="sky-scene sky-scene--meadow">
      <SharedFilters />

      {/* Golden atmospheric glow at horizon */}
      <div
        className="sky-scene__atmo-glow"
        style={{
          background: 'radial-gradient(ellipse 120% 60% at 70% 100%, rgba(255,240,180,0.25) 0%, rgba(255,230,150,0.1) 40%, transparent 70%)',
          bottom: '20%',
          height: '50%',
        }}
      />

      {/* Layer 1 — Distant blue-grey mountains (heaviest blur) */}
      <svg
        className="sky-scene__layer sky-scene__layer--far"
        viewBox="0 0 800 200"
        preserveAspectRatio="none"
        aria-hidden="true"
        style={{ filter: 'url(#sky-blur-far)', opacity: 0.35 }}
      >
        <defs>
          <linearGradient id="meadow-l1" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={farColor} stopOpacity="0.6" />
            <stop offset="100%" stopColor={farColor} stopOpacity="0.2" />
          </linearGradient>
        </defs>
        <path
          d="M0,200 L0,130 Q40,110 80,118 Q120,95 160,108 Q200,80 240,100
             Q280,70 320,90 Q360,60 400,82 Q440,65 480,78 Q520,55 560,72
             Q600,60 640,75 Q680,65 720,80 Q760,72 800,85 L800,200 Z"
          fill="url(#meadow-l1)"
        />
      </svg>

      {/* Layer 2 — Mid-range green hills with tree crowns (medium blur) */}
      <svg
        className="sky-scene__layer sky-scene__layer--mid"
        viewBox="0 0 800 180"
        preserveAspectRatio="none"
        aria-hidden="true"
        style={{ filter: 'url(#sky-blur-mid)', opacity: 0.45 }}
      >
        <defs>
          <linearGradient id="meadow-l2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={midColor} stopOpacity="0.7" />
            <stop offset="100%" stopColor={midColor} stopOpacity="0.25" />
          </linearGradient>
        </defs>
        <path
          d="M0,180 L0,115 Q30,105 60,110 C75,95 82,90 92,100 Q110,94 130,102
             C142,88 150,84 160,95 Q185,88 210,96 C222,80 230,76 240,88
             Q265,82 290,90 C302,74 310,70 320,82 Q345,78 370,86
             C382,72 388,68 398,80 Q420,74 445,82 C455,68 462,64 472,76
             Q500,70 530,80 C540,66 548,62 558,74 Q585,68 610,78
             C620,64 628,60 638,72 Q660,68 685,76 C695,62 702,58 712,70
             Q740,66 770,74 L800,72 L800,180 Z"
          fill="url(#meadow-l2)"
        />
        {/* Windmill on ridge */}
        <g className="sky-scene__windmill" transform="translate(530, 68)">
          <rect x="-1.5" y="0" width="3" height="16" fill={midColor} opacity="0.4" rx="0.5" />
          <g className="sky-scene__windmill-blades" transform="translate(0, 0)">
            <line x1="0" y1="0" x2="0" y2="-10" stroke={midColor} strokeWidth="1" opacity="0.35" />
            <line x1="0" y1="0" x2="8.7" y2="5" stroke={midColor} strokeWidth="1" opacity="0.35" />
            <line x1="0" y1="0" x2="-8.7" y2="5" stroke={midColor} strokeWidth="1" opacity="0.35" />
          </g>
        </g>
        {/* Small barn silhouette */}
        <g transform="translate(200, 88)" opacity="0.2">
          <rect x="0" y="0" width="10" height="8" fill={midColor} />
          <path d="M-1,0 L5,-5 L11,0 Z" fill={midColor} />
        </g>
      </svg>

      {/* Layer 3 — Near foreground ridge with detailed trees (slight blur) */}
      <svg
        className="sky-scene__layer sky-scene__layer--near"
        viewBox="0 0 800 140"
        preserveAspectRatio="none"
        aria-hidden="true"
        style={{ filter: 'url(#sky-blur-near)', opacity: 0.55 }}
      >
        <defs>
          <linearGradient id="meadow-l3" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={nearColor} stopOpacity="0.8" />
            <stop offset="100%" stopColor={nearColor} stopOpacity="0.3" />
          </linearGradient>
        </defs>
        <path
          d="M0,140 L0,85 Q20,78 40,82 C52,68 58,64 66,74 Q80,70 96,76
             C106,62 114,58 122,68 Q140,64 160,72 C170,56 178,52 186,64
             Q205,58 225,66 C235,50 244,46 252,58 Q275,52 298,62
             C308,46 316,42 324,54 Q348,48 370,58 C380,42 388,38 396,50
             Q420,44 445,54 C455,38 462,34 472,46 Q498,40 520,50
             C530,36 538,32 546,44 Q570,38 595,48 C605,34 612,30 620,42
             Q645,36 668,48 C678,34 686,30 694,42 Q718,38 740,46
             C748,34 756,30 764,42 Q785,38 800,44 L800,140 Z"
          fill="url(#meadow-l3)"
        />
        {/* Wildflower dots on ridge */}
        {[55, 92, 140, 195, 255, 312, 380, 445, 510, 580, 648, 718].map((x, i) => (
          <circle
            key={`flower-${i}`}
            cx={x}
            cy={64 + (i % 3) * 4}
            r={1.2 + (i % 2) * 0.4}
            fill={['#FF9EAA', '#FFD166', '#DDA0DD', '#A8E6CF', '#87CEEB'][i % 5]}
            opacity={0.5 + (i % 3) * 0.1}
          />
        ))}
        {/* Fence posts */}
        {[140, 152, 164, 176, 188].map((x, i) => (
          <rect key={`fence-${i}`} x={x} y={68} width="1" height="6" fill={nearColor} opacity="0.2" rx="0.3" />
        ))}
        <line x1="140" y1="70" x2="188" y2="70" stroke={nearColor} strokeWidth="0.5" opacity="0.12" />
      </svg>

      {/* Layer 4 — Foreground grass blades framing bottom */}
      <svg
        className="sky-scene__layer sky-scene__layer--foreground"
        viewBox="0 0 800 60"
        preserveAspectRatio="none"
        aria-hidden="true"
        style={{ opacity: 0.3 }}
      >
        {[0, 35, 80, 130, 180, 240, 300, 370, 440, 510, 580, 650, 720, 780].map((x, i) => (
          <path
            key={`grass-${i}`}
            d={`M${x},60 Q${x + 2},${40 + (i % 3) * 5} ${x + 4},${35 + (i % 4) * 4}
                Q${x + 6},${40 + (i % 3) * 5} ${x + 8},60`}
            fill={nearColor}
            opacity={0.3 + (i % 3) * 0.08}
          />
        ))}
      </svg>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// BEACH — Tropical ocean with island silhouettes, waves, palms
// ═══════════════════════════════════════════════════════════════════════════

function BeachScene({ theme }: { theme: IslandTheme }) {
  const [deepColor, midColor, shoreColor] = theme.skyScene.landscapeColors;
  return (
    <div className="sky-scene sky-scene--beach">
      <SharedFilters />

      {/* Warm horizon glow — tropical sunset hint */}
      <div
        className="sky-scene__atmo-glow"
        style={{
          background: 'radial-gradient(ellipse 100% 50% at 65% 100%, rgba(255,200,140,0.3) 0%, rgba(255,180,120,0.15) 30%, transparent 65%)',
          bottom: '25%',
          height: '45%',
        }}
      />

      {/* Sun reflection shimmer column on water */}
      <div className="sky-scene__sun-reflection" />

      {/* Layer 1 — Distant ocean horizon with far islands (heavy blur) */}
      <svg
        className="sky-scene__layer sky-scene__layer--far"
        viewBox="0 0 800 180"
        preserveAspectRatio="none"
        aria-hidden="true"
        style={{ filter: 'url(#sky-blur-far)', opacity: 0.35 }}
      >
        <defs>
          <linearGradient id="beach-l1" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={deepColor} stopOpacity="0.4" />
            <stop offset="100%" stopColor={deepColor} stopOpacity="0.55" />
          </linearGradient>
        </defs>
        {/* Ocean base */}
        <rect x="0" y="60" width="800" height="120" fill="url(#beach-l1)" />
        {/* Far island silhouettes */}
        <path
          d="M120,62 Q140,48 160,52 Q175,45 190,55 Q200,52 210,60"
          fill={deepColor} opacity="0.3"
        />
        <path
          d="M550,58 Q570,42 590,48 Q610,38 630,50 Q645,46 660,58"
          fill={deepColor} opacity="0.25"
        />
      </svg>

      {/* Layer 2 — Deep rolling waves (medium blur) */}
      <svg
        className="sky-scene__layer sky-scene__layer--mid"
        viewBox="0 0 800 160"
        preserveAspectRatio="none"
        aria-hidden="true"
        style={{ filter: 'url(#sky-blur-mid)', opacity: 0.4 }}
      >
        <defs>
          <linearGradient id="beach-l2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={midColor} stopOpacity="0.35" />
            <stop offset="100%" stopColor={midColor} stopOpacity="0.5" />
          </linearGradient>
        </defs>
        <path
          className="sky-scene__wave sky-scene__wave--deep"
          d="M0,80 Q60,62 120,76 Q180,88 240,72 Q300,58 360,72 Q420,84 480,68
             Q540,54 600,70 Q660,82 720,66 Q760,58 800,65 L800,160 L0,160 Z"
          fill="url(#beach-l2)"
        />
        {/* Foam highlights */}
        <path
          d="M0,80 Q60,62 120,76 Q180,88 240,72 Q300,58 360,72 Q420,84 480,68
             Q540,54 600,70 Q660,82 720,66 Q760,58 800,65"
          fill="none"
          stroke="rgba(255,255,255,0.2)"
          strokeWidth="1.5"
        />
      </svg>

      {/* Layer 3 — Shore waves with foam (slight blur) */}
      <svg
        className="sky-scene__layer sky-scene__layer--near"
        viewBox="0 0 800 120"
        preserveAspectRatio="none"
        aria-hidden="true"
        style={{ filter: 'url(#sky-blur-near)', opacity: 0.5 }}
      >
        <defs>
          <linearGradient id="beach-l3" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={shoreColor} stopOpacity="0.25" />
            <stop offset="100%" stopColor={shoreColor} stopOpacity="0.4" />
          </linearGradient>
        </defs>
        <path
          className="sky-scene__wave sky-scene__wave--shore"
          d="M0,55 Q50,42 100,52 Q150,60 200,48 Q250,38 300,50 Q350,58 400,45
             Q450,35 500,48 Q550,56 600,42 Q650,34 700,46 Q750,54 800,40 L800,120 L0,120 Z"
          fill="url(#beach-l3)"
        />
        <path
          className="sky-scene__foam-line"
          d="M0,55 Q50,42 100,52 Q150,60 200,48 Q250,38 300,50 Q350,58 400,45
             Q450,35 500,48 Q550,56 600,42 Q650,34 700,46 Q750,54 800,40"
          fill="none"
          stroke="rgba(255,255,255,0.25)"
          strokeWidth="1.2"
        />
        {/* Coral hints */}
        <ellipse cx="220" cy="85" rx="20" ry="6" fill="rgba(255,127,80,0.1)" />
        <ellipse cx="500" cy="90" rx="25" ry="7" fill="rgba(255,140,90,0.08)" />
      </svg>

      {/* Palm tree silhouettes */}
      <svg
        className="sky-scene__palm-left"
        viewBox="0 0 60 100"
        aria-hidden="true"
      >
        <path d="M28,100 Q26,70 30,50 Q32,35 29,25" fill="none" stroke="rgba(30,60,25,0.25)" strokeWidth="3" strokeLinecap="round" />
        <path d="M29,25 Q10,18 2,28" fill="none" stroke="rgba(30,70,25,0.2)" strokeWidth="2" />
        <path d="M29,25 Q15,12 5,15" fill="none" stroke="rgba(30,70,25,0.18)" strokeWidth="1.8" />
        <path d="M29,25 Q40,10 55,12" fill="none" stroke="rgba(30,70,25,0.2)" strokeWidth="2" />
        <path d="M29,25 Q45,18 58,24" fill="none" stroke="rgba(30,70,25,0.18)" strokeWidth="1.8" />
        <path d="M29,25 Q25,8 20,2" fill="none" stroke="rgba(30,70,25,0.16)" strokeWidth="1.5" />
      </svg>

      <svg className="sky-scene__palm-right" viewBox="0 0 50 80" aria-hidden="true">
        <path d="M24,80 Q22,55 25,38 Q27,26 24,18" fill="none" stroke="rgba(30,60,25,0.2)" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M24,18 Q8,12 2,20" fill="none" stroke="rgba(30,70,25,0.16)" strokeWidth="1.5" />
        <path d="M24,18 Q12,6 4,8" fill="none" stroke="rgba(30,70,25,0.14)" strokeWidth="1.3" />
        <path d="M24,18 Q35,8 48,10" fill="none" stroke="rgba(30,70,25,0.16)" strokeWidth="1.5" />
        <path d="M24,18 Q38,14 46,20" fill="none" stroke="rgba(30,70,25,0.14)" strokeWidth="1.3" />
      </svg>

      {/* Distant sailboat */}
      <svg className="sky-scene__sailboat" viewBox="0 0 16 14" aria-hidden="true">
        <path d="M3,10 Q8,8 13,10" fill="none" stroke="rgba(40,50,60,0.3)" strokeWidth="1.2" />
        <path d="M8,10 L8,2 L12,8 Z" fill="rgba(255,255,255,0.35)" />
        <path d="M8,10 L8,3 L5,8 Z" fill="rgba(255,255,255,0.25)" />
      </svg>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// WINTER — Dramatic peaks with atmospheric perspective, aurora, ice
// ═══════════════════════════════════════════════════════════════════════════

function WinterScene({ theme }: { theme: IslandTheme }) {
  const [farPeak, nearPeak, snowColor] = theme.skyScene.landscapeColors;
  return (
    <div className="sky-scene sky-scene--winter">
      <SharedFilters />

      {/* Cold atmospheric glow at horizon */}
      <div
        className="sky-scene__atmo-glow"
        style={{
          background: 'radial-gradient(ellipse 100% 45% at 50% 100%, rgba(180,210,240,0.2) 0%, rgba(160,200,240,0.1) 35%, transparent 65%)',
          bottom: '18%',
          height: '50%',
        }}
      />

      {/* Layer 1 — Distant ethereal peaks (heaviest blur) */}
      <svg
        className="sky-scene__layer sky-scene__layer--far"
        viewBox="0 0 800 200"
        preserveAspectRatio="none"
        aria-hidden="true"
        style={{ filter: 'url(#sky-blur-far)', opacity: 0.3 }}
      >
        <defs>
          <linearGradient id="winter-l1" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={farPeak} stopOpacity="0.5" />
            <stop offset="100%" stopColor={farPeak} stopOpacity="0.15" />
          </linearGradient>
          <linearGradient id="winter-snow-1" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={snowColor} stopOpacity="0.6" />
            <stop offset="35%" stopColor={snowColor} stopOpacity="0.15" />
            <stop offset="100%" stopColor={snowColor} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d="M0,200 L0,140 L30,120 L50,135 L80,80 L105,110 L130,55 L160,90
             L190,40 L220,75 L250,30 L280,65 L310,20 L340,55 L370,15
             L400,50 L430,25 L460,55 L490,35 L520,60 L550,22 L580,55
             L610,40 L640,62 L670,30 L700,55 L730,42 L760,58 L800,50 L800,200 Z"
          fill="url(#winter-l1)"
        />
        <path
          d="M0,200 L0,140 L30,120 L50,135 L80,80 L105,110 L130,55 L160,90
             L190,40 L220,75 L250,30 L280,65 L310,20 L340,55 L370,15
             L400,50 L430,25 L460,55 L490,35 L520,60 L550,22 L580,55
             L610,40 L640,62 L670,30 L700,55 L730,42 L760,58 L800,50 L800,200 Z"
          fill="url(#winter-snow-1)"
        />
      </svg>

      {/* Layer 2 — Mid-range mountains with pine forest (medium blur) */}
      <svg
        className="sky-scene__layer sky-scene__layer--mid"
        viewBox="0 0 800 160"
        preserveAspectRatio="none"
        aria-hidden="true"
        style={{ filter: 'url(#sky-blur-mid)', opacity: 0.4 }}
      >
        <defs>
          <linearGradient id="winter-l2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={nearPeak} stopOpacity="0.55" />
            <stop offset="100%" stopColor={nearPeak} stopOpacity="0.2" />
          </linearGradient>
        </defs>
        <path
          d="M0,160 L0,110 L25,95 L45,108 L75,65 L100,88 L130,50 L155,75
             L185,38 L210,62 L240,42 L270,60 L300,30 L325,55 L355,35
             L380,58 L410,40 L440,60 L470,45 L500,62 L530,38 L560,58
             L590,42 L620,60 L650,48 L680,62 L710,52 L740,64 L770,55 L800,60 L800,160 Z"
          fill="url(#winter-l2)"
        />
        {/* Snow cap highlights */}
        <path
          d="M0,160 L0,110 L25,95 L45,108 L75,65 L100,88 L130,50 L155,75
             L185,38 L210,62 L240,42 L270,60 L300,30 L325,55 L355,35
             L380,58 L410,40 L440,60 L470,45 L500,62 L530,38 L560,58
             L590,42 L620,60 L650,48 L680,62 L710,52 L740,64 L770,55 L800,60 L800,160 Z"
          fill="url(#winter-snow-1)"
          opacity="0.5"
        />
        {/* Pine tree silhouettes along base */}
        {[80, 150, 230, 320, 410, 500, 580, 660, 740].map((x, i) => (
          <path
            key={`pine-${i}`}
            d={`M${x},${90 + (i % 3) * 4} L${x - 5},${102 + (i % 3) * 4} L${x - 2},${98 + (i % 3) * 4}
                L${x - 7},${108 + (i % 3) * 4} L${x + 7},${108 + (i % 3) * 4}
                L${x + 2},${98 + (i % 3) * 4} L${x + 5},${102 + (i % 3) * 4} Z`}
            fill={nearPeak}
            opacity={0.25 + (i % 3) * 0.05}
          />
        ))}
      </svg>

      {/* Layer 3 — Near snow-covered ridge (slight blur) */}
      <svg
        className="sky-scene__layer sky-scene__layer--near"
        viewBox="0 0 800 100"
        preserveAspectRatio="none"
        aria-hidden="true"
        style={{ filter: 'url(#sky-blur-near)', opacity: 0.5 }}
      >
        <defs>
          <linearGradient id="winter-l3" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={nearPeak} stopOpacity="0.6" />
            <stop offset="100%" stopColor={nearPeak} stopOpacity="0.25" />
          </linearGradient>
        </defs>
        <path
          d="M0,100 L0,65 L30,55 L55,68 L85,40 L110,58 L140,32 L165,52
             L195,28 L220,48 L250,35 L280,52 L310,30 L340,48 L370,38
             L400,52 L430,35 L460,50 L490,38 L520,52 L550,34 L580,48
             L610,38 L640,52 L670,42 L700,55 L730,48 L760,58 L800,52 L800,100 Z"
          fill="url(#winter-l3)"
        />
        {/* Snow-covered pine trees in foreground */}
        {[50, 130, 220, 310, 400, 490, 580, 680, 770].map((x, i) => (
          <g key={`snow-pine-${i}`} opacity={0.3 + (i % 3) * 0.05}>
            <path
              d={`M${x},${58 + (i % 3) * 3} L${x - 4},${68 + (i % 3) * 3} L${x + 4},${68 + (i % 3) * 3} Z`}
              fill={nearPeak}
            />
            <path
              d={`M${x},${58 + (i % 3) * 3} L${x - 3},${64 + (i % 3) * 3} L${x + 3},${64 + (i % 3) * 3} Z`}
              fill={snowColor}
              opacity="0.4"
            />
          </g>
        ))}
      </svg>

      {/* Mist layer */}
      <div className="sky-scene__mist" />

      {/* Ice crystal sparkles */}
      <div className="sky-scene__ice-crystal sky-scene__ice-crystal--1" />
      <div className="sky-scene__ice-crystal sky-scene__ice-crystal--2" />
      <div className="sky-scene__ice-crystal sky-scene__ice-crystal--3" />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// DESERT — Golden dunes with mesa formations, heat shimmer
// ═══════════════════════════════════════════════════════════════════════════

function DesertScene({ theme }: { theme: IslandTheme }) {
  const [farDune, midDune, nearDune] = theme.skyScene.landscapeColors;
  return (
    <div className="sky-scene sky-scene--desert">
      <SharedFilters />

      {/* Intense golden horizon glow */}
      <div
        className="sky-scene__atmo-glow"
        style={{
          background: 'radial-gradient(ellipse 110% 55% at 60% 100%, rgba(255,200,100,0.35) 0%, rgba(255,180,80,0.15) 35%, transparent 65%)',
          bottom: '18%',
          height: '55%',
        }}
      />

      {/* Layer 1 — Distant mesa formations (heavy blur, heat shimmer) */}
      <svg
        className="sky-scene__layer sky-scene__layer--far"
        viewBox="0 0 800 180"
        preserveAspectRatio="none"
        aria-hidden="true"
        style={{ filter: 'url(#sky-blur-far)', opacity: 0.28 }}
      >
        <defs>
          <linearGradient id="desert-l1" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={farDune} stopOpacity="0.4" />
            <stop offset="100%" stopColor={farDune} stopOpacity="0.12" />
          </linearGradient>
        </defs>
        {/* Mesa/butte formations */}
        <path
          d="M0,180 L0,130 Q40,120 80,128 L100,128 L100,90 L115,85 L130,90
             L130,125 Q180,115 230,122 Q280,110 330,118 L350,118 L350,75 L370,68
             L390,75 L390,115 Q440,108 500,115 Q560,105 620,112 L640,112
             L640,80 L660,72 L680,80 L680,112 Q730,106 800,115 L800,180 Z"
          fill="url(#desert-l1)"
        />
      </svg>

      {/* Layer 2 — Mid dunes with shimmer (medium blur) */}
      <svg
        className="sky-scene__layer sky-scene__layer--mid sky-scene__shimmer-target"
        viewBox="0 0 800 140"
        preserveAspectRatio="none"
        aria-hidden="true"
        style={{ filter: 'url(#sky-blur-mid)', opacity: 0.38 }}
      >
        <defs>
          <linearGradient id="desert-l2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={midDune} stopOpacity="0.5" />
            <stop offset="100%" stopColor={midDune} stopOpacity="0.18" />
          </linearGradient>
        </defs>
        <path
          d="M0,140 L0,85 Q60,65 120,78 Q180,55 240,70 Q300,50 360,65
             Q420,48 480,62 Q540,50 600,64 Q660,55 720,68 Q760,60 800,65 L800,140 Z"
          fill="url(#desert-l2)"
        />
        {/* Sand ripple lines */}
        {[0, 1, 2].map((i) => (
          <path
            key={`ripple-${i}`}
            d={`M${40 + i * 250},${100 + i * 5} Q${120 + i * 250},${95 + i * 5} ${200 + i * 250},${100 + i * 5}`}
            fill="none"
            stroke={midDune}
            strokeWidth="0.6"
            opacity="0.12"
          />
        ))}
      </svg>

      {/* Layer 3 — Near dunes (slight blur) */}
      <svg
        className="sky-scene__layer sky-scene__layer--near"
        viewBox="0 0 800 100"
        preserveAspectRatio="none"
        aria-hidden="true"
        style={{ filter: 'url(#sky-blur-near)', opacity: 0.48 }}
      >
        <defs>
          <linearGradient id="desert-l3" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={nearDune} stopOpacity="0.6" />
            <stop offset="100%" stopColor={nearDune} stopOpacity="0.25" />
          </linearGradient>
        </defs>
        <path
          d="M0,100 L0,55 Q50,38 100,48 Q160,30 220,42 Q280,25 340,38
             Q400,22 460,35 Q520,25 580,38 Q640,30 700,40 Q740,34 800,38 L800,100 Z"
          fill="url(#desert-l3)"
        />
        {/* Desert brush silhouettes */}
        {[100, 280, 450, 640].map((x, i) => (
          <g key={`brush-${i}`} opacity={0.15 + (i % 2) * 0.05}>
            <path d={`M${x},${48 + (i % 3) * 3} Q${x - 3},${38 + (i % 3) * 3} ${x - 1},${32 + (i % 3) * 3}`} fill="none" stroke="rgba(80,100,40,0.3)" strokeWidth="1" />
            <path d={`M${x},${48 + (i % 3) * 3} Q${x + 4},${36 + (i % 3) * 3} ${x + 2},${30 + (i % 3) * 3}`} fill="none" stroke="rgba(80,100,40,0.25)" strokeWidth="0.8" />
          </g>
        ))}
      </svg>

      {/* Oasis mirage */}
      <div className="sky-scene__oasis-mirage">
        <svg viewBox="0 0 40 20" aria-hidden="true">
          <ellipse cx="20" cy="16" rx="16" ry="3" fill="rgba(60,180,220,0.15)" />
          <path d="M14,14 Q13,6 16,4" fill="none" stroke="rgba(40,100,50,0.2)" strokeWidth="1" />
          <path d="M26,14 Q25,5 28,3" fill="none" stroke="rgba(40,100,50,0.18)" strokeWidth="1" />
        </svg>
      </div>

      {/* Distant caravan */}
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
// NIGHT — Milky Way, constellations, bioluminescent landscape
// ═══════════════════════════════════════════════════════════════════════════

function NightScene({ theme }: { theme: IslandTheme }) {
  const [farCliff, nearCliff, accentCliff] = theme.skyScene.landscapeColors;
  return (
    <div className="sky-scene sky-scene--night">
      <SharedFilters />

      {/* Milky Way band */}
      <div className="sky-scene__milky-way" />

      {/* Nebula patches */}
      <div className="sky-scene__nebula sky-scene__nebula--1" />
      <div className="sky-scene__nebula sky-scene__nebula--2" />

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
        {/* Star points at constellation vertices */}
        {[[65,30],[85,22],[78,45],[200,40],[215,25],[230,38],[248,30],[320,50],[335,35],[350,50],[335,65]].map(([cx,cy], i) => (
          <circle key={`star-${i}`} cx={cx} cy={cy} r="1" fill="rgba(220,230,255,0.4)" />
        ))}
      </svg>

      {/* Moonlight cone */}
      <div className="sky-scene__moonlight-cone" />

      {/* Layer 1 — Far cliff range (heavy blur, dark) */}
      <svg
        className="sky-scene__layer sky-scene__layer--far"
        viewBox="0 0 800 180"
        preserveAspectRatio="none"
        aria-hidden="true"
        style={{ filter: 'url(#sky-blur-far)', opacity: 0.35 }}
      >
        <path
          d="M0,180 L0,130 L30,118 L55,132 L90,90 L120,115 L155,72 L185,100
             L220,58 L250,85 L285,50 L315,78 L350,42 L380,70 L415,38 L445,65
             L480,45 L510,70 L545,50 L575,72 L610,55 L640,75 L675,58
             L705,78 L740,62 L770,78 L800,70 L800,180 Z"
          fill={farCliff}
          opacity="0.5"
        />
      </svg>

      {/* Layer 2 — Near cliffs with bioluminescent details (medium blur) */}
      <svg
        className="sky-scene__layer sky-scene__layer--near"
        viewBox="0 0 800 140"
        preserveAspectRatio="none"
        aria-hidden="true"
        style={{ filter: 'url(#sky-blur-mid)', opacity: 0.5 }}
      >
        <path
          d="M0,140 L0,100 L35,88 L65,102 L100,65 L130,85 L168,52 L198,75
             L235,42 L265,65 L300,38 L330,60 L368,35 L398,58 L435,32
             L465,55 L500,38 L530,58 L568,42 L598,60 L635,48 L665,65
             L700,52 L730,68 L768,55 L800,62 L800,140 Z"
          fill={nearCliff}
          opacity="0.55"
        />
        {/* Bioluminescent moss spots along cliff edges */}
        {[52, 118, 185, 252, 318, 385, 452, 518, 585, 652, 718].map((x, i) => (
          <circle
            key={`glow-${i}`}
            cx={x}
            cy={68 + (i % 3) * 6}
            r="2"
            fill="rgba(100,255,200,0.5)"
            className="sky-scene__bio-dot"
            style={{ animationDelay: `${i * 0.6}s` } as React.CSSProperties}
          />
        ))}
        {/* Moonlight rim-light on cliff edges */}
        <path
          d="M0,140 L0,100 L35,88 L65,102 L100,65 L130,85 L168,52 L198,75
             L235,42 L265,65 L300,38 L330,60 L368,35 L398,58 L435,32
             L465,55 L500,38 L530,58 L568,42 L598,60 L635,48 L665,65
             L700,52 L730,68 L768,55 L800,62"
          fill="none"
          stroke="rgba(140,170,255,0.1)"
          strokeWidth="1.5"
        />
      </svg>

      {/* Enhanced firefly field */}
      <div className="sky-scene__firefly-field">
        {Array.from({ length: 20 }, (_, i) => (
          <div
            key={`ff-${i}`}
            className="sky-scene__firefly"
            style={{
              left: `${(i * 29 + 8) % 92}%`,
              top: `${22 + (i * 23) % 58}%`,
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
// SAKURA — Dreamy cherry blossom landscape with torii gate
// ═══════════════════════════════════════════════════════════════════════════

function SakuraScene({ theme }: { theme: IslandTheme }) {
  const [farColor, midColor, nearColor] = theme.skyScene.landscapeColors;
  return (
    <div className="sky-scene sky-scene--sakura">
      <SharedFilters />

      {/* Warm pink atmospheric glow */}
      <div
        className="sky-scene__atmo-glow"
        style={{
          background: 'radial-gradient(ellipse 110% 50% at 55% 100%, rgba(255,180,200,0.25) 0%, rgba(255,160,180,0.12) 35%, transparent 65%)',
          bottom: '20%',
          height: '50%',
        }}
      />

      {/* Layer 1 — Distant misty pink mountains (heavy blur) */}
      <svg
        className="sky-scene__layer sky-scene__layer--far"
        viewBox="0 0 800 180"
        preserveAspectRatio="none"
        aria-hidden="true"
        style={{ filter: 'url(#sky-blur-far)', opacity: 0.3 }}
      >
        <defs>
          <linearGradient id="sakura-l1" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={farColor} stopOpacity="0.45" />
            <stop offset="100%" stopColor={farColor} stopOpacity="0.12" />
          </linearGradient>
        </defs>
        <path
          d="M0,180 L0,110 Q50,90 100,100 Q150,78 200,92 Q250,68 300,82
             Q350,60 400,75 Q450,62 500,78 Q550,65 600,80 Q650,70 700,82
             Q750,75 800,85 L800,180 Z"
          fill="url(#sakura-l1)"
        />
        {/* Torii gate silhouette on far ridge */}
        <g transform="translate(380, 68)" opacity="0.15">
          <rect x="-8" y="0" width="16" height="2" rx="0.5" fill={farColor} />
          <rect x="-9" y="-3" width="18" height="2" rx="0.5" fill={farColor} />
          <rect x="-6" y="0" width="2" height="14" fill={farColor} />
          <rect x="4" y="0" width="2" height="14" fill={farColor} />
        </g>
      </svg>

      {/* Layer 2 — Mid hills with cherry tree clusters (medium blur) */}
      <svg
        className="sky-scene__layer sky-scene__layer--mid"
        viewBox="0 0 800 150"
        preserveAspectRatio="none"
        aria-hidden="true"
        style={{ filter: 'url(#sky-blur-mid)', opacity: 0.4 }}
      >
        <defs>
          <linearGradient id="sakura-l2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={midColor} stopOpacity="0.55" />
            <stop offset="100%" stopColor={midColor} stopOpacity="0.15" />
          </linearGradient>
        </defs>
        <path
          d="M0,150 L0,90 Q30,78 65,84 C80,68 88,64 98,76 Q120,70 145,78
             C158,62 166,58 176,70 Q200,64 228,72 C240,55 250,50 260,64
             Q285,58 312,66 C324,50 332,46 342,58 Q368,52 395,62
             C408,46 416,42 426,54 Q452,48 480,58 C492,42 500,38 510,50
             Q538,44 565,54 C578,38 586,34 596,46 Q622,42 650,52
             C662,36 670,32 680,44 Q708,38 738,48 C748,36 756,32 766,44
             Q790,40 800,45 L800,150 Z"
          fill="url(#sakura-l2)"
        />
        {/* Cherry blossom clusters on tree tops */}
        {[92, 170, 254, 336, 420, 504, 590, 674, 760].map((x, i) => (
          <circle
            key={`bloom-${i}`}
            cx={x}
            cy={58 + (i % 3) * 4}
            r={5 + (i % 2) * 1.5}
            fill="rgba(255,180,200,0.22)"
          />
        ))}
      </svg>

      {/* Layer 3 — Near ridge with detailed cherry trees (slight blur) */}
      <svg
        className="sky-scene__layer sky-scene__layer--near"
        viewBox="0 0 800 110"
        preserveAspectRatio="none"
        aria-hidden="true"
        style={{ filter: 'url(#sky-blur-near)', opacity: 0.5 }}
      >
        <defs>
          <linearGradient id="sakura-l3" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={nearColor} stopOpacity="0.65" />
            <stop offset="100%" stopColor={nearColor} stopOpacity="0.2" />
          </linearGradient>
        </defs>
        <path
          d="M0,110 L0,62 Q30,50 65,56 C78,40 84,36 94,48 Q118,42 145,50
             C158,34 166,30 176,42 Q200,36 228,44 C240,28 250,24 260,36
             Q285,30 312,40 C324,24 332,20 342,32 Q368,26 395,36
             C408,20 416,16 426,28 Q452,22 480,32 C492,18 500,14 510,26
             Q538,20 565,30 C578,16 586,12 596,24 Q622,18 650,28
             C662,14 670,10 680,22 Q708,16 738,26 C748,14 756,10 766,22
             Q790,18 800,22 L800,110 Z"
          fill="url(#sakura-l3)"
        />
        {/* Stone lantern silhouettes */}
        <g transform="translate(200, 44)" opacity="0.18">
          <rect x="-2" y="0" width="4" height="6" fill={nearColor} />
          <rect x="-3" y="-1" width="6" height="2" rx="0.5" fill={nearColor} />
          <rect x="-1.5" y="-4" width="3" height="3" rx="0.5" fill={nearColor} />
        </g>
        <g transform="translate(600, 28)" opacity="0.15">
          <rect x="-2" y="0" width="4" height="6" fill={nearColor} />
          <rect x="-3" y="-1" width="6" height="2" rx="0.5" fill={nearColor} />
          <rect x="-1.5" y="-4" width="3" height="3" rx="0.5" fill={nearColor} />
        </g>
      </svg>

      {/* Wisteria vines framing top */}
      <div className="sky-scene__wisteria">
        <div className="sky-scene__vine sky-scene__vine--1" />
        <div className="sky-scene__vine sky-scene__vine--2" />
        <div className="sky-scene__vine sky-scene__vine--3" />
      </div>

      {/* Cherry branch framing top-right */}
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
