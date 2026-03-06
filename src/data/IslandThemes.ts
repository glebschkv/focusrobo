/**
 * Island Theme Definitions
 *
 * Each theme defines colors for the sky gradient, grass tiles, cliff walls,
 * and ambient effects. Connected to shopStore.equippedBackground.
 */

export interface IslandTheme {
  id: string;
  name: string;
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
    sky: ['#6BB8E0', '#A5D8EF', '#D0EAF5', '#F0F4F8'],
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
    name: 'Floating Archipelago',
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
    name: 'Serene Tides',
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
    name: 'Dusk Canopy',
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
    name: 'Northern Glow',
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
    name: 'Golden Hour',
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

  cyberpunk: {
    id: 'cyberpunk',
    name: 'Neon City',
    sky: ['#0A0A2E', '#1A1040', '#301860', '#482878'],
    grassLight: ['#4040A0', '#3838B8'],
    grassDark: ['#282890', '#202080'],
    grassBase: ['#3838B0', '#3030A0', '#282890', '#202080'],
    grassEdge: ['#181870', '#101060'],
    lipLeft: ['#301868', '#281060', '#402850'],
    lipRight: ['#281060', '#200850', '#382040'],
    dirtLeft: ['#382848', '#302040', '#281838'],
    dirtRight: ['#302040', '#281838', '#201030'],
    stoneBaseLeft: '#1C1430',
    stoneBaseRight: '#141028',
    cloudColor: 'rgba(180, 80, 255, 0.4)',
    sunColor: 'rgba(255, 50, 150, 0.6)',
    particles: 'sparkles',
    particleColors: [
      'rgba(255, 50, 200, 0.6)',
      'rgba(80, 200, 255, 0.5)',
      'rgba(200, 80, 255, 0.5)',
      'rgba(50, 255, 200, 0.55)',
    ],
  },

  aurora: {
    id: 'aurora',
    name: 'Aurora Borealis',
    sky: ['#051028', '#0C2040', '#184060', '#2C7070'],
    grassLight: ['#48A888', '#38A078'],
    grassDark: ['#288868', '#207858'],
    grassBase: ['#38A078', '#289068', '#208058', '#187048'],
    grassEdge: ['#106840', '#085830'],
    lipLeft: ['#106040', '#085838', '#305048'],
    lipRight: ['#085838', '#084830', '#284040'],
    dirtLeft: ['#405848', '#305040', '#284038'],
    dirtRight: ['#305040', '#284038', '#203030'],
    stoneBaseLeft: '#243430',
    stoneBaseRight: '#1C2C28',
    cloudColor: 'rgba(60, 180, 160, 0.35)',
    sunColor: 'rgba(80, 200, 180, 0.4)',
    particles: 'fireflies',
    particleColors: [
      'rgba(80, 255, 180, 0.6)',
      'rgba(40, 200, 160, 0.5)',
      'rgba(100, 255, 200, 0.5)',
      'rgba(60, 220, 170, 0.55)',
    ],
  },

  crystal: {
    id: 'crystal',
    name: 'Crystal Cavern',
    sky: ['#182838', '#284058', '#406080', '#6888A8'],
    grassLight: ['#80B8D8', '#70A8C8'],
    grassDark: ['#5890B0', '#4880A0'],
    grassBase: ['#70A8C8', '#6098B8', '#5088A8', '#407898'],
    grassEdge: ['#387090', '#286080'],
    lipLeft: ['#306880', '#286070', '#485868'],
    lipRight: ['#286070', '#205060', '#384858'],
    dirtLeft: ['#505868', '#485060', '#404850'],
    dirtRight: ['#485060', '#404850', '#383C48'],
    stoneBaseLeft: '#343C44',
    stoneBaseRight: '#2C343C',
    cloudColor: 'rgba(150, 200, 240, 0.4)',
    sunColor: 'rgba(180, 220, 255, 0.5)',
    particles: 'sparkles',
    particleColors: [
      'rgba(150, 220, 255, 0.6)',
      'rgba(180, 230, 255, 0.5)',
      'rgba(120, 200, 240, 0.5)',
      'rgba(200, 240, 255, 0.55)',
    ],
  },

  volcano: {
    id: 'volcano',
    name: 'Magma Peak',
    sky: ['#2A0A08', '#4A1810', '#783020', '#A85038'],
    grassLight: ['#584038', '#504038'],
    grassDark: ['#403028', '#382820'],
    grassBase: ['#504038', '#483830', '#403028', '#382820'],
    grassEdge: ['#302018', '#281810'],
    lipLeft: ['#301818', '#281010', '#402020'],
    lipRight: ['#281010', '#200808', '#381818'],
    dirtLeft: ['#402820', '#382018', '#301810'],
    dirtRight: ['#382018', '#301810', '#281008'],
    stoneBaseLeft: '#241410',
    stoneBaseRight: '#1C100C',
    cloudColor: 'rgba(200, 80, 40, 0.4)',
    sunColor: 'rgba(255, 120, 40, 0.8)',
    particles: 'dust',
    particleColors: [
      'rgba(255, 120, 40, 0.6)',
      'rgba(255, 80, 20, 0.5)',
      'rgba(255, 160, 60, 0.5)',
      'rgba(200, 60, 20, 0.55)',
    ],
  },

  space: {
    id: 'space',
    name: 'Cosmic Void',
    sky: ['#04040C', '#0A0818', '#141028', '#201840'],
    grassLight: ['#302860', '#282058'],
    grassDark: ['#201850', '#181048'],
    grassBase: ['#282058', '#201850', '#181048', '#100840'],
    grassEdge: ['#0C0838', '#080630'],
    lipLeft: ['#100830', '#0C0628', '#181028'],
    lipRight: ['#0C0628', '#080420', '#100820'],
    dirtLeft: ['#1C1030', '#141028', '#0C0820'],
    dirtRight: ['#141028', '#0C0820', '#080418'],
    stoneBaseLeft: '#0C0818',
    stoneBaseRight: '#080414',
    cloudColor: 'rgba(100, 80, 200, 0.3)',
    sunColor: 'rgba(200, 180, 255, 0.4)',
    particles: 'sparkles',
    particleColors: [
      'rgba(200, 180, 255, 0.6)',
      'rgba(255, 255, 255, 0.7)',
      'rgba(150, 130, 255, 0.5)',
      'rgba(255, 200, 255, 0.55)',
    ],
  },

  underwater: {
    id: 'underwater',
    name: 'Deep Sea Reef',
    sky: ['#043048', '#085868', '#108090', '#28A8B8'],
    grassLight: ['#38B8A0', '#28A890'],
    grassDark: ['#189880', '#109070'],
    grassBase: ['#28A890', '#189880', '#109070', '#088060'],
    grassEdge: ['#087058', '#006048'],
    lipLeft: ['#086850', '#006040', '#1C5848'],
    lipRight: ['#006040', '#005030', '#104838'],
    dirtLeft: ['#2C5850', '#1C4840', '#103838'],
    dirtRight: ['#1C4840', '#103838', '#082828'],
    stoneBaseLeft: '#0C3030',
    stoneBaseRight: '#082828',
    cloudColor: 'rgba(80, 200, 220, 0.3)',
    sunColor: 'rgba(100, 220, 240, 0.4)',
    particles: 'sparkles',
    particleColors: [
      'rgba(80, 220, 255, 0.5)',
      'rgba(60, 200, 240, 0.4)',
      'rgba(100, 240, 255, 0.45)',
      'rgba(40, 180, 220, 0.5)',
    ],
  },

  halloween: {
    id: 'halloween',
    name: 'Spooky Hollow',
    sky: ['#1A0C28', '#2C1440', '#4C2060', '#783878'],
    grassLight: ['#584840', '#504038'],
    grassDark: ['#403830', '#383028'],
    grassBase: ['#504038', '#483830', '#403028', '#382820'],
    grassEdge: ['#302018', '#281810'],
    lipLeft: ['#281818', '#201010', '#382020'],
    lipRight: ['#201010', '#180808', '#301818'],
    dirtLeft: ['#382820', '#302018', '#281810'],
    dirtRight: ['#302018', '#281810', '#201008'],
    stoneBaseLeft: '#201410',
    stoneBaseRight: '#18100C',
    cloudColor: 'rgba(120, 60, 160, 0.4)',
    sunColor: 'rgba(255, 160, 40, 0.6)',
    particles: 'fireflies',
    particleColors: [
      'rgba(255, 160, 40, 0.6)',
      'rgba(200, 80, 255, 0.5)',
      'rgba(255, 200, 60, 0.5)',
      'rgba(160, 60, 200, 0.55)',
    ],
  },
};

/** Get theme by ID, falling back to default meadow */
export function getIslandTheme(themeId: string): IslandTheme {
  return ISLAND_THEMES[themeId] || ISLAND_THEMES.day;
}

/** List of all available theme IDs */
export const ISLAND_THEME_IDS = Object.keys(ISLAND_THEMES);
