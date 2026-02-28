/**
 * BotCollectionGrid Component
 *
 * Main collection view with bots and zones/backgrounds tabs.
 * Refactored to use smaller, focused child components for maintainability.
 *
 * Components extracted:
 * - ZoneGrid: Zone selection
 * - BackgroundGrid: Premium backgrounds
 * - BackgroundDetailModal: Background purchase/equip modal
 */

import { useState, useMemo, useCallback, memo } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCollection } from "@/hooks/useCollection";
import { useAppState } from "@/contexts/AppStateContext";
import { RobotData, ZONE_DATABASE } from "@/data/RobotDatabase";
import { PREMIUM_BACKGROUNDS, PremiumBackground } from "@/data/ShopData";
import { toast } from "sonner";
import { CollectionFilters, BotSortOption } from "./collection/CollectionFilters";
import { BotCard } from "./collection/BotCard";
import { BotDetailModal } from "./collection/BotDetailModal";
import { ZoneGrid } from "./collection/ZoneGrid";
import { BackgroundGrid } from "./collection/BackgroundGrid";
import { BackgroundDetailModal } from "./collection/BackgroundDetailModal";
import { useShopStore, useThemeStore } from "@/stores";

// Map zone names to background theme IDs
const ZONE_TO_BACKGROUND: Record<string, string> = {
  'Workshop': 'day',
  'Solar Fields': 'sunset',
  'Stealth Lab': 'night',
  'Biotech Zone': 'forest',
  'Assembly Line': 'snow',
  'Cyber District': 'city',
};

// Memoized bot grid component for better performance
const BotGrid = memo(({
  bots,
  isAnimalUnlocked,
  isShopExclusive,
  isStudyHoursGated,
  isAnimalFavorite,
  isAnimalHomeActive,
  onBotClick,
}: {
  bots: RobotData[];
  isAnimalUnlocked: (id: string) => boolean;
  isShopExclusive: (id: string) => boolean;
  isStudyHoursGated: (id: string) => boolean;
  isAnimalFavorite: (id: string) => boolean;
  isAnimalHomeActive: (id: string) => boolean;
  onBotClick: (bot: RobotData) => void;
}) => {
  return (
    <div className="grid grid-cols-3 gap-3">
      {bots.map((bot) => (
        <BotCard
          key={bot.id}
          bot={bot}
          isLocked={!isAnimalUnlocked(bot.id)}
          isShopBot={isShopExclusive(bot.id)}
          isStudyHoursGated={isStudyHoursGated(bot.id)}
          isFavorited={isAnimalFavorite(bot.id)}
          isHomeActive={isAnimalHomeActive(bot.id)}
          onClick={() => onBotClick(bot)}
        />
      ))}
    </div>
  );
});

BotGrid.displayName = 'BotGrid';

export const BotCollectionGrid = memo(() => {
  const {
    currentLevel,
    currentBiome,
    switchBiome
  } = useAppState();

  const {
    stats,
    totalStudyHours,
    toggleFavorite,
    toggleHomeActive,
    isAnimalUnlocked,
    isAnimalFavorite,
    isAnimalHomeActive,
    isShopExclusive,
    isStudyHoursGated,
    filterAnimals
  } = useCollection();

  // Use Zustand stores instead of local state + events
  const ownedBackgrounds = useShopStore((state) => state.ownedBackgrounds);
  const equippedBackground = useShopStore((state) => state.equippedBackground);
  const setEquippedBackground = useShopStore((state) => state.setEquippedBackground);
  const setHomeBackground = useThemeStore((state) => state.setHomeBackground);

  // Local UI state
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState<BotSortOption>("owned");
  const [selectedBot, setSelectedBot] = useState<RobotData | null>(null);
  const [activeTab, setActiveTab] = useState<"bots" | "zones">("bots");
  const [selectedBackground, setSelectedBackground] = useState<PremiumBackground | null>(null);

  // Handle equipping a background
  const handleEquipBackground = useCallback((bgId: string) => {
    const newEquipped = equippedBackground === bgId ? null : bgId;
    setEquippedBackground(newEquipped);

    if (newEquipped) {
      const background = PREMIUM_BACKGROUNDS.find(bg => bg.id === bgId);
      const imagePath = background?.previewImage || 'day';
      setHomeBackground(imagePath);
      toast.success("Background equipped!");
    } else {
      setHomeBackground('day');
      toast.success("Background unequipped");
    }
  }, [equippedBackground, setEquippedBackground, setHomeBackground]);

  // Handle switching zones
  const handleSwitchBiome = useCallback((biomeName: string) => {
    switchBiome(biomeName);

    // Clear any equipped premium background when switching zones
    if (equippedBackground) {
      setEquippedBackground(null);
    }

    // Use the zone's background image if available
    const zone = ZONE_DATABASE.find(b => b.name === biomeName);
    const backgroundTheme = zone?.backgroundImage || ZONE_TO_BACKGROUND[biomeName] || 'day';
    setHomeBackground(backgroundTheme);
  }, [switchBiome, equippedBackground, setEquippedBackground, setHomeBackground]);

  // Handle navigation to shop tab (switches to shop and opens the bots category)
  const handleNavigateToShop = useCallback(() => {
    window.dispatchEvent(new CustomEvent('switchToTab', { detail: 'shop' }));
    window.dispatchEvent(new CustomEvent('navigateToShopCategory', { detail: 'bots' }));
  }, []);

  // Memoize filtered and sorted bots
  const filteredBots = useMemo(() => {
    const bots = filterAnimals(searchQuery, "all", "all");

    if (sortOption === "default") return bots;

    const RARITY_RANK: Record<string, number> = {
      legendary: 0,
      epic: 1,
      rare: 2,
      common: 3,
    };

    return [...bots].sort((a, b) => {
      switch (sortOption) {
        case "name":
          return a.name.localeCompare(b.name);
        case "rarity":
          return (RARITY_RANK[a.rarity] ?? 4) - (RARITY_RANK[b.rarity] ?? 4);
        case "owned": {
          const aOwned = isAnimalUnlocked(a.id) ? 0 : 1;
          const bOwned = isAnimalUnlocked(b.id) ? 0 : 1;
          return aOwned - bOwned;
        }
        case "favorites": {
          const aFav = isAnimalFavorite(a.id) ? 0 : 1;
          const bFav = isAnimalFavorite(b.id) ? 0 : 1;
          return aFav - bFav;
        }
        default:
          return 0;
      }
    });
  }, [searchQuery, sortOption, filterAnimals, isAnimalUnlocked, isAnimalFavorite]);

  // Memoize handler to avoid recreating on every render
  const handleBotClick = useCallback((bot: RobotData) => {
    setSelectedBot(bot);
  }, []);

  // Memoize stats calculations
  const botsStats = useMemo(() => ({
    unlocked: stats.unlockedRobots + stats.shopBotsOwned,
    total: stats.totalBots + stats.shopBotsTotal,
  }), [stats]);

  const zonesStats = useMemo(() => ({
    unlocked: ZONE_DATABASE.filter(b => b.unlockLevel <= currentLevel).length + ownedBackgrounds.length,
    total: ZONE_DATABASE.length + PREMIUM_BACKGROUNDS.length,
  }), [currentLevel, ownedBackgrounds.length]);

  // Handle background detail modal close
  const handleCloseBackgroundModal = useCallback(() => {
    setSelectedBackground(null);
  }, []);

  // Handle background equip from modal
  const handleEquipFromModal = useCallback(() => {
    if (selectedBackground) {
      handleEquipBackground(selectedBackground.id);
    }
  }, [selectedBackground, handleEquipBackground]);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <CollectionFilters
        activeTab={activeTab}
        onTabChange={setActiveTab}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        sortOption={sortOption}
        onSortChange={setSortOption}
        botsStats={botsStats}
        zonesStats={zonesStats}
      />

      {/* Content - Scrollable area that stops at taskbar */}
      <ScrollArea className="flex-1 min-h-0">
        {activeTab === "bots" && (
          <div className="px-4 pt-2 pb-28">
            {filteredBots.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <span className="text-3xl mb-3">🔍</span>
                <p className="text-sm font-semibold text-white mb-1">No bots found</p>
                <p className="text-xs text-purple-300/70">Try a different search or sort option</p>
              </div>
            ) : (
              <BotGrid
                bots={filteredBots}
                isAnimalUnlocked={isAnimalUnlocked}
                isShopExclusive={isShopExclusive}
                isStudyHoursGated={isStudyHoursGated}
                isAnimalFavorite={isAnimalFavorite}
                isAnimalHomeActive={isAnimalHomeActive}
                onBotClick={handleBotClick}
              />
            )}
          </div>
        )}

        {activeTab === "zones" && (
          <div className="px-4 pt-2 pb-28 space-y-4">
            {/* Zone Selection Section */}
            <ZoneGrid
              currentLevel={currentLevel}
              currentBiome={currentBiome}
              equippedBackground={equippedBackground}
              onSwitchBiome={handleSwitchBiome}
            />

            {/* Premium Backgrounds Section */}
            <BackgroundGrid
              ownedBackgrounds={ownedBackgrounds}
              equippedBackground={equippedBackground}
              onEquipBackground={handleEquipBackground}
              onSelectBackground={setSelectedBackground}
            />
          </div>
        )}
      </ScrollArea>

      {/* Background Detail Modal */}
      <BackgroundDetailModal
        background={selectedBackground}
        open={!!selectedBackground}
        onOpenChange={handleCloseBackgroundModal}
        isOwned={selectedBackground ? ownedBackgrounds.includes(selectedBackground.id) : false}
        isEquipped={selectedBackground?.id === equippedBackground}
        onEquip={handleEquipFromModal}
        onNavigateToShop={handleNavigateToShop}
      />

      {/* Bot Detail Modal */}
      <BotDetailModal
        bot={selectedBot}
        open={!!selectedBot}
        onOpenChange={() => setSelectedBot(null)}
        isUnlocked={selectedBot ? isAnimalUnlocked(selectedBot.id) : false}
        isShopExclusive={selectedBot ? isShopExclusive(selectedBot.id) : false}
        isStudyHoursGated={selectedBot ? isStudyHoursGated(selectedBot.id) : false}
        totalStudyHours={totalStudyHours}
        isFavorite={selectedBot ? isAnimalFavorite(selectedBot.id) : false}
        isHomeActive={selectedBot ? isAnimalHomeActive(selectedBot.id) : false}
        onToggleFavorite={() => selectedBot && toggleFavorite(selectedBot.id)}
        onToggleHomeActive={() => selectedBot && toggleHomeActive(selectedBot.id)}
        onNavigateToShop={() => {
          setSelectedBot(null);
          handleNavigateToShop();
        }}
      />
    </div>
  );
});

BotCollectionGrid.displayName = 'BotCollectionGrid';

/** @deprecated Use BotCollectionGrid instead */
export const PetCollectionGrid = BotCollectionGrid;
export const AnimalCollection = BotCollectionGrid;
