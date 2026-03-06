// Analytics Types for Focus Timer

export type SessionType = 'pomodoro' | 'deep-work' | 'break' | 'countup';
export type SessionStatus = 'completed' | 'skipped' | 'abandoned';

// Focus categories for task/intention tracking
export type FocusCategory = 'work' | 'study' | 'creative' | 'personal' | 'health' | 'other';

export const FOCUS_CATEGORIES: { id: FocusCategory; label: string; emoji: string; icon: string; color: string }[] = [
  { id: 'work', label: 'Work', emoji: '💼', icon: 'backpack', color: 'bg-blue-500' },
  { id: 'study', label: 'Study', emoji: '📚', icon: 'books', color: 'bg-purple-500' },
  { id: 'creative', label: 'Creative', emoji: '🎨', icon: 'palette', color: 'bg-pink-500' },
  { id: 'personal', label: 'Personal', emoji: '🏠', icon: 'heart', color: 'bg-green-500' },
  { id: 'health', label: 'Health', emoji: '💪', icon: 'muscle', color: 'bg-orange-500' },
  { id: 'other', label: 'Other', emoji: '✨', icon: 'sparkles', color: 'bg-gray-500' },
];

export type FocusQuality = 'perfect' | 'good' | 'distracted';

export interface FocusSession {
  id: string;
  startTime: number; // timestamp
  endTime: number; // timestamp
  plannedDuration: number; // in seconds
  actualDuration: number; // in seconds
  sessionType: SessionType;
  status: SessionStatus;
  xpEarned: number;
  // Task/intention tracking
  category?: FocusCategory;
  taskLabel?: string;
  // Focus quality tracking
  shieldAttempts?: number;
  focusQuality?: FocusQuality;
  appsBlocked?: boolean;
  // Session reflection
  rating?: number; // 1-5
  hasNotes?: boolean;
}

// Insight generated from analytics data
export interface AnalyticsInsight {
  id: string;
  type: 'improvement' | 'achievement' | 'recommendation' | 'trend';
  icon: string; // lucide icon name
  title: string;
  description: string;
  color: string; // tailwind color class
}

// Milestone tracking
export interface Milestone {
  id: string;
  label: string;
  target: number;
  current: number;
  unit: string;
  icon: string;
  color: string;
}

// Monthly summary
export interface MonthlyStats {
  month: string; // YYYY-MM
  totalFocusTime: number;
  totalSessions: number;
  daysActive: number;
  goalsMet: number;
  totalDays: number;
  bestDay: { date: string; focusTime: number };
  topCategory: { category: FocusCategory; time: number } | null;
  avgDailyFocus: number;
  completionRate: number;
}

export interface DailyStats {
  date: string; // YYYY-MM-DD
  totalFocusTime: number; // seconds
  totalBreakTime: number; // seconds
  sessionsCompleted: number;
  sessionsAbandoned: number;
  longestSession: number; // seconds
  goalMet: boolean;
  hourlyFocus: Record<number, number>; // hour (0-23) -> seconds focused
  // Category breakdown for task/intention tracking
  categoryTime?: Partial<Record<FocusCategory, number>>; // category -> seconds focused
  // Focus score snapshot (recorded daily for trend tracking)
  focusScore?: number;
}

export interface AnalyticsSettings {
  dailyGoalMinutes: number;
  weeklyGoalMinutes: number;
}

export interface PersonalRecords {
  longestSession: number; // seconds
  longestSessionDate: string;
  mostFocusInDay: number; // seconds
  mostFocusInDayDate: string;
  mostSessionsInDay: number;
  mostSessionsInDayDate: string;
  longestGoalStreak: number;
  longestGoalStreakDate: string;
  totalFocusTime: number; // all-time seconds
  totalSessions: number;
  joinedDate: string;
}

export interface WeeklyStats {
  weekStart: string; // YYYY-MM-DD (Monday)
  totalFocusTime: number;
  totalBreakTime: number;
  sessionsCompleted: number;
  daysActive: number;
  goalsMet: number;
  averageSessionLength: number;
}

export interface AnalyticsState {
  sessions: FocusSession[];
  dailyStats: Record<string, DailyStats>; // keyed by date YYYY-MM-DD
  settings: AnalyticsSettings;
  records: PersonalRecords;
  currentGoalStreak: number;
}

// Default values
export const DEFAULT_ANALYTICS_SETTINGS: AnalyticsSettings = {
  dailyGoalMinutes: 120, // 2 hours
  weeklyGoalMinutes: 600, // 10 hours
};

export const DEFAULT_PERSONAL_RECORDS: PersonalRecords = {
  longestSession: 0,
  longestSessionDate: '',
  mostFocusInDay: 0,
  mostFocusInDayDate: '',
  mostSessionsInDay: 0,
  mostSessionsInDayDate: '',
  longestGoalStreak: 0,
  longestGoalStreakDate: '',
  totalFocusTime: 0,
  totalSessions: 0,
  joinedDate: new Date().toISOString().split('T')[0],
};

// ─── Focus Personality ─────────────────────────────────
export type FocusArchetype =
  | 'early-bird'
  | 'night-owl'
  | 'marathon-runner'
  | 'sprint-master'
  | 'zen-master'
  | 'grinder'
  | 'perfectionist'
  | 'explorer';

export interface FocusPersonality {
  primary: FocusArchetype;
  secondary: FocusArchetype;
  traits: {
    endurance: number;
    consistency: number;
    quality: number;
    volume: number;
    growth: number;
  };
  description: string;
  icon: string;
  color: string;
}

export const FOCUS_ARCHETYPES: Record<
  FocusArchetype,
  { label: string; icon: string; color: string; gradient: string; description: string }
> = {
  'early-bird': {
    label: 'Early Bird',
    icon: 'Sunrise',
    color: 'text-amber-500',
    gradient: 'from-amber-500/20 to-orange-500/10',
    description: 'You thrive in the morning light. Your best work happens before the world wakes up.',
  },
  'night-owl': {
    label: 'Night Owl',
    icon: 'Moon',
    color: 'text-indigo-400',
    gradient: 'from-indigo-500/20 to-violet-500/10',
    description: 'The quiet hours fuel your focus. Late nights are when your creativity peaks.',
  },
  'marathon-runner': {
    label: 'Marathon Runner',
    icon: 'Timer',
    color: 'text-emerald-500',
    gradient: 'from-emerald-500/20 to-green-500/10',
    description: 'You go deep. Long, unbroken sessions are your superpower.',
  },
  'sprint-master': {
    label: 'Sprint Master',
    icon: 'Zap',
    color: 'text-cyan-500',
    gradient: 'from-cyan-500/20 to-blue-500/10',
    description: 'Quick bursts of intense focus. You pack maximum output into short sessions.',
  },
  'zen-master': {
    label: 'Zen Master',
    icon: 'Shield',
    color: 'text-violet-500',
    gradient: 'from-violet-500/20 to-purple-500/10',
    description: 'Distraction-free and disciplined. Your focus quality is exceptional.',
  },
  'grinder': {
    label: 'The Grinder',
    icon: 'Flame',
    color: 'text-orange-500',
    gradient: 'from-orange-500/20 to-red-500/10',
    description: 'Relentless volume. You show up session after session, day after day.',
  },
  'perfectionist': {
    label: 'The Perfectionist',
    icon: 'CheckCircle',
    color: 'text-green-500',
    gradient: 'from-green-500/20 to-emerald-500/10',
    description: 'You finish what you start. Your completion rate is remarkable.',
  },
  'explorer': {
    label: 'The Explorer',
    icon: 'Compass',
    color: 'text-blue-500',
    gradient: 'from-blue-500/20 to-sky-500/10',
    description: 'Balanced and versatile. You adapt your focus style to what the day demands.',
  },
};

// ─── Radar Chart ───────────────────────────────────────
export interface RadarDataPoint {
  axis: string;
  value: number;
  previousValue?: number;
}

// ─── Predictions ───────────────────────────────────────
export interface Prediction {
  id: string;
  label: string;
  value: string;
  date?: string;
  confidence: 'high' | 'medium' | 'low';
  icon: string;
  trend: 'up' | 'down' | 'stable';
}

// ─── Flow States ───────────────────────────────────────
export interface FlowStats {
  totalFlowSessions: number;
  flowRate: number;
  longestFlowStreak: number;
  currentFlowStreak: number;
  lastFlowDate: string | null;
}

// ─── Smart Schedule ────────────────────────────────────
export interface ScheduleSlot {
  dayOfWeek: number;
  hour: number;
  completionRate: number;
  avgMinutes: number;
  sessionCount: number;
}

export interface SmartSchedule {
  topSlots: ScheduleSlot[];
  bestDay: { day: number; totalMinutes: number };
  peakHours: number[];
  matrix: Record<string, { totalMinutes: number; completionRate: number; sessionCount: number }>;
}

// ─── Gamification Stats ────────────────────────────────
export interface WeeklyGameStats {
  petsEarned: number;
  rareOrBetter: number;
  xpEarned: number;
  coinsEarned: number;
  islandProgress: number;
}

export const createEmptyDailyStats = (date: string): DailyStats => ({
  date,
  totalFocusTime: 0,
  totalBreakTime: 0,
  sessionsCompleted: 0,
  sessionsAbandoned: 0,
  longestSession: 0,
  goalMet: false,
  hourlyFocus: {},
  categoryTime: {},
});
