/**
 * Focus Store
 *
 * Manages the focus mode settings including app blocking, website blocking,
 * strict mode, and notification blocking. Used in conjunction with native
 * Capacitor plugins for actual device-level blocking.
 *
 * @module stores/focusStore
 *
 * @example
 * ```typescript
 * import { useFocusStore, useIsFocusModeActive } from '@/stores/focusStore';
 *
 * // In a component
 * const { activateFocusMode, deactivateFocusMode, getBlockedApps } = useFocusStore();
 *
 * // Start focus mode
 * activateFocusMode();
 *
 * // Or use selector hooks
 * const isActive = useIsFocusModeActive();
 * ```
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { focusModeLogger } from '@/lib/logger';

/**
 * Represents an app that can be blocked during focus mode
 */
export interface BlockedApp {
  id: string;
  name: string;
  icon: string;
  bundleId?: string;
  isBlocked: boolean;
}

export const SUGGESTED_APPS: BlockedApp[] = [
  { id: 'instagram', name: 'Instagram', icon: '📸', bundleId: 'com.burbn.instagram', isBlocked: true },
  { id: 'tiktok', name: 'TikTok', icon: '🎵', bundleId: 'com.zhiliaoapp.musically', isBlocked: true },
  { id: 'twitter', name: 'X (Twitter)', icon: '🐦', bundleId: 'com.atebits.Tweetie2', isBlocked: true },
  { id: 'facebook', name: 'Facebook', icon: '👥', bundleId: 'com.facebook.Facebook', isBlocked: true },
  { id: 'youtube', name: 'YouTube', icon: '▶️', bundleId: 'com.google.ios.youtube', isBlocked: false },
  { id: 'snapchat', name: 'Snapchat', icon: '👻', bundleId: 'com.toyopagroup.picaboo', isBlocked: false },
  { id: 'reddit', name: 'Reddit', icon: '🤖', bundleId: 'com.reddit.Reddit', isBlocked: false },
  { id: 'discord', name: 'Discord', icon: '💬', bundleId: 'com.hammerandchisel.discord', isBlocked: false },
];

export interface FocusModeSettings {
  enabled: boolean;
  strictMode: boolean;
  blockNotifications: boolean;
  blockedApps: BlockedApp[];
  allowEmergencyBypass: boolean;
  bypassCooldown: number;
}

export interface FocusState extends FocusModeSettings {
  isFocusModeActive: boolean;
  isNativeBlocking: boolean;
}

interface FocusStore extends FocusState {
  setEnabled: (enabled: boolean) => void;
  setStrictMode: (strict: boolean) => void;
  toggleAppBlocking: (appId: string, blocked: boolean) => void;
  activateFocusMode: () => void;
  deactivateFocusMode: () => void;
  updateSettings: (settings: Partial<FocusModeSettings>) => void;
  getBlockedApps: () => BlockedApp[];
  resetToDefaults: () => void;
}

const defaultSettings: FocusModeSettings = {
  enabled: true, strictMode: false, blockNotifications: true, blockedApps: SUGGESTED_APPS,
  allowEmergencyBypass: true, bypassCooldown: 30,
};

const initialState: FocusState = { ...defaultSettings, isFocusModeActive: false, isNativeBlocking: false };

export const useFocusStore = create<FocusStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      setEnabled: (enabled) => set({ enabled }),
      setStrictMode: (strict) => set({ strictMode: strict }),
      toggleAppBlocking: (appId, blocked) => set((s) => ({
        blockedApps: s.blockedApps.map(app => app.id === appId ? { ...app, isBlocked: blocked } : app)
      })),
      activateFocusMode: () => set({ isFocusModeActive: true }),
      deactivateFocusMode: () => set({ isFocusModeActive: false }),
      updateSettings: (settings) => set((s) => ({ ...s, ...settings })),
      getBlockedApps: () => get().blockedApps.filter(app => app.isBlocked),
      resetToDefaults: () => set(initialState),
    }),
    {
      name: 'nomo_focus_mode',
      partialize: (state) => ({
        enabled: state.enabled, strictMode: state.strictMode, blockNotifications: state.blockNotifications,
        blockedApps: state.blockedApps,
        allowEmergencyBypass: state.allowEmergencyBypass, bypassCooldown: state.bypassCooldown,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) {
          try {
            const legacy = localStorage.getItem('petIsland_focusMode');
            if (legacy) {
              const parsed = JSON.parse(legacy);
              // Only spread known safe keys from legacy data
              const safeKeys: (keyof FocusModeSettings)[] = [
                'enabled', 'strictMode', 'blockNotifications',
                'blockedApps', 'allowEmergencyBypass', 'bypassCooldown',
              ];
              const migrated: Partial<FocusModeSettings> = {};
              for (const key of safeKeys) {
                if (key in parsed) (migrated as Record<string, unknown>)[key] = parsed[key];
              }
              useFocusStore.setState({ ...initialState, ...migrated });
              focusModeLogger.debug('Focus store migrated from legacy storage');
              return;
            }
          } catch { /* ignore */ }
        }
        if (state) focusModeLogger.debug('Focus store rehydrated');
      },
    }
  )
);

export const useIsFocusModeActive = () => useFocusStore((s) => s.isFocusModeActive);
export const useIsNativeBlocking = () => useFocusStore((s) => s.isNativeBlocking);
export const useFocusModeEnabled = () => useFocusStore((s) => s.enabled);
export const useBlockedApps = () => useFocusStore((s) => s.blockedApps);
