import { useState, useCallback, useMemo } from 'react';
import { useLandStore } from '@/stores/landStore';
import { usePremiumStore } from '@/stores/premiumStore';
import { useCoinSystem } from '@/hooks/useCoinSystem';
import { PASSIVE_INCOME_CONFIG, getPetPassiveRate } from '@/lib/constants';

export function usePassiveIncome() {
  const currentLand = useLandStore((s) => s.currentLand);
  const lastOfflineCheck = useLandStore((s) => s.lastOfflineCheck);
  const collectOfflineIncome = useLandStore((s) => s.collectOfflineIncome);
  const isPremium = usePremiumStore((s) => s.isPremium());
  const { addCoins } = useCoinSystem();
  const [justCollected, setJustCollected] = useState<number | null>(null);

  const dailyIncomeRate = useMemo(() => {
    let rate = 0;
    for (const cell of currentLand.cells) {
      if (!cell) continue;
      rate += getPetPassiveRate(cell.rarity, cell.size);
    }
    if (isPremium) rate = Math.floor(rate * PASSIVE_INCOME_CONFIG.PREMIUM_MULTIPLIER);
    return rate;
  }, [currentLand.cells, isPremium]);

  const accumulatedCoins = useMemo(() => {
    const now = Date.now();
    const hoursPassed = Math.min(
      (now - lastOfflineCheck) / (1000 * 60 * 60),
      PASSIVE_INCOME_CONFIG.MAX_ACCUMULATION_DAYS * 24
    );
    if (hoursPassed < PASSIVE_INCOME_CONFIG.MIN_HOURS_FOR_CLAIM) return 0;
    let total = 0;
    for (const cell of currentLand.cells) {
      if (!cell) continue;
      total += getPetPassiveRate(cell.rarity, cell.size) * (hoursPassed / 24);
    }
    if (isPremium) total *= PASSIVE_INCOME_CONFIG.PREMIUM_MULTIPLIER;
    return Math.floor(total);
  }, [currentLand.cells, lastOfflineCheck, isPremium]);

  const collect = useCallback(() => {
    const baseAmount = collectOfflineIncome();
    if (baseAmount <= 0) return 0;
    const finalAmount = isPremium
      ? Math.floor(baseAmount * PASSIVE_INCOME_CONFIG.PREMIUM_MULTIPLIER)
      : baseAmount;
    addCoins(finalAmount, 'passive_income');
    setJustCollected(finalAmount);
    setTimeout(() => setJustCollected(null), 3000);
    return finalAmount;
  }, [collectOfflineIncome, isPremium, addCoins]);

  return {
    dailyIncomeRate,
    accumulatedCoins,
    justCollected,
    collect,
  };
}
