import { useState } from 'react';
import {
  Crown,
  Check,
  Sparkles,
  Zap,
  RefreshCw,
  Music,
  Snowflake,
  Loader2,
  Palette,
  Egg,
  BarChart3,
  Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';
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

const PREMIUM_FEATURES = [
  { icon: <Zap className="w-4 h-4" />, label: '2x Coins & XP' },
  { icon: <Snowflake className="w-4 h-4" />, label: '3 Streak Freezes/mo' },
  { icon: <Music className="w-4 h-4" />, label: '3-Layer Sound Mix' },
  { icon: <Settings className="w-4 h-4" />, label: '5 Focus Presets' },
  { icon: <Egg className="w-4 h-4" />, label: '15% Egg Discount' },
  { icon: <BarChart3 className="w-4 h-4" />, label: 'Full Analytics' },
  { icon: <Palette className="w-4 h-4" />, label: 'All Island Themes' },
];

export const PremiumSubscription = ({ isOpen, onClose }: PremiumSubscriptionProps) => {
  const { isPremium, currentPlan, purchaseSubscription, restorePurchases, tier, grantBonusCoins } = usePremiumStatus();
  const storeKit = useStoreKit();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string>('premium-yearly');

  const isNative = Capacitor.isNativePlatform();
  const isCurrentPremium = tier === 'premium';

  const handlePurchase = async (planDef: PlanDef) => {
    const matchingPlan = SUBSCRIPTION_PLANS.find(p => p.id === planDef.id);
    setIsProcessing(true);

    if (isNative) {
      const result = await storeKit.purchaseProduct(planDef.iapProductId);
      setIsProcessing(false);

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
      } else if (!result.success && !result.cancelled) {
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

  const activePlanDef = PLAN_DEFS.find(p => p.id === selectedPlan) || PLAN_DEFS[1];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isProcessing && !isRestoring && onClose()}>
      <DialogContent className="max-w-[360px] p-0 overflow-hidden border-0 rounded-[24px] max-h-[90vh] overflow-y-auto bg-white shadow-[0_8px_40px_rgba(0,0,0,0.12)]">
        <VisuallyHidden>
          <DialogTitle>Go Premium</DialogTitle>
        </VisuallyHidden>

        {/* Header */}
        <div className="pt-7 pb-5 px-6 text-center relative"
          style={{
            background: 'linear-gradient(180deg, hsl(42 60% 96%) 0%, white 100%)',
          }}
        >
          {/* Crown icon */}
          <div className="relative inline-flex items-center justify-center mb-3">
            <div
              className="w-16 h-16 rounded-[18px] flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, hsl(42 75% 58%) 0%, hsl(30 70% 52%) 100%)',
                boxShadow: '0 4px 16px hsl(42 80% 50% / 0.3)',
              }}
            >
              <Crown className="w-8 h-8 text-white" />
            </div>
          </div>
          <h2 className="text-xl font-extrabold text-[hsl(var(--foreground))] tracking-tight">
            Go Premium
          </h2>
          <p className="text-[13px] mt-1 text-[hsl(var(--muted-foreground))]">
            Unlock all features & supercharge your focus
          </p>
        </div>

        <div className="px-5 pb-5 space-y-4">
          {/* Already Premium banner */}
          {isPremium && currentPlan && (
            <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-[hsl(145_40%_96%)] border border-[hsl(145_35%_82%)]">
              <div className="w-7 h-7 rounded-full flex items-center justify-center bg-[hsl(145_45%_48%)] flex-shrink-0">
                <Check className="w-4 h-4 text-white" />
              </div>
              <div>
                <span className="text-[13px] font-bold text-[hsl(145_45%_35%)]">{currentPlan.name} Active</span>
                <span className="text-[11px] block text-[hsl(145_20%_55%)]">
                  Thank you for supporting BotBlock!
                </span>
              </div>
            </div>
          )}

          {/* Plan selector pills */}
          <div className="flex gap-2">
            {PLAN_DEFS.map((planDef) => {
              const isSelected = selectedPlan === planDef.id;
              const localizedPrice = storeKit.getLocalizedPrice(planDef.iapProductId, planDef.price);
              return (
                <button
                  key={planDef.id}
                  onClick={() => setSelectedPlan(planDef.id)}
                  className={cn(
                    "flex-1 relative rounded-2xl p-3 text-center transition-all",
                    isSelected
                      ? "bg-[hsl(var(--primary))] shadow-[0_2px_12px_hsl(var(--primary)/0.3)]"
                      : "bg-[hsl(var(--muted)/0.3)] border border-[hsl(var(--border))]",
                  )}
                >
                  {planDef.badge && isSelected && (
                    <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wide bg-[hsl(42_70%_52%)] text-white whitespace-nowrap">
                      {planDef.badge}
                    </span>
                  )}
                  <span className={cn(
                    "block text-[11px] font-semibold uppercase tracking-wide mb-1",
                    isSelected ? "text-white/80" : "text-[hsl(var(--muted-foreground))]",
                  )}>
                    {planDef.label}
                  </span>
                  <span className={cn(
                    "block text-[17px] font-extrabold leading-tight",
                    isSelected ? "text-white" : "text-[hsl(var(--foreground))]",
                  )}>
                    {localizedPrice}
                  </span>
                  <span className={cn(
                    "block text-[10px] mt-0.5",
                    isSelected ? "text-white/60" : "text-[hsl(var(--muted-foreground))]",
                  )}>
                    {planDef.period}
                  </span>
                  {planDef.savingsBadge && (
                    <span className={cn(
                      "inline-block mt-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold",
                      isSelected
                        ? "bg-white/20 text-white"
                        : "bg-[hsl(145_45%_92%)] text-[hsl(145_50%_35%)]",
                    )}>
                      {planDef.savingsBadge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Features list */}
          <div className="rounded-2xl bg-[hsl(var(--muted)/0.2)] border border-[hsl(var(--border)/0.6)] p-4">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-[hsl(var(--muted-foreground))] mb-3 block">
              Everything in Premium
            </span>
            <div className="space-y-2.5">
              {PREMIUM_FEATURES.map((feature) => (
                <div key={feature.label} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-[10px] flex items-center justify-center bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))] flex-shrink-0">
                    {feature.icon}
                  </div>
                  <span className="text-[13px] font-semibold text-[hsl(var(--foreground))]">
                    {feature.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Subscribe button */}
          <button
            onClick={() => handlePurchase(activePlanDef)}
            disabled={isProcessing || isCurrentPremium}
            className={cn(
              "w-full py-3.5 rounded-2xl font-bold text-[15px] flex items-center justify-center gap-2 transition-all active:scale-[0.97]",
              isCurrentPremium
                ? "bg-[hsl(var(--muted)/0.4)] text-[hsl(var(--muted-foreground))] cursor-not-allowed"
                : "text-white shadow-[0_2px_12px_hsl(var(--primary)/0.3)]",
            )}
            style={!isCurrentPremium ? {
              background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(152 44% 38%) 100%)',
            } : undefined}
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing...
              </>
            ) : isCurrentPremium ? (
              <>
                <Check className="w-4 h-4" />
                Already Premium
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Subscribe — {storeKit.getLocalizedPrice(activePlanDef.iapProductId, activePlanDef.price)}{activePlanDef.period}
              </>
            )}
          </button>

          {/* Restore Purchases */}
          <button
            onClick={handleRestore}
            disabled={isRestoring || isProcessing}
            className={cn(
              "w-full py-2.5 flex items-center justify-center gap-2 text-[13px] font-semibold text-[hsl(var(--muted-foreground))] transition-all active:scale-[0.97]",
              (isRestoring || isProcessing) && "opacity-50 cursor-not-allowed"
            )}
          >
            <RefreshCw className={cn("w-3.5 h-3.5", isRestoring && "animate-spin")} />
            {isRestoring ? 'Restoring...' : 'Restore Purchases'}
          </button>

          {/* Terms */}
          <p className="text-[10px] text-center leading-relaxed text-[hsl(var(--muted-foreground)/0.7)]">
            Payment will be charged to your Apple ID account at confirmation of purchase. Subscription automatically renews unless auto-renew is turned off at least 24 hours before the end of the current period.
          </p>
          <div className="flex items-center justify-center gap-3 pb-1">
            <button
              onClick={() => { onClose(); navigate('/privacy'); }}
              className="text-[11px] underline text-[hsl(var(--muted-foreground))]"
            >
              Privacy Policy
            </button>
            <span className="text-[11px] text-[hsl(var(--border))]">|</span>
            <button
              onClick={() => { onClose(); navigate('/terms'); }}
              className="text-[11px] underline text-[hsl(var(--muted-foreground))]"
            >
              Terms of Service
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
