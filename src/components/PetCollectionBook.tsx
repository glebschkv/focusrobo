/**
 * PetCollectionBook — main collection tab orchestrator.
 *
 * Sub-components live in ./collection/:
 *   SpeciesTab   — species grid grouped by rarity
 *   LandsTab     — current + completed lands
 *   SpeciesCard  — individual species card (3 visual states)
 *   ProgressRing — circular progress SVG
 *   SpeciesDetailDrawer — bottom sheet for tapping a species
 *
 * Achievements are lazy-loaded from AchievementGallery.
 * All colors use shared design tokens from base.css.
 */

import { useState, useMemo, useCallback, memo, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PET_DATABASE, type PetSpecies } from '@/data/PetDatabase';
import { useLandStore, useWishedSpecies } from '@/stores/landStore';
import { useXPStore } from '@/stores/xpStore';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { cn } from '@/lib/utils';
import { PixelIcon } from '@/components/ui/PixelIcon';

import { SpeciesTab } from '@/components/collection/SpeciesTab';
import { LandsTab } from '@/components/collection/LandsTab';
import { ProgressRing } from '@/components/collection/ProgressRing';
import { SpeciesDetailDrawer } from '@/components/collection/SpeciesDetailDrawer';

const LazyAchievementGallery = lazy(() =>
  import('@/components/AchievementGallery').then(m => ({ default: m.AchievementGallery }))
);

// ============================================================================
// Tab transition variants
// ============================================================================

const TAB_VARIANTS = {
  enter: (direction: number) => ({
    x: direction > 0 ? 60 : -60,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -60 : 60,
    opacity: 0,
  }),
};

const TAB_TRANSITION = {
  x: { type: 'spring', stiffness: 400, damping: 35, mass: 0.8 },
  opacity: { duration: 0.18 },
};

const TAB_REDUCED = {
  enter: { opacity: 0 },
  center: { opacity: 1 },
  exit: { opacity: 0 },
};

const TAB_LIST = ['species', 'lands', 'achievements'] as const;
type TabId = typeof TAB_LIST[number];

const TAB_LABELS: Record<TabId, string> = {
  species: 'Species',
  lands: 'Lands',
  achievements: 'Achievements',
};

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
  const prefersReducedMotion = useReducedMotion();

  const [activeTab, setActiveTab] = useState<TabId>('species');
  const [tabDirection, setTabDirection] = useState(0);
  const [detailSpecies, setDetailSpecies] = useState<PetSpecies | null>(null);

  // Compute stats
  const stats = useMemo(() => {
    const discovered = Object.keys(speciesCatalog).length;
    const total = PET_DATABASE.length;
    const totalFound = Object.values(speciesCatalog).reduce((sum, e) => sum + e.timesFound, 0);
    const filledCells = currentLand.cells.filter(c => c !== null).length;
    const totalVariants = Object.values(speciesCatalog).reduce((sum, e) => sum + (e.sizesFound?.length ?? 0), 0);
    const maxVariants = discovered * 3;
    const completedSpecies = Object.values(speciesCatalog).filter(e => e.sizesFound?.length === 3).length;
    return {
      discovered, total, totalFound, filledCells,
      landsCompleted: completedLands.length,
      totalVariants, maxVariants, completedSpecies,
    };
  }, [speciesCatalog, currentLand.cells, completedLands.length]);

  const discoveryPct = stats.total > 0 ? Math.round((stats.discovered / stats.total) * 100) : 0;

  // Handlers
  const handleTabChange = useCallback((tab: TabId) => {
    setTabDirection(TAB_LIST.indexOf(tab) - TAB_LIST.indexOf(activeTab));
    setActiveTab(tab);
  }, [activeTab]);

  const handleWish = useCallback((speciesId: string) => {
    setWishedSpecies(wishedSpecies === speciesId ? null : speciesId);
  }, [wishedSpecies, setWishedSpecies]);

  const handleSpeciesTap = useCallback((species: PetSpecies) => {
    setDetailSpecies(species);
  }, []);

  const handleDetailClose = useCallback(() => {
    setDetailSpecies(null);
  }, []);

  const handleDetailWish = useCallback(() => {
    if (detailSpecies) {
      handleWish(detailSpecies.id);
    }
  }, [detailSpecies, handleWish]);

  // Variants based on reduced motion preference
  const variants = prefersReducedMotion ? TAB_REDUCED : TAB_VARIANTS;
  const transition = prefersReducedMotion ? { duration: 0.15 } : TAB_TRANSITION;

  return (
    <div className="h-full flex flex-col collection-page">
      {/* ── Header ── */}
      <div className="collection-header-area">
        {/* Title + discovery count */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[hsl(var(--primary)/0.12)] flex items-center justify-center">
              <PixelIcon name="leaf" size={18} />
            </div>
            <h1 className="text-lg font-bold tracking-tight text-[hsl(var(--foreground))]">Collection</h1>
          </div>
          <span className="text-xs font-bold text-[hsl(var(--primary))]">
            {stats.discovered}/{stats.total}
          </span>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2.5 mb-4">
          <div className="collection-stat-card gap-1">
            <div className="relative flex items-center justify-center flex-shrink-0">
              <ProgressRing percent={discoveryPct} size={36} stroke={3} />
              <span className="absolute text-[9px] font-black text-[hsl(var(--foreground))]">{discoveryPct}%</span>
            </div>
            <p className="text-[11px] font-black text-[hsl(var(--foreground))]">{stats.discovered}/{stats.total}</p>
            <p className="text-[9px] font-semibold text-[hsl(var(--muted-foreground))] uppercase">Species</p>
          </div>
          <div className="collection-stat-card gap-1">
            <div className="relative flex items-center justify-center flex-shrink-0">
              <ProgressRing percent={stats.maxVariants > 0 ? Math.round((stats.totalVariants / stats.maxVariants) * 100) : 0} size={36} stroke={3} color="hsl(40, 90%, 50%)" />
              <span className="absolute text-[9px] font-black text-[hsl(var(--foreground))]">{stats.totalVariants}</span>
            </div>
            <p className="text-[11px] font-black text-[hsl(var(--foreground))]">{stats.totalVariants}/{stats.maxVariants}</p>
            <p className="text-[9px] font-semibold text-[hsl(var(--muted-foreground))] uppercase">Variants</p>
          </div>
          <div className="collection-stat-card gap-0.5">
            <p className="text-lg font-black text-[hsl(var(--foreground))]">{stats.landsCompleted}</p>
            <p className="text-[9px] font-semibold text-[hsl(var(--muted-foreground))] uppercase">Lands</p>
            <p className="text-[9px] text-[hsl(var(--muted-foreground))]">{stats.totalFound} pets</p>
          </div>
        </div>

        {/* Pill tabs */}
        <div className="flex gap-1.5 p-1 rounded-xl bg-[hsl(var(--muted)/0.5)]">
          {TAB_LIST.map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              className={cn(
                'flex-1 py-2 rounded-lg text-[11px] font-bold transition-all',
                activeTab === tab
                  ? 'bg-[hsl(var(--card))] text-[hsl(var(--foreground))] shadow-sm'
                  : 'text-[hsl(var(--muted-foreground))]',
              )}
            >
              {TAB_LABELS[tab]}
            </button>
          ))}
        </div>
      </div>

      {/* ── Tab content with crossfade / slide ── */}
      <ScrollArea className="flex-1 min-h-0">
        <AnimatePresence mode="wait" custom={tabDirection}>
          <motion.div
            key={activeTab}
            custom={tabDirection}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={transition}
          >
            {activeTab === 'species' && (
              <SpeciesTab
                speciesCatalog={speciesCatalog}
                currentLevel={currentLevel}
                wishedSpecies={wishedSpecies}
                onWish={handleWish}
                onSpeciesTap={handleSpeciesTap}
              />
            )}

            {activeTab === 'lands' && (
              <LandsTab
                currentLand={currentLand}
                completedLands={completedLands}
                filledCells={stats.filledCells}
              />
            )}

            {activeTab === 'achievements' && (
              <div className="px-4 pt-3 pb-28">
                <Suspense fallback={
                  <div className="py-12 text-center text-xs text-[hsl(var(--muted-foreground))]">Loading achievements...</div>
                }>
                  <LazyAchievementGallery embedded />
                </Suspense>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </ScrollArea>

      {/* ── Species detail drawer ── */}
      <SpeciesDetailDrawer
        species={detailSpecies}
        catalogEntry={detailSpecies ? speciesCatalog[detailSpecies.id] ?? null : null}
        isWished={detailSpecies ? wishedSpecies === detailSpecies.id : false}
        onWish={handleDetailWish}
        onClose={handleDetailClose}
      />
    </div>
  );
});
PetCollectionBook.displayName = 'PetCollectionBook';
