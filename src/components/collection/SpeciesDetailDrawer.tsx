import { memo } from 'react';
import { cn } from '@/lib/utils';
import { PixelIcon } from '@/components/ui/PixelIcon';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from '@/components/ui/drawer';
import { type PetSpecies, type GrowthSize, RARITY_GLOW, getSizeSpritePath } from '@/data/PetDatabase';
import type { SpeciesCatalogEntry } from '@/stores/landStore';
import { RARITY_LABEL, SIZE_LABEL, SIZE_ORDER, SIZE_DURATION_HINT } from './constants';

interface SpeciesDetailDrawerProps {
  species: PetSpecies | null;
  catalogEntry: SpeciesCatalogEntry | null;
  isWished: boolean;
  onWish: () => void;
  onClose: () => void;
}

const RARITY_BADGE_STYLE: Record<string, string> = {
  common: 'bg-[hsl(var(--muted)/0.15)] text-[hsl(var(--muted-foreground))]',
  uncommon: 'bg-emerald-100 text-emerald-700',
  rare: 'bg-sky-100 text-sky-700',
  epic: 'bg-violet-100 text-violet-700',
  legendary: 'bg-amber-100 text-amber-700',
};

export const SpeciesDetailDrawer = memo(({
  species, catalogEntry, isWished, onWish, onClose,
}: SpeciesDetailDrawerProps) => {
  const glow = species ? RARITY_GLOW[species.rarity] : null;
  const sizesFound = catalogEntry?.sizesFound ?? [];
  const variantCount = sizesFound.length;

  return (
    <Drawer open={!!species} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DrawerContent className="collection-detail-drawer">
        {species && (
          <div className="px-6 pb-8 pt-2">
            {/* Name + rarity badge */}
            <DrawerHeader className="p-0 mb-4 text-center">
              <DrawerTitle className="text-lg font-bold text-[hsl(var(--foreground))]">
                {species.name}
              </DrawerTitle>
              <div className="flex items-center justify-center gap-2 mt-1.5">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${RARITY_BADGE_STYLE[species.rarity] ?? ''}`}>
                  {RARITY_LABEL[species.rarity]}
                </span>
                <span className="text-[10px] font-semibold text-[hsl(var(--muted-foreground))]">
                  Lv.{species.unlockLevel}
                </span>
              </div>
              <DrawerDescription className="mt-2 text-sm text-[hsl(var(--muted-foreground))] leading-relaxed">
                {species.description}
              </DrawerDescription>
            </DrawerHeader>

            {/* 3 size variant panels */}
            <div className="collection-detail__sizes">
              {SIZE_ORDER.map((size) => {
                const collected = sizesFound.includes(size);
                return (
                  <div
                    key={size}
                    className={cn(
                      'collection-detail__size-panel',
                      collected ? 'collection-detail__size-panel--collected' : 'collection-detail__size-panel--locked',
                    )}
                  >
                    <img
                      src={getSizeSpritePath(species.id, size)}
                      alt={`${species.name} ${size}`}
                      className={cn(
                        'collection-detail__size-sprite',
                        !collected && 'collection-detail__size-sprite--locked',
                      )}
                      style={collected && glow ? { filter: `drop-shadow(0 0 6px ${glow})` } : undefined}
                      draggable={false}
                    />
                    <p className="text-[10px] font-bold text-[hsl(var(--foreground))]">
                      {SIZE_LABEL[size]}
                    </p>
                    <p className="text-[9px] text-[hsl(var(--muted-foreground))] mt-0.5">
                      {SIZE_DURATION_HINT[size]}
                    </p>
                    {collected ? (
                      <div className="mt-1.5 w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center">
                        <PixelIcon name="check" size={10} className="text-emerald-600" />
                      </div>
                    ) : (
                      <div className="mt-1.5 w-4 h-4 rounded-full bg-[hsl(var(--muted)/0.3)] flex items-center justify-center">
                        <PixelIcon name="lock" size={8} className="text-[hsl(var(--muted-foreground)/0.4)]" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Stats grid */}
            {catalogEntry ? (
              <div className="grid grid-cols-3 gap-2.5 mb-5">
                <div className="collection-detail-stat">
                  <PixelIcon name="star" size={14} className="mb-1" />
                  <p className="text-sm font-black text-[hsl(var(--foreground))]">{catalogEntry.timesFound}</p>
                  <p className="text-[9px] font-semibold text-[hsl(var(--muted-foreground))] uppercase">Found</p>
                </div>
                <div className="collection-detail-stat">
                  <PixelIcon name="sparkles" size={14} className="mb-1" />
                  <p className="text-sm font-black text-[hsl(var(--foreground))]">
                    {new Date(catalogEntry.firstFoundAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </p>
                  <p className="text-[9px] font-semibold text-[hsl(var(--muted-foreground))] uppercase">First Found</p>
                </div>
                <div className="collection-detail-stat">
                  <PixelIcon name="trophy" size={14} className="mb-1" />
                  <p className="text-sm font-black text-[hsl(var(--foreground))]">{variantCount}/3</p>
                  <p className="text-[9px] font-semibold text-[hsl(var(--muted-foreground))] uppercase">Variants</p>
                </div>
              </div>
            ) : (
              <div className="py-4 text-center mb-5">
                <p className="text-xs text-[hsl(var(--muted-foreground))]">Not yet discovered. Keep focusing!</p>
              </div>
            )}

            {/* Wish button */}
            <button
              onClick={onWish}
              className={`w-full py-3 rounded-2xl text-sm font-bold transition-all active:scale-[0.98] ${
                isWished
                  ? 'bg-rose-50 text-rose-500 border border-rose-200'
                  : 'bg-[hsl(var(--primary)/0.10)] text-[hsl(var(--primary))] border border-[hsl(var(--border))]'
              }`}
            >
              <PixelIcon name="heart" size={16} className={`inline mr-1.5 -mt-0.5 ${isWished ? 'opacity-100' : 'opacity-40'}`} />
              {isWished ? 'Remove Wish' : 'Add to Wishlist'}
            </button>
          </div>
        )}
      </DrawerContent>
    </Drawer>
  );
});
SpeciesDetailDrawer.displayName = 'SpeciesDetailDrawer';
