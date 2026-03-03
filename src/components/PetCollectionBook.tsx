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
import { Book, Grid3X3, Lock, Star, Trophy, Search, Sparkles } from 'lucide-react';

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

const RARITY_CARD_STYLE: Record<PetRarity, { bg: string; border: string; badge: string; badgeText: string; glow: string }> = {
  common: {
    bg: 'bg-white',
    border: 'border-stone-200',
    badge: 'bg-stone-100',
    badgeText: 'text-stone-500',
    glow: '',
  },
  uncommon: {
    bg: 'bg-emerald-50/50',
    border: 'border-emerald-200',
    badge: 'bg-emerald-100',
    badgeText: 'text-emerald-600',
    glow: '',
  },
  rare: {
    bg: 'bg-blue-50/50',
    border: 'border-blue-200',
    badge: 'bg-blue-100',
    badgeText: 'text-blue-600',
    glow: 'shadow-[0_0_8px_rgba(59,130,246,0.15)]',
  },
  epic: {
    bg: 'bg-purple-50/50',
    border: 'border-purple-200',
    badge: 'bg-purple-100',
    badgeText: 'text-purple-600',
    glow: 'shadow-[0_0_10px_rgba(168,85,247,0.15)]',
  },
  legendary: {
    bg: 'bg-amber-50/50',
    border: 'border-amber-200',
    badge: 'bg-amber-100',
    badgeText: 'text-amber-600',
    glow: 'shadow-[0_0_12px_rgba(234,179,8,0.2)]',
  },
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
  const style = RARITY_CARD_STYLE[species.rarity];

  if (!discovered && locked) {
    return (
      <div className="relative rounded-xl border-2 border-stone-100 bg-stone-50/80 p-2.5 flex flex-col items-center">
        <div className="h-14 flex items-center justify-center mb-1.5">
          <div className="w-12 h-12 rounded-xl bg-stone-200/60 flex items-center justify-center">
            <Lock className="w-4 h-4 text-stone-300" />
          </div>
        </div>
        <p className="text-[11px] font-bold text-stone-300 text-center truncate w-full">???</p>
        <span className="mt-1 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase bg-stone-100 text-stone-300">
          Lv. {species.unlockLevel}
        </span>
      </div>
    );
  }

  if (!discovered) {
    return (
      <div className="relative rounded-xl border-2 border-dashed border-stone-200 bg-white/50 p-2.5 flex flex-col items-center">
        <div className="h-14 flex items-center justify-center mb-1.5">
          <div className="w-12 h-12 rounded-xl bg-stone-100 flex items-center justify-center">
            <span className="text-lg text-stone-300 font-bold">?</span>
          </div>
        </div>
        <p className="text-[11px] font-bold text-stone-400 text-center truncate w-full">{species.name}</p>
        <span className={cn('mt-1 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase', style.badge, style.badgeText)}>
          {RARITY_LABEL[species.rarity]}
        </span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'relative rounded-xl border-2 p-2.5 transition-all flex flex-col items-center',
        style.bg, style.border, style.glow,
      )}
    >
      {/* Pet image */}
      <div className="h-14 flex items-center justify-center mb-1.5">
        <img
          src={species.imagePath}
          alt={species.name}
          className="w-12 h-12 object-contain"
          style={{
            imageRendering: 'pixelated',
            filter: glow ? `drop-shadow(0 0 4px ${glow})` : undefined,
          }}
          draggable={false}
        />
      </div>

      {/* Name */}
      <p className="text-[11px] font-bold text-stone-800 text-center truncate w-full">
        {species.name}
      </p>

      {/* Rarity badge */}
      <span className={cn(
        'mt-1 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase',
        style.badge, style.badgeText,
      )}>
        {RARITY_LABEL[species.rarity]}
      </span>

      {/* Stats */}
      {timesFound > 0 && (
        <div className="flex items-center gap-1 mt-1.5 text-[9px] font-semibold text-stone-500">
          <span>×{timesFound}</span>
          {bestSize && (
            <>
              <span className="text-stone-300">·</span>
              <span>{SIZE_LABEL[bestSize] ?? bestSize}</span>
            </>
          )}
        </div>
      )}

      {/* Legendary sparkle */}
      {species.rarity === 'legendary' && (
        <Sparkles className="absolute top-1.5 right-1.5 w-3 h-3 text-amber-400 animate-pulse" />
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

  const discoveryPct = stats.total > 0 ? Math.round((stats.discovered / stats.total) * 100) : 0;

  return (
    <div className="h-full flex flex-col bg-[#FAFAF9]">
      {/* Header */}
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-lg font-black tracking-tight text-stone-800">
            Collection
          </h1>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-[11px] font-bold text-stone-500 bg-stone-100 px-2 py-1 rounded-full">
              <Book className="w-3 h-3" />
              {stats.discovered}/{stats.total}
            </span>
          </div>
        </div>

        {/* Stats banner */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="bg-white rounded-xl border border-stone-200 p-2.5 text-center">
            <p className="text-base font-black text-stone-800">{stats.totalFound}</p>
            <p className="text-[9px] font-bold text-stone-400 uppercase tracking-wide">Pets Found</p>
          </div>
          <div className="bg-white rounded-xl border border-stone-200 p-2.5 text-center">
            <p className="text-base font-black text-stone-800">{discoveryPct}%</p>
            <p className="text-[9px] font-bold text-stone-400 uppercase tracking-wide">Discovered</p>
          </div>
          <div className="bg-white rounded-xl border border-stone-200 p-2.5 text-center">
            <p className="text-base font-black text-stone-800">{stats.landsCompleted}</p>
            <p className="text-[9px] font-bold text-stone-400 uppercase tracking-wide">Lands</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-2">
          <button
            onClick={() => setActiveTab('catalog')}
            className={cn(
              'flex-1 py-2 rounded-xl text-xs font-bold transition-all border',
              activeTab === 'catalog'
                ? 'bg-stone-800 text-white border-stone-800'
                : 'bg-white text-stone-500 border-stone-200',
            )}
          >
            Species
          </button>
          <button
            onClick={() => setActiveTab('lands')}
            className={cn(
              'flex-1 py-2 rounded-xl text-xs font-bold transition-all border',
              activeTab === 'lands'
                ? 'bg-stone-800 text-white border-stone-800'
                : 'bg-white text-stone-500 border-stone-200',
            )}
          >
            Lands ({stats.landsCompleted})
          </button>
        </div>

        {/* Search (catalog only) */}
        {activeTab === 'catalog' && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400" />
            <input
              type="text"
              placeholder="Search species..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-2 rounded-xl bg-white border border-stone-200 text-xs text-stone-700 placeholder:text-stone-400 outline-none focus:ring-2 focus:ring-stone-300 focus:border-transparent"
            />
          </div>
        )}
      </div>

      {/* Content */}
      <ScrollArea className="flex-1 min-h-0">
        {activeTab === 'catalog' && (
          <div className="px-4 pt-1 pb-28">
            {/* Species grid */}
            {filteredSpecies.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Search className="w-8 h-8 text-stone-300 mb-3" />
                <p className="text-sm font-bold text-stone-600 mb-1">No species found</p>
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
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-200 flex items-center justify-center">
                    <Grid3X3 className="w-4 h-4 text-emerald-700" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-emerald-800">
                      Land {currentLand.number}
                    </h3>
                    <span className="text-[10px] font-semibold text-emerald-600">
                      In Progress
                    </span>
                  </div>
                </div>
                <span className="text-lg font-black text-emerald-700">
                  {stats.filledCells}%
                </span>
              </div>
              {/* Progress bar */}
              <div className="h-2.5 rounded-full bg-emerald-200 overflow-hidden mb-2">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all"
                  style={{ width: `${stats.filledCells}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] text-emerald-600 font-semibold">
                <span>{stats.filledCells}/100 cells filled</span>
                <span>{Math.round(currentLand.totalFocusMinutes / 60 * 10) / 10}h focused</span>
              </div>
            </div>

            {/* Completed lands */}
            {completedLands.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-14 h-14 rounded-2xl bg-stone-100 flex items-center justify-center mb-3">
                  <Trophy className="w-7 h-7 text-stone-300" />
                </div>
                <p className="text-sm font-bold text-stone-600 mb-1">No lands completed yet</p>
                <p className="text-xs text-stone-400 max-w-[200px]">
                  Fill all 100 cells to complete your first land and earn bonus coins!
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {[...completedLands].reverse().map((land) => (
                  <div
                    key={land.id}
                    className="p-3.5 rounded-xl border border-stone-200 bg-white"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                          <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                        </div>
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
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-stone-600">
                          {Math.round(land.totalFocusMinutes / 60 * 10) / 10}h
                        </p>
                        <p className="text-[10px] font-semibold text-amber-500 mt-0.5">
                          100/100
                        </p>
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
