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
import { RARITY_DOT_COLORS } from './styles';

const RARITY_ORDER: PetRarity[] = ['legendary', 'epic', 'rare', 'uncommon', 'common'];
const RARITY_LABEL: Record<PetRarity, string> = {
  common: 'Common', uncommon: 'Uncommon', rare: 'Rare', epic: 'Epic', legendary: 'Legendary',
};

interface SpeciesSelectorModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (speciesId: string) => void;
  speciesCatalog: Record<string, SpeciesCatalogEntry>;
}

export const SpeciesSelectorModal = memo(({
  open, onClose, onSelect, speciesCatalog,
}: SpeciesSelectorModalProps) => {
  const [selected, setSelected] = useState<string | null>(null);

  const discoveredSpecies = useMemo(() => {
    const discovered = PET_DATABASE.filter(s => speciesCatalog[s.id]);
    const groups: Partial<Record<PetRarity, PetSpecies[]>> = {};
    for (const sp of discovered) {
      if (!groups[sp.rarity]) groups[sp.rarity] = [];
      groups[sp.rarity]!.push(sp);
    }
    return groups;
  }, [speciesCatalog]);

  const totalDiscovered = Object.values(discoveredSpecies).reduce((sum, arr) => sum + (arr?.length ?? 0), 0);

  const handleConfirm = () => {
    if (selected) {
      onSelect(selected);
      setSelected(null);
    }
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
              Choose a species you've already discovered ({totalDiscovered} available)
            </DrawerDescription>
          </DrawerHeader>

          {totalDiscovered === 0 ? (
            <div className="py-8 text-center">
              <PixelIcon name="sparkles" size={24} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm text-[hsl(var(--muted-foreground))]">
                No species discovered yet.
              </p>
              <p className="text-xs text-[hsl(var(--muted-foreground)/0.6)] mt-1">
                Complete focus sessions to discover pets first!
              </p>
            </div>
          ) : (
            <div className="overflow-y-auto max-h-[55vh] space-y-3">
              {RARITY_ORDER.map((rarity) => {
                const group = discoveredSpecies[rarity];
                if (!group || group.length === 0) return null;
                return (
                  <div key={rarity}>
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
                      {group.map((sp) => (
                        <button
                          key={sp.id}
                          onClick={() => setSelected(sp.id)}
                          className={cn(
                            'flex flex-col items-center p-2 rounded-xl border transition-all active:scale-[0.96]',
                            selected === sp.id
                              ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.08)]'
                              : 'border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.06)]',
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
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
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
            {selected ? `Summon ${PET_DATABASE.find(s => s.id === selected)?.name ?? 'Pet'}` : 'Select a species'}
          </button>
        </div>
      </DrawerContent>
    </Drawer>
  );
});
SpeciesSelectorModal.displayName = 'SpeciesSelectorModal';
