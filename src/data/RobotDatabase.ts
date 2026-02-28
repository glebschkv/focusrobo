export interface RobotData {
  id: string;
  name: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockLevel: number;
  description: string;
  abilities: string[];
  zone: string;
  imageConfig: {
    imagePath: string;
    size?: number;
    glowColor?: string;
  };
  // Coin-exclusive properties
  coinPrice?: number;
  isExclusive?: boolean;
  // Study hours unlock requirement (hours of focus time needed)
  requiredStudyHours?: number;
}

export interface ZoneData {
  name: string;
  unlockLevel: number;
  description: string;
  robots: string[];
  backgroundImage?: string;
}

// Complete robot database
export const ROBOT_DATABASE: RobotData[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // ASSEMBLY LINE (Levels 1-4) - Starting zone, simple bots
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'bolt-bot',
    name: 'Bolt Bot',
    icon: 'bolt',
    rarity: 'common',
    unlockLevel: 1,
    description: 'A sturdy little bot held together by bolts and determination. Your first companion on the assembly line.',
    abilities: ['Quick Charge', 'Bolt Shield', 'Spark Jolt'],
    zone: 'Assembly Line',
    imageConfig: {
      imagePath: '/assets/robots/assembly-line/bolt-bot.svg',
      glowColor: '#3b82f6',
    },
  },
  {
    id: 'gear-pup',
    name: 'Gear Pup',
    icon: 'cog',
    rarity: 'common',
    unlockLevel: 2,
    description: 'A playful bot shaped like a small dog, with gears turning happily inside its chest.',
    abilities: ['Gear Spin', 'Pup Dash', 'Tail Whirl'],
    zone: 'Assembly Line',
    imageConfig: {
      imagePath: '/assets/robots/assembly-line/gear-pup.svg',
      glowColor: '#3b82f6',
    },
  },
  {
    id: 'rivet',
    name: 'Rivet',
    icon: 'wrench',
    rarity: 'common',
    unlockLevel: 3,
    description: 'A compact bot that specializes in keeping things together. Reliable and focused.',
    abilities: ['Iron Grip', 'Focus Lock', 'Rivet Burst'],
    zone: 'Assembly Line',
    imageConfig: {
      imagePath: '/assets/robots/assembly-line/rivet.svg',
      glowColor: '#3b82f6',
    },
  },
  {
    id: 'spark-welder',
    name: 'Spark Welder',
    icon: 'zap',
    rarity: 'rare',
    unlockLevel: 4,
    description: 'A skilled bot that creates brilliant sparks to fuse metal and ideas together.',
    abilities: ['Arc Weld', 'Spark Shower', 'Heat Focus'],
    zone: 'Assembly Line',
    imageConfig: {
      imagePath: '/assets/robots/assembly-line/spark-welder.svg',
      glowColor: '#3b82f6',
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // WORKSHOP (Levels 5-8) - Tinkerer bots
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'wrench-bot',
    name: 'Wrench Bot',
    icon: 'wrench',
    rarity: 'common',
    unlockLevel: 5,
    description: 'A handy bot with a wrench for an arm, always ready to fix and improve things.',
    abilities: ['Quick Fix', 'Torque Boost', 'Tool Spin'],
    zone: 'Workshop',
    imageConfig: {
      imagePath: '/assets/robots/workshop/wrench-bot.svg',
      glowColor: '#22c55e',
    },
  },
  {
    id: 'cog-roller',
    name: 'Cog Roller',
    icon: 'cog',
    rarity: 'common',
    unlockLevel: 6,
    description: 'A round bot that rolls on interlocking cogs, generating energy as it moves.',
    abilities: ['Roll Charge', 'Gear Mesh', 'Momentum'],
    zone: 'Workshop',
    imageConfig: {
      imagePath: '/assets/robots/workshop/cog-roller.svg',
      glowColor: '#22c55e',
    },
  },
  {
    id: 'chrome-cat',
    name: 'Chrome Cat',
    icon: 'cat',
    rarity: 'rare',
    unlockLevel: 7,
    description: 'A sleek feline bot with a mirror-polished chrome body that reflects laser focus.',
    abilities: ['Chrome Reflect', 'Silent Step', 'Laser Gaze'],
    zone: 'Workshop',
    imageConfig: {
      imagePath: '/assets/robots/workshop/chrome-cat.svg',
      glowColor: '#22c55e',
    },
  },
  {
    id: 'piston',
    name: 'Piston',
    icon: 'hammer',
    rarity: 'rare',
    unlockLevel: 8,
    description: 'A powerful bot driven by hydraulic pistons, delivering bursts of focused energy.',
    abilities: ['Piston Punch', 'Hydraulic Boost', 'Pressure Drive'],
    zone: 'Workshop',
    imageConfig: {
      imagePath: '/assets/robots/workshop/piston.svg',
      glowColor: '#22c55e',
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // STEALTH LAB (Levels 10-14) - Covert ops bots
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'shadow-drone',
    name: 'Shadow Drone',
    icon: 'plane',
    rarity: 'common',
    unlockLevel: 10,
    description: 'A silent aerial bot that glides through darkness, monitoring your focus with precision.',
    abilities: ['Silent Flight', 'Shadow Scan', 'Dark Pulse'],
    zone: 'Stealth Lab',
    imageConfig: {
      imagePath: '/assets/robots/stealth-lab/shadow-drone.svg',
      glowColor: '#8b5cf6',
    },
  },
  {
    id: 'neon-phantom',
    name: 'Neon Phantom',
    icon: 'ghost',
    rarity: 'rare',
    unlockLevel: 12,
    description: 'A translucent bot that phases in and out of visibility, leaving trails of neon light.',
    abilities: ['Phase Shift', 'Neon Trail', 'Ghost Protocol'],
    zone: 'Stealth Lab',
    imageConfig: {
      imagePath: '/assets/robots/stealth-lab/neon-phantom.svg',
      glowColor: '#8b5cf6',
    },
  },
  {
    id: 'cipher',
    name: 'Cipher',
    icon: 'lock',
    rarity: 'epic',
    unlockLevel: 14,
    description: 'An enigmatic bot that communicates in encrypted signals and guards secrets of deep focus.',
    abilities: ['Encrypt', 'Code Break', 'Stealth Mode'],
    zone: 'Stealth Lab',
    imageConfig: {
      imagePath: '/assets/robots/stealth-lab/cipher.svg',
      glowColor: '#8b5cf6',
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // BIOTECH ZONE (Levels 15-19) - Organic-tech hybrid bots
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'moss-mech',
    name: 'Moss Mech',
    icon: 'leaf',
    rarity: 'common',
    unlockLevel: 15,
    description: 'A bot overgrown with living moss, blending nature and technology in perfect harmony.',
    abilities: ['Bio Heal', 'Root Anchor', 'Green Shield'],
    zone: 'Biotech Zone',
    imageConfig: {
      imagePath: '/assets/robots/biotech-zone/moss-mech.svg',
      glowColor: '#10b981',
    },
  },
  {
    id: 'spore-bot',
    name: 'Spore Bot',
    icon: 'flower',
    rarity: 'rare',
    unlockLevel: 17,
    description: 'A bot that releases calming bio-spores, creating a zen atmosphere for deep concentration.',
    abilities: ['Spore Cloud', 'Calm Wave', 'Bio Sync'],
    zone: 'Biotech Zone',
    imageConfig: {
      imagePath: '/assets/robots/biotech-zone/spore-bot.svg',
      glowColor: '#10b981',
    },
  },
  {
    id: 'vine-walker',
    name: 'Vine Walker',
    icon: 'tree',
    rarity: 'epic',
    unlockLevel: 19,
    description: 'A tall bot with vine-like limbs that grows stronger the more you focus.',
    abilities: ['Vine Whip', 'Growth Surge', 'Photon Charge'],
    zone: 'Biotech Zone',
    imageConfig: {
      imagePath: '/assets/robots/biotech-zone/vine-walker.svg',
      glowColor: '#10b981',
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SOLAR FIELDS (Levels 20-24) - Solar-powered bots
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'sun-charger',
    name: 'Sun Charger',
    icon: 'sun',
    rarity: 'common',
    unlockLevel: 20,
    description: 'A radiant bot that absorbs solar energy and converts it into pure focus power.',
    abilities: ['Solar Beam', 'Radiant Shield', 'Sun Burst'],
    zone: 'Solar Fields',
    imageConfig: {
      imagePath: '/assets/robots/solar-fields/sun-charger.svg',
      glowColor: '#f59e0b',
    },
  },
  {
    id: 'prism-bot',
    name: 'Prism Bot',
    icon: 'diamond',
    rarity: 'rare',
    unlockLevel: 22,
    description: 'A crystalline bot that refracts light into dazzling rainbow patterns of concentration.',
    abilities: ['Prism Split', 'Rainbow Focus', 'Light Bend'],
    zone: 'Solar Fields',
    imageConfig: {
      imagePath: '/assets/robots/solar-fields/prism-bot.svg',
      glowColor: '#f59e0b',
    },
  },
  {
    id: 'nova',
    name: 'Nova',
    icon: 'star',
    rarity: 'epic',
    unlockLevel: 24,
    description: 'A blazing bot born from a stellar explosion, radiating intense focus energy.',
    abilities: ['Supernova', 'Star Flare', 'Cosmic Focus'],
    zone: 'Solar Fields',
    imageConfig: {
      imagePath: '/assets/robots/solar-fields/nova.svg',
      glowColor: '#f59e0b',
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // CYBER DISTRICT (Levels 25-30) - High-tech elite bots
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'neon-sentinel',
    name: 'Neon Sentinel',
    icon: 'shield',
    rarity: 'rare',
    unlockLevel: 25,
    description: 'An elite guardian bot that patrols the Cyber District with neon-lit armor.',
    abilities: ['Neon Guard', 'Sentinel Watch', 'Barrier Pulse'],
    zone: 'Cyber District',
    imageConfig: {
      imagePath: '/assets/robots/cyber-district/neon-sentinel.svg',
      glowColor: '#06b6d4',
    },
  },
  {
    id: 'quantum-core',
    name: 'Quantum Core',
    icon: 'atom',
    rarity: 'epic',
    unlockLevel: 28,
    description: 'A bot powered by quantum computing, processing focus at the speed of thought.',
    abilities: ['Quantum Leap', 'Core Sync', 'Entangle'],
    zone: 'Cyber District',
    imageConfig: {
      imagePath: '/assets/robots/cyber-district/quantum-core.svg',
      glowColor: '#06b6d4',
    },
  },
  {
    id: 'omega-prime',
    name: 'Omega Prime',
    icon: 'crown',
    rarity: 'legendary',
    unlockLevel: 30,
    description: 'The ultimate bot. A legendary machine of unmatched focus and power.',
    abilities: ['Omega Blast', 'Prime Shield', 'Ultimate Focus'],
    zone: 'Cyber District',
    imageConfig: {
      imagePath: '/assets/robots/cyber-district/omega-prime.svg',
      glowColor: '#06b6d4',
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SHOP EXCLUSIVES (Coin-purchasable)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'turbo-tank',
    name: 'Turbo Tank',
    icon: 'tank',
    rarity: 'rare',
    unlockLevel: 99,
    coinPrice: 500,
    isExclusive: true,
    description: 'A heavily armored bot that charges through obstacles with turbo-powered treads.',
    abilities: ['Turbo Charge', 'Armor Up', 'Tank Rush'],
    zone: 'Assembly Line',
    imageConfig: {
      imagePath: '/assets/robots/assembly-line/turbo-tank.svg',
      glowColor: '#3b82f6',
    },
  },
  {
    id: 'plasma-pup',
    name: 'Plasma Pup',
    icon: 'zap',
    rarity: 'epic',
    unlockLevel: 99,
    coinPrice: 750,
    isExclusive: true,
    description: 'An adorable bot pup crackling with plasma energy, loyal and electrifying.',
    abilities: ['Plasma Bark', 'Energy Fetch', 'Static Bond'],
    zone: 'Workshop',
    imageConfig: {
      imagePath: '/assets/robots/workshop/plasma-pup.svg',
      glowColor: '#22c55e',
    },
  },
  {
    id: 'stealth-owl',
    name: 'Stealth Owl',
    icon: 'eye',
    rarity: 'epic',
    unlockLevel: 99,
    coinPrice: 1000,
    isExclusive: true,
    description: 'A silent, all-seeing bot modeled after an owl, equipped with advanced night-vision sensors.',
    abilities: ['Night Vision', 'Silent Strike', 'Owl Wisdom'],
    zone: 'Stealth Lab',
    imageConfig: {
      imagePath: '/assets/robots/stealth-lab/stealth-owl.svg',
      glowColor: '#8b5cf6',
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // STUDY HOURS EXCLUSIVES (Unlocked by studying)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'iron-scholar',
    name: 'Iron Scholar',
    icon: 'book',
    rarity: 'rare',
    unlockLevel: 99,
    requiredStudyHours: 10,
    description: 'A studious bot with a library of knowledge stored in its iron frame. Unlocked by dedicated focus.',
    abilities: ['Knowledge Beam', 'Study Shield', 'Iron Will'],
    zone: 'Workshop',
    imageConfig: {
      imagePath: '/assets/robots/workshop/iron-scholar.svg',
      glowColor: '#22c55e',
    },
  },
  {
    id: 'focus-titan',
    name: 'Focus Titan',
    icon: 'mountain',
    rarity: 'legendary',
    unlockLevel: 99,
    requiredStudyHours: 50,
    description: 'A colossal bot forged through hours of deep concentration. Only the most dedicated unlock this titan.',
    abilities: ['Titan Slam', 'Deep Focus', 'Unbreakable Will'],
    zone: 'Cyber District',
    imageConfig: {
      imagePath: '/assets/robots/cyber-district/focus-titan.svg',
      glowColor: '#06b6d4',
    },
  },
];

// Zone definitions
export const ZONE_DATABASE: ZoneData[] = [
  {
    name: 'Assembly Line',
    unlockLevel: 0,
    description: 'Where every bot begins. A bustling factory floor of sparks and steel.',
    robots: ['bolt-bot', 'gear-pup', 'rivet', 'spark-welder', 'turbo-tank'],
    backgroundImage: '/assets/worlds/snowbiome1.png',
  },
  {
    name: 'Workshop',
    unlockLevel: 5,
    description: 'A tinkerer\'s paradise filled with tools, parts, and half-built machines.',
    robots: ['wrench-bot', 'cog-roller', 'chrome-cat', 'piston', 'plasma-pup', 'iron-scholar'],
    backgroundImage: '/assets/worlds/meadowbiome.png',
  },
  {
    name: 'Stealth Lab',
    unlockLevel: 9,
    description: 'A shadowy research facility where covert bots are designed and tested.',
    robots: ['shadow-drone', 'neon-phantom', 'cipher', 'stealth-owl'],
    backgroundImage: '/assets/worlds/NIGHT_LAVENDER.png',
  },
  {
    name: 'Biotech Zone',
    unlockLevel: 13,
    description: 'Where nature meets nanotechnology in a lush, experimental garden.',
    robots: ['moss-mech', 'spore-bot', 'vine-walker'],
    backgroundImage: '/assets/worlds/junglerealbackground.png',
  },
  {
    name: 'Solar Fields',
    unlockLevel: 19,
    description: 'Vast plains of solar panels and radiant energy collectors.',
    robots: ['sun-charger', 'prism-bot', 'nova'],
    backgroundImage: '/assets/worlds/autumnbiome1.png',
  },
  {
    name: 'Cyber District',
    unlockLevel: 24,
    description: 'The neon-lit heart of the city where the most advanced bots operate.',
    robots: ['neon-sentinel', 'quantum-core', 'omega-prime', 'focus-titan'],
    backgroundImage: '/assets/worlds/CITY_NIGHT.png',
  },
];

// Helper functions
export const getRobotById = (id: string): RobotData | undefined => {
  return ROBOT_DATABASE.find(robot => robot.id === id);
};

export const getRobotsByZone = (zone: string): RobotData[] => {
  return ROBOT_DATABASE.filter(robot => robot.zone === zone);
};

export const getRobotsByRarity = (rarity: RobotData['rarity']): RobotData[] => {
  return ROBOT_DATABASE.filter(robot => robot.rarity === rarity);
};

export const getUnlockableRobots = (level: number): RobotData[] => {
  return ROBOT_DATABASE.filter(robot => robot.unlockLevel <= level && !robot.isExclusive);
};

// Alias for getUnlockableRobots (backward compatibility)
export const getUnlockedRobots = getUnlockableRobots;

// Get only XP-unlockable robots (excludes shop exclusives)
export const getXPUnlockableRobots = (): RobotData[] => {
  return ROBOT_DATABASE.filter(robot => !robot.isExclusive);
};

export const getShopExclusiveRobots = (): RobotData[] => {
  return ROBOT_DATABASE.filter(robot => robot.isExclusive);
};

// Get robots that require study hours to unlock
export const getStudyHoursRobots = (): RobotData[] => {
  return ROBOT_DATABASE.filter(robot => robot.requiredStudyHours !== undefined && robot.requiredStudyHours > 0);
};

// Check if a robot is gated by study hours
export const isStudyHoursRobot = (robot: RobotData): boolean => {
  return robot.requiredStudyHours !== undefined && robot.requiredStudyHours > 0;
};

// Alias for backward compatibility
export const getCoinExclusiveRobots = getShopExclusiveRobots;

export const getZoneByName = (name: string): ZoneData | undefined => {
  return ZONE_DATABASE.find(zone => zone.name === name);
};

export const getUnlockedZones = (level: number): ZoneData[] => {
  return ZONE_DATABASE.filter(zone => zone.unlockLevel <= level);
};

// Map theme names to zone names
export const THEME_TO_ZONE: Record<string, string> = {
  'day': 'Workshop',
  'sunset': 'Solar Fields',
  'night': 'Stealth Lab',
  'forest': 'Biotech Zone',
  'snow': 'Assembly Line',
  'city': 'Cyber District',
  'deepocean': 'Workshop', // Fallback
};

// ═══════════════════════════════════════════════════════════════════════════
// BACKWARD COMPATIBILITY ALIASES
// These let existing imports keep working during migration.
// ═══════════════════════════════════════════════════════════════════════════

/** @deprecated Use RobotData instead */
export type AnimalData = RobotData;
/** @deprecated Use ZoneData instead */
export type BiomeData = ZoneData;

/** @deprecated Use ROBOT_DATABASE instead */
export const ANIMAL_DATABASE = ROBOT_DATABASE;
/** @deprecated Use ZONE_DATABASE instead */
export const BIOME_DATABASE = ZONE_DATABASE;
/** @deprecated Use THEME_TO_ZONE instead */
export const THEME_TO_BIOME = THEME_TO_ZONE;

/** @deprecated Use getRobotById instead */
export const getAnimalById = getRobotById;
/** @deprecated Use getRobotsByZone instead */
export const getAnimalsByBiome = getRobotsByZone;
/** @deprecated Use getRobotsByRarity instead */
export const getAnimalsByRarity = getRobotsByRarity;
/** @deprecated Use getUnlockableRobots instead */
export const getUnlockableAnimals = getUnlockableRobots;
/** @deprecated Use getUnlockableRobots instead */
export const getUnlockedAnimals = getUnlockableRobots;
/** @deprecated Use getXPUnlockableRobots instead */
export const getXPUnlockableAnimals = getXPUnlockableRobots;
/** @deprecated Use getShopExclusiveRobots instead */
export const getShopExclusiveAnimals = getShopExclusiveRobots;
/** @deprecated Use getCoinExclusiveRobots instead */
export const getCoinExclusiveAnimals = getCoinExclusiveRobots;
/** @deprecated Use getStudyHoursRobots instead */
export const getStudyHoursAnimals = getStudyHoursRobots;
/** @deprecated Use isStudyHoursRobot instead */
export const isStudyHoursAnimal = isStudyHoursRobot;
/** @deprecated Use getZoneByName instead */
export const getBiomeByName = getZoneByName;
/** @deprecated Use getUnlockedZones instead */
export const getUnlockedBiomes = getUnlockedZones;
