import { useState, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Zap, Clock, Backpack, Star, Palette, Zap as ZapIcon, Egg } from "lucide-react";
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
import { PremiumSubscription } from "@/components/PremiumSubscription";
import { toast } from "sonner";
import { playSoundEffect } from "@/hooks/useSoundEffects";
import { FeaturedTab } from "@/components/shop/tabs/FeaturedTab";
import { BackgroundsTab } from "@/components/shop/tabs/BackgroundsTab";
import { PowerUpsTab } from "@/components/shop/tabs/PowerUpsTab";
import { EggsTab } from "@/components/shop/tabs/EggsTab";
import { InventoryTab } from "@/components/shop/tabs/InventoryTab";
import { PurchaseConfirmDialog } from "@/components/shop/PurchaseConfirmDialog";

const CATEGORY_ICONS: Record<string, typeof Star> = {
  eggs: Egg,
  featured: Star,
  customize: Palette,
  powerups: ZapIcon,
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
        result = await purchaseItem(selectedItem.id, activeCategory);
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
            canAfford={canAfford}
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
      case 'customize':
        return (
          <BackgroundsTab
            inventory={inventory}
            isOwned={isOwned}
            isBundleOwned={isBundleOwned}
            equipBackground={equipBackground}
            setSelectedItem={setSelectedItem}
            setShowPurchaseConfirm={setShowPurchaseConfirm}
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
      {/* Compact Header Row */}
      <div className="shop-header">
        <div className="flex items-center gap-2">
          <h1 className="text-base font-black uppercase tracking-tight text-amber-900">Shop</h1>
          {isBoosterActive() && activeBooster && (
            <div className="shop-booster-pill">
              <Zap className="w-3 h-3 text-purple-600 animate-pulse" />
              <span className="text-[10px] font-bold text-purple-700">
                {getCurrentMultiplier()}x
              </span>
              <div className="flex items-center gap-0.5 text-[9px] text-purple-500">
                <Clock className="w-2.5 h-2.5" />
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
            aria-label="My Items"
          >
            <Backpack className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setShowInventory(false);
              setActiveCategory('powerups');
            }}
            className="shop-coin-badge"
            aria-label="Buy Coins"
          >
            <PixelIcon name="coin" size={16} />
            <span className="font-black text-sm text-amber-800">
              {coinBalance.toLocaleString()}
            </span>
            <span className="shop-coin-plus">+</span>
          </button>
        </div>
      </div>

      {/* Horizontal pill tabs */}
      {!showInventory && (
        <div className="shop-tabs-bar">
          {SHOP_CATEGORIES.map((category) => {
            const Icon = CATEGORY_ICONS[category.id] || Star;
            const isActive = activeCategory === category.id;
            return (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={cn("shop-tab-pill", isActive && "active")}
              >
                <Icon className="w-3.5 h-3.5" strokeWidth={isActive ? 2.5 : 2} />
                <span>{category.name}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Inventory header */}
      {showInventory && (
        <div className="px-4 pt-2 pb-1 flex items-center gap-2">
          <Backpack className="w-4 h-4 text-emerald-600" />
          <h2 className="text-sm font-black uppercase tracking-tight text-emerald-700">
            My Items
          </h2>
        </div>
      )}

      {/* Content */}
      <ScrollArea className="flex-1 min-h-0">
        <div className="px-4 pt-3 pb-6">
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
