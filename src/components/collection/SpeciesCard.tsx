import { memo } from 'react';
import { cn } from '@/lib/utils';
import { PixelIcon } from '@/components/ui/PixelIcon';
import { type PetSpecies, type GrowthSize, RARITY_GLOW, getSizeSpritePath } from '@/data/PetDatabase';
import { RARITY_ACCENT, SIZE_ORDER } from './constants';

interface SpeciesCardProps {
  species: PetSpecies;
  discovered: boolean;
  timesFound: number;
  sizesFound: GrowthSize[];
  locked: boolean;
  isWished: boolean;
  onWish: () => void;
  onTap: () => void;
}

const SPRITE_SIZE_CLASS: Record<string, string> = {
  baby: 'collection-card__size-sprite--baby',
  adolescent: 'collection-card__size-sprite--adolescent',
};

export const SpeciesCard = memo(({
  species, discovered, timesFound, sizesFound, locked, isWished, onWish, onTap,
}: SpeciesCardProps) => {
  const glow = RARITY_GLOW[species.rarity];
  const accent = RARITY_ACCENT[species.rarity];
  const isComplete = sizesFound.length === 3;

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

  // Discovered — show 3 size variants
  return (
    <button
      type="button"
      onClick={onTap}
      className={cn(
        'collection-card collection-card--discovered',
        accent.cardBg,
        accent.cardBorder,
        isComplete && 'collection-card--complete',
      )}
    >
      {/* Top-left: rarity pip or completion check */}
      {isComplete ? (
        <div className="absolute top-2 left-2 w-3.5 h-3.5 rounded-full bg-amber-400/80 flex items-center justify-center">
          <PixelIcon name="check" size={8} className="text-white" />
        </div>
      ) : (
        <div className={cn('absolute top-2 left-2 w-2 h-2 rounded-full', accent.dot)} />
      )}

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

      {/* 3 size variant sprites */}
      <div className="collection-card__sizes">
        {SIZE_ORDER.map((size) => {
          const collected = sizesFound.includes(size);
          return (
            <img
              key={size}
              src={getSizeSpritePath(species.id, size)}
              alt={`${species.name} ${size}`}
              className={cn(
                'collection-card__size-sprite',
                SPRITE_SIZE_CLASS[size],
                !collected && 'collection-card__size-sprite--locked',
              )}
              style={collected && glow ? { filter: `drop-shadow(0 0 3px ${glow})` } : undefined}
              draggable={false}
              loading="lazy"
            />
          );
        })}
      </div>

      {/* Name */}
      <p className="text-[11px] font-bold text-[hsl(var(--foreground))] text-center truncate w-full">{species.name}</p>

      {/* Dots + count */}
      {timesFound > 0 && (
        <div className={cn('collection-card__meta text-[9px] font-semibold', accent.label)}>
          <div className="collection-card__dots">
            {SIZE_ORDER.map((size) => (
              <span
                key={size}
                className={cn(
                  'collection-card__dot',
                  sizesFound.includes(size) ? 'collection-card__dot--filled' : 'collection-card__dot--empty',
                )}
              />
            ))}
          </div>
          <span className="text-[hsl(var(--muted-foreground))]">{timesFound}x</span>
        </div>
      )}
    </button>
  );
});
SpeciesCard.displayName = 'SpeciesCard';
