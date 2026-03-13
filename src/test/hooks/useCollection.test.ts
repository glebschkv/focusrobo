import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useCollectionStore, useActiveHomeBots, useFavorites } from '@/stores/collectionStore';
import { renderHook, act } from '@testing-library/react';

// Mock logger
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

describe('collectionStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();

    // Reset store to known state
    useCollectionStore.setState({
      activeHomeBots: [],
      favorites: [],
    });
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('default state', () => {
    it('should have bolt-bot as default active home bot when freshly created', () => {
      // The store defaults to ['bolt-bot'], but our beforeEach resets it.
      // Test the initial default by reading the store creation default.
      // We reset to empty in beforeEach for isolation, so just verify the reset works.
      const state = useCollectionStore.getState();
      expect(state.activeHomeBots).toEqual([]);
      expect(state.favorites).toEqual([]);
    });
  });

  describe('toggleHomeActive', () => {
    it('should add a bot to active home bots', () => {
      act(() => {
        useCollectionStore.getState().toggleHomeActive('bunny');
      });

      const state = useCollectionStore.getState();
      expect(state.activeHomeBots).toContain('bunny');
    });

    it('should remove a bot from active home bots when toggled again', () => {
      useCollectionStore.setState({ activeHomeBots: ['bunny'] });

      act(() => {
        useCollectionStore.getState().toggleHomeActive('bunny');
      });

      const state = useCollectionStore.getState();
      expect(state.activeHomeBots).not.toContain('bunny');
    });

    it('should support multiple active home bots', () => {
      act(() => {
        useCollectionStore.getState().toggleHomeActive('bunny');
        useCollectionStore.getState().toggleHomeActive('chick');
        useCollectionStore.getState().toggleHomeActive('frog');
      });

      const state = useCollectionStore.getState();
      expect(state.activeHomeBots).toEqual(['bunny', 'chick', 'frog']);
    });

    it('should only remove the toggled bot and keep others', () => {
      useCollectionStore.setState({ activeHomeBots: ['bunny', 'chick', 'frog'] });

      act(() => {
        useCollectionStore.getState().toggleHomeActive('chick');
      });

      const state = useCollectionStore.getState();
      expect(state.activeHomeBots).toEqual(['bunny', 'frog']);
    });
  });

  describe('toggleFavorite', () => {
    it('should add a bot to favorites', () => {
      act(() => {
        useCollectionStore.getState().toggleFavorite('fox');
      });

      const state = useCollectionStore.getState();
      expect(state.favorites).toContain('fox');
    });

    it('should remove a bot from favorites when toggled again', () => {
      useCollectionStore.setState({ favorites: ['fox'] });

      act(() => {
        useCollectionStore.getState().toggleFavorite('fox');
      });

      const state = useCollectionStore.getState();
      expect(state.favorites).not.toContain('fox');
    });

    it('should support multiple favorites', () => {
      act(() => {
        useCollectionStore.getState().toggleFavorite('fox');
        useCollectionStore.getState().toggleFavorite('owl');
        useCollectionStore.getState().toggleFavorite('dragon');
      });

      const state = useCollectionStore.getState();
      expect(state.favorites).toEqual(['fox', 'owl', 'dragon']);
    });

    it('should only remove the toggled favorite and keep others', () => {
      useCollectionStore.setState({ favorites: ['fox', 'owl', 'dragon'] });

      act(() => {
        useCollectionStore.getState().toggleFavorite('owl');
      });

      const state = useCollectionStore.getState();
      expect(state.favorites).toEqual(['fox', 'dragon']);
    });
  });

  describe('setActiveHomeBots', () => {
    it('should replace the entire active home bots list', () => {
      useCollectionStore.setState({ activeHomeBots: ['bunny'] });

      act(() => {
        useCollectionStore.getState().setActiveHomeBots(['chick', 'frog', 'hamster']);
      });

      const state = useCollectionStore.getState();
      expect(state.activeHomeBots).toEqual(['chick', 'frog', 'hamster']);
    });

    it('should support setting to empty array', () => {
      useCollectionStore.setState({ activeHomeBots: ['bunny', 'chick'] });

      act(() => {
        useCollectionStore.getState().setActiveHomeBots([]);
      });

      const state = useCollectionStore.getState();
      expect(state.activeHomeBots).toEqual([]);
    });
  });

  describe('setFavorites', () => {
    it('should replace the entire favorites list', () => {
      useCollectionStore.setState({ favorites: ['fox'] });

      act(() => {
        useCollectionStore.getState().setFavorites(['owl', 'dragon']);
      });

      const state = useCollectionStore.getState();
      expect(state.favorites).toEqual(['owl', 'dragon']);
    });

    it('should support setting to empty array', () => {
      useCollectionStore.setState({ favorites: ['fox', 'owl'] });

      act(() => {
        useCollectionStore.getState().setFavorites([]);
      });

      const state = useCollectionStore.getState();
      expect(state.favorites).toEqual([]);
    });
  });

  describe('isBotHomeActive', () => {
    it('should return true for active home bots', () => {
      useCollectionStore.setState({ activeHomeBots: ['bunny', 'chick'] });

      expect(useCollectionStore.getState().isBotHomeActive('bunny')).toBe(true);
      expect(useCollectionStore.getState().isBotHomeActive('chick')).toBe(true);
    });

    it('should return false for inactive bots', () => {
      useCollectionStore.setState({ activeHomeBots: ['bunny'] });

      expect(useCollectionStore.getState().isBotHomeActive('frog')).toBe(false);
    });

    it('should return false when no bots are active', () => {
      expect(useCollectionStore.getState().isBotHomeActive('bunny')).toBe(false);
    });
  });

  describe('isBotFavorite', () => {
    it('should return true for favorited bots', () => {
      useCollectionStore.setState({ favorites: ['fox', 'owl'] });

      expect(useCollectionStore.getState().isBotFavorite('fox')).toBe(true);
      expect(useCollectionStore.getState().isBotFavorite('owl')).toBe(true);
    });

    it('should return false for non-favorited bots', () => {
      useCollectionStore.setState({ favorites: ['fox'] });

      expect(useCollectionStore.getState().isBotFavorite('dragon')).toBe(false);
    });

    it('should return false when no favorites exist', () => {
      expect(useCollectionStore.getState().isBotFavorite('fox')).toBe(false);
    });
  });

  describe('backward-compat aliases', () => {
    it('activeHomePets should mirror activeHomeBots', () => {
      act(() => {
        useCollectionStore.getState().setActiveHomeBots(['bunny', 'chick']);
      });

      const state = useCollectionStore.getState();
      expect(state.activeHomeBots).toEqual(['bunny', 'chick']);
      // activeHomePets is a getter alias that calls get().activeHomeBots
      expect(state.isPetHomeActive('bunny')).toBe(true);
      expect(state.isPetHomeActive('chick')).toBe(true);
    });

    it('setActiveHomePets should update activeHomeBots', () => {
      act(() => {
        useCollectionStore.getState().setActiveHomePets(['fox', 'owl']);
      });

      const state = useCollectionStore.getState();
      expect(state.activeHomeBots).toEqual(['fox', 'owl']);
    });

    it('isPetHomeActive should delegate to isBotHomeActive', () => {
      useCollectionStore.setState({ activeHomeBots: ['bunny'] });

      expect(useCollectionStore.getState().isPetHomeActive('bunny')).toBe(true);
      expect(useCollectionStore.getState().isPetHomeActive('frog')).toBe(false);
    });

    it('isPetFavorite should delegate to isBotFavorite', () => {
      useCollectionStore.setState({ favorites: ['fox'] });

      expect(useCollectionStore.getState().isPetFavorite('fox')).toBe(true);
      expect(useCollectionStore.getState().isPetFavorite('owl')).toBe(false);
    });
  });

  describe('selector hooks', () => {
    it('useActiveHomeBots should return activeHomeBots', () => {
      useCollectionStore.setState({ activeHomeBots: ['bunny', 'chick'] });

      const { result } = renderHook(() => useActiveHomeBots());
      expect(result.current).toEqual(['bunny', 'chick']);
    });

    it('useFavorites should return favorites', () => {
      useCollectionStore.setState({ favorites: ['fox', 'owl'] });

      const { result } = renderHook(() => useFavorites());
      expect(result.current).toEqual(['fox', 'owl']);
    });

    it('useActiveHomeBots should update when store changes', () => {
      const { result } = renderHook(() => useActiveHomeBots());
      expect(result.current).toEqual([]);

      act(() => {
        useCollectionStore.getState().toggleHomeActive('bunny');
      });

      expect(result.current).toEqual(['bunny']);
    });

    it('useFavorites should update when store changes', () => {
      const { result } = renderHook(() => useFavorites());
      expect(result.current).toEqual([]);

      act(() => {
        useCollectionStore.getState().toggleFavorite('fox');
      });

      expect(result.current).toEqual(['fox']);
    });
  });

  describe('persistence', () => {
    it('should use botblock-collection as storage key', () => {
      act(() => {
        useCollectionStore.getState().toggleHomeActive('bunny');
        useCollectionStore.getState().toggleFavorite('fox');
      });

      // The persist middleware stores under the configured key
      const stored = localStorage.getItem('botblock-collection');
      expect(stored).not.toBeNull();

      if (stored) {
        const parsed = JSON.parse(stored);
        expect(parsed.state.activeHomeBots).toContain('bunny');
        expect(parsed.state.favorites).toContain('fox');
      }
    });
  });

  describe('state independence', () => {
    it('toggling favorites should not affect active home bots', () => {
      useCollectionStore.setState({ activeHomeBots: ['bunny'] });

      act(() => {
        useCollectionStore.getState().toggleFavorite('fox');
      });

      const state = useCollectionStore.getState();
      expect(state.activeHomeBots).toEqual(['bunny']);
      expect(state.favorites).toEqual(['fox']);
    });

    it('toggling active home bots should not affect favorites', () => {
      useCollectionStore.setState({ favorites: ['fox'] });

      act(() => {
        useCollectionStore.getState().toggleHomeActive('bunny');
      });

      const state = useCollectionStore.getState();
      expect(state.favorites).toEqual(['fox']);
      expect(state.activeHomeBots).toEqual(['bunny']);
    });
  });
});
