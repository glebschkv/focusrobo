/**
 * Land Store
 *
 * Manages the user's pet collection land — a 10×10 grid where pets are placed
 * after completing focus sessions. Tracks current land, completed lands,
 * species catalog, and pending pet placement.
 *
 * Storage key: nomo_land_data
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { z } from 'zod';
import { createValidatedStorage } from '@/lib/validated-zustand-storage';
import type { GrowthSize, PetRarity } from '@/data/PetDatabase';
import { getGrowthSize, rollRandomPet } from '@/data/PetDatabase';
import type { EggType } from '@/data/EggData';
import { ISLAND_POSITIONS } from '@/data/islandPositions';

// ============================================================================
// Types
// ============================================================================

export interface LandCell {
  petId: string;
  size: GrowthSize;
  sessionMinutes: number;
  rarity: PetRarity;
  timestamp: number;
}

export interface Land {
  id: string;
  number: number;
  theme: string;
  cells: (LandCell | null)[];
  startedAt: number;
  completedAt: number | null;
  totalFocusMinutes: number;
}

export interface SpeciesCatalogEntry {
  timesFound: number;
  bestSize: GrowthSize;
  firstFoundAt: number;
}

export interface PendingPet {
  petId: string;
  size: GrowthSize;
  rarity: PetRarity;
  sessionMinutes: number;
}

// ============================================================================
// Constants
// ============================================================================

export const LAND_SIZE = 100; // 10×10 grid
export const LAND_COLS = 10;
export const LAND_ROWS = 10;
export const LAND_COMPLETE_BONUS_COINS = 500;

// ============================================================================
// Validation Schema
// ============================================================================

const landCellSchema = z.object({
  petId: z.string().max(100),
  size: z.enum(['baby', 'adolescent', 'adult']),
  sessionMinutes: z.number().min(0).max(1000),
  rarity: z.enum(['common', 'uncommon', 'rare', 'epic', 'legendary']),
  timestamp: z.number().min(0),
});

const landSchema = z.object({
  id: z.string().max(100),
  number: z.number().int().min(1).max(10000),
  theme: z.string().max(100),
  cells: z.array(z.union([landCellSchema, z.null()])).max(LAND_SIZE),
  startedAt: z.number().min(0),
  completedAt: z.union([z.number().min(0), z.null()]),
  totalFocusMinutes: z.number().min(0),
});

const speciesCatalogEntrySchema = z.object({
  timesFound: z.number().int().min(0),
  bestSize: z.enum(['baby', 'adolescent', 'adult']),
  firstFoundAt: z.number().min(0),
});

const pendingPetSchema = z.object({
  petId: z.string().max(100),
  size: z.enum(['baby', 'adolescent', 'adult']),
  rarity: z.enum(['common', 'uncommon', 'rare', 'epic', 'legendary']),
  sessionMinutes: z.number().min(0).max(1000),
});

const landStoreSchema = z.object({
  currentLand: landSchema,
  completedLands: z.array(landSchema).max(1000),
  speciesCatalog: z.record(z.string(), speciesCatalogEntrySchema),
  pendingPet: z.union([pendingPetSchema, z.null()]),
  ownedThemes: z.array(z.string().max(100)).max(50),
  selectedNextTheme: z.string().max(100),
  wishedSpecies: z.union([z.string().max(100), z.null()]).optional(),
  speciesAffinity: z.record(z.string(), z.number().int().min(0)).optional(),
  lastOfflineCheck: z.number().min(0).optional(),
});

// ============================================================================
// Helpers
// ============================================================================

function createEmptyLand(number: number, theme: string): Land {
  return {
    id: `land_${number}_${Date.now()}`,
    number,
    theme,
    cells: new Array(LAND_SIZE).fill(null),
    startedAt: Date.now(),
    completedAt: null,
    totalFocusMinutes: 0,
  };
}

/**
 * Pick the empty cell that is farthest from any already-placed pet.
 * This creates an even, organic spread across the island instead of
 * random clustering. Falls back to random if only 0-1 pets are placed.
 */
function getNextEmptyCellIndex(cells: (LandCell | null)[]): number {
  const emptyIndices: number[] = [];
  const filledIndices: number[] = [];
  for (let i = 0; i < cells.length; i++) {
    if (cells[i] === null) emptyIndices.push(i);
    else filledIndices.push(i);
  }
  if (emptyIndices.length === 0) return -1;

  // First few pets: pick randomly (no spatial reference yet)
  if (filledIndices.length < 2) {
    const randomIdx = Math.floor(Math.random() * emptyIndices.length);
    return emptyIndices[randomIdx];
  }

  // Farthest-first insertion: pick empty cell with maximum minimum distance to any placed pet
  let bestIndex = emptyIndices[0];
  let bestMinDist = -1;

  for (const emptyIdx of emptyIndices) {
    const emptyPos = ISLAND_POSITIONS[emptyIdx];
    if (!emptyPos) continue;

    let minDist = Infinity;
    for (const filledIdx of filledIndices) {
      const filledPos = ISLAND_POSITIONS[filledIdx];
      if (!filledPos) continue;
      const dx = emptyPos.x - filledPos.x;
      const dy = emptyPos.y - filledPos.y;
      const dist = dx * dx + dy * dy;
      if (dist < minDist) minDist = dist;
    }

    // Add small random jitter to break ties and prevent patterns
    const jitteredDist = minDist + Math.random() * 2;
    if (jitteredDist > bestMinDist) {
      bestMinDist = jitteredDist;
      bestIndex = emptyIdx;
    }
  }

  return bestIndex;
}

const SIZE_RANK: Record<GrowthSize, number> = {
  baby: 0,
  adolescent: 1,
  adult: 2,
};

// ============================================================================
// Store
// ============================================================================

interface LandStoreState {
  currentLand: Land;
  completedLands: Land[];
  speciesCatalog: Record<string, SpeciesCatalogEntry>;
  pendingPet: PendingPet | null;
  ownedThemes: string[];
  selectedNextTheme: string;
  /** Species ID the player wishes to find next */
  wishedSpecies: string | null;
  /** Total count of each species collected across all islands (for affinity system) */
  speciesAffinity: Record<string, number>;
  /** Timestamp of last offline income check */
  lastOfflineCheck: number;
  /** Index of the most recently placed pet (ephemeral, not persisted) */
  lastPlacedIndex: number | null;
  /** Land number that was just completed (ephemeral, not persisted) */
  landJustCompleted: number | null;
  /** Milestone percentage just reached (ephemeral, not persisted) */
  milestoneReached: number | null;
}

interface LandStoreActions {
  /** Generate a random pet after session completion */
  generateRandomPet: (sessionMinutes: number, playerLevel: number) => PendingPet;

  /** Hatch an egg — generate a pet using the egg's custom rarity weights */
  hatchEgg: (egg: EggType, playerLevel: number) => PendingPet;

  /** Place the pending pet onto the next empty cell. Returns cell index or -1 if full. */
  placePendingPet: () => number;

  /** Start a new empty land (after completing current one) */
  startNewLand: () => void;

  /** Check if the current land is full (100/100) */
  isLandComplete: () => boolean;

  /** Get number of filled cells */
  getFilledCount: () => number;

  /** Buy and own a new land theme */
  addOwnedTheme: (themeId: string) => void;

  /** Set which theme to use for the next new land */
  setSelectedNextTheme: (themeId: string) => void;

  /** Clear the lastPlacedIndex after animation plays */
  clearLastPlaced: () => void;

  /** Clear the land completion overlay */
  clearLandCompleted: () => void;

  /** Clear the milestone overlay */
  clearMilestone: () => void;

  /** Set wished species (or null to clear) */
  setWishedSpecies: (speciesId: string | null) => void;

  /** Get affinity level for a species */
  getAffinityLevel: (speciesId: string) => 'none' | 'familiar' | 'bonded' | 'devoted';

  /** Grow a pet on the current island to a larger size */
  growPet: (cellIndex: number, targetSize: 'adolescent' | 'adult') => boolean;

  /** Collect passive offline income (1 coin/hr per pet, capped 24/day). Returns coins earned. */
  collectOfflineIncome: () => number;

  /** Reset land data (for debugging/testing) */
  resetLand: () => void;
}

type LandStore = LandStoreState & LandStoreActions;

const initialState: LandStoreState = {
  currentLand: createEmptyLand(1, 'meadow'),
  completedLands: [],
  speciesCatalog: {},
  pendingPet: null,
  ownedThemes: ['meadow'],
  selectedNextTheme: 'meadow',
  wishedSpecies: null,
  speciesAffinity: {},
  lastOfflineCheck: Date.now(),
  lastPlacedIndex: null,
  landJustCompleted: null,
  milestoneReached: null,
};

export const useLandStore = create<LandStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      generateRandomPet: (sessionMinutes: number, playerLevel: number) => {
        const species = rollRandomPet(playerLevel);
        const size = getGrowthSize(sessionMinutes);

        const pending: PendingPet = {
          petId: species.id,
          size,
          rarity: species.rarity,
          sessionMinutes,
        };

        set({ pendingPet: pending });
        return pending;
      },

      hatchEgg: (egg: EggType, playerLevel: number) => {
        const species = rollRandomPet(playerLevel, egg.rarityWeights);
        // Egg-hatched pets are always baby size (no session duration)
        const pending: PendingPet = {
          petId: species.id,
          size: 'baby',
          rarity: species.rarity,
          sessionMinutes: 0,
        };

        set({ pendingPet: pending });
        return pending;
      },

      placePendingPet: () => {
        const { pendingPet, speciesCatalog } = get();
        let { currentLand } = get();
        if (!pendingPet) return -1;

        let cellIndex = getNextEmptyCellIndex(currentLand.cells);

        // If the current land is full, auto-archive it and start a new one
        if (cellIndex === -1) {
          const { completedLands, selectedNextTheme } = get();
          const completedLandNumber = currentLand.number;
          const archivedLand: Land = {
            ...currentLand,
            completedAt: currentLand.completedAt ?? Date.now(),
          };
          currentLand = createEmptyLand(currentLand.number + 1, selectedNextTheme);
          set({
            completedLands: [...completedLands, archivedLand],
            currentLand,
            landJustCompleted: completedLandNumber,
          });
          // Emit event so the UI layer can award the land completion bonus coins
          window.dispatchEvent(new CustomEvent('land:completed', {
            detail: { landNumber: completedLandNumber, bonusCoins: LAND_COMPLETE_BONUS_COINS },
          }));
          cellIndex = getNextEmptyCellIndex(currentLand.cells);
          if (cellIndex === -1) return -1; // Should not happen with fresh land
        }

        const newCell: LandCell = {
          petId: pendingPet.petId,
          size: pendingPet.size,
          sessionMinutes: pendingPet.sessionMinutes,
          rarity: pendingPet.rarity,
          timestamp: Date.now(),
        };

        // Update cells
        const newCells = [...currentLand.cells];
        newCells[cellIndex] = newCell;

        // Update species catalog
        const newCatalog = { ...speciesCatalog };
        const existing = newCatalog[pendingPet.petId];
        if (existing) {
          newCatalog[pendingPet.petId] = {
            ...existing,
            timesFound: existing.timesFound + 1,
            bestSize: SIZE_RANK[pendingPet.size] > SIZE_RANK[existing.bestSize]
              ? pendingPet.size
              : existing.bestSize,
          };
        } else {
          newCatalog[pendingPet.petId] = {
            timesFound: 1,
            bestSize: pendingPet.size,
            firstFoundAt: Date.now(),
          };
        }

        // Update land
        const updatedLand: Land = {
          ...currentLand,
          cells: newCells,
          totalFocusMinutes: currentLand.totalFocusMinutes + pendingPet.sessionMinutes,
          completedAt: newCells.every(c => c !== null) ? Date.now() : null,
        };

        // Check for milestone (25/50/75)
        const count = newCells.filter(Boolean).length;
        const milestones = [25, 50, 75];
        const hit = milestones.find(m => count === m) ?? null;

        // Update species affinity (total count across all islands)
        const newAffinity = { ...get().speciesAffinity };
        newAffinity[pendingPet.petId] = (newAffinity[pendingPet.petId] || 0) + 1;

        set({
          currentLand: updatedLand,
          speciesCatalog: newCatalog,
          speciesAffinity: newAffinity,
          pendingPet: null,
          lastPlacedIndex: cellIndex,
          ...(hit !== null ? { milestoneReached: hit } : {}),
        });

        return cellIndex;
      },

      startNewLand: () => {
        const { currentLand, completedLands, selectedNextTheme } = get();

        set({
          completedLands: [...completedLands, currentLand],
          currentLand: createEmptyLand(currentLand.number + 1, selectedNextTheme),
        });
      },

      isLandComplete: () => {
        return get().currentLand.cells.every(c => c !== null);
      },

      getFilledCount: () => {
        return get().currentLand.cells.filter(c => c !== null).length;
      },

      addOwnedTheme: (themeId: string) => {
        const { ownedThemes } = get();
        if (!ownedThemes.includes(themeId)) {
          set({ ownedThemes: [...ownedThemes, themeId] });
        }
      },

      setSelectedNextTheme: (themeId: string) => {
        set({ selectedNextTheme: themeId });
      },

      clearLastPlaced: () => {
        set({ lastPlacedIndex: null });
      },

      clearLandCompleted: () => {
        set({ landJustCompleted: null });
      },

      clearMilestone: () => {
        set({ milestoneReached: null });
      },

      setWishedSpecies: (speciesId: string | null) => {
        set({ wishedSpecies: speciesId });
      },

      getAffinityLevel: (speciesId: string) => {
        const count = get().speciesAffinity[speciesId] || 0;
        if (count >= 10) return 'devoted';
        if (count >= 5) return 'bonded';
        if (count >= 3) return 'familiar';
        return 'none';
      },

      growPet: (cellIndex: number, targetSize: 'adolescent' | 'adult') => {
        const { currentLand } = get();
        const cell = currentLand.cells[cellIndex];
        if (!cell) return false;

        // Check current size is smaller than target
        if (targetSize === 'adolescent' && cell.size !== 'baby') return false;
        if (targetSize === 'adult' && cell.size === 'adult') return false;

        const newCells = [...currentLand.cells];
        newCells[cellIndex] = { ...cell, size: targetSize };
        set({
          currentLand: { ...currentLand, cells: newCells },
        });
        return true;
      },

      collectOfflineIncome: () => {
        const { currentLand, lastOfflineCheck } = get();
        const now = Date.now();
        const filledCount = currentLand.cells.filter(c => c !== null).length;
        if (filledCount === 0) {
          set({ lastOfflineCheck: now });
          return 0;
        }

        const hoursElapsed = (now - lastOfflineCheck) / (1000 * 60 * 60);
        // 1 coin per pet per hour, capped at 24 coins total per check
        const rawCoins = Math.floor(filledCount * hoursElapsed);
        const coins = Math.min(rawCoins, 24);

        set({ lastOfflineCheck: now });
        return coins;
      },

      resetLand: () => {
        set(initialState);
      },
    }),
    {
      name: 'nomo_land_data',
      storage: createValidatedStorage({
        schema: landStoreSchema,
        defaultState: initialState,
        name: 'nomo_land_data',
      }),
      partialize: (state) => ({
        currentLand: state.currentLand,
        completedLands: state.completedLands,
        speciesCatalog: state.speciesCatalog,
        pendingPet: state.pendingPet,
        ownedThemes: state.ownedThemes,
        selectedNextTheme: state.selectedNextTheme,
        wishedSpecies: state.wishedSpecies,
        speciesAffinity: state.speciesAffinity,
        lastOfflineCheck: state.lastOfflineCheck,
      }),
    }
  )
);

// ============================================================================
// Selector Hooks
// ============================================================================

export const useCurrentLand = () => useLandStore((s) => s.currentLand);
export const useCompletedLands = () => useLandStore((s) => s.completedLands);
export const useSpeciesCatalog = () => useLandStore((s) => s.speciesCatalog);
export const usePendingPet = () => useLandStore((s) => s.pendingPet);
export const useOwnedThemes = () => useLandStore((s) => s.ownedThemes);
export const useWishedSpecies = () => useLandStore((s) => s.wishedSpecies);
export const useSpeciesAffinity = () => useLandStore((s) => s.speciesAffinity);
