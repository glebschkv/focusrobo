import { memo, useMemo } from 'react';
import { Heart, Sparkles, Clock, Star } from 'lucide-react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from '@/components/ui/drawer';
import { type PetSpecies, RARITY_GLOW } from '@/data/PetDatabase';
import type { SpeciesCatalogEntry } from '@/stores/landStore';
import { RARITY_LABEL, SIZE_LABEL } from './constants';

interface SpeciesDetailDrawerProps {
  species: PetSpecies | null;
  catalogEntry: SpeciesCatalogEntry | null;
  isWished: boolean;
  onWish: () => void;
  onClose: () => void;
}

const RARITY_BADGE_STYLE: Record<string, string> = {
  common: 'bg-[hsl(var(--col-tint))] text-[hsl(var(--col-muted))]',
  uncommon: 'bg-emerald-100 text-emerald-700',
  rare: 'bg-sky-100 text-sky-700',
  epic: 'bg-violet-100 text-violet-700',
  legendary: 'bg-amber-100 text-amber-700',
};

export const SpeciesDetailDrawer = memo(({
  species, catalogEntry, isWished, onWish, onClose,
}: SpeciesDetailDrawerProps) => {
  const glow = species ? RARITY_GLOW[species.rarity] : null;

  const sizesFound = useMemo(() => {
    if (!catalogEntry) return [];
    const sizes: string[] = [];
    // We only store bestSize, so show that
    if (catalogEntry.bestSize) sizes.push(SIZE_LABEL[catalogEntry.bestSize] ?? catalogEntry.bestSize);
    return sizes;
  }, [catalogEntry]);

  return (
    <Drawer open={!!species} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DrawerContent className="collection-detail-drawer">
        {species && (
          <div className="px-6 pb-8 pt-2">
            {/* Pet sprite — large, centered */}
            <div className="flex justify-center mb-4">
              <div className="relative">
                <img
                  src={species.imagePath}
                  alt={species.name}
                  className="w-24 h-24 object-contain"
                  style={{
                    imageRendering: 'pixelated',
                    filter: glow ? `drop-shadow(0 0 8px ${glow})` : undefined,
                  }}
                  draggable={false}
                />
              </div>
            </div>

            {/* Name + rarity badge */}
            <DrawerHeader className="p-0 mb-4 text-center">
              <DrawerTitle className="text-lg font-bold text-[hsl(var(--col-text))]">
                {species.name}
              </DrawerTitle>
              <div className="flex items-center justify-center gap-2 mt-1.5">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${RARITY_BADGE_STYLE[species.rarity] ?? ''}`}>
                  {RARITY_LABEL[species.rarity]}
                </span>
                <span className="text-[10px] font-semibold text-[hsl(var(--col-ghost))]">
                  Lv.{species.unlockLevel}
                </span>
              </div>
              <DrawerDescription className="mt-2 text-sm text-[hsl(var(--col-muted))] leading-relaxed">
                {species.description}
              </DrawerDescription>
            </DrawerHeader>

            {/* Stats grid */}
            {catalogEntry ? (
              <div className="grid grid-cols-3 gap-2.5 mb-5">
                <div className="collection-detail-stat">
                  <Star className="w-3.5 h-3.5 text-[hsl(var(--col-accent))] mb-1" />
                  <p className="text-sm font-black text-[hsl(var(--col-text))]">{catalogEntry.timesFound}</p>
                  <p className="text-[9px] font-semibold text-[hsl(var(--col-muted))] uppercase">Found</p>
                </div>
                <div className="collection-detail-stat">
                  <Clock className="w-3.5 h-3.5 text-[hsl(var(--col-accent))] mb-1" />
                  <p className="text-sm font-black text-[hsl(var(--col-text))]">
                    {sizesFound.length > 0 ? sizesFound[0] : '—'}
                  </p>
                  <p className="text-[9px] font-semibold text-[hsl(var(--col-muted))] uppercase">Best Size</p>
                </div>
                <div className="collection-detail-stat">
                  <Sparkles className="w-3.5 h-3.5 text-[hsl(var(--col-accent))] mb-1" />
                  <p className="text-sm font-black text-[hsl(var(--col-text))]">
                    {new Date(catalogEntry.firstFoundAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </p>
                  <p className="text-[9px] font-semibold text-[hsl(var(--col-muted))] uppercase">First Found</p>
                </div>
              </div>
            ) : (
              <div className="py-4 text-center mb-5">
                <p className="text-xs text-[hsl(var(--col-subtle))]">Not yet discovered. Keep focusing!</p>
              </div>
            )}

            {/* Wish button */}
            <button
              onClick={onWish}
              className={`w-full py-3 rounded-2xl text-sm font-bold transition-all active:scale-[0.98] ${
                isWished
                  ? 'bg-rose-50 text-rose-500 border border-rose-200'
                  : 'bg-[hsl(var(--col-accent-soft))] text-[hsl(var(--col-accent))] border border-[hsl(var(--col-border))]'
              }`}
            >
              <Heart className="w-4 h-4 inline mr-1.5 -mt-0.5" fill={isWished ? 'currentColor' : 'none'} />
              {isWished ? 'Remove Wish' : 'Add to Wishlist'}
            </button>
          </div>
        )}
      </DrawerContent>
    </Drawer>
  );
});
SpeciesDetailDrawer.displayName = 'SpeciesDetailDrawer';
