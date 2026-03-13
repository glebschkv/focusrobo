import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { questLogger } from '@/lib/logger';
import { DAILY_CHALLENGES, WEEKLY_CHALLENGES, DAILY_SWEEP_BONUS, type ChallengeTemplate, type ChallengeDifficulty, type WeeklyChallengeTemplate } from '@/data/GamificationData';
import { useCoinStore } from '@/stores/coinStore';

export interface QuestObjective {
  id: string;
  description: string;
  target: number;
  current: number;
  type: 'focus_time' | 'bot_interaction' | 'bond_level' | 'streak' | 'collection' | 'zone_unlock';
}

export interface QuestReward {
  type: 'xp' | 'coins' | 'bot_unlock' | 'badge' | 'item';
  amount?: number;
  itemId?: string;
  description: string;
}

export interface Quest {
  id: string;
  type: 'daily' | 'weekly' | 'story';
  title: string;
  description: string;
  objectives: QuestObjective[];
  rewards: QuestReward[];
  isCompleted: boolean;
  isClaimed: boolean;
  progress: Record<string, number>;
  unlockLevel?: number;
  expiresAt?: number;
}

export interface DailyChallenge {
  templateId: string;
  date: string;
  progress: number;
  target: number;
  completed: boolean;
  challengeStreak: number;
}

export interface WeeklyChallenge {
  templateId: string;
  weekStart: string; // ISO date string of Monday
  progress: number;
  target: number;
  completed: boolean;
}

interface QuestState {
  quests: Quest[];
  lastDailyReset: string | null;
  lastWeeklyReset: string | null;
  dailyChallenge: DailyChallenge | null;
  weeklyChallenge: WeeklyChallenge | null;
  dailySweepClaimed: boolean;
  dailySweepClaimedDate: string | null;
}

interface QuestStore extends QuestState {
  addQuest: (quest: Quest) => void;
  addQuests: (quests: Quest[]) => void;
  removeQuest: (questId: string) => void;
  updateQuestProgress: (questId: string, objectiveId: string, progress: number) => void;
  completeQuest: (questId: string) => void;
  claimQuest: (questId: string) => void;
  setQuests: (quests: Quest[]) => void;
  getActiveQuests: () => Quest[];
  getDailyQuests: () => Quest[];
  getWeeklyQuests: () => Quest[];
  resetQuests: () => void;
  getDailyChallenge: () => DailyChallenge | null;
  refreshDailyChallenge: () => void;
  updateDailyChallengeProgress: (type: string, amount: number) => void;
  getWeeklyChallenge: () => WeeklyChallenge | null;
  refreshWeeklyChallenge: () => void;
  updateWeeklyChallengeProgress: (type: string, amount: number) => void;
  claimDailySweep: () => void;
  isDailySweepAvailable: () => boolean;
}

const initialState: QuestState = { quests: [], lastDailyReset: null, lastWeeklyReset: null, dailyChallenge: null, weeklyChallenge: null, dailySweepClaimed: false, dailySweepClaimedDate: null };

/** Deterministic daily challenge selection seeded by date string */
function hashDate(dateStr: string): number {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = ((hash << 5) - hash) + dateStr.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function getWeekStartISO(): string {
  const now = new Date();
  const day = now.getDay();
  const diff = day === 0 ? 6 : day - 1; // Monday = 0
  const monday = new Date(now);
  monday.setDate(now.getDate() - diff);
  return monday.toISOString().slice(0, 10);
}

function pickWeeklyChallenge(weekStart: string): WeeklyChallengeTemplate {
  const seed = hashDate(weekStart + '-weekly');
  return WEEKLY_CHALLENGES[seed % WEEKLY_CHALLENGES.length];
}

function pickDailyChallenge(dateStr: string): ChallengeTemplate {
  const seed = hashDate(dateStr);
  // Weighted selection: 50% easy, 35% medium, 15% hard
  const roll = (seed % 100);
  let pool: ChallengeTemplate[];
  if (roll < 50) {
    pool = DAILY_CHALLENGES.filter(c => c.difficulty === 'easy');
  } else if (roll < 85) {
    pool = DAILY_CHALLENGES.filter(c => c.difficulty === 'medium');
  } else {
    pool = DAILY_CHALLENGES.filter(c => c.difficulty === 'hard');
  }
  return pool[seed % pool.length];
}

export const useQuestStore = create<QuestStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      addQuest: (quest) => { if (!get().quests.some(q => q.id === quest.id)) set((s) => ({ quests: [...s.quests, quest] })); },
      addQuests: (newQuests) => {
        const existing = new Set(get().quests.map(q => q.id));
        const toAdd = newQuests.filter(q => !existing.has(q.id));
        if (toAdd.length > 0) set((s) => ({ quests: [...s.quests, ...toAdd] }));
      },
      removeQuest: (questId) => set((s) => ({ quests: s.quests.filter(q => q.id !== questId) })),
      updateQuestProgress: (questId, objectiveId, progress) => set((s) => ({
        quests: s.quests.map(quest => {
          if (quest.id !== questId) return quest;
          const updatedObjectives = quest.objectives.map(obj =>
            obj.id === objectiveId ? { ...obj, current: Math.min(obj.target, progress) } : obj
          );
          return { ...quest, objectives: updatedObjectives, isCompleted: updatedObjectives.every(o => o.current >= o.target) };
        }),
      })),
      completeQuest: (questId) => set((s) => ({ quests: s.quests.map(q => q.id === questId ? { ...q, isCompleted: true } : q) })),
      claimQuest: (questId) => set((s) => ({ quests: s.quests.map(q => q.id === questId ? { ...q, isClaimed: true } : q) })),
      setQuests: (quests) => set({ quests }),
      getActiveQuests: () => get().quests.filter(q => !q.isCompleted && (!q.expiresAt || q.expiresAt > Date.now())),
      getDailyQuests: () => get().quests.filter(q => q.type === 'daily' && (!q.expiresAt || q.expiresAt > Date.now())),
      getWeeklyQuests: () => get().quests.filter(q => q.type === 'weekly' && (!q.expiresAt || q.expiresAt > Date.now())),
      resetQuests: () => set(initialState),
      getDailyChallenge: () => {
        const state = get();
        const today = new Date().toDateString();
        if (state.dailyChallenge && state.dailyChallenge.date === today) {
          return state.dailyChallenge;
        }
        return null;
      },
      refreshDailyChallenge: () => {
        const today = new Date().toDateString();
        const existing = get().dailyChallenge;
        if (existing && existing.date === today) return;

        const prevStreak = existing?.challengeStreak ?? 0;
        const wasCompletedYesterday = existing?.completed ?? false;
        const newStreak = wasCompletedYesterday ? prevStreak + 1 : 0;

        const template = pickDailyChallenge(today);
        set({
          dailyChallenge: {
            templateId: template.id,
            date: today,
            progress: 0,
            target: template.target,
            completed: false,
            challengeStreak: newStreak,
          },
        });
      },
      updateDailyChallengeProgress: (type: string, amount: number) => {
        const dc = get().dailyChallenge;
        if (!dc || dc.completed) return;
        const today = new Date().toDateString();
        if (dc.date !== today) return;

        const template = DAILY_CHALLENGES.find(c => c.id === dc.templateId);
        if (!template || template.objectiveType !== type) return;

        const newProgress = Math.min(dc.target, dc.progress + amount);
        set({
          dailyChallenge: {
            ...dc,
            progress: newProgress,
            completed: newProgress >= dc.target,
          },
        });
      },
      getWeeklyChallenge: () => {
        const state = get();
        const currentWeek = getWeekStartISO();
        if (state.weeklyChallenge && state.weeklyChallenge.weekStart === currentWeek) {
          return state.weeklyChallenge;
        }
        return null;
      },
      refreshWeeklyChallenge: () => {
        const currentWeek = getWeekStartISO();
        const existing = get().weeklyChallenge;
        if (existing && existing.weekStart === currentWeek) return;

        const template = pickWeeklyChallenge(currentWeek);
        set({
          weeklyChallenge: {
            templateId: template.id,
            weekStart: currentWeek,
            progress: 0,
            target: template.target,
            completed: false,
          },
        });
      },
      updateWeeklyChallengeProgress: (type: string, amount: number) => {
        const wc = get().weeklyChallenge;
        if (!wc || wc.completed) return;
        const currentWeek = getWeekStartISO();
        if (wc.weekStart !== currentWeek) return;

        const template = WEEKLY_CHALLENGES.find(c => c.id === wc.templateId);
        if (!template || template.objectiveType !== type) return;

        const newProgress = Math.min(wc.target, wc.progress + amount);
        set({
          weeklyChallenge: {
            ...wc,
            progress: newProgress,
            completed: newProgress >= wc.target,
          },
        });
      },
      claimDailySweep: () => {
        const state = get();
        const today = new Date().toDateString();
        if (state.dailySweepClaimed && state.dailySweepClaimedDate === today) return;
        useCoinStore.getState().addCoins(DAILY_SWEEP_BONUS);
        set({ dailySweepClaimed: true, dailySweepClaimedDate: today });
        questLogger.debug('Daily sweep bonus claimed: +' + DAILY_SWEEP_BONUS + ' coins');
      },
      isDailySweepAvailable: () => {
        const state = get();
        const today = new Date().toDateString();
        // Already claimed today
        if (state.dailySweepClaimed && state.dailySweepClaimedDate === today) return false;
        // Check if all daily quests are complete
        const dailyQuests = state.quests.filter(q => q.type === 'daily' && (!q.expiresAt || q.expiresAt > Date.now()));
        return dailyQuests.length >= 3 && dailyQuests.every(q => q.isCompleted);
      },
    }),
    {
      name: 'nomo_quest_system',
      onRehydrateStorage: () => (state) => {
        if (!state) {
          try {
            const legacy = localStorage.getItem('quest-system-data') || localStorage.getItem('botblock_quest_system');
            if (legacy) {
              const parsed = JSON.parse(legacy);
              useQuestStore.setState({
                quests: Array.isArray(parsed.quests) ? parsed.quests : [],
                lastDailyReset: null,
                lastWeeklyReset: null,
              });
              questLogger.debug('Quest store migrated from legacy storage');
              return;
            }
          } catch { /* ignore */ }
        }
        if (state) questLogger.debug('Quest store rehydrated');
      },
    }
  )
);

export const useQuests = () => useQuestStore((s) => s.quests);
export const useActiveQuests = () => useQuestStore((s) => s.quests.filter(q => !q.isCompleted && (!q.expiresAt || q.expiresAt > Date.now())));
export const useDailyQuests = () => useQuestStore((s) => s.quests.filter(q => q.type === 'daily' && (!q.expiresAt || q.expiresAt > Date.now())));
export const useWeeklyQuests = () => useQuestStore((s) => s.quests.filter(q => q.type === 'weekly' && (!q.expiresAt || q.expiresAt > Date.now())));
export const useDailyChallenge = () => useQuestStore((s) => s.dailyChallenge);
export const useRefreshDailyChallenge = () => useQuestStore((s) => s.refreshDailyChallenge);
export const useWeeklyChallenge = () => useQuestStore((s) => s.weeklyChallenge);
export const useRefreshWeeklyChallenge = () => useQuestStore((s) => s.refreshWeeklyChallenge);
