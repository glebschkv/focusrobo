/**
 * BotCollectionGrid Component
 *
 * Temporarily replaced with a "Coming Soon" placeholder.
 * The full collection view will return in a future update.
 */

import { memo } from "react";

export const BotCollectionGrid = memo(() => {
  return (
    <div className="h-full flex flex-col items-center justify-center px-6">
      <div className="text-center space-y-3">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-stone-100 flex items-center justify-center">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-stone-400">
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-stone-800">Collection Coming Soon</h2>
        <p className="text-sm text-stone-500 max-w-[260px] mx-auto">
          Your village characters and collectibles will appear here in a future update.
        </p>
      </div>
    </div>
  );
});

BotCollectionGrid.displayName = 'BotCollectionGrid';

/** @deprecated Use BotCollectionGrid instead */
export const PetCollectionGrid = BotCollectionGrid;
export const AnimalCollection = BotCollectionGrid;
