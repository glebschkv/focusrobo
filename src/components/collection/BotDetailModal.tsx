import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Heart, Lock, Home, ShoppingBag, Clock } from "lucide-react";
import { PixelIcon } from "@/components/ui/PixelIcon";
import { cn } from "@/lib/utils";
import { RobotData } from "@/data/RobotDatabase";
import { BotPreview } from "./BotPreview";

const RARITY_CONFIG = {
  common: { label: "Common", color: "hsl(220, 10%, 55%)", glow: "none" },
  rare: { label: "Rare", color: "hsl(210, 70%, 55%)", glow: "0 0 6px hsl(210, 70%, 55%, 0.4)" },
  epic: { label: "Epic", color: "hsl(280, 70%, 60%)", glow: "0 0 8px hsl(280, 70%, 60%, 0.4)" },
  legendary: { label: "Legendary", color: "hsl(45, 90%, 55%)", glow: "0 0 10px hsl(45, 90%, 55%, 0.5)" },
};

interface BotDetailModalProps {
  bot: RobotData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isUnlocked: boolean;
  isShopExclusive: boolean;
  isStudyHoursGated: boolean;
  totalStudyHours: number;
  isFavorite: boolean;
  isHomeActive: boolean;
  onToggleFavorite: () => void;
  onToggleHomeActive: () => void;
  onNavigateToShop: () => void;
}

export const BotDetailModal = ({
  bot,
  open,
  onOpenChange,
  isUnlocked,
  isShopExclusive,
  isStudyHoursGated,
  totalStudyHours,
  isFavorite,
  isHomeActive,
  onToggleFavorite,
  onToggleHomeActive,
  onNavigateToShop,
}: BotDetailModalProps) => {
  if (!bot) return null;

  const rarityConf = RARITY_CONFIG[bot.rarity];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-xs p-0 overflow-hidden border-0"
        style={{
          background: 'white',
          border: '1px solid hsl(var(--border))',
          borderRadius: '14px',
          boxShadow: '0 16px 48px hsl(0, 0%, 0%, 0.08), 0 0 0 1px hsl(var(--border))',
        }}
      >
        <>
          {/* Header with sprite animation */}
          <div className="p-6 text-center" style={{
            background: 'hsl(var(--muted))',
            borderBottom: '1px solid hsl(var(--border))',
          }}>
            {/* Show animated sprite for unlocked bots, silhouette for locked */}
            {isUnlocked && bot.spriteConfig ? (
              <div className="mb-3 flex items-center justify-center h-[180px] overflow-hidden">
                <BotPreview
                  robot={bot}
                  scale={Math.min(4, 180 / Math.max(bot.spriteConfig.frameWidth, bot.spriteConfig.frameHeight))}
                />
              </div>
            ) : !isUnlocked && bot.spriteConfig ? (
              <div className="mb-3 flex items-center justify-center h-[180px] overflow-hidden relative">
                <div style={{ filter: 'brightness(0.5) saturate(0)' }}>
                  <BotPreview
                    robot={bot}
                    scale={Math.min(4, 180 / Math.max(bot.spriteConfig.frameWidth, bot.spriteConfig.frameHeight))}
                  />
                </div>
              </div>
            ) : (
              <div className="text-5xl mb-3">
                {isUnlocked ? bot.emoji : "?"}
              </div>
            )}

            {/* Rarity badge */}
            <div className="flex justify-center mb-2">
              <span
                className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
                style={{
                  color: rarityConf.color,
                  border: `1px solid ${rarityConf.color}`,
                  background: `${rarityConf.color}15`,
                  boxShadow: rarityConf.glow,
                }}
              >
                {rarityConf.label}
              </span>
            </div>

            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-stone-800">
                {isUnlocked ? bot.name : "???"}
              </DialogTitle>
            </DialogHeader>

            <div className="flex items-center justify-center gap-2 mt-1">
              <span className="px-2 py-0.5 text-[10px] font-semibold rounded-md bg-stone-100 text-stone-500 border border-stone-200">
                {bot.zone}
              </span>
            </div>
          </div>

          <div className="p-4 space-y-3">
            {isUnlocked ? (
              <>
                <p className="text-sm text-stone-500 text-center">
                  {bot.description}
                </p>

                {/* Show on Home toggle */}
                <button
                  onClick={onToggleHomeActive}
                  className={cn(
                    "w-full py-3 rounded-lg font-bold text-sm transition-all active:scale-95 border",
                    isHomeActive
                      ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                      : "bg-stone-50 text-stone-500 border-stone-200"
                  )}
                >
                  <Home className={cn(
                    "w-4 h-4 inline mr-2",
                    isHomeActive && "fill-emerald-400/50"
                  )} />
                  {isHomeActive ? "Showing on Home" : "Show on Home"}
                </button>

                {/* Favorite toggle */}
                <button
                  onClick={onToggleFavorite}
                  className={cn(
                    "w-full py-3 rounded-lg font-bold text-sm transition-all active:scale-95 border",
                    isFavorite
                      ? "bg-red-50 text-red-500 border-red-200"
                      : "bg-stone-50 text-stone-500 border-stone-200"
                  )}
                >
                  <Heart className={cn(
                    "w-4 h-4 inline mr-2",
                    isFavorite && "fill-red-400"
                  )} />
                  {isFavorite ? "Favorited" : "Add to Favorites"}
                </button>
              </>
            ) : isShopExclusive ? (
              <div className="text-center py-4">
                <p className="text-sm text-stone-500 mb-3">
                  {bot.description}
                </p>
                <div className="w-14 h-14 mx-auto mb-3 bg-amber-50 rounded-full flex items-center justify-center border-2 border-amber-300">
                  <ShoppingBag className="w-7 h-7 text-amber-500" />
                </div>
                <p className="text-sm text-stone-500 mb-2">
                  This bot is available in the Shop
                </p>
                <div className="flex items-center justify-center gap-1 mb-3 text-amber-600">
                  <PixelIcon name="coin" size={16} />
                  <span className="font-bold">{bot.coinPrice?.toLocaleString()}</span>
                </div>
                <button
                  onClick={onNavigateToShop}
                  className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-6 py-2.5 rounded-lg font-bold text-sm transition-all active:scale-95 inline-flex items-center gap-2 border border-amber-400 shadow-sm"
                >
                  <ShoppingBag className="w-4 h-4" />
                  Buy from Shop
                </button>
              </div>
            ) : isStudyHoursGated && bot.requiredStudyHours ? (
              <div className="text-center py-4">
                <p className="text-sm text-stone-500 mb-3">
                  {bot.description}
                </p>
                <div className="w-14 h-14 mx-auto mb-3 bg-sky-50 rounded-full flex items-center justify-center border-2 border-sky-300">
                  <Clock className="w-7 h-7 text-sky-500" />
                </div>
                <p className="text-sm text-stone-500 mb-2">
                  Unlock by studying
                </p>
                <div className="bg-sky-50 border border-sky-200 inline-block px-4 py-2 rounded-lg mb-3">
                  <span className="text-sm font-bold text-sky-600">
                    {Math.floor(totalStudyHours)}h / {bot.requiredStudyHours}h studied
                  </span>
                </div>
                {/* Progress bar */}
                <div className="w-full max-w-[200px] mx-auto bg-stone-100 rounded-full h-2.5 overflow-hidden border border-stone-200">
                  <div
                    className="bg-gradient-to-r from-sky-400 to-sky-500 h-full rounded-full transition-all"
                    style={{ width: `${Math.min(100, (totalStudyHours / bot.requiredStudyHours) * 100)}%` }}
                  />
                </div>
                <p className="text-xs text-stone-400 mt-2">
                  {Math.max(0, Math.ceil(bot.requiredStudyHours - totalStudyHours))}h remaining
                </p>
              </div>
            ) : (
              <div className="text-center py-4">
                <div className="w-14 h-14 mx-auto mb-3 bg-stone-100 rounded-full flex items-center justify-center border border-stone-200">
                  <Lock className="w-7 h-7 text-stone-400" />
                </div>
                <p className="text-sm text-stone-500 mb-1">
                  Keep leveling up to unlock this bot!
                </p>
                <div className="inline-block px-4 py-2 text-sm font-bold rounded-md bg-amber-50 text-amber-600 border border-amber-200">
                  Reach Level {bot.unlockLevel}
                </div>
              </div>
            )}
          </div>
        </>
      </DialogContent>
    </Dialog>
  );
};

/** @deprecated Use BotDetailModal instead */
export const PetDetailModal = BotDetailModal;
