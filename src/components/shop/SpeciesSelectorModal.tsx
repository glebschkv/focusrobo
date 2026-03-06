import { memo, useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import { PixelIcon } from '@/components/ui/PixelIcon';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from '@/components/ui/drawer';
import { PET_DATABASE, type PetSpecies, type PetRarity } from '@/data/PetDatabase';
import type { SpeciesCatalogEntry } from '@/stores/landStore';
import { SPECIES_SELECTOR_DISCOVERED_PRICE, SPECIES_SELECTOR_UNDISCOVERED_PRICE } from '@/data/EggData';
import { RARITY_DOT_COLORS } from './styles';

const RARITY_ORDER: PetRarity[] = ['legendary', 'epic', 'rare', 'uncommon', 'common'];
const RARITY_LABEL: Record<PetRarity, string> = {
  common: 'Common', uncommon: 'Uncommon', rare: 'Rare', epic: 'Epic', legendary: 'Legendary',
};

interface SpeciesSelectorModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (speciesId: string, isDiscovered: boolean) => void;
  speciesCatalog: Record<string, SpeciesCatalogEntry>;
  playerLevel: number;
}

export const SpeciesSelectorModal = memo(({
  open, onClose, onSelect, speciesCatalog, playerLevel,
}: SpeciesSelectorModalProps) => {
  const [selected, setSelected] = useState<string | null>(null);

  const { discoveredSpecies, undiscoveredSpecies } = useMemo(() => {
    const discovered: Partial<Record<PetRarity, PetSpecies[]>> = {};
    const undiscovered: Partial<Record<PetRarity, PetSpecies[]>> = {};

    for (const sp of PET_DATABASE) {
      if (sp.unlockLevel > playerLevel) continue;
      const isDiscovered = !!speciesCatalog[sp.id];
      const target = isDiscovered ? discovered : undiscovered;
      if (!target[sp.rarity]) target[sp.rarity] = [];
      target[sp.rarity]!.push(sp);
    }

    return { discoveredSpecies: discovered, undiscoveredSpecies: undiscovered };
  }, [speciesCatalog, playerLevel]);

  const totalDiscovered = Object.values(discoveredSpecies).reduce((sum, arr) => sum + (arr?.length ?? 0), 0);
  const totalUndiscovered = Object.values(undiscoveredSpecies).reduce((sum, arr) => sum + (arr?.length ?? 0), 0);
  const totalAvailable = totalDiscovered + totalUndiscovered;

  const isSelectedDiscovered = selected ? !!speciesCatalog[selected] : true;
  const selectedPrice = isSelectedDiscovered
    ? SPECIES_SELECTOR_DISCOVERED_PRICE
    : SPECIES_SELECTOR_UNDISCOVERED_PRICE;

  const handleConfirm = () => {
    if (selected) {
      onSelect(selected, isSelectedDiscovered);
      setSelected(null);
    }
  };

  const renderSpeciesGroup = (group: PetSpecies[] | undefined, rarity: PetRarity, dimmed: boolean) => {
    if (!group || group.length === 0) return null;
    return group.map((sp) => (
      <button
        key={sp.id}
        onClick={() => setSelected(sp.id)}
        className={cn(
          'flex flex-col items-center p-2 rounded-xl border transition-all active:scale-[0.96] relative',
          selected === sp.id
            ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.08)]'
            : 'border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.06)]',
          dimmed && 'opacity-75',
        )}
      >
        <img
          src={sp.imagePath}
          alt={sp.name}
          className="w-10 h-10 object-contain"
          style={{ imageRendering: 'pixelated' }}
          draggable={false}
        />
        <span className="text-[9px] font-semibold text-[hsl(var(--foreground))] mt-1 truncate w-full text-center">
          {sp.name}
        </span>
        {dimmed && (
          <span className="absolute top-1 right-1 text-[7px] font-bold uppercase bg-amber-500 text-white px-1 rounded">
            NEW
          </span>
        )}
      </button>
    ));
  };

  const renderRaritySection = (groups: Partial<Record<PetRarity, PetSpecies[]>>, dimmed: boolean) => {
    return RARITY_ORDER.map((rarity) => {
      const group = groups[rarity];
      if (!group || group.length === 0) return null;
      return (
        <div key={`${dimmed ? 'u' : 'd'}-${rarity}`}>
          <div className="flex items-center gap-1.5 mb-1.5">
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: RARITY_DOT_COLORS[rarity] }}
            />
            <span
              className="text-[10px] font-bold uppercase tracking-wider"
              style={{ color: RARITY_DOT_COLORS[rarity] }}
            >
              {RARITY_LABEL[rarity]}
            </span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {renderSpeciesGroup(group, rarity, dimmed)}
          </div>
        </div>
      );
    });
  };

  return (
    <Drawer open={open} onOpenChange={(o) => { if (!o) { onClose(); setSelected(null); } }}>
      <DrawerContent className="max-h-[85vh]">
        <div className="px-5 pb-6 pt-2">
          <DrawerHeader className="p-0 mb-3 text-center">
            <DrawerTitle className="text-base font-bold text-[hsl(var(--foreground))]">
              Wishing Well
            </DrawerTitle>
            <DrawerDescription className="text-xs text-[hsl(var(--muted-foreground))] mt-1">
              Choose any unlocked species — discovered or new! ({totalAvailable} available)
            </DrawerDescription>
            <p className="text-[10px] text-[hsl(var(--muted-foreground)/0.6)] mt-1">
              Discovered: {SPECIES_SELECTOR_DISCOVERED_PRICE.toLocaleString()} coins | New species: {SPECIES_SELECTOR_UNDISCOVERED_PRICE.toLocaleString()} coins
            </p>
          </DrawerHeader>

          {totalAvailable === 0 ? (
            <div className="py-8 text-center">
              <PixelIcon name="sparkles" size={24} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm text-[hsl(var(--muted-foreground))]">
                No species unlocked at your level yet.
              </p>
              <p className="text-xs text-[hsl(var(--muted-foreground)/0.6)] mt-1">
                Level up to unlock more species!
              </p>
            </div>
          ) : (
            <div className="overflow-y-auto max-h-[55vh] space-y-3">
              {/* Discovered species */}
              {totalDiscovered > 0 && (
                <>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground)/0.5)]">
                    Discovered ({totalDiscovered})
                  </p>
                  {renderRaritySection(discoveredSpecies, false)}
                </>
              )}

              {/* Undiscovered species */}
              {totalUndiscovered > 0 && (
                <>
                  <div className="border-t border-[hsl(var(--border)/0.3)] my-2" />
                  <p className="text-[10px] font-bold uppercase tracking-wider text-amber-500">
                    Undiscovered ({totalUndiscovered}) — {SPECIES_SELECTOR_UNDISCOVERED_PRICE.toLocaleString()} coins
                  </p>
                  {renderRaritySection(undiscoveredSpecies, true)}
                </>
              )}
            </div>
          )}

          {/* Confirm button */}
          <button
            onClick={handleConfirm}
            disabled={!selected}
            className={cn(
              'w-full mt-4 py-3 rounded-2xl text-sm font-bold transition-all active:scale-[0.98]',
              selected
                ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]'
                : 'bg-[hsl(var(--muted)/0.2)] text-[hsl(var(--muted-foreground)/0.4)] cursor-not-allowed',
            )}
          >
            {selected
              ? `Summon ${PET_DATABASE.find(s => s.id === selected)?.name ?? 'Pet'} (${selectedPrice.toLocaleString()} coins)`
              : 'Select a species'}
          </button>
        </div>
      </DrawerContent>
    </Drawer>
  );
});
SpeciesSelectorModal.displayName = 'SpeciesSelectorModal';
