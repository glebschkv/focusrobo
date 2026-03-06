import { BOOSTER_TYPES } from '@/hooks/useCoinBooster';
import type {
  ShopCategory,
  ShopItem,
  PremiumBackground,
  UtilityItem,
  CoinPack,
  StarterBundle,
  Bundle,
} from '@/types';

export type {
  ShopCategory,
  ShopItem,
  PremiumBackground,
  UtilityItem,
  CoinPack,
  StarterBundle,
  Bundle,
} from '@/types';

// Sky Bundle Backgrounds - Individual backgrounds that come with the Sky Bundle
export const SKY_BUNDLE_BACKGROUNDS: PremiumBackground[] = [
  {
    id: 'bg-sky-islands',
    name: 'Sky Islands',
    description: 'Majestic rocky islands rising from calm waters under a serene sky.',
    category: 'backgrounds',
    coinPrice: 800,
    icon: 'island',
    rarity: 'rare',
    theme: 'sky-islands',
    previewImage: '/assets/worlds/SKYBUNDLE1.png',
    bundleId: 'bundle-sky-realms',
  },
  {
    id: 'bg-calm-seas',
    name: 'Calm Seas',
    description: 'A peaceful ocean horizon under a beautiful gradient sky.',
    category: 'backgrounds',
    coinPrice: 800,
    icon: 'wave',
    rarity: 'rare',
    theme: 'calm-seas',
    previewImage: '/assets/worlds/SKYBUNDLE2.png',
    bundleId: 'bundle-sky-realms',
  },
  {
    id: 'bg-twilight-clouds',
    name: 'Twilight Clouds',
    description: 'Dramatic clouds painted in soft twilight colors over the sea.',
    category: 'backgrounds',
    coinPrice: 1000,
    icon: 'cloud',
    rarity: 'epic',
    theme: 'twilight-clouds',
    previewImage: '/assets/worlds/SKYBUNDLE3.png',
    bundleId: 'bundle-sky-realms',
  },
  {
    id: 'bg-aurora-horizon',
    name: 'Aurora Horizon',
    description: 'A mesmerizing sky with ethereal light dancing across the clouds.',
    category: 'backgrounds',
    coinPrice: 1000,
    icon: 'sparkles',
    rarity: 'epic',
    theme: 'aurora-horizon',
    previewImage: '/assets/worlds/SKYBUNDLE4.png',
    bundleId: 'bundle-sky-realms',
  },
  {
    id: 'bg-sunset-clouds',
    name: 'Sunset Clouds',
    description: 'Breathtaking sunset clouds reflected in still waters.',
    category: 'backgrounds',
    coinPrice: 1200,
    icon: 'sunset',
    rarity: 'legendary',
    theme: 'sunset-clouds',
    previewImage: '/assets/worlds/SKYBUNDLE5.png',
    bundleId: 'bundle-sky-realms',
  },
];

export const PREMIUM_BACKGROUNDS: PremiumBackground[] = [
  // Include Sky Bundle backgrounds
  ...SKY_BUNDLE_BACKGROUNDS,
  {
    id: 'bg-sakura',
    name: 'Sakura Garden',
    description: 'A serene Japanese garden with cherry blossoms in full bloom.',
    category: 'backgrounds',
    coinPrice: 1000,
    icon: 'sakura',
    rarity: 'rare',
    theme: 'sakura',
    comingSoon: false,
  },
  {
    id: 'bg-cyberpunk',
    name: 'Neon City',
    description: 'A futuristic cyberpunk cityscape with neon lights and holograms.',
    category: 'backgrounds',
    coinPrice: 1500,
    icon: 'neon-city',
    rarity: 'epic',
    theme: 'cyberpunk',
    comingSoon: false,
  },
  {
    id: 'bg-aurora',
    name: 'Aurora Borealis',
    description: 'Dance under the magical northern lights in this stunning arctic scene.',
    category: 'backgrounds',
    coinPrice: 1800,
    icon: 'aurora',
    rarity: 'epic',
    theme: 'aurora',
    comingSoon: false,
  },
  {
    id: 'bg-crystal-cave',
    name: 'Crystal Cavern',
    description: 'A mystical underground cave filled with glowing crystals.',
    category: 'backgrounds',
    coinPrice: 1200,
    icon: 'diamond',
    rarity: 'rare',
    theme: 'crystal',
    comingSoon: false,
  },
  {
    id: 'bg-volcano',
    name: 'Volcanic Island',
    description: 'A dramatic volcanic landscape with flowing lava and ash.',
    category: 'backgrounds',
    coinPrice: 2200,
    icon: 'volcano',
    rarity: 'legendary',
    theme: 'volcano',
    comingSoon: false,
  },
  {
    id: 'bg-space',
    name: 'Cosmic Void',
    description: 'Float among the stars in the endless expanse of space.',
    category: 'backgrounds',
    coinPrice: 2500,
    icon: 'rocket',
    rarity: 'legendary',
    theme: 'space',
    comingSoon: false,
  },
  {
    id: 'bg-underwater',
    name: 'Deep Sea Reef',
    description: 'Explore a vibrant coral reef teeming with colorful life.',
    category: 'backgrounds',
    coinPrice: 1100,
    icon: 'fish',
    rarity: 'rare',
    theme: 'underwater',
    comingSoon: false,
  },
  {
    id: 'bg-halloween',
    name: 'Spooky Hollow',
    description: 'A haunted forest perfect for the spookiest of bots.',
    category: 'backgrounds',
    coinPrice: 1800,
    icon: 'pumpkin',
    rarity: 'epic',
    isLimited: true,
    theme: 'halloween',
    comingSoon: false,
  },
  {
    id: 'bg-winter-wonderland',
    name: 'Winter Wonderland',
    description: 'A magical snowy scene with twinkling lights and cozy vibes.',
    category: 'backgrounds',
    coinPrice: 1800,
    icon: 'christmas-tree',
    rarity: 'epic',
    isLimited: true,
    theme: 'winter',
    comingSoon: false,
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// UTILITY ITEMS (Streak Freezes, etc.)
// ═══════════════════════════════════════════════════════════════════════════

export const UTILITY_ITEMS: UtilityItem[] = [
  {
    id: 'streak-freeze-1',
    name: 'Time Crystal',
    description: 'A shimmering crystal that freezes time for one day, protecting your streak.',
    category: 'utilities',
    coinPrice: 150,
    icon: 'ice-cube',
    rarity: 'common',
    quantity: 1,
  },
  {
    id: 'streak-freeze-3',
    name: 'Crystal Cluster',
    description: 'A trio of time crystals — protection for three days.',
    category: 'utilities',
    coinPrice: 400,
    icon: 'ice-cube',
    rarity: 'rare',
    quantity: 3,
  },
  {
    id: 'streak-freeze-7',
    name: 'Crystal Cache',
    description: 'A treasure trove of seven time crystals for the prepared adventurer.',
    category: 'utilities',
    coinPrice: 800,
    icon: 'ice-cube',
    rarity: 'epic',
    quantity: 7,
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// COIN PACKS (In-App Purchases)
// ═══════════════════════════════════════════════════════════════════════════

export const COIN_PACKS: CoinPack[] = [
  {
    id: 'coins-value',
    name: 'Pouch of Coins',
    description: 'A leather pouch filled with shiny coins.',
    category: 'coins',
    iapPrice: '€2,99',
    iapProductId: 'com.fonoinc.app.coins.value',
    icon: 'money-bag',
    coinAmount: 1500,
    bonusCoins: 300,
    rarity: 'rare',
  },
  {
    id: 'coins-premium',
    name: 'Treasure Sack',
    description: 'A hefty sack bursting with coins and gems.',
    category: 'coins',
    iapPrice: '€7,99',
    iapProductId: 'com.fonoinc.app.coins.premium',
    icon: 'diamond',
    coinAmount: 5000,
    bonusCoins: 1000,
    rarity: 'epic',
  },
  {
    id: 'coins-mega',
    name: 'Golden Chest',
    description: 'An ornate chest overflowing with riches.',
    category: 'coins',
    iapPrice: '€19,99',
    iapProductId: 'com.fonoinc.app.coins.mega',
    icon: 'trophy',
    coinAmount: 15000,
    bonusCoins: 5000,
    rarity: 'legendary',
  },
  {
    id: 'coins-ultra',
    name: "Dragon's Hoard",
    description: 'A legendary stash worthy of a dragon.',
    category: 'coins',
    iapPrice: '€49,99',
    iapProductId: 'com.fonoinc.app.coins.ultra',
    icon: 'crown-ultra',
    coinAmount: 40000,
    bonusCoins: 20000,
    rarity: 'legendary',
  },
  {
    id: 'coins-legendary',
    name: "King's Vault",
    description: 'The entire royal treasury — an unimaginable fortune.',
    category: 'coins',
    iapPrice: '€99,99',
    iapProductId: 'com.fonoinc.app.coins.legendary',
    icon: 'crown-legendary',
    coinAmount: 100000,
    bonusCoins: 50000,
    rarity: 'legendary',
    isBestValue: true,
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// STARTER BUNDLES (IAP-only — purchased via Apple Pay)
// ═══════════════════════════════════════════════════════════════════════════

export const STARTER_BUNDLES: StarterBundle[] = [
  {
    id: 'bundle-welcome',
    name: "Traveler's Gift",
    description: 'A warm welcome from the merchant — coins, crystals, and a boost for your journey.',
    category: 'bundles',
    iapPrice: '€2,99',
    iapProductId: 'com.fonoinc.app.bundle.welcome',
    icon: 'bundle-welcome',
    rarity: 'rare',
    contents: {
      coins: 600,
      boosterId: 'focus_boost',
      streakFreezes: 2,
    },
    savings: '65%',
  },
  {
    id: 'bundle-starter',
    name: "Explorer's Kit",
    description: 'Everything a new explorer needs — coins and a powerful focus elixir.',
    category: 'bundles',
    iapPrice: '€4,99',
    iapProductId: 'com.fonoinc.app.bundle.starter',
    icon: 'bundle-starter',
    rarity: 'epic',
    contents: {
      coins: 1000,
      boosterId: 'focus_boost',
    },
    savings: '50%',
  },
  {
    id: 'bundle-collector',
    name: "Keeper's Trove",
    description: 'A curated collection for dedicated pet keepers — premium riches and rewards.',
    category: 'bundles',
    iapPrice: '€14,99',
    iapProductId: 'com.fonoinc.app.bundle.collector',
    icon: 'bundle-collector',
    rarity: 'legendary',
    contents: {
      coins: 5000,
      boosterId: 'super_boost',
    },
    savings: '60%',
  },
  {
    id: 'bundle-ultimate',
    name: "Merchant's Finest",
    description: 'The merchant\'s most prized collection — an extraordinary treasure for true adventurers.',
    category: 'bundles',
    iapPrice: '€29,99',
    iapProductId: 'com.fonoinc.app.bundle.ultimate',
    icon: 'treasure-chest',
    rarity: 'legendary',
    contents: {
      coins: 12000,
      boosterId: 'super_boost',
      streakFreezes: 5,
    },
    savings: '65%',
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// BUNDLES (Purchasable with coins — bots or backgrounds)
// ═══════════════════════════════════════════════════════════════════════════

export const BACKGROUND_BUNDLES: Bundle[] = [
  {
    id: 'bundle-sky-realms',
    name: 'Sky Realms Bundle',
    description: 'A collection of 5 breathtaking sky and ocean themed backgrounds.',
    category: 'bundles',
    coinPrice: 2800,
    icon: 'sun-cloud',
    rarity: 'legendary',
    bundleType: 'backgrounds',
    itemIds: [
      'bg-sky-islands',
      'bg-calm-seas',
      'bg-twilight-clouds',
      'bg-aurora-horizon',
      'bg-sunset-clouds',
    ],
    previewImages: [
      '/assets/worlds/SKYBUNDLE1.png',
      '/assets/worlds/SKYBUNDLE2.png',
      '/assets/worlds/SKYBUNDLE3.png',
      '/assets/worlds/SKYBUNDLE4.png',
      '/assets/worlds/SKYBUNDLE5.png',
    ],
    totalValue: 4800, // Sum of individual prices: 800+800+1000+1000+1200
    savings: '42%',
  },
];

export const ALL_BUNDLES: Bundle[] = [...BACKGROUND_BUNDLES];

// ═══════════════════════════════════════════════════════════════════════════
// SHOP HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

export const getAllShopItems = (): ShopItem[] => {
  return [
    ...PREMIUM_BACKGROUNDS,
    ...UTILITY_ITEMS,
    ...COIN_PACKS,
    ...STARTER_BUNDLES,
    ...ALL_BUNDLES,
  ];
};

export const getBundleById = (bundleId: string): Bundle | undefined => {
  return ALL_BUNDLES.find(bundle => bundle.id === bundleId);
};

export const getBackgroundsInBundle = (bundleId: string): PremiumBackground[] => {
  return PREMIUM_BACKGROUNDS.filter(bg => bg.bundleId === bundleId);
};

export const getShopItemsByCategory = (category: ShopCategory): ShopItem[] => {
  switch (category) {
    case 'featured':
      return [...STARTER_BUNDLES, ...BACKGROUND_BUNDLES, ...getLimitedTimeItems()];
    case 'customize':
      return [...PREMIUM_BACKGROUNDS];
    case 'powerups': {
      const boosters = BOOSTER_TYPES.map(booster => ({
        id: booster.id,
        name: booster.name,
        description: booster.description,
        category: 'powerups' as ShopCategory,
        coinPrice: booster.coinPrice,
        iapPrice: booster.iapPrice,
        icon: booster.id === 'focus_boost' ? 'lightning' : booster.id === 'super_boost' ? 'rocket' : 'calendar',
        rarity: (booster.id === 'weekly_pass' ? 'epic' : booster.id === 'super_boost' ? 'rare' : 'common') as 'common' | 'rare' | 'epic' | 'legendary',
      }));
      return [...boosters, ...UTILITY_ITEMS, ...COIN_PACKS];
    }
    case 'bundles':
      return [...ALL_BUNDLES];
    default:
      return [];
  }
};

export const getShopItemById = (itemId: string): ShopItem | undefined => {
  return getAllShopItems().find(item => item.id === itemId);
};

export const getBackgroundById = (backgroundId: string): PremiumBackground | undefined => {
  return PREMIUM_BACKGROUNDS.find(bg => bg.id === backgroundId);
};

export const getCoinPackById = (packId: string): CoinPack | undefined => {
  return COIN_PACKS.find(pack => pack.id === packId);
};

export const getLimitedTimeItems = (): ShopItem[] => {
  return getAllShopItems().filter(item => item.isLimited);
};

export const getItemsByRarity = (rarity: 'common' | 'rare' | 'epic' | 'legendary'): ShopItem[] => {
  return getAllShopItems().filter(item => item.rarity === rarity);
};

// Shop categories for UI - 4 tabs: Hatchery, Worlds, Potions, Today's Finds
export const SHOP_CATEGORIES: { id: ShopCategory; name: string; icon: string }[] = [
  { id: 'eggs', name: 'Hatchery', icon: 'egg' },
  { id: 'customize', name: 'Worlds', icon: 'island' },
  { id: 'powerups', name: 'Potions', icon: 'lightning' },
  { id: 'featured', name: "Finds", icon: 'crown' },
];
