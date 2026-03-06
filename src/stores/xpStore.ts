/**
 * XP Store
 *
 * Manages the user's experience points, levels, and progression. Includes
 * unlocked robots and available zones. Uses Zustand with persistence.
 *
 * @module stores/xpStore
 *
 * @example
 * ```typescript
 * import { useXPStore, useCurrentLevel } from '@/stores/xpStore';
 *
 * // In a component
 * const { addXP, currentLevel, unlockedPets } = useXPStore();
 *
 * // Award XP for completing a session
 * addXP(100);
 *
 * // Or use selector hooks
 * const level = useCurrentLevel();
 * ```
 */

import { create } from 'zustand';
import { persist, subscribeWithSelector } from 'zustand/middleware';
import { xpLogger } from '@/lib/logger';
import { xpSystemSchema } from '@/lib/storage-validation';
import { createValidatedStorage } from '@/lib/validated-zustand-storage';
import { calculateLevelRequirement, calculateLevel as calculateLevelFromXP } from '@/hooks/xp/xpUtils';

/** Maximum achievable level in the game */
export const MAX_LEVEL = 50;

/**
 * Reuse the canonical LEVEL_REQUIREMENTS table and level calculation from
 * the XP hook module so that the store and the hook always agree on what
 * level corresponds to a given XP total.
 */
export { calculateLevelRequirement, calculateLevelFromXP };

export interface XPState {
  currentXP: number;
  currentLevel: number;
  xpToNextLevel: number;
  totalXPForCurrentLevel: number;
  unlockedPets: string[];
  currentZone: string;
  availableZones: string[];
}

interface XPStore extends XPState {
  setXP: (xp: number) => void;
  addXP: (amount: number) => void;
  setLevel: (level: number) => void;
  addPet: (robotName: string) => void;
  addPets: (robotNames: string[]) => void;
  switchZone: (zoneName: string) => void;
  addZone: (zoneName: string) => void;
  updateState: (partial: Partial<XPState>) => void;
  resetXP: () => void;
}

const initialState: XPState = {
  currentXP: 0,
  currentLevel: 0,
  xpToNextLevel: 15,
  totalXPForCurrentLevel: 0,
  unlockedPets: [],
  currentZone: 'Assembly Line',
  availableZones: ['Assembly Line'],
};

export const useXPStore = create<XPStore>()(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        ...initialState,
        setXP: (xp) => set({ currentXP: xp }),
        addXP: (amount) => set((s) => {
          const newXP = s.currentXP + amount;
          const newLevel = calculateLevelFromXP(newXP);
          const currentLevelXP = calculateLevelRequirement(newLevel);
          const nextLevelXP = newLevel >= MAX_LEVEL ? currentLevelXP : calculateLevelRequirement(newLevel + 1);
          return {
            currentXP: newXP,
            currentLevel: newLevel,
            totalXPForCurrentLevel: currentLevelXP,
            xpToNextLevel: newLevel >= MAX_LEVEL ? 0 : Math.max(0, nextLevelXP - newXP),
          };
        }),
        setLevel: (level) => {
          const xpRequired = calculateLevelRequirement(level);
          const nextLevelXP = level >= MAX_LEVEL ? xpRequired : calculateLevelRequirement(level + 1);
          set({ currentLevel: level, totalXPForCurrentLevel: xpRequired, xpToNextLevel: Math.max(0, nextLevelXP - get().currentXP) });
        },
        addPet: (name) => {
          const { unlockedPets } = get();
          if (!unlockedPets.includes(name)) set({ unlockedPets: [...unlockedPets, name] });
        },
        addPets: (names) => {
          const { unlockedPets } = get();
          const newAnimals = names.filter(n => !unlockedPets.includes(n));
          if (newAnimals.length > 0) set({ unlockedPets: [...unlockedPets, ...newAnimals] });
        },
        switchZone: (name) => { if (get().availableZones.includes(name)) set({ currentZone: name }); },
        addZone: (name) => {
          const { availableZones } = get();
          if (!availableZones.includes(name)) set({ availableZones: [...availableZones, name] });
        },
        updateState: (partial) => set((s) => ({ ...s, ...partial })),
        resetXP: () => set(initialState),
      }),
      {
        name: 'nomo_xp_system',
        storage: createValidatedStorage({
          schema: xpSystemSchema,
          defaultState: initialState,
          name: 'xp-store',
        }),
        onRehydrateStorage: () => (state) => {
          if (!state) {
            // Try to recover from legacy storage key — mutate the store
            // directly since Zustand ignores the return value from this callback.
            try {
              const legacy = localStorage.getItem('botblock_xpSystem');
              if (legacy) {
                let parsed = JSON.parse(legacy);
                if (parsed && typeof parsed === 'object' && 'state' in parsed) {
                  parsed = parsed.state;
                }
                const validated = xpSystemSchema.safeParse(parsed);
                if (validated.success) {
                  xpLogger.debug('Migrated XP data from legacy storage');
                  localStorage.removeItem('botblock_xpSystem');
                  useXPStore.setState(validated.data);
                }
              }
            } catch {
              xpLogger.warn('Failed to parse legacy XP data');
            }
            return;
          }
          // Validate the rehydrated level makes sense for the XP (fix both directions)
          const expectedLevel = calculateLevelFromXP(state.currentXP);
          if (state.currentLevel !== expectedLevel) {
            xpLogger.warn(`Level mismatch: stored ${state.currentLevel}, expected ${expectedLevel}. Fixing.`);
            state.currentLevel = expectedLevel;
          }
          xpLogger.debug('XP store rehydrated and validated');
        },
      }
    )
  )
);

// Selector hooks for efficient subscriptions
export const useCurrentXP = () => useXPStore((s) => s.currentXP);
export const useCurrentLevel = () => useXPStore((s) => s.currentLevel);
export const useUnlockedPets = () => useXPStore((s) => s.unlockedPets);

// Subscribe to XP changes for cross-component communication
// This replaces the window.dispatchEvent pattern
export const subscribeToXPChanges = (callback: (state: XPState) => void) => {
  return useXPStore.subscribe(
    (state) => ({ currentXP: state.currentXP, currentLevel: state.currentLevel }),
    () => callback(useXPStore.getState()),
    { equalityFn: (a, b) => a.currentXP === b.currentXP && a.currentLevel === b.currentLevel }
  );
};
