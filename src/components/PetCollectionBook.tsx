/**
 * PetCollectionBook Component
 *
 * Collection tab showing the pet species catalog and land history.
 * Replaces the old BotCollectionGrid which showed 40+ robots.
 */

import { useState, useMemo, memo } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PET_DATABASE, type PetSpecies, type PetRarity, RARITY_GLOW } from '@/data/PetDatabase';
import { useLandStore } from '@/stores/landStore';
import { useXPStore } from '@/stores/xpStore';
import { cn } from '@/lib/utils';
import { Book, Grid3X3, Lock, Star, Trophy, Search } from 'lucide-react';

// ============================================================================
// Rarity styling
// ============================================================================

const RARITY_LABEL: Record<PetRarity, string> = {
  common: 'Common',
  uncommon: 'Uncommon',
  rare: 'Rare',
  epic: 'Epic',
  legendary: 'Legendary',
};

const RARITY_BG: Record<PetRarity, string> = {
  common: 'bg-stone-100 border-stone-200',
  uncommon: 'bg-emerald-50 border-emerald-200',
  rare: 'bg-blue-50 border-blue-200',
  epic: 'bg-purple-50 border-purple-200',
  legendary: 'bg-amber-50 border-amber-200',
};

const RARITY_TEXT: Record<PetRarity, string> = {
  common: 'text-stone-500',
  uncommon: 'text-emerald-600',
  rare: 'text-blue-600',
  epic: 'text-purple-600',
  legendary: 'text-amber-600',
};

const RARITY_BADGE: Record<PetRarity, string> = {
  common: 'bg-stone-200 text-stone-600',
  uncommon: 'bg-emerald-200 text-emerald-700',
  rare: 'bg-blue-200 text-blue-700',
  epic: 'bg-purple-200 text-purple-700',
  legendary: 'bg-amber-200 text-amber-700',
};

const SIZE_LABEL: Record<string, string> = {
  baby: 'Baby',
  adolescent: 'Teen',
  adult: 'Adult',
};

// ============================================================================
// Sub-components
// ============================================================================

const SpeciesCard = memo(({
  species,
  discovered,
  timesFound,
  bestSize,
  locked,
}: {
  species: PetSpecies;
  discovered: boolean;
  timesFound: number;
  bestSize: string | null;
  locked: boolean;
}) => {
  const glow = RARITY_GLOW[species.rarity];

  return (
    <div
      className={cn(
        'relative rounded-xl border-2 p-2.5 transition-all',
        discovered ? RARITY_BG[species.rarity] : 'bg-stone-50 border-stone-100',
        discovered && glow && 'shadow-sm',
      )}
    >
      {/* Pet image */}
      <div className="flex items-center justify-center h-14 mb-1.5">
        {discovered ? (
          <img
            src={species.imagePath}
            alt={species.name}
            className="w-12 h-12 object-contain"
            style={{ imageRendering: 'pixelated' }}
            draggable={false}
          />
        ) : locked ? (
          <div className="w-12 h-12 rounded-lg bg-stone-200 flex items-center justify-center">
            <Lock className="w-5 h-5 text-stone-400" />
          </div>
        ) : (
          <div className="w-12 h-12 rounded-lg bg-stone-200 flex items-center justify-center">
            <span className="text-xl text-stone-400">?</span>
          </div>
        )}
      </div>

      {/* Name */}
      <p className={cn(
        'text-[11px] font-bold text-center truncate',
        discovered ? 'text-stone-800' : 'text-stone-400',
      )}>
        {discovered || !locked ? species.name : '???'}
      </p>

      {/* Rarity badge */}
      <div className="flex justify-center mt-1">
        <span className={cn(
          'px-1.5 py-0.5 rounded text-[8px] font-bold uppercase',
          discovered ? RARITY_BADGE[species.rarity] : 'bg-stone-100 text-stone-400',
        )}>
          {RARITY_LABEL[species.rarity]}
        </span>
      </div>

      {/* Stats for discovered species */}
      {discovered && timesFound > 0 && (
        <div className="flex items-center justify-center gap-1 mt-1.5">
          <span className={cn('text-[9px] font-semibold', RARITY_TEXT[species.rarity])}>
            ×{timesFound}
          </span>
          {bestSize && (
            <>
              <span className="text-stone-300">·</span>
              <span className={cn('text-[9px] font-semibold', RARITY_TEXT[species.rarity])}>
                {SIZE_LABEL[bestSize] ?? bestSize}
              </span>
            </>
          )}
        </div>
      )}

      {/* Lock level indicator */}
      {!discovered && locked && (
        <p className="text-[9px] text-stone-400 text-center mt-1">
          Lv. {species.unlockLevel}
        </p>
      )}
    </div>
  );
});
SpeciesCard.displayName = 'SpeciesCard';

// ============================================================================
// Main component
// ============================================================================

export const PetCollectionBook = memo(() => {
  const speciesCatalog = useLandStore((s) => s.speciesCatalog);
  const currentLand = useLandStore((s) => s.currentLand);
  const completedLands = useLandStore((s) => s.completedLands);
  const currentLevel = useXPStore((s) => s.currentLevel);

  const [activeTab, setActiveTab] = useState<'catalog' | 'lands'>('catalog');
  const [searchQuery, setSearchQuery] = useState('');

  // Calculate stats
  const stats = useMemo(() => {
    const discovered = Object.keys(speciesCatalog).length;
    const total = PET_DATABASE.length;
    const totalFound = Object.values(speciesCatalog).reduce((sum, e) => sum + e.timesFound, 0);
    const filledCells = currentLand.cells.filter(c => c !== null).length;

    return { discovered, total, totalFound, filledCells, landsCompleted: completedLands.length };
  }, [speciesCatalog, currentLand.cells, completedLands.length]);

  // Filtered + sorted species
  const filteredSpecies = useMemo(() => {
    let list = [...PET_DATABASE];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.rarity.includes(q),
      );
    }

    // Sort: discovered first, then by unlock level
    return list.sort((a, b) => {
      const aFound = speciesCatalog[a.id] ? 1 : 0;
      const bFound = speciesCatalog[b.id] ? 1 : 0;
      if (aFound !== bFound) return bFound - aFound;
      return a.unlockLevel - b.unlockLevel;
    });
  }, [searchQuery, speciesCatalog]);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-4 pt-3 pb-2">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-base font-black uppercase tracking-tight text-stone-800">
            Collection
          </h1>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1 font-semibold text-stone-600">
              <Book className="w-3.5 h-3.5" />
              {stats.discovered}/{stats.total}
            </span>
            <span className="flex items-center gap-1 font-semibold text-stone-600">
              <Grid3X3 className="w-3.5 h-3.5" />
              {stats.filledCells}/100
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-2">
          <button
            onClick={() => setActiveTab('catalog')}
            className={cn(
              'px-3 py-1.5 rounded-full text-xs font-bold transition-all',
              activeTab === 'catalog'
                ? 'bg-stone-800 text-white'
                : 'bg-stone-100 text-stone-500',
            )}
          >
            Species
          </button>
          <button
            onClick={() => setActiveTab('lands')}
            className={cn(
              'px-3 py-1.5 rounded-full text-xs font-bold transition-all',
              activeTab === 'lands'
                ? 'bg-stone-800 text-white'
                : 'bg-stone-100 text-stone-500',
            )}
          >
            Lands ({stats.landsCompleted})
          </button>
        </div>

        {/* Search (catalog only) */}
        {activeTab === 'catalog' && (
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400" />
            <input
              type="text"
              placeholder="Search species..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-stone-100 text-xs text-stone-700 placeholder:text-stone-400 outline-none focus:ring-2 focus:ring-stone-300"
            />
          </div>
        )}
      </div>

      {/* Content */}
      <ScrollArea className="flex-1 min-h-0">
        {activeTab === 'catalog' && (
          <div className="px-4 pt-1 pb-28">
            {/* Stats banner */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-stone-100 mb-3">
              <div className="flex-1 text-center">
                <p className="text-lg font-black text-stone-800">{stats.totalFound}</p>
                <p className="text-[10px] font-semibold text-stone-500 uppercase">Pets Found</p>
              </div>
              <div className="w-px h-8 bg-stone-300" />
              <div className="flex-1 text-center">
                <p className="text-lg font-black text-stone-800">{stats.discovered}</p>
                <p className="text-[10px] font-semibold text-stone-500 uppercase">Species</p>
              </div>
              <div className="w-px h-8 bg-stone-300" />
              <div className="flex-1 text-center">
                <p className="text-lg font-black text-stone-800">{stats.landsCompleted}</p>
                <p className="text-[10px] font-semibold text-stone-500 uppercase">Lands</p>
              </div>
            </div>

            {/* Species grid */}
            {filteredSpecies.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <span className="text-3xl mb-3">🔍</span>
                <p className="text-sm font-semibold text-stone-700 mb-1">No species found</p>
                <p className="text-xs text-stone-400">Try a different search</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2.5">
                {filteredSpecies.map((species) => {
                  const entry = speciesCatalog[species.id];
                  const discovered = !!entry;
                  const locked = species.unlockLevel > currentLevel;

                  return (
                    <SpeciesCard
                      key={species.id}
                      species={species}
                      discovered={discovered}
                      timesFound={entry?.timesFound ?? 0}
                      bestSize={entry?.bestSize ?? null}
                      locked={locked}
                    />
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'lands' && (
          <div className="px-4 pt-1 pb-28">
            {/* Current land */}
            <div className="p-4 rounded-xl border-2 border-emerald-200 bg-emerald-50 mb-3">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold text-emerald-800">
                  Land {currentLand.number}
                </h3>
                <span className="text-xs font-semibold text-emerald-600">
                  In Progress
                </span>
              </div>
              {/* Mini progress bar */}
              <div className="h-2 rounded-full bg-emerald-200 overflow-hidden mb-1.5">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all"
                  style={{ width: `${stats.filledCells}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] text-emerald-600 font-semibold">
                <span>{stats.filledCells}/100 cells</span>
                <span>{Math.round(currentLand.totalFocusMinutes / 60 * 10) / 10}h focused</span>
              </div>
            </div>

            {/* Completed lands */}
            {completedLands.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Trophy className="w-8 h-8 text-stone-300 mb-2" />
                <p className="text-sm font-semibold text-stone-600 mb-1">No lands completed yet</p>
                <p className="text-xs text-stone-400">Fill all 100 cells to complete a land!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {[...completedLands].reverse().map((land) => (
                  <div
                    key={land.id}
                    className="p-3 rounded-xl border border-stone-200 bg-white"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-stone-700">
                          Land {land.number}
                        </h4>
                        <p className="text-[10px] text-stone-400 mt-0.5">
                          {land.completedAt
                            ? new Date(land.completedAt).toLocaleDateString()
                            : 'Completed'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-semibold text-stone-600">
                          {Math.round(land.totalFocusMinutes / 60 * 10) / 10}h
                        </p>
                        <div className="flex items-center gap-0.5 mt-0.5">
                          <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                          <span className="text-[10px] font-bold text-amber-600">100/100</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </ScrollArea>
    </div>
  );
});
PetCollectionBook.displayName = 'PetCollectionBook';
