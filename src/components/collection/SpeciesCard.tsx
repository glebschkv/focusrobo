import { memo } from 'react';
import { cn } from '@/lib/utils';
import { PixelIcon } from '@/components/ui/PixelIcon';
import { type PetSpecies, RARITY_GLOW } from '@/data/PetDatabase';
import { RARITY_ACCENT, SIZE_LABEL } from './constants';

interface SpeciesCardProps {
  species: PetSpecies;
  discovered: boolean;
  timesFound: number;
  bestSize: string | null;
  locked: boolean;
  isWished: boolean;
  onWish: () => void;
  onTap: () => void;
}

export const SpeciesCard = memo(({
  species, discovered, timesFound, bestSize, locked, isWished, onWish, onTap,
}: SpeciesCardProps) => {
  const glow = RARITY_GLOW[species.rarity];
  const accent = RARITY_ACCENT[species.rarity];

  // Locked & undiscovered
  if (!discovered && locked) {
    return (
      <div className="collection-card collection-card--locked">
        <div className="h-14 flex items-center justify-center mb-1">
          <div className="w-12 h-12 rounded-2xl bg-[hsl(var(--muted)/0.4)] flex items-center justify-center">
            <PixelIcon name="lock" size={16} className="opacity-50" />
          </div>
        </div>
        <p className="text-[11px] font-semibold text-[hsl(var(--muted-foreground)/0.5)] text-center truncate w-full">???</p>
        <span className="mt-0.5 text-[9px] font-bold text-[hsl(var(--muted-foreground)/0.4)]">Lv.{species.unlockLevel}</span>
      </div>
    );
  }

  // Unlocked but undiscovered
  if (!discovered) {
    return (
      <div className="collection-card collection-card--undiscovered">
        <div className="h-14 flex items-center justify-center mb-1">
          <div className="w-12 h-12 rounded-2xl bg-[hsl(var(--muted)/0.3)] flex items-center justify-center">
            <span className="text-base text-[hsl(var(--muted-foreground)/0.4)] font-bold">?</span>
          </div>
        </div>
        <p className="text-[11px] font-semibold text-[hsl(var(--muted-foreground))] text-center truncate w-full">{species.name}</p>
      </div>
    );
  }

  // Discovered
  return (
    <button
      type="button"
      onClick={onTap}
      className={cn('collection-card collection-card--discovered', accent.cardBg, accent.cardBorder)}
    >
      {/* Rarity pip */}
      <div className={cn('absolute top-2 left-2 w-2 h-2 rounded-full', accent.dot)} />

      {/* Wish heart */}
      <span
        role="button"
        tabIndex={0}
        onClick={(e) => { e.stopPropagation(); onWish(); }}
        onKeyDown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); onWish(); } }}
        className={cn(
          'absolute top-1.5 right-1.5 w-6 h-6 flex items-center justify-center rounded-full transition-all z-10',
          isWished ? 'text-rose-400 scale-110' : 'text-[hsl(var(--muted-foreground)/0.3)] hover:text-rose-300',
        )}
        aria-label={isWished ? 'Remove wish' : `Wish for ${species.name}`}
      >
        <PixelIcon name="heart" size={14} className={isWished ? 'opacity-100' : 'opacity-40'} />
      </span>

      <div className="h-14 flex items-center justify-center mb-1">
        <img
          src={species.imagePath}
          alt={species.name}
          className="w-14 h-14 object-contain"
          style={{ imageRendering: 'pixelated', filter: glow ? `drop-shadow(0 0 4px ${glow})` : undefined }}
          draggable={false}
        />
      </div>
      <p className="text-[11px] font-bold text-[hsl(var(--foreground))] text-center truncate w-full">{species.name}</p>
      {timesFound > 0 && (
        <div className="flex items-center gap-1 mt-0.5 text-[9px] font-semibold text-[hsl(var(--muted-foreground))]">
          <span>{timesFound}x</span>
          {bestSize && <><span className="text-[hsl(var(--border))]">/</span><span>{SIZE_LABEL[bestSize] ?? bestSize}</span></>}
        </div>
      )}
    </button>
  );
});
SpeciesCard.displayName = 'SpeciesCard';
