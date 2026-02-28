import { memo, useMemo } from "react";
import { Heart, Lock, Home, ShoppingBag, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { RobotData } from "@/data/RobotDatabase";
import { BotPreview } from "./BotPreview";
import { ariaLabel } from "@/lib/accessibility";

interface BotCardProps {
  bot: RobotData;
  isLocked: boolean;
  isShopBot: boolean;
  isStudyHoursGated: boolean;
  isFavorited: boolean;
  isHomeActive: boolean;
  onClick: () => void;
}

export const BotCard = memo(({
  bot,
  isLocked,
  isShopBot,
  isStudyHoursGated,
  isFavorited,
  isHomeActive,
  onClick,
}: BotCardProps) => {
  const showAsLocked = isLocked && !isShopBot && !isStudyHoursGated;
  const showAsShopBot = isLocked && isShopBot;
  const showAsStudyHours = isLocked && isStudyHoursGated;
  const isUnavailable = showAsLocked || showAsStudyHours;

  const accessibleLabel = useMemo(() =>
    ariaLabel.botCard?.(bot.name, isLocked, bot.unlockLevel) ??
    ariaLabel.petCard?.(bot.name, isLocked, bot.unlockLevel) ??
    `${bot.name}, ${isLocked ? 'locked' : 'unlocked'}`,
    [bot.name, isLocked, bot.unlockLevel]
  );

  // Build inventory slot class names
  const slotClasses = cn(
    "inventory-slot",
    `rarity-${bot.rarity}`,
    !isLocked && "unlocked",
    showAsLocked && "locked",
    showAsShopBot && "shop-bot",
    showAsStudyHours && "study-gated",
  );

  return (
    <button
      onClick={onClick}
      aria-label={accessibleLabel}
      className={slotClasses}
    >
      {/* Favorite heart */}
      {!isLocked && isFavorited && (
        <div className="inventory-fav">
          <Heart className="w-3.5 h-3.5 fill-red-400 text-red-400" />
        </div>
      )}

      {/* Home active indicator */}
      {!isLocked && isHomeActive && (
        <div className="inventory-home">
          <Home className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400/30" />
        </div>
      )}

      {/* Level badge for locked (non-shop) */}
      {showAsLocked && (
        <div className="inventory-badge level-badge">
          <span>Lv.{bot.unlockLevel}</span>
        </div>
      )}

      {/* Shop badge */}
      {showAsShopBot && (
        <div className="inventory-badge shop-badge">
          <ShoppingBag className="w-2.5 h-2.5" />
          <span>SHOP</span>
        </div>
      )}

      {/* Study hours badge */}
      {showAsStudyHours && bot.requiredStudyHours && (
        <div className="inventory-badge study-badge">
          <Clock className="w-2.5 h-2.5" />
          <span>{bot.requiredStudyHours}h</span>
        </div>
      )}

      {/* Sprite area */}
      <div className={cn("inventory-sprite-area")}>
        {(isUnavailable) && bot.imageConfig ? (
          <div style={{ filter: 'brightness(0.5) saturate(0)' }}>
            <BotPreview
              robot={bot}
              scale={1.5}
            />
          </div>
        ) : (isUnavailable) ? (
          <Lock className="w-6 h-6 text-[hsl(260,10%,35%)]" />
        ) : bot.imageConfig ? (
          <BotPreview
            robot={bot}
            scale={1.5}
          />
        ) : (
          <span className="text-3xl">{bot.icon}</span>
        )}
      </div>

      {/* Rarity dot */}
      <div className={cn("rarity-dot", bot.rarity)} />

      {/* Name */}
      <span className="inventory-bot-name">
        {isUnavailable ? "???" : bot.name}
      </span>
    </button>
  );
});

BotCard.displayName = 'BotCard';

/** @deprecated Use BotCard instead */
export const PetCard = BotCard;
