/**
 * PetCollectionBook Component
 *
 * Collection tab showing pet species grouped by rarity, wish system,
 * land history, and achievements. Redesigned for clarity and engagement.
 */

import { useState, useMemo, memo, lazy, Suspense } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PET_DATABASE, type PetSpecies, type PetRarity, RARITY_GLOW } from '@/data/PetDatabase';
import { useLandStore, useWishedSpecies } from '@/stores/landStore';
import { useXPStore } from '@/stores/xpStore';
import { cn } from '@/lib/utils';
import { Book, Grid3X3, Lock, Star, Trophy, Sparkles, Heart } from 'lucide-react';

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

const RARITY_SECTION_STYLE: Record<PetRarity, { line: string; text: string }> = {
  common: { line: 'bg-stone-300', text: 'text-stone-500' },
  uncommon: { line: 'bg-emerald-400', text: 'text-emerald-600' },
  rare: { line: 'bg-blue-400', text: 'text-blue-600' },
  epic: { line: 'bg-purple-400', text: 'text-purple-600' },
  legendary: { line: 'bg-amber-400', text: 'text-amber-600' },
};

const RARITY_CARD_STYLE: Record<PetRarity, { bg: string; border: string; badge: string; badgeText: string; glow: string }> = {
  common: { bg: 'bg-white', border: 'border-stone-200', badge: 'bg-stone-100', badgeText: 'text-stone-500', glow: '' },
  uncommon: { bg: 'bg-emerald-50/50', border: 'border-emerald-200', badge: 'bg-emerald-100', badgeText: 'text-emerald-600', glow: '' },
  rare: { bg: 'bg-blue-50/50', border: 'border-blue-200', badge: 'bg-blue-100', badgeText: 'text-blue-600', glow: 'shadow-[0_0_8px_rgba(59,130,246,0.15)]' },
  epic: { bg: 'bg-purple-50/50', border: 'border-purple-200', badge: 'bg-purple-100', badgeText: 'text-purple-600', glow: 'shadow-[0_0_10px_rgba(168,85,247,0.15)]' },
  legendary: { bg: 'bg-amber-50/50', border: 'border-amber-200', badge: 'bg-amber-100', badgeText: 'text-amber-600', glow: 'shadow-[0_0_12px_rgba(234,179,8,0.2)]' },
};

const SIZE_LABEL: Record<string, string> = { baby: 'Baby', adolescent: 'Teen', adult: 'Adult' };

// ============================================================================
// Sub-components
// ============================================================================

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
  const style = RARITY_CARD_STYLE[species.rarity];

  if (!discovered && locked) {
    return (
      <div className="relative rounded-xl border-2 border-stone-100 bg-stone-50/80 p-2 flex flex-col items-center">
        <div className="h-12 flex items-center justify-center mb-1">
          <div className="w-10 h-10 rounded-lg bg-stone-200/60 flex items-center justify-center">
            <Lock className="w-3.5 h-3.5 text-stone-300" />
          </div>
        </div>
        <p className="text-[10px] font-bold text-stone-300 text-center truncate w-full">???</p>
        <span className="mt-0.5 text-[8px] font-bold text-stone-300">Lv.{species.unlockLevel}</span>
      </div>
    );
  }

  if (!discovered) {
    return (
      <div className="relative rounded-xl border-2 border-dashed border-stone-200 bg-white/50 p-2 flex flex-col items-center">
        <div className="h-12 flex items-center justify-center mb-1">
          <div className="w-10 h-10 rounded-lg bg-stone-100 flex items-center justify-center">
            <span className="text-base text-stone-300 font-bold">?</span>
          </div>
        </div>
        <p className="text-[10px] font-bold text-stone-400 text-center truncate w-full">{species.name}</p>
      </div>
    );
  }

  return (
    <div className={cn('relative rounded-xl border-2 p-2 flex flex-col items-center', style.bg, style.border, style.glow)}>
      {/* Wish heart */}
      <button
        onClick={(e) => { e.stopPropagation(); onWish(); }}
        className={cn(
          'absolute top-1 right-1 w-5 h-5 flex items-center justify-center rounded-full transition-all',
          isWished ? 'text-rose-500 scale-110' : 'text-stone-300 hover:text-rose-300',
        )}
        aria-label={isWished ? 'Remove wish' : `Wish for ${species.name}`}
      >
        <Heart className="w-3 h-3" fill={isWished ? 'currentColor' : 'none'} />
      </button>

      <div className="h-12 flex items-center justify-center mb-1">
        <img
          src={species.imagePath}
          alt={species.name}
          className="w-10 h-10 object-contain"
          style={{ imageRendering: 'pixelated', filter: glow ? `drop-shadow(0 0 4px ${glow})` : undefined }}
          draggable={false}
        />
      </div>
      <p className="text-[10px] font-bold text-stone-800 text-center truncate w-full">{species.name}</p>
      {timesFound > 0 && (
        <div className="flex items-center gap-1 mt-0.5 text-[9px] font-semibold text-stone-500">
          <span>×{timesFound}</span>
          {bestSize && <><span className="text-stone-300">·</span><span>{SIZE_LABEL[bestSize] ?? bestSize}</span></>}
        </div>
      )}
      {species.rarity === 'legendary' && (
        <Sparkles className="absolute top-1 left-1 w-3 h-3 text-amber-400 animate-pulse" />
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

  // Group species by rarity
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
    <div className="h-full flex flex-col bg-[hsl(var(--background))]">
      {/* Header */}
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-lg font-black tracking-tight text-stone-800">Collection</h1>
          <span className="flex items-center gap-1 text-[11px] font-bold text-stone-500 bg-stone-100 px-2 py-1 rounded-full">
            <Book className="w-3 h-3" />
            {stats.discovered}/{stats.total}
          </span>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="bg-white rounded-xl border border-stone-200 p-2 text-center">
            <p className="text-sm font-black text-stone-800">{stats.totalFound}</p>
            <p className="text-[9px] font-bold text-stone-400 uppercase">Pets Found</p>
          </div>
          <div className="bg-white rounded-xl border border-stone-200 p-2 text-center">
            <p className="text-sm font-black text-stone-800">{discoveryPct}%</p>
            <p className="text-[9px] font-bold text-stone-400 uppercase">Discovered</p>
          </div>
          <div className="bg-white rounded-xl border border-stone-200 p-2 text-center">
            <p className="text-sm font-black text-stone-800">{stats.landsCompleted}</p>
            <p className="text-[9px] font-bold text-stone-400 uppercase">Lands</p>
          </div>
        </div>

        {/* 3 sub-tabs */}
        <div className="flex gap-1.5">
          {(['species', 'lands', 'achievements'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'flex-1 py-1.5 rounded-lg text-[11px] font-bold transition-all border',
                activeTab === tab
                  ? 'bg-stone-800 text-white border-stone-800'
                  : 'bg-white text-stone-500 border-stone-200',
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
          <div className="px-4 pt-1 pb-28">
            {/* Wished species banner */}
            {wishedSpecies && (() => {
              const ws = PET_DATABASE.find(s => s.id === wishedSpecies);
              return ws ? (
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-rose-50 border border-rose-200 mb-3">
                  <Heart className="w-4 h-4 text-rose-500 flex-shrink-0" fill="currentColor" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-bold text-rose-700">Wishing for {ws.name}</p>
                    <p className="text-[10px] text-rose-500">Focus or hatch eggs to find it!</p>
                  </div>
                  <img src={ws.imagePath} alt={ws.name} className="w-8 h-8 object-contain" style={{ imageRendering: 'pixelated' }} />
                </div>
              ) : null;
            })()}

            {/* Species grouped by rarity */}
            {RARITY_ORDER.map((rarity) => {
              const species = speciesByRarity[rarity];
              if (species.length === 0) return null;
              const sectionStyle = RARITY_SECTION_STYLE[rarity];
              const discoveredInGroup = species.filter(s => speciesCatalog[s.id]).length;

              return (
                <div key={rarity} className="mb-4">
                  {/* Section header */}
                  <div className="flex items-center gap-2 mb-2">
                    <div className={cn('h-0.5 flex-1 rounded-full', sectionStyle.line)} />
                    <span className={cn('text-[10px] font-bold uppercase tracking-wider', sectionStyle.text)}>
                      {RARITY_LABEL[rarity]} ({discoveredInGroup}/{species.length})
                    </span>
                    <div className={cn('h-0.5 flex-1 rounded-full', sectionStyle.line)} />
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
          <div className="px-4 pt-1 pb-28">
            <div className="p-3 rounded-xl border-2 border-emerald-200 bg-emerald-50 mb-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-200 flex items-center justify-center">
                    <Grid3X3 className="w-3.5 h-3.5 text-emerald-700" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-emerald-800">Land {currentLand.number}</h3>
                    <span className="text-[10px] font-semibold text-emerald-600">In Progress</span>
                  </div>
                </div>
                <span className="text-sm font-black text-emerald-700">{stats.filledCells}</span>
              </div>
              <div className="h-2 rounded-full bg-emerald-200 overflow-hidden mb-1.5">
                <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${stats.filledCells}%` }} />
              </div>
              <div className="flex items-center justify-between text-[10px] text-emerald-600 font-semibold">
                <span>{stats.filledCells}/100 filled</span>
                <span>{Math.round(currentLand.totalFocusMinutes / 60 * 10) / 10}h focused</span>
              </div>
            </div>

            {completedLands.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Trophy className="w-8 h-8 text-stone-300 mb-2" />
                <p className="text-xs font-bold text-stone-600 mb-1">No lands completed yet</p>
                <p className="text-[11px] text-stone-400 max-w-[200px]">Fill all cells to complete your first land!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {[...completedLands].reverse().map((land) => (
                  <div key={land.id} className="p-3 rounded-xl border border-stone-200 bg-white">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                        <div>
                          <h4 className="text-xs font-bold text-stone-700">Land {land.number}</h4>
                          <p className="text-[10px] text-stone-400">
                            {land.completedAt ? new Date(land.completedAt).toLocaleDateString() : 'Completed'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[11px] font-bold text-stone-600">{Math.round(land.totalFocusMinutes / 60 * 10) / 10}h</p>
                        <p className="text-[10px] font-semibold text-amber-500">100/100</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'achievements' && (
          <div className="px-4 pt-1 pb-28">
            <Suspense fallback={<div className="py-12 text-center text-xs text-stone-400">Loading achievements...</div>}>
              <LazyAchievementGallery />
            </Suspense>
          </div>
        )}
      </ScrollArea>
    </div>
  );
});
PetCollectionBook.displayName = 'PetCollectionBook';
