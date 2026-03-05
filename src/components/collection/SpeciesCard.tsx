import { memo } from 'react';
import { cn } from '@/lib/utils';
import { Lock, Heart } from 'lucide-react';
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
        <div className="h-12 flex items-center justify-center mb-1.5">
          <div className="w-10 h-10 rounded-xl bg-[hsl(var(--col-surface))] flex items-center justify-center">
            <Lock className="w-3.5 h-3.5 text-[hsl(var(--col-ghost))]" />
          </div>
        </div>
        <p className="text-[10px] font-semibold text-[hsl(var(--col-ghost))] text-center truncate w-full">???</p>
        <span className="mt-0.5 text-[8px] font-bold text-[hsl(var(--col-whisper))]">Lv.{species.unlockLevel}</span>
      </div>
    );
  }

  // Unlocked but undiscovered
  if (!discovered) {
    return (
      <div className="collection-card collection-card--undiscovered">
        <div className="h-12 flex items-center justify-center mb-1.5">
          <div className="w-10 h-10 rounded-xl bg-[hsl(var(--col-tint))] flex items-center justify-center">
            <span className="text-sm text-[hsl(var(--col-faint))] font-bold">?</span>
          </div>
        </div>
        <p className="text-[10px] font-semibold text-[hsl(var(--col-subtle))] text-center truncate w-full">{species.name}</p>
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
      {/* Wish heart */}
      <span
        role="button"
        tabIndex={0}
        onClick={(e) => { e.stopPropagation(); onWish(); }}
        onKeyDown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); onWish(); } }}
        className={cn(
          'absolute top-1.5 right-1.5 w-5 h-5 flex items-center justify-center rounded-full transition-all z-10',
          isWished ? 'text-rose-400 scale-110' : 'text-[hsl(var(--col-whisper))] hover:text-rose-300',
        )}
        aria-label={isWished ? 'Remove wish' : `Wish for ${species.name}`}
      >
        <Heart className="w-3 h-3" fill={isWished ? 'currentColor' : 'none'} />
      </span>

      <div className="h-12 flex items-center justify-center mb-1.5">
        <img
          src={species.imagePath}
          alt={species.name}
          className="w-10 h-10 object-contain"
          style={{ imageRendering: 'pixelated', filter: glow ? `drop-shadow(0 0 4px ${glow})` : undefined }}
          draggable={false}
        />
      </div>
      <p className="text-[10px] font-bold text-[hsl(var(--col-text))] text-center truncate w-full">{species.name}</p>
      {timesFound > 0 && (
        <div className="flex items-center gap-1 mt-0.5 text-[9px] font-semibold text-[hsl(var(--col-muted))]">
          <span>{timesFound}x</span>
          {bestSize && <><span className="text-[hsl(var(--col-whisper))]">/</span><span>{SIZE_LABEL[bestSize] ?? bestSize}</span></>}
        </div>
      )}
    </button>
  );
});
SpeciesCard.displayName = 'SpeciesCard';
