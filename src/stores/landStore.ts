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

function getNextEmptyCellIndex(cells: (LandCell | null)[]): number {
  return cells.findIndex(cell => cell === null);
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
}

interface LandStoreActions {
  /** Generate a random pet after session completion */
  generateRandomPet: (sessionMinutes: number, playerLevel: number) => PendingPet;

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

      placePendingPet: () => {
        const { pendingPet, currentLand, speciesCatalog } = get();
        if (!pendingPet) return -1;

        const cellIndex = getNextEmptyCellIndex(currentLand.cells);
        if (cellIndex === -1) return -1; // Land is full

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

        set({
          currentLand: updatedLand,
          speciesCatalog: newCatalog,
          pendingPet: null,
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
