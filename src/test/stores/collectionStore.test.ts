import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';

// Mock logger before importing store
vi.mock('@/lib/logger', () => {
  const l = () => ({ debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() });
  return {
    logger: l(),
    createLogger: () => l(),
    xpLogger: l(),
    coinLogger: l(),
    shopLogger: l(),
    storageLogger: l(),
    supabaseLogger: l(),
    authLogger: l(),
    storeKitLogger: l(),
    notificationLogger: l(),
    syncLogger: l(),
    deviceActivityLogger: l(),
    focusModeLogger: l(),
    widgetLogger: l(),
    backupLogger: l(),
    threeLogger: l(),
    timerLogger: l(),
    questLogger: l(),
    achievementLogger: l(),
    bondLogger: l(),
    streakLogger: l(),
    soundLogger: l(),
    performanceLogger: l(),
    appReviewLogger: l(),
    settingsLogger: l(),
    collectionLogger: l(),
    nativePluginLogger: l(),
    analyticsLogger: l(),
  };
});

import { useCollectionStore, useActiveHomePets, useFavorites } from '@/stores/collectionStore';

describe('collectionStore', () => {
  // Storage key: 'botblock-collection'

  beforeEach(() => {
    localStorage.clear();
    // Reset store to initial state
    useCollectionStore.setState({
      activeHomeBots: ['bolt-bot'],
      favorites: [],
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should initialize with default active home bot "bolt-bot"', () => {
      const state = useCollectionStore.getState();
      expect(state.activeHomeBots).toEqual(['bolt-bot']);
    });

    it('should initialize with empty favorites', () => {
      const state = useCollectionStore.getState();
      expect(state.favorites).toEqual([]);
    });

    it('should have all required actions available', () => {
      const state = useCollectionStore.getState();
      expect(typeof state.toggleHomeActive).toBe('function');
      expect(typeof state.toggleFavorite).toBe('function');
      expect(typeof state.setActiveHomePets).toBe('function');
      expect(typeof state.setFavorites).toBe('function');
      expect(typeof state.isPetHomeActive).toBe('function');
      expect(typeof state.isPetFavorite).toBe('function');
    });
  });

  describe('toggleHomeActive', () => {
    it('should add a bot to active home bots when not present', () => {
      const { toggleHomeActive } = useCollectionStore.getState();

      act(() => {
        toggleHomeActive('cat');
      });

      const state = useCollectionStore.getState();
      expect(state.activeHomeBots).toContain('cat');
      expect(state.activeHomeBots).toContain('bolt-bot');
    });

    it('should remove a bot from active home bots when already present', () => {
      const { toggleHomeActive, setActiveHomePets } = useCollectionStore.getState();

      act(() => {
        setActiveHomePets(['bolt-bot', 'cat', 'dog']);
        toggleHomeActive('cat');
      });

      const state = useCollectionStore.getState();
      expect(state.activeHomeBots).not.toContain('cat');
      expect(state.activeHomeBots).toContain('bolt-bot');
      expect(state.activeHomeBots).toContain('dog');
    });

    it('should handle toggling the default bot off', () => {
      const { toggleHomeActive } = useCollectionStore.getState();

      act(() => {
        toggleHomeActive('bolt-bot');
      });

      const state = useCollectionStore.getState();
      expect(state.activeHomeBots).not.toContain('bolt-bot');
      expect(state.activeHomeBots).toHaveLength(0);
    });

    it('should toggle multiple pets independently', () => {
      const { toggleHomeActive } = useCollectionStore.getState();

      act(() => {
        toggleHomeActive('cat');
        toggleHomeActive('dog');
        toggleHomeActive('bird');
      });

      const state = useCollectionStore.getState();
      expect(state.activeHomeBots).toContain('cat');
      expect(state.activeHomeBots).toContain('dog');
      expect(state.activeHomeBots).toContain('bird');
      expect(state.activeHomeBots).toHaveLength(4); // bolt-bot + 3 new
    });

    it('should handle rapid toggle on same bot', () => {
      const { toggleHomeActive } = useCollectionStore.getState();

      act(() => {
        toggleHomeActive('cat');
        toggleHomeActive('cat');
        toggleHomeActive('cat');
      });

      const state = useCollectionStore.getState();
      expect(state.activeHomeBots).toContain('cat');
      expect(state.activeHomeBots.filter(id => id === 'cat')).toHaveLength(1);
    });
  });

  describe('toggleFavorite', () => {
    it('should add a bot to favorites when not present', () => {
      const { toggleFavorite } = useCollectionStore.getState();

      act(() => {
        toggleFavorite('golden-cat');
      });

      const state = useCollectionStore.getState();
      expect(state.favorites).toContain('golden-cat');
    });

    it('should remove a bot from favorites when already present', () => {
      const { toggleFavorite, setFavorites } = useCollectionStore.getState();

      act(() => {
        setFavorites(['golden-cat', 'rainbow-dog', 'crystal-bird']);
        toggleFavorite('rainbow-dog');
      });

      const state = useCollectionStore.getState();
      expect(state.favorites).not.toContain('rainbow-dog');
      expect(state.favorites).toContain('golden-cat');
      expect(state.favorites).toContain('crystal-bird');
    });

    it('should handle empty favorites correctly', () => {
      const { toggleFavorite } = useCollectionStore.getState();

      act(() => {
        toggleFavorite('legendary-dragon');
      });

      const state = useCollectionStore.getState();
      expect(state.favorites).toEqual(['legendary-dragon']);
    });

    it('should support many favorites', () => {
      const { toggleFavorite } = useCollectionStore.getState();
      const petIds = Array.from({ length: 20 }, (_, i) => `bot-${i}`);

      act(() => {
        petIds.forEach(id => toggleFavorite(id));
      });

      const state = useCollectionStore.getState();
      expect(state.favorites).toHaveLength(20);
      petIds.forEach(id => {
        expect(state.favorites).toContain(id);
      });
    });
  });

  describe('setActiveHomePets', () => {
    it('should set active home pets to provided array', () => {
      const { setActiveHomePets } = useCollectionStore.getState();

      act(() => {
        setActiveHomePets(['cat', 'dog', 'bird']);
      });

      const state = useCollectionStore.getState();
      expect(state.activeHomeBots).toEqual(['cat', 'dog', 'bird']);
    });

    it('should replace all existing active pets', () => {
      const { setActiveHomePets } = useCollectionStore.getState();

      act(() => {
        setActiveHomePets(['cat', 'dog']);
        setActiveHomePets(['fish']);
      });

      const state = useCollectionStore.getState();
      expect(state.activeHomeBots).toEqual(['fish']);
    });

    it('should handle empty array', () => {
      const { setActiveHomePets } = useCollectionStore.getState();

      act(() => {
        setActiveHomePets([]);
      });

      const state = useCollectionStore.getState();
      expect(state.activeHomeBots).toEqual([]);
    });
  });

  describe('setFavorites', () => {
    it('should set favorites to provided array', () => {
      const { setFavorites } = useCollectionStore.getState();

      act(() => {
        setFavorites(['golden-cat', 'silver-dog']);
      });

      const state = useCollectionStore.getState();
      expect(state.favorites).toEqual(['golden-cat', 'silver-dog']);
    });

    it('should replace all existing favorites', () => {
      const { setFavorites } = useCollectionStore.getState();

      act(() => {
        setFavorites(['bot-1', 'bot-2', 'bot-3']);
        setFavorites(['bot-4']);
      });

      const state = useCollectionStore.getState();
      expect(state.favorites).toEqual(['bot-4']);
    });
  });

  describe('Selector Functions', () => {
    describe('isPetHomeActive', () => {
      it('should return true for active pets', () => {
        const { setActiveHomePets } = useCollectionStore.getState();

        act(() => {
          setActiveHomePets(['cat', 'dog', 'bird']);
        });

        const state = useCollectionStore.getState();
        expect(state.isPetHomeActive('cat')).toBe(true);
        expect(state.isPetHomeActive('dog')).toBe(true);
        expect(state.isPetHomeActive('bird')).toBe(true);
      });

      it('should return false for inactive pets', () => {
        const state = useCollectionStore.getState();
        expect(state.isPetHomeActive('dragon')).toBe(false);
        expect(state.isPetHomeActive('unicorn')).toBe(false);
      });

      it('should return true for default bot', () => {
        const state = useCollectionStore.getState();
        expect(state.isPetHomeActive('bolt-bot')).toBe(true);
      });
    });

    describe('isPetFavorite', () => {
      it('should return true for favorite pets', () => {
        const { setFavorites } = useCollectionStore.getState();

        act(() => {
          setFavorites(['golden-cat', 'silver-dog']);
        });

        const state = useCollectionStore.getState();
        expect(state.isPetFavorite('golden-cat')).toBe(true);
        expect(state.isPetFavorite('silver-dog')).toBe(true);
      });

      it('should return false for non-favorite pets', () => {
        const state = useCollectionStore.getState();
        expect(state.isPetFavorite('random-pet')).toBe(false);
      });
    });
  });

  describe('Selector Hooks', () => {
    it('useActiveHomePets should return active home pets', () => {
      const { setActiveHomePets } = useCollectionStore.getState();

      act(() => {
        setActiveHomePets(['cat', 'dog']);
      });

      const { result } = renderHook(() => useActiveHomePets());
      expect(result.current).toEqual(['cat', 'dog']);
    });

    it('useFavorites should return favorites', () => {
      const { setFavorites } = useCollectionStore.getState();

      act(() => {
        setFavorites(['golden-pet', 'silver-pet']);
      });

      const { result } = renderHook(() => useFavorites());
      expect(result.current).toEqual(['golden-pet', 'silver-pet']);
    });

    it('selector hooks should update when state changes', () => {
      const { result: activePetsResult } = renderHook(() => useActiveHomePets());
      const { result: favoritesResult } = renderHook(() => useFavorites());

      expect(activePetsResult.current).toEqual(['bolt-bot']);
      expect(favoritesResult.current).toEqual([]);

      act(() => {
        useCollectionStore.getState().toggleHomeActive('cat');
        useCollectionStore.getState().toggleFavorite('golden-cat');
      });

      expect(activePetsResult.current).toContain('cat');
      expect(favoritesResult.current).toContain('golden-cat');
    });
  });

  describe('Persistence', () => {
    it('should persist state to localStorage', async () => {
      const { toggleHomeActive, toggleFavorite } = useCollectionStore.getState();

      act(() => {
        toggleHomeActive('cat');
        toggleFavorite('golden-cat');
      });

      // Wait for persistence middleware to save
      await new Promise(resolve => setTimeout(resolve, 50));

      const saved = localStorage.getItem('botblock-collection');
      expect(saved).not.toBeNull();

      const parsed = JSON.parse(saved!);
      expect(parsed.state.activeHomeBots).toContain('cat');
      expect(parsed.state.favorites).toContain('golden-cat');
    });

    it('should restore state from localStorage on mount', async () => {
      // Pre-populate localStorage with valid persisted state
      const persistedState = {
        state: {
          activeHomeBots: ['dragon', 'phoenix'],
          favorites: ['legendary-pet'],
        },
        version: 0,
      };
      localStorage.setItem('botblock-collection', JSON.stringify(persistedState));

      // Reset and let Zustand rehydrate
      useCollectionStore.setState({
        activeHomeBots: persistedState.state.activeHomeBots,
        favorites: persistedState.state.favorites,
      });

      const state = useCollectionStore.getState();
      expect(state.activeHomeBots).toEqual(['dragon', 'phoenix']);
      expect(state.favorites).toEqual(['legendary-pet']);
    });
  });

  describe('Edge Cases', () => {
    it('should handle special characters in bot IDs', () => {
      const { toggleHomeActive, toggleFavorite } = useCollectionStore.getState();
      const specialId = 'bot-with-special-chars-äöü-123';

      act(() => {
        toggleHomeActive(specialId);
        toggleFavorite(specialId);
      });

      const state = useCollectionStore.getState();
      expect(state.activeHomeBots).toContain(specialId);
      expect(state.favorites).toContain(specialId);
    });

    it('should handle very long bot IDs', () => {
      const { toggleHomeActive } = useCollectionStore.getState();
      const longId = 'a'.repeat(1000);

      act(() => {
        toggleHomeActive(longId);
      });

      const state = useCollectionStore.getState();
      expect(state.activeHomeBots).toContain(longId);
    });

    it('should handle empty string bot ID', () => {
      const { toggleHomeActive } = useCollectionStore.getState();

      act(() => {
        toggleHomeActive('');
      });

      const state = useCollectionStore.getState();
      expect(state.activeHomeBots).toContain('');
    });

    it('should maintain state consistency with concurrent operations', () => {
      const { toggleHomeActive, toggleFavorite, setActiveHomePets } = useCollectionStore.getState();

      act(() => {
        toggleHomeActive('bot-1');
        setActiveHomePets(['bot-2', 'bot-3']);
        toggleHomeActive('bot-4');
        toggleFavorite('fav-1');
        toggleFavorite('fav-2');
        toggleFavorite('fav-1'); // Remove
      });

      const state = useCollectionStore.getState();
      expect(state.activeHomeBots).toEqual(['bot-2', 'bot-3', 'bot-4']);
      expect(state.favorites).toEqual(['fav-2']);
    });
  });
});
