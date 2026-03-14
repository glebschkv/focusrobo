import { useState, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PixelIcon } from "@/components/ui/PixelIcon";
import { cn } from "@/lib/utils";
import { useShop } from "@/hooks/useShop";
import { useCoinBooster } from "@/hooks/useCoinBooster";
import { usePremiumStatus } from "@/hooks/usePremiumStatus";
import {
  ShopCategory,
  SHOP_CATEGORIES,
  ShopItem,
  Bundle,
} from "@/data/ShopData";
import { getEggById } from "@/data/EggData";
import { PremiumSubscription } from "@/components/PremiumSubscription";
import { toast } from "sonner";
import { playSoundEffect } from "@/hooks/useSoundEffects";
import { FeaturedTab } from "@/components/shop/tabs/FeaturedTab";
import { PowerUpsTab } from "@/components/shop/tabs/PowerUpsTab";
import { InventoryTab } from "@/components/shop/tabs/InventoryTab";
import { EggsTab } from "@/components/shop/tabs/EggsTab";
import { DecorTab } from "@/components/shop/tabs/DecorTab";
import { PurchaseConfirmDialog } from "@/components/shop/PurchaseConfirmDialog";
import { useLandStore } from "@/stores/landStore";
import { useShopStore } from "@/stores/shopStore";
import { useCurrentLevel, useCurrentXP, calculateLevelFromXP } from "@/stores/xpStore";
import { useCoinSystem } from "@/hooks/useCoinSystem";

const CATEGORY_ICONS: Record<string, string> = {
  eggs: 'egg',
  decor: 'tree',
  featured: 'crown',
  powerups: 'lightning',
};

export const Shop = () => {
  const [activeCategory, setActiveCategory] = useState<ShopCategory>("eggs");
  const [selectedItem, setSelectedItem] = useState<ShopItem | null>(null);
  const [showPurchaseConfirm, setShowPurchaseConfirm] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [showInventory, setShowInventory] = useState(false);

  const {
    inventory,
    isOwned,
    isBundleOwned,
    purchaseItem,
    purchaseBundle,
    equipBackground,
    coinBalance,
    canAfford,
  } = useShop();

  const {
    isBoosterActive,
    getTimeRemainingFormatted,
    activeBooster,
    getCurrentMultiplier,
  } = useCoinBooster();

  const { isPremium, currentPlan } = usePremiumStatus();

  const hatchEgg = useLandStore((s) => s.hatchEgg);
  const placePendingPet = useLandStore((s) => s.placePendingPet);
  const addDecorationToInventory = useLandStore((s) => s.addDecorationToInventory);
  const setDailyDealPurchased = useShopStore((s) => s.setDailyDealPurchased);
  const coinSystem = useCoinSystem();
  const storedLevel = useCurrentLevel();
  const currentXP = useCurrentXP();
  const currentLevel = storedLevel === 0 && currentXP > 0
    ? calculateLevelFromXP(currentXP)
    : storedLevel;

  // Listen for external navigation requests
  useEffect(() => {
    const handleNavigate = (event: CustomEvent<ShopCategory>) => {
      const category = event.detail;
      if (category && SHOP_CATEGORIES.some(c => c.id === category)) {
        setActiveCategory(category);
      }
    };
    window.addEventListener('navigateToShopCategory', handleNavigate as EventListener);
    return () => {
      window.removeEventListener('navigateToShopCategory', handleNavigate as EventListener);
    };
  }, []);

  const handlePurchase = async () => {
    if (!selectedItem || isPurchasing) return;

    setIsPurchasing(true);
    try {
      let result;
      if ('itemIds' in selectedItem) {
        result = await purchaseBundle(selectedItem.id);
      } else {
        const itemCategory = selectedItem.category || activeCategory;

        // Daily deal egg/decor items need dedicated handling since
        // purchaseItem only supports customize/powerups categories.
        if (itemCategory === 'eggs') {
          const egg = getEggById(selectedItem.id);
          if (!egg) {
            result = { success: false, message: 'Egg not found' };
          } else {
            const price = selectedItem.coinPrice ?? egg.coinPrice;
            const spent = await coinSystem.spendCoins(price, 'shop_purchase');
            if (!spent) {
              result = { success: false, message: 'Not enough coins!' };
            } else {
              hatchEgg(egg, currentLevel);
              placePendingPet();
              setDailyDealPurchased();
              result = { success: true, message: `Hatched a new pet from ${egg.name}!` };
            }
          }
        } else if (itemCategory === 'decor') {
          const price = selectedItem.coinPrice ?? 0;
          const spent = await coinSystem.spendCoins(price, 'shop_purchase');
          if (!spent) {
            result = { success: false, message: 'Not enough coins!' };
          } else {
            addDecorationToInventory(selectedItem.id);
            setDailyDealPurchased();
            result = { success: true, message: `${selectedItem.name} added to your inventory!` };
          }
        } else {
          result = await purchaseItem(selectedItem.id, itemCategory);
        }
      }

      if (result.success) {
        playSoundEffect('purchase');
        setShowPurchaseConfirm(false);
        toast.success(result.message);
        setSelectedItem(null);
      } else {
        toast.error(result.message);
      }
    } finally {
      setIsPurchasing(false);
    }
  };

  const renderContent = () => {
    switch (activeCategory) {
      case 'eggs':
        return (
          <EggsTab
            coinBalance={coinBalance}
            canAfford={(price: number) => canAfford(price)}
          />
        );
      case 'decor':
        return (
          <DecorTab
            coinBalance={coinBalance}
            canAfford={(price: number) => canAfford(price)}
          />
        );
      case 'featured':
        return (
          <FeaturedTab
            inventory={inventory}
            isOwned={isOwned}
            isBundleOwned={isBundleOwned}
            setActiveCategory={setActiveCategory}
            setSelectedItem={setSelectedItem}
            setShowPurchaseConfirm={setShowPurchaseConfirm}
            setShowPremiumModal={setShowPremiumModal}
            isPremium={isPremium}
            currentPlan={currentPlan}
            coinBalance={coinBalance}
            canAfford={canAfford}
          />
        );
      case 'powerups':
        return (
          <PowerUpsTab
            inventory={inventory}
            isOwned={isOwned}
            setSelectedItem={setSelectedItem}
            setShowPurchaseConfirm={setShowPurchaseConfirm}
            canAfford={canAfford}
            isBoosterActive={isBoosterActive}
            getTimeRemainingFormatted={getTimeRemainingFormatted}
            activeBooster={activeBooster}
            getCurrentMultiplier={getCurrentMultiplier}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="shop-container h-full flex flex-col">
      {/* Merchant Header */}
      <div className="shop-header">
        <div className="shop-title-banner">
          <PixelIcon name="star" size={18} />
          <span className="shop-title-text">Wandering Cart</span>
          {isBoosterActive() && activeBooster && (
            <div className="shop-booster-pill">
              <PixelIcon name="lightning" size={12} />
              <span className="text-[10px] font-bold text-purple-700">
                {getCurrentMultiplier()}x
              </span>
              <div className="flex items-center gap-0.5 text-[9px] text-purple-500">
                <PixelIcon name="clock" size={10} />
                <span className="font-mono font-bold">{getTimeRemainingFormatted()}</span>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowInventory(!showInventory)}
            className={cn(
              "shop-inventory-btn",
              showInventory && "active"
            )}
            aria-label="My Collection"
          >
            <PixelIcon name="backpack" size={16} />
          </button>
          <button
            onClick={() => {
              setShowInventory(false);
              setActiveCategory('powerups');
            }}
            className="shop-coin-badge"
            aria-label="View Coins"
          >
            <PixelIcon name="coin" size={16} />
            <span className="font-black text-sm" style={{ color: '#7A5C20' }}>
              {coinBalance.toLocaleString()}
            </span>
            <span className="shop-coin-plus">+</span>
          </button>
        </div>
      </div>

      {/* Wooden sign tabs */}
      {!showInventory && (
        <div className="shop-tabs-bar">
          {SHOP_CATEGORIES.map((category) => {
            const iconName = CATEGORY_ICONS[category.id] || 'star';
            const isActive = activeCategory === category.id;
            return (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={cn("shop-tab-pill", isActive && "active")}
              >
                <PixelIcon name={iconName} size={14} />
                <span>{category.name}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Inventory header */}
      {showInventory && (
        <div className="px-4 pt-2 pb-1 flex items-center gap-2">
          <PixelIcon name="backpack" size={16} />
          <h2 className="text-sm font-black tracking-tight" style={{ color: '#5C3D1A' }}>
            My Collection
          </h2>
        </div>
      )}

      {/* Content */}
      <ScrollArea className="flex-1 min-h-0">
        <div className="px-4 pt-3 dock-clearance">
          {showInventory ? (
            <InventoryTab equipBackground={equipBackground} />
          ) : (
            renderContent()
          )}
        </div>
      </ScrollArea>

      {/* Purchase Confirmation Modal */}
      <PurchaseConfirmDialog
        open={showPurchaseConfirm}
        onOpenChange={setShowPurchaseConfirm}
        selectedItem={selectedItem as ShopItem | Bundle | null}
        onPurchase={handlePurchase}
        canAfford={canAfford}
        coinBalance={coinBalance}
        isPurchasing={isPurchasing}
      />

      {/* Premium Subscription Modal */}
      <PremiumSubscription
        isOpen={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
      />
    </div>
  );
};
