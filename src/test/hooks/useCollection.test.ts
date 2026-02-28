import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useCollection } from '@/hooks/useCollection';
import { useCollectionStore, useShopStore } from '@/stores';

// Mock the dependencies - useXPSystem now handles both local and backend sync internally
vi.mock('@/hooks/useXPSystem', () => ({
  useXPSystem: () => ({
    currentLevel: 1,
    unlockedRobots: ['Dewdrop Frog'],
    currentZone: 'forest',
    availableZones: ['forest'],
    isLoading: false,
    totalStudyMinutes: 0,
  }),
}));

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

// Mock RobotDatabase
vi.mock('@/data/RobotDatabase', () => ({
  ROBOT_DATABASE: [
    {
      id: 'dewdrop-frog',
      name: 'Dewdrop Frog',
      rarity: 'common',
      zone: 'Biotech Zone',
      unlockLevel: 1,
      isExclusive: false,
      imageConfig: { imagePath: 'sprite.png' },
    },
    {
      id: 'moss-turtle',
      name: 'Moss Turtle',
      rarity: 'common',
      zone: 'Biotech Zone',
      unlockLevel: 2,
      isExclusive: false,
      imageConfig: { imagePath: 'sprite.png' },
    },
    {
      id: 'golden-phoenix',
      name: 'Golden Phoenix',
      rarity: 'legendary',
      zone: 'Solar Fields',
      unlockLevel: 99,
      isExclusive: true,
      coinPrice: 5000,
      imageConfig: { imagePath: 'sprite.png' },
    },
    {
      id: 'crystal-dragon',
      name: 'Crystal Dragon',
      rarity: 'epic',
      zone: 'Cyber District',
      unlockLevel: 20,
      isExclusive: false,
      imageConfig: { imagePath: 'sprite.png' },
    },
  ],
  getRobotById: vi.fn((id: string) => {
    const animals = [
      { id: 'dewdrop-frog', name: 'Dewdrop Frog', rarity: 'common', zone: 'Biotech Zone', unlockLevel: 1, isExclusive: false, imageConfig: { imagePath: 'sprite.png' } },
      { id: 'moss-turtle', name: 'Moss Turtle', rarity: 'common', zone: 'Biotech Zone', unlockLevel: 2, isExclusive: false, imageConfig: { imagePath: 'sprite.png' } },
      { id: 'golden-phoenix', name: 'Golden Phoenix', rarity: 'legendary', zone: 'Solar Fields', unlockLevel: 99, isExclusive: true, coinPrice: 5000, imageConfig: { imagePath: 'sprite.png' } },
      { id: 'crystal-dragon', name: 'Crystal Dragon', rarity: 'epic', zone: 'Cyber District', unlockLevel: 20, isExclusive: false, imageConfig: { imagePath: 'sprite.png' } },
    ];
    return animals.find(a => a.id === id);
  }),
  getUnlockableRobots: vi.fn((level: number) => {
    const animals = [
      { id: 'dewdrop-frog', name: 'Dewdrop Frog', rarity: 'common', zone: 'Biotech Zone', unlockLevel: 1, isExclusive: false },
      { id: 'moss-turtle', name: 'Moss Turtle', rarity: 'common', zone: 'Biotech Zone', unlockLevel: 2, isExclusive: false },
      { id: 'crystal-dragon', name: 'Crystal Dragon', rarity: 'epic', zone: 'Cyber District', unlockLevel: 20, isExclusive: false },
    ];
    return animals.filter(a => a.unlockLevel <= level);
  }),
  getRobotsByZone: vi.fn((biome: string) => {
    const animals = [
      { id: 'dewdrop-frog', name: 'Dewdrop Frog', rarity: 'common', zone: 'Biotech Zone', unlockLevel: 1 },
      { id: 'moss-turtle', name: 'Moss Turtle', rarity: 'common', zone: 'Biotech Zone', unlockLevel: 2 },
    ];
    return animals.filter(a => a.zone === zone);
  }),
  getXPUnlockableRobots: vi.fn(() => [
    { id: 'dewdrop-frog', name: 'Dewdrop Frog', rarity: 'common' },
    { id: 'moss-turtle', name: 'Moss Turtle', rarity: 'common' },
    { id: 'crystal-dragon', name: 'Crystal Dragon', rarity: 'epic' },
  ]),
  isStudyHoursRobot: vi.fn((animal: { requiredStudyHours?: number }) => {
    return animal.requiredStudyHours !== undefined && animal.requiredStudyHours > 0;
  }),
  getStudyHoursRobots: vi.fn(() => []),
}));

describe('useCollection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();

    // Reset Zustand stores to known state
    useCollectionStore.setState({
      activeHomeBots: [],
      favorites: [],
    });
    useShopStore.setState({
      ownedCharacters: [],
      ownedBackgrounds: [],
      equippedBackground: null,
    });
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('initialization', () => {
    it('should return all animals from database', () => {
      const { result } = renderHook(() => useCollection());

      expect(result.current.allAnimals).toBeDefined();
      expect(result.current.allAnimals.length).toBeGreaterThan(0);
    });

    it('should load favorites from store', async () => {
      // Set up store state
      useCollectionStore.setState({ favorites: ['dewdrop-frog'] });

      const { result } = renderHook(() => useCollection());

      await waitFor(() => {
        expect(result.current.favorites.has('dewdrop-frog')).toBe(true);
      });
    });

    it('should load active home pets from store', async () => {
      // Set up store state
      useCollectionStore.setState({ activeHomeBots: ['moss-turtle'] });

      const { result } = renderHook(() => useCollection());

      await waitFor(() => {
        expect(result.current.activeHomeBots.has('moss-turtle')).toBe(true);
      });
    });

    it('should have empty active pets when nothing in store', async () => {
      const { result } = renderHook(() => useCollection());

      await waitFor(() => {
        // Store is reset to empty in beforeEach
        expect(result.current.activeHomeBots.size).toBe(0);
      });
    });

    it('should handle empty store gracefully', () => {
      // Store is already reset to empty in beforeEach
      const { result } = renderHook(() => useCollection());

      expect(result.current.favorites.size).toBe(0);
    });
  });

  describe('toggleFavorite', () => {
    it('should add bot to favorites', async () => {
      const { result } = renderHook(() => useCollection());

      await waitFor(() => {
        expect(result.current.favorites.size).toBe(0);
      });

      act(() => {
        result.current.toggleFavorite('dewdrop-frog');
      });

      await waitFor(() => {
        expect(result.current.favorites.has('dewdrop-frog')).toBe(true);
      });
    });

    it('should remove bot from favorites', async () => {
      // Set up store state with a favorite
      useCollectionStore.setState({ favorites: ['dewdrop-frog'] });

      const { result } = renderHook(() => useCollection());

      await waitFor(() => {
        expect(result.current.favorites.has('dewdrop-frog')).toBe(true);
      });

      act(() => {
        result.current.toggleFavorite('dewdrop-frog');
      });

      await waitFor(() => {
        expect(result.current.favorites.has('dewdrop-frog')).toBe(false);
      });
    });

    it('should persist favorites to store', async () => {
      const { result } = renderHook(() => useCollection());

      act(() => {
        result.current.toggleFavorite('moss-turtle');
      });

      await waitFor(() => {
        // Check the Zustand store state
        const storeState = useCollectionStore.getState();
        expect(storeState.favorites).toContain('moss-turtle');
      });
    });
  });

  describe('toggleHomeActive', () => {
    it('should add bot to active home bots', async () => {
      // Store is already reset to empty in beforeEach

      const { result } = renderHook(() => useCollection());

      await waitFor(() => {
        expect(result.current.activeHomeBots.size).toBe(0);
      });

      act(() => {
        result.current.toggleHomeActive('dewdrop-frog');
      });

      await waitFor(() => {
        expect(result.current.activeHomeBots.has('dewdrop-frog')).toBe(true);
      });
    });

    it('should remove bot from active home bots', async () => {
      // Set up store state
      useCollectionStore.setState({ activeHomeBots: ['dewdrop-frog'] });

      const { result } = renderHook(() => useCollection());

      await waitFor(() => {
        expect(result.current.activeHomeBots.has('dewdrop-frog')).toBe(true);
      });

      act(() => {
        result.current.toggleHomeActive('dewdrop-frog');
      });

      await waitFor(() => {
        expect(result.current.activeHomeBots.has('dewdrop-frog')).toBe(false);
      });
    });

    it('should update store when home pets change', async () => {
      const { result } = renderHook(() => useCollection());

      act(() => {
        result.current.toggleHomeActive('moss-turtle');
      });

      await waitFor(() => {
        // Verify store was updated
        const storeState = useCollectionStore.getState();
        expect(storeState.activeHomeBots).toContain('moss-turtle');
      });
    });
  });

  describe('isAnimalUnlocked', () => {
    it('should return true for level-unlocked animals', () => {
      const { result } = renderHook(() => useCollection());

      // Level 1 bot should be unlocked
      expect(result.current.isAnimalUnlocked('dewdrop-frog')).toBe(true);
    });

    it('should return false for high-level animals', () => {
      const { result } = renderHook(() => useCollection());

      // Level 20 bot should not be unlocked at level 1
      expect(result.current.isAnimalUnlocked('crystal-dragon')).toBe(false);
    });

    it('should return true for purchased shop animals', async () => {
      // Set up shop store with owned character
      useShopStore.setState({ ownedCharacters: ['golden-phoenix'] });

      const { result } = renderHook(() => useCollection());

      await waitFor(() => {
        expect(result.current.isAnimalUnlocked('golden-phoenix')).toBe(true);
      });
    });

    it('should return false for non-existent animals', () => {
      const { result } = renderHook(() => useCollection());

      expect(result.current.isAnimalUnlocked('non-existent')).toBe(false);
    });
  });

  describe('isAnimalFavorite', () => {
    it('should return true for favorited animals', async () => {
      // Set up store with favorite
      useCollectionStore.setState({ favorites: ['dewdrop-frog'] });

      const { result } = renderHook(() => useCollection());

      await waitFor(() => {
        expect(result.current.isAnimalFavorite('dewdrop-frog')).toBe(true);
      });
    });

    it('should return false for non-favorited animals', () => {
      // Store is reset to empty in beforeEach
      const { result } = renderHook(() => useCollection());

      expect(result.current.isAnimalFavorite('moss-turtle')).toBe(false);
    });
  });

  describe('isAnimalHomeActive', () => {
    it('should return true for active home pets', async () => {
      // Set up store with active bot
      useCollectionStore.setState({ activeHomeBots: ['moss-turtle'] });

      const { result } = renderHook(() => useCollection());

      await waitFor(() => {
        expect(result.current.isAnimalHomeActive('moss-turtle')).toBe(true);
      });
    });

    it('should return false for non-active pets', async () => {
      // Set up store with a different bot
      useCollectionStore.setState({ activeHomeBots: ['dewdrop-frog'] });

      const { result } = renderHook(() => useCollection());

      await waitFor(() => {
        expect(result.current.isAnimalHomeActive('moss-turtle')).toBe(false);
      });
    });
  });

  describe('isShopExclusive', () => {
    it('should return true for shop-exclusive animals', () => {
      const { result } = renderHook(() => useCollection());

      expect(result.current.isShopExclusive('golden-phoenix')).toBe(true);
    });

    it('should return false for non-exclusive animals', () => {
      const { result } = renderHook(() => useCollection());

      expect(result.current.isShopExclusive('dewdrop-frog')).toBe(false);
    });
  });

  describe('getRobotData', () => {
    it('should return robot data by id', () => {
      const { result } = renderHook(() => useCollection());

      const animal = result.current.getRobotData('dewdrop-frog');
      expect(animal).toBeDefined();
      expect(animal?.name).toBe('Dewdrop Frog');
    });

    it('should return undefined for non-existent robot', () => {
      const { result } = renderHook(() => useCollection());

      const animal = result.current.getRobotData('non-existent');
      expect(animal).toBeUndefined();
    });
  });

  describe('getActiveHomePetsData', () => {
    it('should return only unlocked active pets', async () => {
      // Set up store with mixed pets (one unlocked, one locked by level)
      useCollectionStore.setState({ activeHomeBots: ['dewdrop-frog', 'crystal-dragon'] });

      const { result } = renderHook(() => useCollection());

      await waitFor(() => {
        const activePets = result.current.getActiveHomePetsData();
        // Only dewdrop-frog should be included (crystal-dragon is level 20)
        expect(activePets.length).toBe(1);
        expect(activePets[0].id).toBe('dewdrop-frog');
      });
    });

    it('should include purchased shop animals', async () => {
      // Set up both stores
      useCollectionStore.setState({ activeHomeBots: ['golden-phoenix'] });
      useShopStore.setState({ ownedCharacters: ['golden-phoenix'] });

      const { result } = renderHook(() => useCollection());

      await waitFor(() => {
        const activePets = result.current.getActiveHomePetsData();
        expect(activePets.some(p => p.id === 'golden-phoenix')).toBe(true);
      });
    });
  });

  describe('filterAnimals', () => {
    it('should filter by search query', () => {
      const { result } = renderHook(() => useCollection());

      const filtered = result.current.filterAnimals('frog');
      expect(filtered.some(a => a.name.toLowerCase().includes('frog'))).toBe(true);
    });

    it('should filter by rarity', () => {
      const { result } = renderHook(() => useCollection());

      const filtered = result.current.filterAnimals('', 'common');
      filtered.forEach(animal => {
        expect(robot.rarity).toBe('common');
      });
    });

    it('should filter by zone', () => {
      const { result } = renderHook(() => useCollection());

      const filtered = result.current.filterAnimals('', undefined, 'forest');
      filtered.forEach(animal => {
        expect(robot.zone).toBe('forest');
      });
    });

    it('should combine multiple filters', () => {
      const { result } = renderHook(() => useCollection());

      const filtered = result.current.filterAnimals('', 'common', 'forest');
      filtered.forEach(animal => {
        expect(robot.rarity).toBe('common');
        expect(robot.zone).toBe('forest');
      });
    });

    it('should return all when filters are "all"', () => {
      const { result } = renderHook(() => useCollection());

      const allAnimals = result.current.allAnimals.length;
      const filtered = result.current.filterAnimals('', 'all', 'all');
      expect(filtered.length).toBe(allAnimals);
    });
  });

  describe('stats', () => {
    it('should compute collection stats', () => {
      const { result } = renderHook(() => useCollection());

      expect(result.current.stats).toBeDefined();
      expect(typeof result.current.stats.totalBots).toBe('number');
      expect(typeof result.current.stats.unlockedRobots).toBe('number');
      expect(typeof result.current.stats.shopBotsTotal).toBe('number');
      expect(typeof result.current.stats.shopBotsOwned).toBe('number');
    });

    it('should track favorites count', async () => {
      // Set up store with favorites
      useCollectionStore.setState({ favorites: ['dewdrop-frog', 'moss-turtle'] });

      const { result } = renderHook(() => useCollection());

      await waitFor(() => {
        expect(result.current.stats.favoritesCount).toBe(2);
      });
    });

    it('should track active home pets count', async () => {
      // Set up store with active bot
      useCollectionStore.setState({ activeHomeBots: ['dewdrop-frog'] });

      const { result } = renderHook(() => useCollection());

      await waitFor(() => {
        expect(result.current.stats.activeHomeBotsCount).toBe(1);
      });
    });

    it('should compute rarity stats', () => {
      const { result } = renderHook(() => useCollection());

      expect(result.current.stats.rarityStats).toBeDefined();
      expect(result.current.stats.rarityStats.common).toBeDefined();
      expect(result.current.stats.rarityStats.rare).toBeDefined();
      expect(result.current.stats.rarityStats.epic).toBeDefined();
      expect(result.current.stats.rarityStats.legendary).toBeDefined();
    });
  });

  describe('shop store updates', () => {
    it('should reflect shop store changes', async () => {
      const { result } = renderHook(() => useCollection());

      // Initially not unlocked
      expect(result.current.isAnimalUnlocked('golden-phoenix')).toBe(false);

      // Update shop store
      act(() => {
        useShopStore.setState({ ownedCharacters: ['golden-phoenix'] });
      });

      await waitFor(() => {
        expect(result.current.isAnimalUnlocked('golden-phoenix')).toBe(true);
      });
    });
  });
});
