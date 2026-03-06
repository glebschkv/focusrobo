import { memo, useMemo, useCallback, useState } from 'react';
import { cn } from '@/lib/utils';
import { PixelIcon } from '@/components/ui/PixelIcon';
import { PET_DATABASE, RARITY_WEIGHTS, type PetSpecies, type PetRarity } from '@/data/PetDatabase';
import type { SpeciesCatalogEntry } from '@/stores/landStore';
import { RARITY_ORDER, RARITY_LABEL, RARITY_ACCENT } from './constants';
import { SpeciesCard } from './SpeciesCard';

const HowItWorksPanel = () => {
  const [open, setOpen] = useState(false);
  return (
    <div className="mb-4">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 w-full p-2.5 rounded-xl bg-[hsl(var(--muted)/0.12)] border border-[hsl(var(--border))] text-left transition-colors active:bg-[hsl(var(--muted)/0.2)]"
      >
        <PixelIcon name="sparkles" size={14} />
        <span className="text-[11px] font-bold text-[hsl(var(--foreground))] flex-1">How It Works</span>
        <PixelIcon name={open ? 'chevron-up' : 'chevron-down'} size={12} className="text-[hsl(var(--muted-foreground))]" />
      </button>
      {open && (
        <div className="mt-2 p-3 rounded-xl bg-[hsl(var(--muted)/0.08)] border border-[hsl(var(--border))] space-y-2.5">
          <div>
            <p className="text-[10px] font-bold text-[hsl(var(--foreground))] mb-0.5">Focus → Pet → Island</p>
            <p className="text-[9px] text-[hsl(var(--muted-foreground))] leading-relaxed">
              Complete a focus session to earn a random pet. Pets are placed on your floating island. Fill the island to archive it and start a new one!
            </p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-[hsl(var(--foreground))] mb-0.5">Pet Sizes</p>
            <p className="text-[9px] text-[hsl(var(--muted-foreground))] leading-relaxed">
              Longer sessions = bigger pets. Baby (25-45 min), Adolescent (60-90 min), Adult (120+ min).
            </p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-[hsl(var(--foreground))] mb-0.5">Rarity Drops</p>
            <p className="text-[9px] text-[hsl(var(--muted-foreground))] leading-relaxed">
              Common 45% · Uncommon 28% · Rare 17% · Epic 8% · Legendary 2%. Higher rarity pets glow!
            </p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-[hsl(var(--foreground))] mb-0.5">Affinity & Growth</p>
            <p className="text-[9px] text-[hsl(var(--muted-foreground))] leading-relaxed">
              Find the same species multiple times to build affinity. Familiar (3×), Bonded (5×), Devoted (10×). Higher affinity lets you grow pets to larger sizes!
            </p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-[hsl(var(--foreground))] mb-0.5">Island Expansion</p>
            <p className="text-[9px] text-[hsl(var(--muted-foreground))] leading-relaxed">
              Your island starts small (5×5) and grows as you fill it: 5→6→7→8→9→10→12→14→17→20. Fill all 400 cells to complete the island!
            </p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-[hsl(var(--foreground))] mb-0.5">Wish List</p>
            <p className="text-[9px] text-[hsl(var(--muted-foreground))] leading-relaxed">
              Wish for a species to get a small drop rate boost (+5%) when its rarity tier is rolled.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

interface SpeciesTabProps {
  speciesCatalog: Record<string, SpeciesCatalogEntry>;
  currentLevel: number;
  wishedSpecies: string | null;
  onWish: (speciesId: string) => void;
  onSpeciesTap: (species: PetSpecies) => void;
}

export const SpeciesTab = memo(({
  speciesCatalog, currentLevel, wishedSpecies, onWish, onSpeciesTap,
}: SpeciesTabProps) => {
  const speciesByRarity = useMemo(() => {
    const groups: Record<PetRarity, PetSpecies[]> = {
      common: [], uncommon: [], rare: [], epic: [], legendary: [],
    };
    for (const species of PET_DATABASE) {
      groups[species.rarity].push(species);
    }
    return groups;
  }, []);

  const wishedPet = useMemo(
    () => wishedSpecies ? PET_DATABASE.find(s => s.id === wishedSpecies) ?? null : null,
    [wishedSpecies],
  );

  const hasAnyPets = Object.keys(speciesCatalog).length > 0;

  return (
    <div className="px-4 pt-3 pb-28">
      {/* Empty state for brand-new users */}
      {!hasAnyPets && (
        <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-[hsl(var(--primary)/0.08)] border border-[hsl(var(--border))] mb-4">
          <PixelIcon name="sparkles" size={16} />
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-bold text-[hsl(var(--foreground))]">Start collecting!</p>
            <p className="text-[10px] text-[hsl(var(--muted-foreground))]">Complete a focus session to discover your first pet.</p>
          </div>
        </div>
      )}

      {/* Wished species banner */}
      {wishedPet && (
        <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-rose-50 border border-rose-200 mb-4">
          <PixelIcon name="heart" size={16} />
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-bold text-rose-700">Wishing for {wishedPet.name}</p>
            <p className="text-[10px] text-rose-400">Focus to find this pet!</p>
          </div>
          <img src={wishedPet.imagePath} alt={wishedPet.name} className="w-8 h-8 object-contain" style={{ imageRendering: 'pixelated' }} />
        </div>
      )}

      {/* How It Works — collapsible */}
      <HowItWorksPanel />

      {/* Species grouped by rarity */}
      {RARITY_ORDER.map((rarity) => {
        const species = speciesByRarity[rarity];
        if (species.length === 0) return null;
        const accent = RARITY_ACCENT[rarity];
        const discoveredInGroup = species.filter(s => speciesCatalog[s.id]).length;

        return (
          <div key={rarity} className="mb-5">
            {/* Section header */}
            <div className="flex items-center gap-2 mb-2.5">
              <div className={cn('w-1.5 h-1.5 rounded-full', accent.dot)} />
              <span className={cn('text-[10px] font-bold uppercase tracking-wider', accent.label)}>
                {RARITY_LABEL[rarity]}
              </span>
              <span className="text-[10px] font-semibold text-[hsl(var(--muted-foreground))]">
                {discoveredInGroup}/{species.length}
              </span>
              <span className="text-[9px] font-medium text-[hsl(var(--muted-foreground)/0.5)]">
                {RARITY_WEIGHTS[rarity]}% drop
              </span>
              <div className="h-px flex-1 bg-[hsl(var(--border))]" />
            </div>

            {/* Species grid */}
            <div className="grid grid-cols-3 gap-2.5">
              {species.map((sp) => {
                const entry = speciesCatalog[sp.id];
                return (
                  <SpeciesCard
                    key={sp.id}
                    species={sp}
                    discovered={!!entry}
                    timesFound={entry?.timesFound ?? 0}
                    sizesFound={entry?.sizesFound ?? []}
                    locked={sp.unlockLevel > currentLevel}
                    isWished={wishedSpecies === sp.id}
                    onWish={() => onWish(sp.id)}
                    onTap={() => onSpeciesTap(sp)}
                  />
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
});
SpeciesTab.displayName = 'SpeciesTab';
