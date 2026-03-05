import { memo, useMemo, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Heart, Sparkles } from 'lucide-react';
import { PET_DATABASE, type PetSpecies, type PetRarity } from '@/data/PetDatabase';
import type { SpeciesCatalogEntry } from '@/stores/landStore';
import { RARITY_ORDER, RARITY_LABEL, RARITY_ACCENT } from './constants';
import { SpeciesCard } from './SpeciesCard';

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
          <Sparkles className="w-4 h-4 text-[hsl(var(--primary))] flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-bold text-[hsl(var(--foreground))]">Start collecting!</p>
            <p className="text-[10px] text-[hsl(var(--muted-foreground))]">Complete a focus session to discover your first pet.</p>
          </div>
        </div>
      )}

      {/* Wished species banner */}
      {wishedPet && (
        <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-rose-50 border border-rose-200 mb-4">
          <Heart className="w-4 h-4 text-rose-400 flex-shrink-0" fill="currentColor" />
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-bold text-rose-700">Wishing for {wishedPet.name}</p>
            <p className="text-[10px] text-rose-400">Focus to find this pet!</p>
          </div>
          <img src={wishedPet.imagePath} alt={wishedPet.name} className="w-8 h-8 object-contain" style={{ imageRendering: 'pixelated' }} />
        </div>
      )}

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
                    bestSize={entry?.bestSize ?? null}
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
