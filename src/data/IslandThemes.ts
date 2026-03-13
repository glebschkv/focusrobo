/**
 * Island Theme Definitions
 *
 * Each archipelago island has a unique biome with its own visual identity:
 * sky composition, cliff materials, surface textures, animated elements.
 * Themes are derived from the active island's biome — not user-selectable.
 */

export interface IslandTheme {
  id: string;
  name: string;
  /** 4-stop sky gradient (top → bottom) */
  sky: [string, string, string, string];
  /** Checkerboard tile colors */
  grassLight: [string, string];
  grassDark: [string, string];
  /** Grass base gradient */
  grassBase: [string, string, string, string];
  /** Grass edge/overhang */
  grassEdge: [string, string];
  /** Cliff lip (grass-to-dirt transition) */
  lipLeft: [string, string, string];
  lipRight: [string, string, string];
  /** Cliff dirt band */
  dirtLeft: [string, string, string];
  dirtRight: [string, string, string];
  /** Cliff stone band base */
  stoneBaseLeft: string;
  stoneBaseRight: string;
  /** Cloud tint (rgba) */
  cloudColor: string;
  /** Sun glow color */
  sunColor: string;
  /** Ambient particles style */
  particles: 'dust' | 'snow' | 'leaves' | 'sparkles' | 'fireflies';
  /** Particle colors */
  particleColors: string[];

  // ─── Biome-Specific Visual Properties ────────────────────────────

  /** Stone block color palette for cliff walls (10 colors each side) */
  stoneColors: { left: string[]; right: string[] };

  /** Cliff detail accent colors */
  cliffDetails: {
    moss: string;
    roots: string;
    grassStrands: string;
    pebbleTint: number;
  };

  /** Grass surface detail colors */
  surfaceDetails: {
    tufts: string;
    dapples: string;
    dirtPatches: string;
    overhangStroke: string;
    blades: string;
    tileStroke: string;
  };

  /** Tier decoration palette */
  tierDecorations: {
    flowerColors: string[];
    rockColor: string;
    mushroomCap: string;
    mushroomStem: string;
  };

  /** Depth shading overlay colors */
  depthShading: {
    shadow: string;
    highlight: string;
  };

  /** Sky scene composition */
  skyScene: {
    landscape: 'hills' | 'ocean' | 'dunes' | 'peaks' | 'cliffs' | 'none';
    landscapeColors: [string, string, string];
    treeline: boolean;
    treelineColor: string;
    hazeColor: string;
    sunStyle: 'golden' | 'pale' | 'warm' | 'moon' | 'setting' | 'hidden';
    rayColor: string;
    rayOpacity: number;
  };

  /** Unique animated sky elements */
  skyAnimations: {
    type: 'none' | 'butterflies' | 'seagulls' | 'aurora' | 'shooting-stars' | 'petal-stream' | 'heat-shimmer';
    cssClass: string;
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// THEME DEFINITIONS — One per archipelago biome
// ═══════════════════════════════════════════════════════════════════════════

export const ISLAND_THEMES: Record<string, IslandTheme> = {

  // ─── HOME ISLAND — Studio Ghibli Pastoral ────────────────────────
  day: {
    id: 'day',
    name: 'Meadow',
    sky: ['#58B8E8', '#8CD4F4', '#C0E8F8', '#E8F6F2'],
    grassLight: ['#D4F488', '#C0E870'],
    grassDark: ['#9CCE4C', '#8CC040'],
    grassBase: ['#C4E87A', '#B0D85A', '#9CC84E', '#88B842'],
    grassEdge: ['#88B842', '#6B9430'],
    lipLeft: ['#72A834', '#5E9228', '#9A8448'],
    lipRight: ['#648E2C', '#507A20', '#8A7440'],
    dirtLeft: ['#B09858', '#A08850', '#887440'],
    dirtRight: ['#988048', '#8A7440', '#746434'],
    stoneBaseLeft: '#5C5444',
    stoneBaseRight: '#504840',
    cloudColor: 'rgba(255, 255, 255, 0.85)',
    sunColor: 'rgba(255, 240, 200, 1)',
    particles: 'dust',
    particleColors: [
      'rgba(255, 255, 240, 0.5)',
      'rgba(255, 240, 200, 0.4)',
      'rgba(200, 230, 120, 0.3)',
      'rgba(255, 255, 255, 0.45)',
    ],
    stoneColors: {
      left: ['#706858', '#7A7264', '#686050', '#746C5C', '#6E6654', '#7C7466', '#626050', '#78705E', '#6A6252', '#72685A'],
      right: ['#625A4C', '#6C6454', '#5A5244', '#66604E', '#5E5848', '#6A6252', '#585040', '#645C4C', '#5C5646', '#625A4E'],
    },
    cliffDetails: {
      moss: 'rgba(75, 115, 35, 0.15)',
      roots: 'rgba(55, 85, 22, 0.2)',
      grassStrands: 'rgba(80, 140, 30, 0.3)',
      pebbleTint: 90,
    },
    surfaceDetails: {
      tufts: 'rgba(60, 100, 25, 0.1)',
      dapples: 'rgba(210, 240, 120, 0.12)',
      dirtPatches: 'rgba(140, 120, 80, 0.09)',
      overhangStroke: 'rgba(55, 80, 25, 0.18)',
      blades: 'rgba(90, 140, 35, 0.35)',
      tileStroke: 'rgba(75, 120, 28, 0.2)',
    },
    tierDecorations: {
      flowerColors: ['#FF9EAA', '#FFD166', '#A8E6CF', '#DDA0DD', '#87CEEB'],
      rockColor: 'rgba(140, 130, 110, 0.3)',
      mushroomCap: 'rgba(200, 80, 80, 0.35)',
      mushroomStem: 'rgba(180, 160, 130, 0.4)',
    },
    depthShading: {
      shadow: 'rgba(40, 70, 15, 0.15)',
      highlight: 'rgba(220, 250, 130, 0.2)',
    },
    skyScene: {
      landscape: 'hills',
      landscapeColors: ['#8898AA', '#7A9A88', '#6B8866'],
      treeline: true,
      treelineColor: 'rgba(45, 80, 35, 0.04)',
      hazeColor: 'rgba(255, 248, 220, 0.35)',
      sunStyle: 'golden',
      rayColor: 'rgba(255, 235, 170, 0.3)',
      rayOpacity: 0.35,
    },
    skyAnimations: {
      type: 'butterflies',
      cssClass: 'pet-land--biome-meadow',
    },
  },

  // ─── CORAL REEF — Tropical Paradise ──────────────────────────────
  beach: {
    id: 'beach',
    name: 'Beach',
    sky: ['#5BB8E8', '#82D0F0', '#B0E4F8', '#E8F4FA'],
    grassLight: ['#F5E6A8', '#ECD898'],
    grassDark: ['#E0CA78', '#D4BC68'],
    grassBase: ['#F0E0A0', '#E4D490', '#D8C880', '#CCB870'],
    grassEdge: ['#C8B068', '#B09850'],
    lipLeft: ['#B8A458', '#A09040', '#988860'],
    lipRight: ['#A89448', '#908030', '#887850'],
    dirtLeft: ['#C8B878', '#B8A868', '#A89858'],
    dirtRight: ['#B8A868', '#A89858', '#988848'],
    stoneBaseLeft: '#887858',
    stoneBaseRight: '#786848',
    cloudColor: 'rgba(255, 255, 255, 0.9)',
    sunColor: 'rgba(255, 230, 150, 1)',
    particles: 'sparkles',
    particleColors: [
      'rgba(255, 248, 200, 0.6)',
      'rgba(255, 240, 170, 0.5)',
      'rgba(255, 255, 220, 0.55)',
      'rgba(200, 230, 255, 0.4)',
    ],
    stoneColors: {
      left: ['#C8B898', '#D4C4A8', '#BEAD8D', '#C9B99A', '#B8A888', '#D0BFA0', '#BAA990', '#C5B698', '#B4A484', '#C0B090'],
      right: ['#B8A888', '#C4B498', '#AE9D7D', '#B9A98A', '#A89878', '#C0AF90', '#AA9980', '#B5A688', '#A49474', '#B0A080'],
    },
    cliffDetails: {
      moss: 'rgba(255, 140, 110, 0.18)',       // coral pink accents
      roots: 'rgba(80, 160, 120, 0.22)',        // seaweed green
      grassStrands: 'rgba(60, 150, 100, 0.25)', // seaweed strands
      pebbleTint: 180,                           // sandy shells
    },
    surfaceDetails: {
      tufts: 'rgba(200, 180, 120, 0.1)',        // sandy tufts
      dapples: 'rgba(255, 250, 200, 0.15)',     // sun sparkle on sand
      dirtPatches: 'rgba(180, 160, 110, 0.08)', // dry sand patches
      overhangStroke: 'rgba(160, 140, 80, 0.18)',
      blades: 'rgba(140, 180, 80, 0.25)',       // sparse grass
      tileStroke: 'rgba(180, 160, 100, 0.15)',
    },
    tierDecorations: {
      flowerColors: ['#FF7B6B', '#FFA07A', '#40E0D0', '#FFD700', '#FF6B9D'], // tropical
      rockColor: 'rgba(200, 180, 140, 0.3)',     // sandstone
      mushroomCap: 'rgba(255, 127, 80, 0.3)',    // coral formation
      mushroomStem: 'rgba(200, 180, 150, 0.35)',
    },
    depthShading: {
      shadow: 'rgba(60, 80, 40, 0.12)',
      highlight: 'rgba(255, 250, 200, 0.18)',
    },
    skyScene: {
      landscape: 'ocean',
      landscapeColors: ['#1A7ACC', '#3EA8D8', '#87CEEB'],
      treeline: false,
      treelineColor: '',
      hazeColor: 'rgba(200, 230, 255, 0.25)',
      sunStyle: 'warm',
      rayColor: 'rgba(255, 240, 180, 0.25)',
      rayOpacity: 0.3,
    },
    skyAnimations: {
      type: 'seagulls',
      cssClass: 'pet-land--biome-beach',
    },
  },

  // ─── SNOW PEAK — Crystalline Summit ──────────────────────────────
  winter: {
    id: 'winter',
    name: 'Winter',
    sky: ['#1A3050', '#3A5878', '#6888A8', '#98B8D0'],
    grassLight: ['#E8F0F8', '#D8E8F0'],
    grassDark: ['#C4D8E8', '#B0CCE0'],
    grassBase: ['#D8E8F2', '#C8DCE8', '#B8D0E0', '#A8C4D8'],
    grassEdge: ['#A0B8C8', '#88A0B4'],
    lipLeft: ['#90A8B8', '#7898A8', '#887868'],
    lipRight: ['#8098A8', '#688898', '#786860'],
    dirtLeft: ['#8A8070', '#7A7060', '#6A6050'],
    dirtRight: ['#7A7060', '#6A6050', '#5A5040'],
    stoneBaseLeft: '#605850',
    stoneBaseRight: '#504840',
    cloudColor: 'rgba(200, 220, 240, 0.6)',
    sunColor: 'rgba(200, 220, 240, 0.7)',
    particles: 'snow',
    particleColors: [
      'rgba(255, 255, 255, 0.7)',
      'rgba(220, 235, 255, 0.6)',
      'rgba(200, 220, 245, 0.5)',
      'rgba(240, 248, 255, 0.65)',
    ],
    stoneColors: {
      left: ['#7888A0', '#8898B0', '#6878A0', '#8090A8', '#7080A0', '#8A98B0', '#6070A0', '#7888A8', '#6878A0', '#7080A0'],
      right: ['#687898', '#7888A0', '#586890', '#708098', '#607090', '#7A88A0', '#506888', '#688098', '#587090', '#607898'],
    },
    cliffDetails: {
      moss: 'rgba(180, 220, 255, 0.2)',         // frost crystal spots
      roots: 'rgba(150, 200, 240, 0.2)',         // ice cracks
      grassStrands: 'rgba(160, 200, 230, 0.25)', // icicle strands
      pebbleTint: 180,                            // ice shards (blue-grey)
    },
    surfaceDetails: {
      tufts: 'rgba(200, 220, 240, 0.12)',        // snow texture
      dapples: 'rgba(180, 230, 255, 0.15)',      // ice crystal sparkle
      dirtPatches: 'rgba(160, 180, 200, 0.08)',  // frost patches
      overhangStroke: 'rgba(130, 160, 190, 0.18)',
      blades: 'rgba(160, 200, 230, 0.2)',        // ice formations
      tileStroke: 'rgba(140, 170, 200, 0.15)',
    },
    tierDecorations: {
      flowerColors: ['#B0D8FF', '#C8E4FF', '#90C8FF', '#E0F0FF', '#A8D0FF'], // ice flowers
      rockColor: 'rgba(160, 180, 200, 0.3)',     // snow-covered rocks
      mushroomCap: 'rgba(140, 200, 240, 0.3)',   // frost mushroom
      mushroomStem: 'rgba(180, 200, 220, 0.35)',
    },
    depthShading: {
      shadow: 'rgba(30, 50, 80, 0.15)',
      highlight: 'rgba(200, 230, 255, 0.2)',
    },
    skyScene: {
      landscape: 'peaks',
      landscapeColors: ['#4A6080', '#6880A0', '#E8F0F8'],
      treeline: false,
      treelineColor: '',
      hazeColor: 'rgba(180, 210, 240, 0.3)',
      sunStyle: 'pale',
      rayColor: 'rgba(200, 220, 255, 0.2)',
      rayOpacity: 0.2,
    },
    skyAnimations: {
      type: 'aurora',
      cssClass: 'pet-land--biome-winter',
    },
  },

  // ─── DESERT OASIS — Golden Mirage ────────────────────────────────
  desert: {
    id: 'desert',
    name: 'Desert',
    sky: ['#D4A050', '#E0B868', '#E8D098', '#F4E8D0'],
    grassLight: ['#F0D898', '#E8CC88'],
    grassDark: ['#D4B870', '#C8AC60'],
    grassBase: ['#E8D090', '#DCC480', '#D0B870', '#C4AC60'],
    grassEdge: ['#C0A458', '#A88C48'],
    lipLeft: ['#B89C50', '#A08840', '#988868'],
    lipRight: ['#A88C40', '#907830', '#887858'],
    dirtLeft: ['#C4A870', '#B49860', '#A48850'],
    dirtRight: ['#B49860', '#A48850', '#947840'],
    stoneBaseLeft: '#887050',
    stoneBaseRight: '#786040',
    cloudColor: 'rgba(255, 240, 210, 0.5)',
    sunColor: 'rgba(255, 210, 120, 1)',
    particles: 'dust',
    particleColors: [
      'rgba(255, 230, 180, 0.5)',
      'rgba(255, 220, 160, 0.4)',
      'rgba(240, 210, 150, 0.45)',
      'rgba(255, 240, 200, 0.5)',
    ],
    stoneColors: {
      left: ['#C4A878', '#D0B488', '#B89868', '#C8A880', '#B49070', '#CEB088', '#AA8860', '#C0A078', '#B09068', '#B89878'],
      right: ['#B49868', '#C0A478', '#A88858', '#B89870', '#A48060', '#BEA078', '#9A7850', '#B09068', '#A08058', '#A88868'],
    },
    cliffDetails: {
      moss: 'rgba(180, 160, 120, 0.15)',         // fossil/crack marks
      roots: 'rgba(160, 130, 80, 0.2)',           // dried root cracks
      grassStrands: 'rgba(100, 140, 60, 0.2)',    // tiny cactus silhouettes
      pebbleTint: 160,                             // sandy pebbles
    },
    surfaceDetails: {
      tufts: 'rgba(200, 180, 120, 0.1)',         // sand tufts
      dapples: 'rgba(255, 240, 180, 0.12)',      // heat shimmer dapples
      dirtPatches: 'rgba(180, 150, 100, 0.1)',   // cracked earth
      overhangStroke: 'rgba(160, 130, 70, 0.18)',
      blades: 'rgba(140, 160, 60, 0.2)',         // sparse desert grass
      tileStroke: 'rgba(180, 150, 90, 0.15)',
    },
    tierDecorations: {
      flowerColors: ['#FF8844', '#FFB347', '#FF6B35', '#FFD700', '#FF4444'], // desert blooms
      rockColor: 'rgba(180, 160, 120, 0.3)',     // sandstone rocks
      mushroomCap: 'rgba(100, 160, 60, 0.3)',    // small cactus (green!)
      mushroomStem: 'rgba(90, 140, 50, 0.35)',
    },
    depthShading: {
      shadow: 'rgba(80, 60, 20, 0.12)',
      highlight: 'rgba(255, 240, 180, 0.2)',
    },
    skyScene: {
      landscape: 'dunes',
      landscapeColors: ['#D4A850', '#C09040', '#E8C878'],
      treeline: false,
      treelineColor: '',
      hazeColor: 'rgba(255, 230, 170, 0.35)',
      sunStyle: 'warm',
      rayColor: 'rgba(255, 220, 140, 0.3)',
      rayOpacity: 0.4,
    },
    skyAnimations: {
      type: 'heat-shimmer',
      cssClass: 'pet-land--biome-desert',
    },
  },

  // ─── MOONLIT GARDEN — Bioluminescent Wonderland ──────────────────
  night: {
    id: 'night',
    name: 'Night Garden',
    sky: ['#0A1020', '#0F1B2E', '#1A2840', '#253550'],
    grassLight: ['#2A5A3A', '#246048'],
    grassDark: ['#1E4030', '#183828'],
    grassBase: ['#285840', '#225038', '#1C4830', '#164028'],
    grassEdge: ['#183828', '#102820'],
    lipLeft: ['#204030', '#183828', '#303028'],
    lipRight: ['#183828', '#103020', '#282820'],
    dirtLeft: ['#484038', '#3C3430', '#302C28'],
    dirtRight: ['#3C3430', '#302C28', '#242020'],
    stoneBaseLeft: '#2C2824',
    stoneBaseRight: '#242020',
    cloudColor: 'rgba(40, 60, 100, 0.25)',
    sunColor: 'rgba(180, 200, 255, 0.3)',
    particles: 'fireflies',
    particleColors: [
      'rgba(100, 255, 180, 0.7)',
      'rgba(80, 240, 160, 0.6)',
      'rgba(120, 255, 200, 0.6)',
      'rgba(90, 230, 170, 0.65)',
    ],
    stoneColors: {
      left: ['#3A3438', '#444040', '#323030', '#3C3838', '#363234', '#424040', '#2E2C2C', '#3A3636', '#343030', '#383434'],
      right: ['#302C30', '#3A3638', '#282628', '#343030', '#2E2A2C', '#383438', '#262424', '#322E30', '#2C2828', '#302C2E'],
    },
    cliffDetails: {
      moss: 'rgba(80, 220, 160, 0.2)',           // bioluminescent glow!
      roots: 'rgba(60, 200, 180, 0.18)',          // glowing cracks
      grassStrands: 'rgba(70, 200, 150, 0.22)',   // glowing vines
      pebbleTint: 120,                             // luminous crystals
    },
    surfaceDetails: {
      tufts: 'rgba(30, 80, 50, 0.12)',           // dark grass
      dapples: 'rgba(160, 200, 255, 0.1)',       // moonlight patches
      dirtPatches: 'rgba(60, 50, 40, 0.08)',     // dark earth
      overhangStroke: 'rgba(30, 60, 30, 0.18)',
      blades: 'rgba(40, 100, 50, 0.25)',
      tileStroke: 'rgba(30, 60, 30, 0.15)',
    },
    tierDecorations: {
      flowerColors: ['#80FFCC', '#AA88FF', '#60CCFF', '#FF88CC', '#88FFAA'], // luminous!
      rockColor: 'rgba(60, 70, 80, 0.3)',         // dark crystal
      mushroomCap: 'rgba(80, 220, 180, 0.4)',     // GLOWING cyan mushroom!
      mushroomStem: 'rgba(60, 80, 70, 0.35)',
    },
    depthShading: {
      shadow: 'rgba(10, 15, 30, 0.2)',
      highlight: 'rgba(140, 180, 255, 0.1)',      // moonlight highlight
    },
    skyScene: {
      landscape: 'cliffs',
      landscapeColors: ['#151A28', '#1A2030', '#202838'],
      treeline: false,
      treelineColor: '',
      hazeColor: 'rgba(60, 40, 120, 0.2)',        // bioluminescent horizon glow
      sunStyle: 'moon',
      rayColor: 'rgba(140, 160, 255, 0.15)',      // moonlight rays
      rayOpacity: 0.15,
    },
    skyAnimations: {
      type: 'shooting-stars',
      cssClass: 'pet-land--biome-night',
    },
  },

  // ─── SAKURA VALLEY — Eternal Blossom Dream ───────────────────────
  sakura: {
    id: 'sakura',
    name: 'Sakura',
    sky: ['#E8A0B8', '#F0B8C8', '#F8D0DC', '#FFF0F4'],
    grassLight: ['#FFD4E0', '#F8C4D0'],
    grassDark: ['#F0A0B8', '#E890A8'],
    grassBase: ['#F8C8D8', '#F0B8C8', '#E8A8B8', '#E098A8'],
    grassEdge: ['#D888A0', '#C07088'],
    lipLeft: ['#C87898', '#B06880', '#A08878'],
    lipRight: ['#B86888', '#A05870', '#907868'],
    dirtLeft: ['#B09078', '#A08068', '#907058'],
    dirtRight: ['#A08068', '#907058', '#806048'],
    stoneBaseLeft: '#786058',
    stoneBaseRight: '#685048',
    cloudColor: 'rgba(255, 220, 235, 0.8)',
    sunColor: 'rgba(255, 200, 220, 0.8)',
    particles: 'leaves',
    particleColors: [
      'rgba(255, 180, 200, 0.6)',
      'rgba(255, 200, 220, 0.5)',
      'rgba(255, 160, 190, 0.4)',
      'rgba(255, 220, 235, 0.55)',
    ],
    stoneColors: {
      left: ['#887080', '#908088', '#807078', '#887880', '#807078', '#908088', '#787070', '#888080', '#807878', '#887880'],
      right: ['#786070', '#806878', '#706068', '#787070', '#706068', '#806878', '#686060', '#787070', '#706868', '#786870'],
    },
    cliffDetails: {
      moss: 'rgba(255, 160, 180, 0.18)',          // cherry petal accents
      roots: 'rgba(120, 90, 80, 0.18)',            // delicate vines
      grassStrands: 'rgba(160, 100, 120, 0.22)',   // vine strands
      pebbleTint: 140,                              // smooth river stones
    },
    surfaceDetails: {
      tufts: 'rgba(200, 120, 150, 0.08)',         // pink-tinted tufts
      dapples: 'rgba(255, 200, 220, 0.12)',       // petal scatter dapples
      dirtPatches: 'rgba(160, 120, 100, 0.07)',   // soft earth
      overhangStroke: 'rgba(160, 90, 110, 0.16)',
      blades: 'rgba(180, 120, 140, 0.2)',
      tileStroke: 'rgba(200, 140, 160, 0.12)',
    },
    tierDecorations: {
      flowerColors: ['#FFB0C8', '#FF88AA', '#FFCCDD', '#FF6699', '#FFA0BB'], // cherry blossom
      rockColor: 'rgba(160, 140, 130, 0.25)',     // smooth decorative stones
      mushroomCap: 'rgba(200, 140, 160, 0.3)',    // pink bonsai-like shapes
      mushroomStem: 'rgba(140, 110, 100, 0.35)',
    },
    depthShading: {
      shadow: 'rgba(80, 40, 60, 0.12)',
      highlight: 'rgba(255, 220, 230, 0.18)',
    },
    skyScene: {
      landscape: 'hills',
      landscapeColors: ['#C090A8', '#D4A0B8', '#E8B8CC'],
      treeline: true,
      treelineColor: 'rgba(180, 100, 130, 0.06)',  // cherry blossom tree silhouettes
      hazeColor: 'rgba(255, 210, 230, 0.3)',
      sunStyle: 'warm',
      rayColor: 'rgba(255, 200, 210, 0.2)',
      rayOpacity: 0.25,
    },
    skyAnimations: {
      type: 'petal-stream',
      cssClass: 'pet-land--biome-sakura',
    },
  },
};

/** Get theme by ID, falling back to default meadow */
export function getIslandTheme(themeId: string): IslandTheme {
  return ISLAND_THEMES[themeId] || ISLAND_THEMES.day;
}

/** List of all available theme IDs */
export const ISLAND_THEME_IDS = Object.keys(ISLAND_THEMES);
