import { useState } from 'react';
import { Shield, Bell, BellOff, Lock, Unlock, Plus, Globe, Crown, AlertTriangle, ShieldCheck, Sparkles, Settings as SettingsIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useFocusMode } from '@/hooks/useFocusMode';
import { usePremiumStatus } from '@/hooks/usePremiumStatus';
import { useDeviceActivity } from '@/hooks/useDeviceActivity';
import { Capacitor } from '@capacitor/core';
import { PremiumSubscription } from '@/components/PremiumSubscription';
import { STORAGE_KEY as TIMER_STORAGE_KEY } from '@/components/focus-timer/constants';

function isTimerCurrentlyRunning(): boolean {
  try {
    const raw = localStorage.getItem(TIMER_STORAGE_KEY);
    if (!raw) return false;
    const state = JSON.parse(raw);
    return !!state.isRunning;
  } catch { return false; }
}

export const SettingsFocusMode = () => {
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const { settings, updateSettings } = useFocusMode();
  const { isPremium } = usePremiumStatus();

  const {
    isPermissionGranted: shieldPermissionGranted,
    hasAppsConfigured: shieldAppsConfigured,
    blockedAppsCount: shieldBlockedCount,
    selectedAppsCount: shieldSelectedApps,
    selectedCategoriesCount: shieldSelectedCategories,
    selectedDomainsCount: shieldSelectedDomains,
    isLoading: shieldLoading,
    requestPermissions: shieldRequestPermissions,
    openSettings: shieldOpenSettings,
    openAppPicker: shieldOpenAppPicker,
  } = useDeviceActivity();
  const isNativePlatform = Capacitor.isNativePlatform();
  const [hasAttemptedShieldPermission, setHasAttemptedShieldPermission] = useState(false);
  const timerRunning = isTimerCurrentlyRunning();

  const shieldLabel = (() => {
    const parts: string[] = [];
    if (shieldSelectedApps > 0 && shieldSelectedCategories > 0) {
      parts.push(`${shieldSelectedApps} app${shieldSelectedApps !== 1 ? 's' : ''} & ${shieldSelectedCategories} group${shieldSelectedCategories !== 1 ? 's' : ''}`);
    } else if (shieldSelectedCategories > 0) {
      parts.push(`${shieldSelectedCategories} app group${shieldSelectedCategories !== 1 ? 's' : ''}`);
    } else if (shieldSelectedApps > 0) {
      parts.push(`${shieldSelectedApps} app${shieldSelectedApps !== 1 ? 's' : ''}`);
    }
    if (isPremium && shieldSelectedDomains > 0) {
      parts.push(`${shieldSelectedDomains} website${shieldSelectedDomains !== 1 ? 's' : ''}`);
    }
    return parts.join(' & ') || `${shieldBlockedCount} app${shieldBlockedCount !== 1 ? 's' : ''}`;
  })();

  return (
    <div className="space-y-3">
      {/* Main Focus Mode Card */}
      <div className="settings-card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={cn("settings-icon-box", settings.enabled ? "settings-icon-box--active" : "settings-icon-box--inactive")}>
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <Label className="text-sm font-bold text-[hsl(var(--foreground))]">Focus Mode</Label>
              <p className="text-[11px] text-[hsl(var(--muted-foreground))]">Block distractions during focus</p>
            </div>
          </div>
          <Switch checked={settings.enabled} onCheckedChange={(enabled) => updateSettings({ enabled })} />
        </div>

        {settings.enabled && (
          <>
            <div className="settings-divider" />

            {/* Block Notifications */}
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                {settings.blockNotifications
                  ? <BellOff className="w-4 h-4 text-[hsl(var(--primary))]" />
                  : <Bell className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />}
                <div>
                  <p className="text-sm font-semibold text-[hsl(var(--foreground))]">Block Notifications</p>
                  <p className="text-[11px] text-[hsl(var(--muted-foreground))]">Enable Do Not Disturb</p>
                </div>
              </div>
              <Switch checked={settings.blockNotifications} onCheckedChange={(blockNotifications) => updateSettings({ blockNotifications })} />
            </div>

            {/* Strict Mode */}
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                {settings.strictMode
                  ? <Lock className="w-4 h-4 text-[hsl(var(--destructive))]" />
                  : <Unlock className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />}
                <div>
                  <p className="text-sm font-semibold text-[hsl(var(--foreground))]">Strict Mode</p>
                  <p className="text-[11px] text-[hsl(var(--muted-foreground))]">Session locked until timer ends</p>
                </div>
              </div>
              <Switch checked={settings.strictMode} onCheckedChange={(strictMode) => updateSettings({ strictMode })} />
            </div>

            {settings.strictMode && (
              <div className="mt-2 p-2 rounded-lg bg-[hsl(var(--destructive)/0.06)] border border-[hsl(var(--destructive)/0.12)]">
                <div className="flex items-center gap-2 text-[hsl(var(--destructive))]">
                  <AlertTriangle className="w-3 h-3" />
                  <p className="text-[11px] font-medium">Focus mode stays active until the timer completes</p>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {settings.enabled && (
        <>
          {/* Focus Shield — Native App Blocking (iOS) */}
          {isNativePlatform && (
            <div className="settings-card">
              <div className="flex items-center gap-3 mb-3">
                <div className={cn(
                  "settings-icon-box",
                  shieldPermissionGranted && (shieldAppsConfigured || shieldSelectedDomains > 0) ? "settings-icon-box--active" : "settings-icon-box--inactive"
                )}>
                  {shieldPermissionGranted && (shieldAppsConfigured || shieldSelectedDomains > 0)
                    ? <ShieldCheck className="w-4 h-4" />
                    : <Shield className="w-4 h-4" />}
                </div>
                <div className="flex-1">
                  <Label className="text-sm font-bold text-[hsl(var(--foreground))]">Focus Shield</Label>
                  <p className="text-[11px] text-[hsl(var(--muted-foreground))]">
                    {shieldPermissionGranted
                      ? shieldAppsConfigured || shieldSelectedDomains > 0
                        ? `${shieldLabel} will be blocked during focus`
                        : 'Tap to select apps to block'
                      : 'Block distracting apps via Screen Time'}
                  </p>
                </div>
                {shieldPermissionGranted && (shieldAppsConfigured || shieldSelectedDomains > 0) && (
                  <span className="settings-badge settings-badge--green">
                    <Sparkles className="w-3 h-3" /> Active
                  </span>
                )}
              </div>

              {!shieldPermissionGranted ? (
                <div className="space-y-2">
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">
                    {hasAttemptedShieldPermission
                      ? "Screen Time permission is needed. You can update this in Settings."
                      : "Screen Time access lets the app block distracting apps during focus sessions and earn bonus rewards."}
                  </p>
                  <button
                    onClick={async () => { setHasAttemptedShieldPermission(true); await shieldRequestPermissions(); }}
                    disabled={shieldLoading}
                    className={cn("settings-btn-primary text-sm", shieldLoading && "opacity-50")}
                  >
                    <Lock className="w-3.5 h-3.5" />
                    {shieldLoading ? 'Requesting...' : hasAttemptedShieldPermission ? 'Try Again' : 'Continue'}
                  </button>
                  {hasAttemptedShieldPermission && (
                    <button onClick={() => shieldOpenSettings()} className="settings-btn-secondary text-sm">
                      <SettingsIcon className="w-3.5 h-3.5" /> Open Settings
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <button
                    onClick={() => shieldOpenAppPicker()}
                    disabled={timerRunning}
                    className={cn("settings-btn-primary text-sm", timerRunning && "opacity-50 cursor-not-allowed")}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    {timerRunning ? 'Locked During Session' : (shieldAppsConfigured ? 'Change Blocked Apps' : 'Select Apps to Block')}
                  </button>

                  {/* Website Blocking */}
                  <div className="settings-divider" />
                  <div className="flex items-center gap-2 mb-2">
                    <Globe className="w-3.5 h-3.5 text-[hsl(var(--primary))]" />
                    <span className="text-xs font-bold text-[hsl(var(--foreground))]">Website Blocking</span>
                    {!isPremium && <span className="settings-premium-tag"><Crown className="w-2.5 h-2.5" /> Premium</span>}
                    {isPremium && shieldSelectedDomains > 0 && (
                      <span className="settings-badge settings-badge--green text-[9px]">{shieldSelectedDomains} selected</span>
                    )}
                  </div>

                  {!isPremium ? (
                    <div className="p-3 rounded-xl bg-[hsl(var(--warning)/0.05)] border border-dashed border-[hsl(var(--warning)/0.2)]">
                      <p className="text-[11px] text-[hsl(var(--muted-foreground))] mb-2">
                        Block distracting websites like Instagram, TikTok & more during focus sessions.
                      </p>
                      <button onClick={() => setShowPremiumModal(true)} className="settings-btn-gold text-xs">
                        <Crown className="w-3 h-3" /> Go Premium to Unlock
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-[11px] text-[hsl(var(--muted-foreground))]">
                        {shieldSelectedDomains > 0
                          ? `${shieldSelectedDomains} website${shieldSelectedDomains !== 1 ? 's' : ''} will be blocked via Screen Time during focus.`
                          : 'Select websites to block via Screen Time during focus sessions.'}
                      </p>
                      <button
                        onClick={() => shieldOpenAppPicker()}
                        disabled={timerRunning}
                        className={cn("settings-btn-primary text-xs", timerRunning && "opacity-50 cursor-not-allowed")}
                      >
                        {shieldSelectedDomains > 0
                          ? <><Globe className="w-3 h-3" /> {timerRunning ? 'Locked During Session' : 'Change Blocked Websites'}</>
                          : <><Plus className="w-3 h-3" /> {timerRunning ? 'Locked During Session' : 'Select Websites to Block'}</>}
                      </button>
                    </div>
                  )}

                  <div className="settings-info">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-[hsl(var(--primary))]" />
                      <p className="text-[11px] text-[hsl(var(--muted-foreground))]">Perfect focus = +25% XP & +50 coins bonus</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Info Card */}
          <div className="settings-card">
            <p className="text-[11px] text-[hsl(var(--muted-foreground))] text-center">
              Focus Mode activates when you start a focus timer and deactivates when the session ends.
            </p>
          </div>
        </>
      )}
      <PremiumSubscription isOpen={showPremiumModal} onClose={() => setShowPremiumModal(false)} />
    </div>
  );
};
