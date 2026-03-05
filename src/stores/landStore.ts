/**
 * Land Store
 *
 * Manages the user's pet collection land — a 20×20 grid where pets are placed
 * after completing focus sessions. The island starts at 5×5 and progressively
 * expands through tiers (5→6→7→8→9→10→12→14→17→20) as the player fills cells.
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
import {
  GRID_SIZE,
  ISLAND_POSITIONS,
  getAvailableCellIndices,
  getAvailableCellCount,
  computeMinGridSize,
  getNextTier,
  migrateCells,
  MIN_GRID_TIER,
  MAX_GRID_TIER,
} from '@/data/islandPositions';

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
  /** Current expansion tier — grid is gridSize × gridSize centered in 20×20 */
  gridSize: number;
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

/** Total cells in the 20×20 grid */
export const LAND_SIZE = GRID_SIZE * GRID_SIZE; // 400
export const LAND_COLS = GRID_SIZE;
export const LAND_ROWS = GRID_SIZE;
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
  // Accept both old 100-cell and new 400-cell arrays
  cells: z.array(z.union([landCellSchema, z.null()])).max(LAND_SIZE),
  gridSize: z.number().int().min(MIN_GRID_TIER).max(MAX_GRID_TIER).default(MIN_GRID_TIER),
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
  wishedSpecies: z.union([z.string().max(100), z.null()]).default(null),
  speciesAffinity: z.record(z.string(), z.number().int().min(0)).default({}),
  lastOfflineCheck: z.number().min(0).default(Date.now()),
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
    gridSize: MIN_GRID_TIER,
    startedAt: Date.now(),
    completedAt: null,
    totalFocusMinutes: 0,
  };
}

/**
 * Pick the empty cell that is farthest from any already-placed pet.
 * Only considers cells within the current expansion tier.
 */
function getNextEmptyCellIndex(cells: (LandCell | null)[], gridSize: number): number {
  const available = getAvailableCellIndices(gridSize);
  const emptyIndices: number[] = [];
  const filledIndices: number[] = [];
  for (const i of available) {
    if (cells[i] === null) emptyIndices.push(i);
    else filledIndices.push(i);
  }
  if (emptyIndices.length === 0) return -1;

  // First few pets: pick randomly
  if (filledIndices.length < 2) {
    return emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
  }

  // Farthest-first insertion
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

/**
 * Migrate a Land object from old 10×10 format to new 20×20 format.
 */
function migrateLand(land: Land): Land {
  if (land.cells.length >= LAND_SIZE) return land;
  const newCells = migrateCells(land.cells);
  const neededSize = computeMinGridSize(newCells);
  return {
    ...land,
    cells: newCells,
    gridSize: Math.max(land.gridSize ?? MIN_GRID_TIER, neededSize),
  };
}

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
  wishedSpecies: string | null;
  speciesAffinity: Record<string, number>;
  lastOfflineCheck: number;
  lastPlacedIndex: number | null;
  landJustCompleted: number | null;
  milestoneReached: number | null;
}

interface LandStoreActions {
  generateRandomPet: (sessionMinutes: number, playerLevel: number) => PendingPet;
  hatchEgg: (egg: EggType, playerLevel: number) => PendingPet;
  placePendingPet: () => number;
  startNewLand: () => void;
  isLandComplete: () => boolean;
  isTierFull: () => boolean;
  getFilledCount: () => number;
  getAvailableCells: () => Set<number>;
  setWishedSpecies: (speciesId: string | null) => void;
  addOwnedTheme: (themeId: string) => void;
  setSelectedNextTheme: (themeId: string) => void;
  getAffinityLevel: (speciesId: string) => 'none' | 'familiar' | 'bonded' | 'devoted';
  growPet: (cellIndex: number, targetSize: 'adolescent' | 'adult') => boolean;
  collectOfflineIncome: () => number;
  clearLastPlaced: () => void;
  clearLandCompleted: () => void;
  clearMilestone: () => void;
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
        // Egg hatches always produce baby-size pets
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

        let cellIndex = getNextEmptyCellIndex(currentLand.cells, currentLand.gridSize);

        // If current tier is full, try to expand to next tier
        if (cellIndex === -1) {
          const nextTier = getNextTier(currentLand.gridSize);
          if (nextTier !== null) {
            currentLand = { ...currentLand, gridSize: nextTier };
            set({ currentLand });
            cellIndex = getNextEmptyCellIndex(currentLand.cells, currentLand.gridSize);
          }
        }

        // If the entire 20×20 land is full, auto-archive and start a new one
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
          // Emit event so GameUI can award land completion bonus coins
          window.dispatchEvent(new CustomEvent('landCompleted', { detail: completedLandNumber }));
          cellIndex = getNextEmptyCellIndex(currentLand.cells, currentLand.gridSize);
          if (cellIndex === -1) return -1;
        }

        const newCell: LandCell = {
          petId: pendingPet.petId,
          size: pendingPet.size,
          sessionMinutes: pendingPet.sessionMinutes,
          rarity: pendingPet.rarity,
          timestamp: Date.now(),
        };

        const newCells = [...currentLand.cells];
        newCells[cellIndex] = newCell;

        // Update species affinity (total count across all islands)
        const newAffinity = { ...get().speciesAffinity };
        newAffinity[pendingPet.petId] = (newAffinity[pendingPet.petId] || 0) + 1;

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

        const updatedLand: Land = {
          ...currentLand,
          cells: newCells,
          totalFocusMinutes: currentLand.totalFocusMinutes + pendingPet.sessionMinutes,
          completedAt: newCells.every(c => c !== null) ? Date.now() : null,
        };

        // Check for tier completion or milestones
        const count = newCells.filter(Boolean).length;
        const tierCapacity = getAvailableCellCount(updatedLand.gridSize);
        const tierFull = count >= tierCapacity && getNextTier(updatedLand.gridSize) !== null;
        const milestones = [25, 50, 75, 100, 150, 200, 300];
        const hit = tierFull ? tierCapacity : (milestones.find(m => count === m) ?? null);

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

      isTierFull: () => {
        const { currentLand } = get();
        const available = getAvailableCellIndices(currentLand.gridSize);
        for (const idx of available) {
          if (currentLand.cells[idx] === null) return false;
        }
        return true;
      },

      getFilledCount: () => {
        return get().currentLand.cells.filter(c => c !== null).length;
      },

      getAvailableCells: () => {
        return getAvailableCellIndices(get().currentLand.gridSize);
      },

      setWishedSpecies: (speciesId: string | null) => {
        set({ wishedSpecies: speciesId });
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

      getAffinityLevel: (speciesId: string) => {
        const count = get().speciesAffinity[speciesId] || 0;
        if (count >= 10) return 'devoted';
        if (count >= 5) return 'bonded';
        if (count >= 3) return 'familiar';
        return 'none';
      },

      growPet: (cellIndex: number, targetSize: 'adolescent' | 'adult') => {
        const { currentLand, speciesAffinity } = get();
        const cell = currentLand.cells[cellIndex];
        if (!cell) return false;

        const count = speciesAffinity[cell.petId] || 0;
        // Bonded (5+) = can grow to adolescent, Devoted (10+) = can grow to adult
        if (targetSize === 'adolescent' && count < 5) return false;
        if (targetSize === 'adult' && count < 10) return false;
        // Can't shrink
        if (targetSize === 'adolescent' && SIZE_RANK[cell.size] >= SIZE_RANK['adolescent']) return false;
        if (targetSize === 'adult' && SIZE_RANK[cell.size] >= SIZE_RANK['adult']) return false;

        const newCells = [...currentLand.cells];
        newCells[cellIndex] = { ...cell, size: targetSize };
        set({ currentLand: { ...currentLand, cells: newCells } });
        return true;
      },

      collectOfflineIncome: () => {
        const { lastOfflineCheck, currentLand } = get();
        const now = Date.now();
        const hoursPassed = (now - lastOfflineCheck) / (1000 * 60 * 60);
        if (hoursPassed < 1) {
          set({ lastOfflineCheck: now });
          return 0;
        }
        const filledCount = currentLand.cells.filter(c => c !== null).length;
        // 1 coin per pet per hour, capped at 24 coins/day
        const earned = Math.min(Math.floor(filledCount * hoursPassed), 24);
        set({ lastOfflineCheck: now });
        return earned;
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
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        // Migrate from old 10×10 format to new 20×20 format
        if (state.currentLand) {
          state.currentLand = migrateLand(state.currentLand);
        }
        if (state.completedLands) {
          state.completedLands = state.completedLands.map(migrateLand);
        }
      },
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
