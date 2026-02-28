import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { collectionLogger } from '@/lib/logger';

interface CollectionState {
  // Active bots shown on home screen
  activeHomeBots: string[];
  // Favorite bots
  favorites: string[];

  // Actions
  toggleHomeActive: (botId: string) => void;
  toggleFavorite: (botId: string) => void;
  setActiveHomeBots: (botIds: string[]) => void;
  setFavorites: (botIds: string[]) => void;

  // Selectors
  isBotHomeActive: (botId: string) => boolean;
  isBotFavorite: (botId: string) => boolean;

  // Backward-compat aliases
  activeHomePets: string[];
  setActiveHomePets: (botIds: string[]) => void;
  isPetHomeActive: (botId: string) => boolean;
  isPetFavorite: (botId: string) => boolean;
}

export const useCollectionStore = create<CollectionState>()(
  persist(
    (set, get) => ({
      activeHomeBots: ['bolt-bot'], // Default bot
      favorites: [],

      toggleHomeActive: (botId) => {
        const { activeHomeBots } = get();
        const newBots = activeHomeBots.includes(botId)
          ? activeHomeBots.filter(id => id !== botId)
          : [...activeHomeBots, botId];
        set({ activeHomeBots: newBots });
        collectionLogger.debug('Active home bots updated:', newBots);
      },

      toggleFavorite: (botId) => {
        const { favorites } = get();
        const newFavorites = favorites.includes(botId)
          ? favorites.filter(id => id !== botId)
          : [...favorites, botId];
        set({ favorites: newFavorites });
        collectionLogger.debug('Favorites updated:', newFavorites);
      },

      setActiveHomeBots: (botIds) => {
        set({ activeHomeBots: botIds });
        collectionLogger.debug('Active home bots set:', botIds);
      },

      setFavorites: (botIds) => {
        set({ favorites: botIds });
        collectionLogger.debug('Favorites set:', botIds);
      },

      // Selectors
      isBotHomeActive: (botId) => get().activeHomeBots.includes(botId),
      isBotFavorite: (botId) => get().favorites.includes(botId),

      // Backward-compat aliases
      get activeHomePets() { return get().activeHomeBots; },
      setActiveHomePets: (botIds) => {
        set({ activeHomeBots: botIds });
        collectionLogger.debug('Active home bots set:', botIds);
      },
      isPetHomeActive: (botId) => get().activeHomeBots.includes(botId),
      isPetFavorite: (botId) => get().favorites.includes(botId),
    }),
    {
      name: 'botblock-collection',
      // Migrate from old localStorage keys
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Try to migrate from old storage keys if store is empty
          if (state.activeHomeBots.length === 1 && state.activeHomeBots[0] === 'hare') {
            try {
              const oldActiveBots = localStorage.getItem('botblock-active-home-bots');
              if (oldActiveBots) {
                const parsed = JSON.parse(oldActiveBots);
                if (Array.isArray(parsed) && parsed.length > 0) {
                  state.activeHomeBots = parsed;
                }
              }
            } catch {
              // Ignore migration errors
            }
          }

          if (state.favorites.length === 0) {
            try {
              const oldFavorites = localStorage.getItem('botblock-favorites');
              if (oldFavorites) {
                const parsed = JSON.parse(oldFavorites);
                if (Array.isArray(parsed)) {
                  state.favorites = parsed;
                }
              }
            } catch {
              // Ignore migration errors
            }
          }

          collectionLogger.debug('Collection store rehydrated');
        }
      },
    }
  )
);

// Selector hooks for optimized re-renders
export const useActiveHomeBots = () => useCollectionStore((state) => state.activeHomeBots);
export const useFavorites = () => useCollectionStore((state) => state.favorites);

// Backward-compat alias
export const useActiveHomePets = useActiveHomeBots;
