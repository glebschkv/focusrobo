/**
 * PetCollectionBook Component
 *
 * Collection tab — pastel green Forest-inspired design.
 * Clean, minimal, nature-themed collection catalog.
 */

import { useState, useMemo, memo, lazy, Suspense } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PET_DATABASE, type PetSpecies, type PetRarity, RARITY_GLOW } from '@/data/PetDatabase';
import { useLandStore, useWishedSpecies } from '@/stores/landStore';
import { useXPStore } from '@/stores/xpStore';
import { cn } from '@/lib/utils';
import { Lock, Star, Sparkles, Heart, TreePine, Mountain, Leaf } from 'lucide-react';

const LazyAchievementGallery = lazy(() =>
  import('@/components/AchievementGallery').then(m => ({ default: m.AchievementGallery }))
);

// ============================================================================
// Constants
// ============================================================================

const RARITY_ORDER: PetRarity[] = ['common', 'uncommon', 'rare', 'epic', 'legendary'];

const RARITY_LABEL: Record<PetRarity, string> = {
  common: 'Common',
  uncommon: 'Uncommon',
  rare: 'Rare',
  epic: 'Epic',
  legendary: 'Legendary',
};

const RARITY_COLORS: Record<PetRarity, { dot: string; text: string; bg: string; border: string; badge: string; badgeText: string }> = {
  common: {
    dot: 'bg-[#8BA68F]',
    text: 'text-[#6B8A6F]',
    bg: 'bg-white/80',
    border: 'border-[#D4E5D7]',
    badge: 'bg-[#E8F0E9]',
    badgeText: 'text-[#6B8A6F]',
  },
  uncommon: {
    dot: 'bg-emerald-500',
    text: 'text-emerald-600',
    bg: 'bg-emerald-50/60',
    border: 'border-emerald-200',
    badge: 'bg-emerald-100',
    badgeText: 'text-emerald-700',
  },
  rare: {
    dot: 'bg-sky-500',
    text: 'text-sky-600',
    bg: 'bg-sky-50/60',
    border: 'border-sky-200',
    badge: 'bg-sky-100',
    badgeText: 'text-sky-700',
  },
  epic: {
    dot: 'bg-violet-500',
    text: 'text-violet-600',
    bg: 'bg-violet-50/60',
    border: 'border-violet-200',
    badge: 'bg-violet-100',
    badgeText: 'text-violet-700',
  },
  legendary: {
    dot: 'bg-amber-500',
    text: 'text-amber-600',
    bg: 'bg-amber-50/60',
    border: 'border-amber-200',
    badge: 'bg-amber-100',
    badgeText: 'text-amber-700',
  },
};

const SIZE_LABEL: Record<string, string> = { baby: 'Baby', adolescent: 'Teen', adult: 'Adult' };

// ============================================================================
// Sub-components
// ============================================================================

/** Progress ring for the header stats */
const ProgressRing = memo(({ percent, size = 44, stroke = 3.5 }: { percent: number; size?: number; stroke?: number }) => {
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (percent / 100) * circumference;
  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#E0ECDF" strokeWidth={stroke} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke="#4CA771" strokeWidth={stroke} strokeLinecap="round"
        strokeDasharray={circumference} strokeDashoffset={offset}
        className="transition-all duration-700 ease-out"
      />
    </svg>
  );
});
ProgressRing.displayName = 'ProgressRing';

const SpeciesCard = memo(({
  species, discovered, timesFound, bestSize, locked, isWished, onWish,
}: {
  species: PetSpecies;
  discovered: boolean;
  timesFound: number;
  bestSize: string | null;
  locked: boolean;
  isWished: boolean;
  onWish: () => void;
}) => {
  const glow = RARITY_GLOW[species.rarity];
  const colors = RARITY_COLORS[species.rarity];

  // Locked & undiscovered
  if (!discovered && locked) {
    return (
      <div className="collection-card collection-card--locked">
        <div className="h-12 flex items-center justify-center mb-1.5">
          <div className="w-10 h-10 rounded-xl bg-[#E8EDE9] flex items-center justify-center">
            <Lock className="w-3.5 h-3.5 text-[#B0C4B3]" />
          </div>
        </div>
        <p className="text-[10px] font-semibold text-[#B0C4B3] text-center truncate w-full">???</p>
        <span className="mt-0.5 text-[8px] font-bold text-[#C4D4C7]">Lv.{species.unlockLevel}</span>
      </div>
    );
  }

  // Unlocked but undiscovered
  if (!discovered) {
    return (
      <div className="collection-card collection-card--undiscovered">
        <div className="h-12 flex items-center justify-center mb-1.5">
          <div className="w-10 h-10 rounded-xl bg-[#EDF4EE] flex items-center justify-center">
            <span className="text-sm text-[#A3BCA6] font-bold">?</span>
          </div>
        </div>
        <p className="text-[10px] font-semibold text-[#8BA68F] text-center truncate w-full">{species.name}</p>
      </div>
    );
  }

  // Discovered
  return (
    <div className={cn('collection-card collection-card--discovered', colors.bg, colors.border)}>
      {/* Wish heart */}
      <button
        onClick={(e) => { e.stopPropagation(); onWish(); }}
        className={cn(
          'absolute top-1.5 right-1.5 w-5 h-5 flex items-center justify-center rounded-full transition-all',
          isWished ? 'text-rose-400 scale-110' : 'text-[#C4D4C7] hover:text-rose-300',
        )}
        aria-label={isWished ? 'Remove wish' : `Wish for ${species.name}`}
      >
        <Heart className="w-3 h-3" fill={isWished ? 'currentColor' : 'none'} />
      </button>

      <div className="h-12 flex items-center justify-center mb-1.5">
        <img
          src={species.imagePath}
          alt={species.name}
          className="w-10 h-10 object-contain"
          style={{ imageRendering: 'pixelated', filter: glow ? `drop-shadow(0 0 4px ${glow})` : undefined }}
          draggable={false}
        />
      </div>
      <p className="text-[10px] font-bold text-[#2D4A32] text-center truncate w-full">{species.name}</p>
      {timesFound > 0 && (
        <div className="flex items-center gap-1 mt-0.5 text-[9px] font-semibold text-[#6B8A6F]">
          <span>{timesFound}x</span>
          {bestSize && <><span className="text-[#C4D4C7]">/</span><span>{SIZE_LABEL[bestSize] ?? bestSize}</span></>}
        </div>
      )}
      {species.rarity === 'legendary' && (
        <Sparkles className="absolute top-1.5 left-1.5 w-3 h-3 text-amber-400 animate-pulse" />
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
  const setWishedSpecies = useLandStore((s) => s.setWishedSpecies);
  const wishedSpecies = useWishedSpecies();
  const currentLevel = useXPStore((s) => s.currentLevel);

  const [activeTab, setActiveTab] = useState<'species' | 'lands' | 'achievements'>('species');

  const stats = useMemo(() => {
    const discovered = Object.keys(speciesCatalog).length;
    const total = PET_DATABASE.length;
    const totalFound = Object.values(speciesCatalog).reduce((sum, e) => sum + e.timesFound, 0);
    const filledCells = currentLand.cells.filter(c => c !== null).length;
    return { discovered, total, totalFound, filledCells, landsCompleted: completedLands.length };
  }, [speciesCatalog, currentLand.cells, completedLands.length]);

  const speciesByRarity = useMemo(() => {
    const groups: Record<PetRarity, PetSpecies[]> = {
      common: [], uncommon: [], rare: [], epic: [], legendary: [],
    };
    for (const species of PET_DATABASE) {
      groups[species.rarity].push(species);
    }
    return groups;
  }, []);

  const discoveryPct = stats.total > 0 ? Math.round((stats.discovered / stats.total) * 100) : 0;

  const handleWish = (speciesId: string) => {
    setWishedSpecies(wishedSpecies === speciesId ? null : speciesId);
  };

  return (
    <div className="h-full flex flex-col collection-page">
      {/* Header */}
      <div className="collection-header-area">
        {/* Title + discovery count */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#4CA771]/10 flex items-center justify-center">
              <Leaf className="w-4 h-4 text-[#4CA771]" />
            </div>
            <h1 className="text-lg font-bold tracking-tight text-[#2D4A32]">Collection</h1>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-[#4CA771]">{stats.discovered}/{stats.total}</span>
          </div>
        </div>

        {/* Stats cards — soft green glassmorphism */}
        <div className="grid grid-cols-3 gap-2.5 mb-4">
          <div className="collection-stat-card">
            <div className="relative flex items-center justify-center mb-1">
              <ProgressRing percent={discoveryPct} size={38} stroke={3} />
              <span className="absolute text-[10px] font-black text-[#2D4A32]">{discoveryPct}%</span>
            </div>
            <p className="text-[9px] font-semibold text-[#6B8A6F] uppercase tracking-wide">Found</p>
          </div>
          <div className="collection-stat-card">
            <p className="text-xl font-black text-[#2D4A32] mb-0.5">{stats.totalFound}</p>
            <p className="text-[9px] font-semibold text-[#6B8A6F] uppercase tracking-wide">Total Pets</p>
          </div>
          <div className="collection-stat-card">
            <p className="text-xl font-black text-[#2D4A32] mb-0.5">{stats.landsCompleted}</p>
            <p className="text-[9px] font-semibold text-[#6B8A6F] uppercase tracking-wide">Lands</p>
          </div>
        </div>

        {/* Sub-tabs — pill style */}
        <div className="flex gap-1.5 p-1 rounded-xl bg-[#E0ECDF]/60">
          {(['species', 'lands', 'achievements'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'flex-1 py-1.5 rounded-lg text-[11px] font-bold transition-all',
                activeTab === tab
                  ? 'bg-white text-[#2D4A32] shadow-sm'
                  : 'text-[#6B8A6F] hover:text-[#4CA771]',
              )}
            >
              {tab === 'species' ? 'Species' : tab === 'lands' ? 'Lands' : 'Achievements'}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1 min-h-0">
        {activeTab === 'species' && (
          <div className="px-4 pt-3 pb-28">
            {/* Wished species banner */}
            {wishedSpecies && (() => {
              const ws = PET_DATABASE.find(s => s.id === wishedSpecies);
              return ws ? (
                <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-[#FFF1F2] border border-[#FECDD3] mb-4">
                  <Heart className="w-4 h-4 text-rose-400 flex-shrink-0" fill="currentColor" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-bold text-rose-700">Wishing for {ws.name}</p>
                    <p className="text-[10px] text-rose-400">Focus to find this pet!</p>
                  </div>
                  <img src={ws.imagePath} alt={ws.name} className="w-8 h-8 object-contain" style={{ imageRendering: 'pixelated' }} />
                </div>
              ) : null;
            })()}

            {/* Species grouped by rarity */}
            {RARITY_ORDER.map((rarity) => {
              const species = speciesByRarity[rarity];
              if (species.length === 0) return null;
              const colors = RARITY_COLORS[rarity];
              const discoveredInGroup = species.filter(s => speciesCatalog[s.id]).length;

              return (
                <div key={rarity} className="mb-5">
                  {/* Section header */}
                  <div className="flex items-center gap-2 mb-2.5">
                    <div className={cn('w-1.5 h-1.5 rounded-full', colors.dot)} />
                    <span className={cn('text-[10px] font-bold uppercase tracking-wider', colors.text)}>
                      {RARITY_LABEL[rarity]}
                    </span>
                    <span className="text-[10px] font-semibold text-[#B0C4B3]">
                      {discoveredInGroup}/{species.length}
                    </span>
                    <div className="h-px flex-1 bg-[#E0ECDF]" />
                  </div>

                  {/* Species grid */}
                  <div className="grid grid-cols-4 gap-2">
                    {species.map((sp) => {
                      const entry = speciesCatalog[sp.id];
                      return (
                        <SpeciesCard
                          key={sp.id}
                          species={sp}
                          discovered={!!entry}
                          timesFound={entry?.timesFound ?? 0}
                          bestSize={entry?.bestSize ?? null}
                          locked={sp.unlockLevel > currentLevel}
                          isWished={wishedSpecies === sp.id}
                          onWish={() => handleWish(sp.id)}
                        />
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'lands' && (
          <div className="px-4 pt-3 pb-28">
            {/* Current land card */}
            <div className="collection-land-current">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#4CA771]/15 flex items-center justify-center">
                    <TreePine className="w-4 h-4 text-[#4CA771]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#2D4A32]">Land {currentLand.number}</h3>
                    <span className="text-[10px] font-semibold text-[#6B8A6F]">In Progress</span>
                  </div>
                </div>
                <span className="text-2xl font-black text-[#4CA771]">{stats.filledCells}</span>
              </div>
              {/* Progress bar */}
              <div className="h-2.5 rounded-full bg-[#E0ECDF] overflow-hidden mb-2">
                <div
                  className="h-full rounded-full transition-all duration-500 ease-out"
                  style={{
                    width: `${stats.filledCells}%`,
                    background: 'linear-gradient(90deg, #6BC18F, #4CA771)',
                  }}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] font-semibold text-[#6B8A6F]">
                <span>{stats.filledCells}/100 pets placed</span>
                <span>{Math.round(currentLand.totalFocusMinutes / 60 * 10) / 10}h focused</span>
              </div>
            </div>

            {/* Completed lands */}
            {completedLands.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-14 h-14 rounded-2xl bg-[#E0ECDF] flex items-center justify-center mb-3">
                  <Mountain className="w-6 h-6 text-[#8BA68F]" />
                </div>
                <p className="text-sm font-bold text-[#4A6B4E] mb-1">No lands completed yet</p>
                <p className="text-xs text-[#8BA68F] max-w-[220px]">Fill all 100 cells to complete your first land!</p>
              </div>
            ) : (
              <div className="space-y-2.5 mt-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#8BA68F] mb-1">Completed</p>
                {[...completedLands].reverse().map((land) => (
                  <div key={land.id} className="collection-land-completed">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center">
                          <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-[#2D4A32]">Land {land.number}</h4>
                          <p className="text-[10px] text-[#8BA68F]">
                            {land.completedAt ? new Date(land.completedAt).toLocaleDateString() : 'Completed'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-[#4A6B4E]">{Math.round(land.totalFocusMinutes / 60 * 10) / 10}h</p>
                        <p className="text-[10px] font-semibold text-[#4CA771]">100/100</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'achievements' && (
          <div className="px-4 pt-3 pb-28">
            <Suspense fallback={<div className="py-12 text-center text-xs text-[#8BA68F]">Loading achievements...</div>}>
              <LazyAchievementGallery />
            </Suspense>
          </div>
        )}
      </ScrollArea>
    </div>
  );
});
PetCollectionBook.displayName = 'PetCollectionBook';
