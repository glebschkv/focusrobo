/**
 * Island Theme Definitions
 *
 * Each theme defines colors for the sky gradient, grass tiles, cliff walls,
 * and ambient effects. Connected to shopStore.equippedBackground.
 */

export interface IslandTheme {
  id: string;
  name: string;
  /** Whether this theme requires premium subscription */
  premiumOnly?: boolean;
  /** 4-stop sky gradient (top → bottom) */
  sky: [string, string, string, string];
  /** Checkerboard tile colors */
  grassLight: [string, string]; // gradient start, end
  grassDark: [string, string];  // gradient start, end
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
  /** Particle colors (array of rgba strings) */
  particleColors: string[];
}

export const ISLAND_THEMES: Record<string, IslandTheme> = {
  // Default meadow theme (matches current hardcoded colors)
  day: {
    id: 'day',
    name: 'Meadow',
    sky: ['#6BB8E0', '#A5D8EF', '#D0EAF5', '#EEF4F0'],
    grassLight: ['#CCF080', '#B8E468'],
    grassDark: ['#96C444', '#84B438'],
    grassBase: ['#C4E87A', '#B0D85A', '#9CC84E', '#88B842'],
    grassEdge: ['#88B842', '#6B9430'],
    lipLeft: ['#72A834', '#5E9228', '#9A8448'],
    lipRight: ['#648E2C', '#507A20', '#8A7440'],
    dirtLeft: ['#B09858', '#A08850', '#887440'],
    dirtRight: ['#988048', '#8A7440', '#746434'],
    stoneBaseLeft: '#5C5444',
    stoneBaseRight: '#504840',
    cloudColor: 'rgba(255, 255, 255, 0.85)',
    sunColor: 'rgba(255, 240, 200, 0.9)',
    particles: 'dust',
    particleColors: [
      'rgba(255, 255, 240, 0.5)',
      'rgba(255, 240, 200, 0.4)',
      'rgba(200, 230, 120, 0.3)',
      'rgba(255, 255, 255, 0.45)',
    ],
  },

  winter: {
    id: 'winter',
    name: 'Winter',
    premiumOnly: true,
    sky: ['#7BA8C4', '#A4C4D8', '#C8DBE8', '#E4EDF2'],
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
    cloudColor: 'rgba(220, 230, 245, 0.9)',
    sunColor: 'rgba(200, 220, 240, 0.7)',
    particles: 'snow',
    particleColors: [
      'rgba(255, 255, 255, 0.7)',
      'rgba(220, 235, 255, 0.6)',
      'rgba(200, 220, 245, 0.5)',
      'rgba(240, 248, 255, 0.65)',
    ],
  },

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
  },

  sakura: {
    id: 'sakura',
    name: 'Sakura',
    premiumOnly: true,
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
    cloudColor: 'rgba(255, 220, 235, 0.85)',
    sunColor: 'rgba(255, 200, 220, 0.8)',
    particles: 'leaves',
    particleColors: [
      'rgba(255, 180, 200, 0.6)',
      'rgba(255, 200, 220, 0.5)',
      'rgba(255, 160, 190, 0.4)',
      'rgba(255, 220, 235, 0.55)',
    ],
  },

  night: {
    id: 'night',
    name: 'Night Garden',
    premiumOnly: true,
    sky: ['#0F1B2E', '#1A2840', '#253550', '#304260'],
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
    cloudColor: 'rgba(60, 80, 120, 0.4)',
    sunColor: 'rgba(180, 200, 255, 0.3)',
    particles: 'fireflies',
    particleColors: [
      'rgba(200, 255, 150, 0.6)',
      'rgba(150, 255, 100, 0.5)',
      'rgba(255, 255, 150, 0.5)',
      'rgba(180, 240, 120, 0.55)',
    ],
  },

  desert: {
    id: 'desert',
    name: 'Desert',
    premiumOnly: true,
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
    cloudColor: 'rgba(255, 240, 210, 0.6)',
    sunColor: 'rgba(255, 210, 120, 1)',
    particles: 'dust',
    particleColors: [
      'rgba(255, 230, 180, 0.5)',
      'rgba(255, 220, 160, 0.4)',
      'rgba(240, 210, 150, 0.45)',
      'rgba(255, 240, 200, 0.5)',
    ],
  },
  // ── Purchasable themes ──────────────────────────────────────────

  'sky-islands': {
    id: 'sky-islands',
    name: 'Sky Islands',
    sky: ['#4A9ED6', '#72B8E4', '#A8D4F0', '#D8ECF8'],
    grassLight: ['#A8D8A0', '#98CC90'],
    grassDark: ['#78B470', '#68A460'],
    grassBase: ['#98CC90', '#88C080', '#78B470', '#68A860'],
    grassEdge: ['#60A058', '#509048'],
    lipLeft: ['#589850', '#488840', '#8A8050'],
    lipRight: ['#488840', '#387830', '#7A7040'],
    dirtLeft: ['#9A8860', '#8A7850', '#7A6840'],
    dirtRight: ['#8A7850', '#7A6840', '#6A5830'],
    stoneBaseLeft: '#5A5040',
    stoneBaseRight: '#4A4438',
    cloudColor: 'rgba(255, 255, 255, 0.9)',
    sunColor: 'rgba(255, 245, 220, 0.9)',
    particles: 'dust',
    particleColors: [
      'rgba(200, 230, 255, 0.5)',
      'rgba(180, 220, 255, 0.4)',
      'rgba(255, 255, 255, 0.45)',
      'rgba(220, 240, 255, 0.5)',
    ],
  },

  'calm-seas': {
    id: 'calm-seas',
    name: 'Calm Seas',
    sky: ['#3A8CC8', '#60A8D8', '#98CCE8', '#D0E8F4'],
    grassLight: ['#88C8A0', '#78BC90'],
    grassDark: ['#60A878', '#50986C'],
    grassBase: ['#78BC90', '#68B080', '#58A470', '#489860'],
    grassEdge: ['#409050', '#308040'],
    lipLeft: ['#388848', '#288038', '#6A8860'],
    lipRight: ['#288038', '#187028', '#5A7850'],
    dirtLeft: ['#708878', '#607868', '#506858'],
    dirtRight: ['#607868', '#506858', '#405848'],
    stoneBaseLeft: '#485850',
    stoneBaseRight: '#3A4A42',
    cloudColor: 'rgba(220, 240, 255, 0.85)',
    sunColor: 'rgba(220, 240, 255, 0.8)',
    particles: 'sparkles',
    particleColors: [
      'rgba(180, 220, 255, 0.5)',
      'rgba(200, 235, 255, 0.4)',
      'rgba(255, 255, 255, 0.45)',
      'rgba(160, 210, 240, 0.5)',
    ],
  },

  'twilight-clouds': {
    id: 'twilight-clouds',
    name: 'Twilight Clouds',
    sky: ['#6A4C8C', '#9870B0', '#C8A0D0', '#E8D0E8'],
    grassLight: ['#A890C0', '#9880B0'],
    grassDark: ['#8068A0', '#705890'],
    grassBase: ['#9880B0', '#8870A0', '#786090', '#685080'],
    grassEdge: ['#604878', '#504068'],
    lipLeft: ['#584070', '#484060', '#706058'],
    lipRight: ['#483860', '#383050', '#605048'],
    dirtLeft: ['#806870', '#706060', '#605050'],
    dirtRight: ['#706060', '#605050', '#504040'],
    stoneBaseLeft: '#484040',
    stoneBaseRight: '#3C3638',
    cloudColor: 'rgba(200, 180, 220, 0.7)',
    sunColor: 'rgba(255, 200, 180, 0.8)',
    particles: 'dust',
    particleColors: [
      'rgba(200, 170, 230, 0.5)',
      'rgba(230, 190, 210, 0.4)',
      'rgba(255, 210, 200, 0.45)',
      'rgba(180, 160, 220, 0.5)',
    ],
  },

  'aurora-horizon': {
    id: 'aurora-horizon',
    name: 'Aurora Horizon',
    sky: ['#0C2840', '#1A4060', '#2C6878', '#5CA898'],
    grassLight: ['#60B898', '#50A888'],
    grassDark: ['#389878', '#288868'],
    grassBase: ['#50A888', '#409878', '#308868', '#207858'],
    grassEdge: ['#187050', '#106040'],
    lipLeft: ['#186848', '#106038', '#406050'],
    lipRight: ['#106038', '#085028', '#305040'],
    dirtLeft: ['#506858', '#406050', '#305040'],
    dirtRight: ['#406050', '#305040', '#204030'],
    stoneBaseLeft: '#2C3C34',
    stoneBaseRight: '#20302C',
    cloudColor: 'rgba(80, 200, 180, 0.4)',
    sunColor: 'rgba(100, 220, 200, 0.5)',
    particles: 'sparkles',
    particleColors: [
      'rgba(80, 220, 180, 0.6)',
      'rgba(100, 240, 200, 0.5)',
      'rgba(60, 200, 160, 0.5)',
      'rgba(120, 255, 220, 0.55)',
    ],
  },

  'sunset-clouds': {
    id: 'sunset-clouds',
    name: 'Sunset Clouds',
    sky: ['#C85830', '#E08048', '#F0B878', '#F8E0C0'],
    grassLight: ['#D8C888', '#CCB878'],
    grassDark: ['#B8A060', '#A89050'],
    grassBase: ['#CCB878', '#BCA868', '#AC9858', '#9C8848'],
    grassEdge: ['#948040', '#847030'],
    lipLeft: ['#8C7838', '#7C6828', '#8A7848'],
    lipRight: ['#7C6828', '#6C5818', '#7A6838'],
    dirtLeft: ['#A88C60', '#987C50', '#886C40'],
    dirtRight: ['#987C50', '#886C40', '#785C30'],
    stoneBaseLeft: '#685440',
    stoneBaseRight: '#584838',
    cloudColor: 'rgba(255, 200, 150, 0.7)',
    sunColor: 'rgba(255, 180, 100, 1)',
    particles: 'dust',
    particleColors: [
      'rgba(255, 200, 140, 0.6)',
      'rgba(255, 180, 120, 0.5)',
      'rgba(255, 220, 160, 0.5)',
      'rgba(255, 160, 100, 0.55)',
    ],
  },

};

/** Get theme by ID, falling back to default meadow */
export function getIslandTheme(themeId: string): IslandTheme {
  return ISLAND_THEMES[themeId] || ISLAND_THEMES.day;
}

/** List of all available theme IDs */
export const ISLAND_THEME_IDS = Object.keys(ISLAND_THEMES);

/** Free built-in theme IDs (always available without premium) */
export const FREE_THEME_IDS = ['day', 'beach'];
