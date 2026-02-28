import { useCallback, useMemo } from 'react';
import { RobotData, getRobotById, getUnlockableRobots, getRobotsByZone, ROBOT_DATABASE, getXPUnlockableRobots, isStudyHoursRobot, getStudyHoursRobots } from '@/data/RobotDatabase';
import { useXPSystem } from '@/hooks/useXPSystem';
import { useCollectionStore, useShopStore } from '@/stores';

interface CollectionStats {
  totalBots: number;
  unlockedRobots: number;
  shopBotsTotal: number;
  shopBotsOwned: number;
  totalZones: number;
  unlockedZones: number;
  favoritesCount: number;
  activeHomeBotsCount: number;
  rarityStats: Record<string, { total: number; unlocked: number }>;
}

interface UseCollectionReturn {
  // Data
  allBots: RobotData[];
  unlockedRobotsData: RobotData[];
  currentZoneBots: RobotData[];
  favorites: Set<string>;
  activeHomeBots: Set<string>;
  stats: CollectionStats;
  totalStudyHours: number;

  // Actions
  toggleFavorite: (botId: string) => void;
  toggleHomeActive: (botId: string) => void;
  isBotUnlocked: (botId: string) => boolean;
  isBotFavorite: (botId: string) => boolean;
  isBotHomeActive: (botId: string) => boolean;
  isShopExclusive: (botId: string) => boolean;
  isStudyHoursGated: (botId: string) => boolean;
  getRobotData: (botId: string) => RobotData | undefined;
  getActiveHomeBotsData: () => RobotData[];

  // Filtering
  filterBots: (searchQuery: string, rarity?: string, zone?: string) => RobotData[];

  // Backward-compat aliases
  allAnimals: RobotData[];
  activeHomePets: Set<string>;
  currentZoneAnimals: RobotData[];
  isAnimalUnlocked: (botId: string) => boolean;
  isAnimalFavorite: (botId: string) => boolean;
  isAnimalHomeActive: (botId: string) => boolean;
  getActiveHomePetsData: () => RobotData[];
  filterAnimals: (searchQuery: string, rarity?: string, zone?: string) => RobotData[];
}

export const useCollection = (): UseCollectionReturn => {
  // Use the unified XP system - it handles local/backend sync internally
  const xpSystem = useXPSystem();
  const { currentLevel, unlockedRobots, currentZone, availableZones, totalStudyMinutes } = xpSystem;
  const totalStudyHours = (totalStudyMinutes || 0) / 60;

  // Use Zustand stores instead of local state + events
  const favoritesArray = useCollectionStore((state) => state.favorites);
  const activeHomeBotsArray = useCollectionStore((state) => state.activeHomeBots);
  const storeToggleFavorite = useCollectionStore((state) => state.toggleFavorite);
  const storeToggleHomeActive = useCollectionStore((state) => state.toggleHomeActive);

  // Use shop store for owned characters
  const shopOwnedCharacters = useShopStore((state) => state.ownedCharacters);

  // Convert arrays to Sets for backwards compatibility
  const favorites = useMemo(() => new Set(favoritesArray), [favoritesArray]);
  const activeHomeBots = useMemo(() => new Set(activeHomeBotsArray), [activeHomeBotsArray]);

  // Get unlocked bots data (level-based + purchased coin-exclusive + study-hours)
  const unlockedRobotsData = useMemo(() => {
    const levelUnlocked = getUnlockableRobots(currentLevel);

    // Also include any coin-exclusive bots that are:
    // 1. In the unlockedRobots list from XP system, OR
    // 2. In the shopOwnedCharacters from shop inventory (direct source of truth for purchases)
    const purchasedBots = ROBOT_DATABASE.filter(bot =>
      bot.isExclusive &&
      (unlockedRobots.includes(bot.name) || shopOwnedCharacters.includes(bot.id)) &&
      !levelUnlocked.some(a => a.id === bot.id)
    );

    // Include study-hours bots that have met their hour requirement
    const studyHoursUnlocked = getStudyHoursRobots().filter(bot =>
      totalStudyHours >= (bot.requiredStudyHours || 0) &&
      !levelUnlocked.some(a => a.id === bot.id) &&
      !purchasedBots.some(a => a.id === bot.id)
    );

    return [...levelUnlocked, ...purchasedBots, ...studyHoursUnlocked];
  }, [currentLevel, unlockedRobots, shopOwnedCharacters, totalStudyHours]);

  // Get bots for current zone
  const currentZoneBots = getRobotsByZone(currentZone);

  // Calculate collection statistics (only count XP-unlockable bots for progression)
  const xpUnlockableBots = getXPUnlockableRobots();
  const shopExclusiveBots = ROBOT_DATABASE.filter(a => a.isExclusive && a.coinPrice);
  // Check both XP system and shop inventory for owned shop bots
  const ownedShopBots = shopExclusiveBots.filter(a =>
    unlockedRobots.includes(a.name) || shopOwnedCharacters.includes(a.id)
  );

  const stats: CollectionStats = {
    totalBots: xpUnlockableBots.length,
    unlockedRobots: unlockedRobotsData.filter(a => !a.isExclusive).length,
    shopBotsTotal: shopExclusiveBots.length,
    shopBotsOwned: ownedShopBots.length,
    totalZones: availableZones.length + (5 - availableZones.length),
    unlockedZones: availableZones.length,
    favoritesCount: favorites.size,
    activeHomeBotsCount: activeHomeBots.size,
    rarityStats: {
      common: {
        total: xpUnlockableBots.filter(a => a.rarity === 'common').length,
        unlocked: unlockedRobotsData.filter(a => a.rarity === 'common' && !a.isExclusive).length
      },
      rare: {
        total: xpUnlockableBots.filter(a => a.rarity === 'rare').length,
        unlocked: unlockedRobotsData.filter(a => a.rarity === 'rare' && !a.isExclusive).length
      },
      epic: {
        total: xpUnlockableBots.filter(a => a.rarity === 'epic').length,
        unlocked: unlockedRobotsData.filter(a => a.rarity === 'epic' && !a.isExclusive).length
      },
      legendary: {
        total: xpUnlockableBots.filter(a => a.rarity === 'legendary').length,
        unlocked: unlockedRobotsData.filter(a => a.rarity === 'legendary' && !a.isExclusive).length
      }
    }
  };

  // Toggle favorite status - now uses Zustand store
  const toggleFavorite = useCallback((botId: string) => {
    storeToggleFavorite(botId);
  }, [storeToggleFavorite]);

  // Toggle home page display status - now uses Zustand store
  const toggleHomeActive = useCallback((botId: string) => {
    storeToggleHomeActive(botId);
  }, [storeToggleHomeActive]);

  // Helper functions
  const isBotUnlocked = useCallback((botId: string): boolean => {
    const bot = getRobotById(botId);
    if (!bot) return false;

    // Study hours bots: check if enough hours studied
    if (isStudyHoursRobot(bot)) {
      if (totalStudyHours >= (bot.requiredStudyHours || 0)) return true;
      // Also check backward-compat: if already in saved unlocked list
      if (unlockedRobots.includes(bot.name)) return true;
      if (shopOwnedCharacters.includes(botId)) return true;
      return false;
    }

    // Check if unlocked by level
    if (bot.unlockLevel <= currentLevel) return true;

    // Check if purchased from shop (direct inventory check)
    if (shopOwnedCharacters.includes(botId)) return true;

    // Check if purchased (in unlockedRobots list but not by level)
    if (unlockedRobots.includes(bot.name)) return true;

    return false;
  }, [currentLevel, unlockedRobots, shopOwnedCharacters, totalStudyHours]);

  const isBotFavorite = useCallback((botId: string): boolean => {
    return favorites.has(botId);
  }, [favorites]);

  const isBotHomeActive = useCallback((botId: string): boolean => {
    return activeHomeBots.has(botId);
  }, [activeHomeBots]);

  const getRobotData = useCallback((botId: string): RobotData | undefined => {
    return getRobotById(botId);
  }, []);

  // Get active home bots data (bots shown on home page)
  const getActiveHomeBotsData = useCallback((): RobotData[] => {
    return Array.from(activeHomeBots)
      .map(id => getRobotById(id))
      .filter((bot): bot is RobotData => {
        if (!bot || !bot.imageConfig) return false;
        // Study hours bots: check hours
        if (isStudyHoursRobot(bot)) {
          return totalStudyHours >= (bot.requiredStudyHours || 0) ||
                 unlockedRobots.includes(bot.name) ||
                 shopOwnedCharacters.includes(bot.id);
        }
        return bot.unlockLevel <= currentLevel ||
               shopOwnedCharacters.includes(bot.id) ||
               unlockedRobots.includes(bot.name);
      });
  }, [activeHomeBots, currentLevel, unlockedRobots, shopOwnedCharacters, totalStudyHours]);

  // Filter bots based on search, rarity, and zone
  const filterBots = useCallback((searchQuery: string, rarity?: string, zone?: string): RobotData[] => {
    return ROBOT_DATABASE.filter(bot => {
      const matchesSearch = bot.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRarity = !rarity || rarity === 'all' || bot.rarity === rarity;
      const matchesZone = !zone || zone === 'all' || bot.zone === zone;

      return matchesSearch && matchesRarity && matchesZone;
    });
  }, []);

  // Check if a bot is shop-exclusive (purchasable only, not level-based)
  const isShopExclusive = useCallback((botId: string): boolean => {
    const bot = getRobotById(botId);
    return bot?.isExclusive === true && bot?.coinPrice !== undefined;
  }, []);

  // Check if a bot is gated by study hours
  const isStudyHoursGated = useCallback((botId: string): boolean => {
    const bot = getRobotById(botId);
    return bot ? isStudyHoursRobot(bot) : false;
  }, []);

  return {
    // New bot terminology
    allBots: ROBOT_DATABASE,
    unlockedRobotsData,
    currentZoneBots,
    favorites,
    activeHomeBots,
    stats,
    totalStudyHours,
    toggleFavorite,
    toggleHomeActive,
    isBotUnlocked,
    isBotFavorite,
    isBotHomeActive,
    isShopExclusive,
    isStudyHoursGated,
    getRobotData,
    getActiveHomeBotsData,
    filterBots,

    // Backward-compat aliases
    allAnimals: ROBOT_DATABASE,
    activeHomePets: activeHomeBots,
    currentZoneAnimals: currentZoneBots,
    isAnimalUnlocked: isBotUnlocked,
    isAnimalFavorite: isBotFavorite,
    isAnimalHomeActive: isBotHomeActive,
    getActiveHomePetsData: getActiveHomeBotsData,
    filterAnimals: filterBots,
  };
};
