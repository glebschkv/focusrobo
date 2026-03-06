import { useState } from 'react';
import {
  Crown,
  Check,
  Sparkles,
  Volume2,
  Timer,
  BarChart3,
  Zap,
  Star,
  RefreshCw,
  Music,
  Settings,
  Snowflake,
  Loader2,
  PenLine,
  Palette,
  Globe,
  Egg,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { PixelIcon } from '@/components/ui/PixelIcon';
import { usePremiumStatus, SUBSCRIPTION_PLANS, SubscriptionPlan } from '@/hooks/usePremiumStatus';
import { useStoreKit } from '@/hooks/useStoreKit';
import { toast } from 'sonner';
import { Capacitor } from '@capacitor/core';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { useNavigate } from 'react-router-dom';

interface PremiumSubscriptionProps {
  isOpen: boolean;
  onClose: () => void;
}

// Plan definitions for the 3-card layout
interface PlanDef {
  id: string;
  label: string;
  period: string;
  price: string;
  iapProductId: string;
  highlighted: boolean;
  badge?: string;
  savingsBadge?: string;
}

const PLAN_DEFS: PlanDef[] = [
  {
    id: 'premium-weekly',
    label: 'Weekly',
    period: '/week',
    price: '$2.49',
    iapProductId: 'com.fonoinc.app.premium.weekly',
    highlighted: false,
  },
  {
    id: 'premium-yearly',
    label: 'Yearly',
    period: '/year',
    price: '$39.99',
    iapProductId: 'com.fonoinc.app.premium.yearly',
    highlighted: true,
    badge: 'Best Value',
    savingsBadge: 'Save 44%',
  },
  {
    id: 'premium-monthly',
    label: 'Monthly',
    period: '/month',
    price: '$5.99',
    iapProductId: 'com.fonoinc.app.premium.monthly',
    highlighted: false,
  },
];

// Features for the premium plan
const PREMIUM_FEATURES = [
  '2x Coins & XP',
  '3 Streak Freezes/mo',
  '3-Layer Sound Mix',
  '5 Focus Presets',
  '15% Egg Discount',
  'Full Analytics',
  'All Island Themes',
];

// Compact feature display
const FEATURE_MAP: Record<string, { icon: React.ReactNode; label: string }> = {
  '2x Coins & XP': { icon: <Zap className="w-3.5 h-3.5" />, label: '2x Coins & XP' },
  '3 Streak Freezes/mo': { icon: <Snowflake className="w-3.5 h-3.5" />, label: '3 Freezes/mo' },
  '3-Layer Sound Mix': { icon: <Music className="w-3.5 h-3.5" />, label: '3-Layer Mix' },
  '5 Focus Presets': { icon: <Settings className="w-3.5 h-3.5" />, label: '5 Presets' },
  '15% Egg Discount': { icon: <Egg className="w-3.5 h-3.5" />, label: '15% Egg Discount' },
  'Full Analytics': { icon: <BarChart3 className="w-3.5 h-3.5" />, label: 'Full Analytics' },
  'All Island Themes': { icon: <Palette className="w-3.5 h-3.5" />, label: 'All Themes' },
  'All 13 ambient sounds': { icon: <Volume2 className="w-3.5 h-3.5" />, label: '13 Sounds' },
  'Auto-break Pomodoro cycles': { icon: <Timer className="w-3.5 h-3.5" />, label: 'Auto Pomodoro' },
  'Session notes & reflections': { icon: <PenLine className="w-3.5 h-3.5" />, label: 'Session Notes' },
  'Focus analytics dashboard': { icon: <BarChart3 className="w-3.5 h-3.5" />, label: 'Analytics' },
  'All timer backgrounds': { icon: <Palette className="w-3.5 h-3.5" />, label: 'All Backgrounds' },
  'Website blocking': { icon: <Globe className="w-3.5 h-3.5" />, label: 'Block Websites' },
};

// Tier-specific colors using the retro dark palette
const TIER_CONFIG = {
  premium: {
    // Header strip
    headerGradient: 'from-amber-500 to-orange-500',
    // Card border (colored)
    borderHsl: 'hsl(35 80% 50%)',
    glowHsl: 'hsl(35 100% 50% / 0.15)',
    // Neon accent class for price
    neonClass: 'retro-neon-orange',
    // Icon color in features
    iconColor: 'text-amber-400',
    // Feature pill border color
    featureBorder: 'border-amber-500/25',
    // Button style (retro-arcade-btn variant)
    btnGradient: 'linear-gradient(180deg, hsl(35 80% 55%) 0%, hsl(35 85% 45%) 50%, hsl(35 90% 35%) 100%)',
    btnBorder: 'hsl(35 70% 65%)',
    btnShadow: 'hsl(35 90% 25%)',
    btnInset: 'hsl(35 60% 70%)',
    btnGlow: 'hsl(35 100% 50% / 0.4)',
    // Icon in header
    icon: <Star className="w-4 h-4 text-white" />,
    // Bonus coins color
    bonusColor: 'text-amber-400',
  },
};

export const PremiumSubscription = ({ isOpen, onClose }: PremiumSubscriptionProps) => {
  const { isPremium, currentPlan, purchaseSubscription, restorePurchases, tier, grantBonusCoins } = usePremiumStatus();
  const storeKit = useStoreKit();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  const isNative = Capacitor.isNativePlatform();
  const config = TIER_CONFIG.premium;

  const handlePurchase = async (planDef: PlanDef) => {
    // Find matching SUBSCRIPTION_PLANS entry if it exists, otherwise construct a minimal one
    const matchingPlan = SUBSCRIPTION_PLANS.find(p => p.id === planDef.id);

    setIsProcessing(true);

    if (isNative) {
      const result = await storeKit.purchaseProduct(planDef.iapProductId);
      setIsProcessing(false);

      // Only grant bonus coins AFTER server validation succeeds
      if (result.success && result.validationResult?.success) {
        if (matchingPlan) {
          const bonusResult = grantBonusCoins(matchingPlan.id);
          if (bonusResult.granted) {
            toast.success(`Purchase successful! +${bonusResult.amount.toLocaleString()} bonus coins!`);
          } else {
            toast.success('Purchase successful!');
          }
        } else {
          toast.success('Purchase successful!');
        }
        onClose();
      } else if (result.success && !result.validationResult?.success) {
        // Native purchase succeeded but server validation failed —
        // don't grant bonus coins; user should restore purchases later
      } else if (!result.cancelled) {
        toast.error(result.message || 'Purchase failed');
      }
    } else {
      await new Promise(resolve => setTimeout(resolve, 1500));
      if (matchingPlan) {
        const result = purchaseSubscription(matchingPlan.id);
        setIsProcessing(false);

        if (result.success) {
          const bonusResult = grantBonusCoins(matchingPlan.id);
          if (bonusResult.granted) {
            toast.success(`${result.message} +${bonusResult.amount.toLocaleString()} bonus coins!`);
          } else {
            toast.success(result.message);
          }
          onClose();
        } else {
          toast.error(result.message);
        }
      } else {
        // Fallback for plans not in SUBSCRIPTION_PLANS (e.g. weekly)
        const result = purchaseSubscription('premium-monthly');
        setIsProcessing(false);

        if (result.success) {
          toast.success('Purchase successful!');
          onClose();
        } else {
          toast.error(result.message);
        }
      }
    }
  };

  const handleRestore = async () => {
    setIsRestoring(true);

    if (isNative) {
      await storeKit.restorePurchases();
      setIsRestoring(false);
    } else {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const result = restorePurchases();
      setIsRestoring(false);

      if (result.success) {
        toast.success(result.message);
      } else {
        toast.info(result.message);
      }
    }
  };

  const isCurrentPremium = tier === 'premium';

  const renderPlanCard = (planDef: PlanDef) => {
    const isHighlighted = planDef.highlighted;
    const localizedPrice = storeKit.getLocalizedPrice(planDef.iapProductId, planDef.price);

    return (
      <div
        key={planDef.id}
        className={cn(
          "relative rounded-lg overflow-hidden flex flex-col",
          isHighlighted ? "flex-[1.3]" : "flex-1",
        )}
        style={{
          background: 'linear-gradient(180deg, hsl(260 25% 20%) 0%, hsl(260 30% 15%) 100%)',
          border: isHighlighted
            ? `3px solid ${config.borderHsl}`
            : '2px solid hsl(260 30% 30%)',
          boxShadow: isHighlighted
            ? `0 4px 0 hsl(260 50% 12%), 0 0 20px ${config.glowHsl}`
            : '0 4px 0 hsl(260 50% 12%)',
        }}
      >
        {/* Header strip */}
        <div className={cn(
          "relative px-2 py-1.5 text-center",
          isHighlighted
            ? `bg-gradient-to-r ${config.headerGradient}`
            : '',
        )} style={!isHighlighted ? {
          background: 'linear-gradient(180deg, hsl(260 30% 25%) 0%, hsl(260 35% 20%) 100%)',
        } : undefined}>
          {isHighlighted && <div className="retro-scanlines" />}
          <div className="flex flex-col items-center gap-0.5 relative z-[1]">
            <span
              className={cn(
                "font-black uppercase tracking-wider text-xs",
                isHighlighted ? "text-white" : "",
              )}
              style={isHighlighted
                ? { textShadow: '0 2px 0 rgba(0,0,0,0.3)' }
                : { color: 'hsl(260 20% 60%)' }
              }
            >
              {planDef.label}
            </span>
            {planDef.badge && (
              <span className="px-2 py-0.5 bg-white/30 rounded text-[7px] font-black text-white uppercase tracking-wider border border-white/20">
                {planDef.badge}
              </span>
            )}
          </div>
        </div>

        {/* Card body */}
        <div className="p-2 flex flex-col flex-1 items-center relative">
          {/* Top shine line */}
          <div
            className="absolute top-0 left-0 right-0 h-[1px]"
            style={{ background: 'linear-gradient(90deg, transparent 0%, hsl(260 40% 40%) 50%, transparent 100%)' }}
          />

          {/* Price */}
          <div className="text-center mb-2 mt-1">
            <span className={cn(
              "text-lg font-black retro-pixel-text",
              isHighlighted ? config.neonClass : '',
            )} style={!isHighlighted ? { color: 'hsl(260 20% 75%)' } : undefined}>
              {localizedPrice}
            </span>
            <span className="text-[9px] block" style={{ color: 'hsl(260 20% 50%)' }}>
              {planDef.period}
            </span>
          </div>

          {/* Savings badge */}
          {planDef.savingsBadge && (
            <span
              className="px-2 py-0.5 rounded text-[7px] font-black text-white uppercase mb-2"
              style={{
                background: 'linear-gradient(180deg, hsl(120 70% 45%), hsl(120 75% 35%))',
                border: '1px solid hsl(120 60% 55%)',
                boxShadow: '0 0 8px hsl(120 100% 40% / 0.4)',
              }}
            >
              {planDef.savingsBadge}
            </span>
          )}

          {/* Features (only on highlighted card) */}
          {isHighlighted && (
            <div className="grid grid-cols-2 gap-1 mb-2 w-full">
              {PREMIUM_FEATURES.map((feature) => {
                const mapped = FEATURE_MAP[feature];
                return (
                  <div
                    key={feature}
                    className={cn(
                      "flex items-center gap-1.5 px-2 py-1.5 rounded border relative",
                      config.featureBorder,
                    )}
                    style={{
                      background: 'linear-gradient(180deg, hsl(260 25% 22%) 0%, hsl(260 30% 17%) 100%)',
                    }}
                  >
                    <div className={cn("flex-shrink-0", config.iconColor)}>
                      {mapped?.icon || <Check className="w-3.5 h-3.5" />}
                    </div>
                    <span
                      className="text-[10px] font-semibold leading-tight truncate"
                      style={{ color: 'hsl(260 20% 80%)' }}
                    >
                      {mapped?.label || feature}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Purchase button */}
          <button
            onClick={() => handlePurchase(planDef)}
            disabled={isProcessing || isCurrentPremium}
            className={cn(
              "w-full py-2 rounded-lg font-black uppercase tracking-wider text-xs transition-all flex items-center justify-center gap-1.5 text-white active:translate-y-1 mt-auto",
              isHighlighted ? "border-[3px]" : "border-2",
            )}
            style={isCurrentPremium ? {
              background: 'linear-gradient(180deg, hsl(260 20% 25%) 0%, hsl(260 25% 18%) 100%)',
              borderColor: 'hsl(260 20% 35%)',
              color: 'hsl(260 15% 45%)',
              boxShadow: '0 4px 0 hsl(260 30% 12%)',
              cursor: 'not-allowed',
            } : isHighlighted ? {
              background: config.btnGradient,
              borderColor: config.btnBorder,
              boxShadow: `0 5px 0 ${config.btnShadow}, inset 0 2px 0 ${config.btnInset}, 0 0 15px ${config.btnGlow}`,
              textShadow: '0 2px 0 rgba(0,0,0,0.3)',
            } : {
              background: 'linear-gradient(180deg, hsl(260 30% 30%) 0%, hsl(260 35% 22%) 100%)',
              borderColor: 'hsl(260 30% 40%)',
              boxShadow: '0 4px 0 hsl(260 40% 15%)',
              textShadow: '0 1px 0 rgba(0,0,0,0.3)',
            }}
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>...</span>
              </>
            ) : isCurrentPremium ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Active</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isHighlighted ? 'Subscribe' : 'Select'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isProcessing && !isRestoring && onClose()}>
      <DialogContent className="retro-modal max-w-[340px] p-0 overflow-hidden border-0 max-h-[90vh] overflow-y-auto">
        <VisuallyHidden>
          <DialogTitle>Go Premium</DialogTitle>
        </VisuallyHidden>
        <>
          {/* Header */}
          <div className="retro-modal-header p-5 text-center relative">
            <div className="retro-scanlines" />

            {/* Crown with glow */}
            <div className="relative inline-flex items-center justify-center mb-3 z-[1]">
              <div className="absolute inset-0 rounded-full blur-xl scale-[2.5]" style={{ background: 'hsl(35 100% 50% / 0.25)' }} />
              <div
                className="relative w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, hsl(35 90% 55%) 0%, hsl(25 90% 50%) 100%)',
                  border: '3px solid hsl(40 80% 65%)',
                  boxShadow: '0 4px 0 hsl(25 80% 30%), 0 0 20px hsl(35 100% 50% / 0.4), inset 0 2px 0 hsl(40 70% 72%)',
                }}
              >
                <Crown className="w-7 h-7 text-white" style={{ filter: 'drop-shadow(0 2px 0 rgba(0,0,0,0.3))' }} />
              </div>
            </div>

            <h2
              className="text-xl font-black uppercase tracking-wider text-white relative z-[1]"
              style={{ textShadow: '0 0 10px hsl(260 80% 70% / 0.5), 0 2px 0 rgba(0,0,0,0.3)' }}
            >
              Go Premium
            </h2>
            <p className="text-[11px] mt-1 relative z-[1]" style={{ color: 'hsl(260 30% 65%)' }}>
              Unlock all features & supercharge your focus
            </p>
          </div>

          {/* Plan Cards — dark retro body */}
          <div className="p-3 space-y-3" style={{ background: 'linear-gradient(180deg, hsl(260 28% 13%) 0%, hsl(275 22% 10%) 100%)' }}>
            {/* Already Premium banner */}
            {isPremium && currentPlan && (
              <div
                className="flex items-center gap-2 px-3 py-2 rounded-lg"
                style={{
                  background: 'linear-gradient(180deg, hsl(140 30% 20%) 0%, hsl(140 35% 15%) 100%)',
                  border: '2px solid hsl(140 50% 40%)',
                  boxShadow: '0 0 10px hsl(140 100% 40% / 0.2)',
                }}
              >
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: 'hsl(140 60% 40%)', border: '2px solid hsl(140 50% 55%)' }}
                >
                  <Check className="w-3.5 h-3.5 text-white" />
                </div>
                <div>
                  <span className="text-xs font-bold retro-neon-green">{currentPlan.name} Active</span>
                  <span className="text-[10px] block" style={{ color: 'hsl(140 20% 55%)' }}>
                    Thank you for supporting BotBlock!
                  </span>
                </div>
              </div>
            )}

            {/* 3 plan cards side by side: Weekly | Yearly (highlighted) | Monthly */}
            <div className="flex gap-2 items-stretch">
              {PLAN_DEFS.map((planDef) => renderPlanCard(planDef))}
            </div>

            {/* Restore Purchases */}
            <button
              onClick={handleRestore}
              disabled={isRestoring || isProcessing}
              className={cn(
                "w-full py-2.5 rounded-lg flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wide transition-all",
                (isRestoring || isProcessing) && "opacity-50 cursor-not-allowed"
              )}
              style={{
                background: 'transparent',
                border: '2px solid hsl(260 30% 30%)',
                color: 'hsl(260 20% 55%)',
              }}
            >
              <RefreshCw className={cn("w-3.5 h-3.5", isRestoring && "animate-spin")} />
              {isRestoring ? 'Restoring...' : 'Restore Purchases'}
            </button>

            {/* Terms */}
            <p className="text-[9px] text-center leading-relaxed pb-1" style={{ color: 'hsl(260 15% 40%)' }}>
              Payment will be charged to your Apple ID account at confirmation of purchase. Subscription automatically renews unless auto-renew is turned off at least 24 hours before the end of the current period. Account will be charged for renewal within 24 hours prior to the end of the current period. Subscriptions may be managed and auto-renewal may be turned off in your Account Settings after purchase.
            </p>
            <div className="flex items-center justify-center gap-3 pb-2">
              <button
                onClick={() => { onClose(); navigate('/privacy'); }}
                className="text-[9px] underline"
                style={{ color: 'hsl(260 20% 50%)' }}
              >
                Privacy Policy
              </button>
              <span className="text-[9px]" style={{ color: 'hsl(260 15% 30%)' }}>|</span>
              <button
                onClick={() => { onClose(); navigate('/terms'); }}
                className="text-[9px] underline"
                style={{ color: 'hsl(260 20% 50%)' }}
              >
                Terms of Service
              </button>
            </div>
          </div>
        </>
      </DialogContent>
    </Dialog>
  );
};
