import { AppSettings } from "@/hooks/useSettings";
import { Sun, Moon, Monitor, Check, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useThemeStore } from "@/stores/themeStore";
import { usePremiumStore } from "@/stores/premiumStore";
import { ISLAND_THEMES } from "@/data/IslandThemes";

interface SettingsAppearanceProps {
  settings: AppSettings;
  onUpdate: (updates: Partial<AppSettings>) => void;
}

const themeOptions = [
  { value: "light", label: "Light", icon: Sun, description: "Always light" },
  { value: "dark", label: "Dark", icon: Moon, description: "Always dark" },
  { value: "system", label: "Auto", icon: Monitor, description: "Follow system" },
];

export const SettingsAppearance = ({ settings, onUpdate }: SettingsAppearanceProps) => {
  const themeId = useThemeStore((s) => s.homeBackground);
  const setTheme = useThemeStore((s) => s.setHomeBackground);
  const isPremium = usePremiumStore((s) => s.tier === 'premium');
  const effectiveThemeId = (!isPremium && ISLAND_THEMES[themeId]?.premiumOnly) ? 'day' : themeId;

  return (
    <>
      <div className="settings-card">
        <div className="settings-section-title">
          <div className="settings-section-icon"><Sun /></div>
          <span>Appearance</span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {themeOptions.map((option) => {
            const Icon = option.icon;
            const isSelected = settings.theme === option.value;
            return (
              <button
                key={option.value}
                onClick={() => onUpdate({ theme: option.value as 'light' | 'dark' | 'system' })}
                className={cn("settings-theme-card", isSelected ? "settings-theme-card--selected" : "settings-theme-card--unselected")}
              >
                {isSelected && (
                  <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-[hsl(var(--primary))] flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 text-white" />
                  </div>
                )}
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                  isSelected
                    ? "bg-[hsl(var(--primary)/0.12)] text-[hsl(var(--primary))]"
                    : "bg-[hsl(var(--muted)/0.5)] text-[hsl(var(--muted-foreground))]"
                )}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="text-center">
                  <div className="text-xs font-semibold text-[hsl(var(--foreground))]">{option.label}</div>
                  <div className="text-[10px] text-[hsl(var(--muted-foreground))]">{option.description}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="settings-card">
        <div className="settings-section-title">
          <div className="settings-section-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="13.5" cy="6.5" r="2.5" />
              <circle cx="17.5" cy="10.5" r="2.5" />
              <circle cx="8.5" cy="7.5" r="2.5" />
              <circle cx="6.5" cy="12.5" r="2.5" />
              <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.9 0 1.7-.1 2.5-.3C13.1 20.4 12 18.8 12 17c0-2.8 2.2-5 5-5 1.8 0 3.4 1 4.2 2.5.2-.8.3-1.6.3-2.5 0-5.5-4.5-10-10-10z" />
            </svg>
          </div>
          <span>Island Theme</span>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {Object.values(ISLAND_THEMES).map((t) => {
            const isActive = t.id === effectiveThemeId;
            const isLocked = t.premiumOnly && !isPremium;
            return (
              <button
                key={t.id}
                onClick={() => {
                  if (isLocked) return;
                  setTheme(t.id);
                }}
                className={cn(
                  "relative flex flex-col items-center gap-1.5 p-2 rounded-xl border-2 transition-colors",
                  isActive
                    ? "border-[hsl(150_40%_45%)] bg-[rgba(100,180,100,0.08)]"
                    : "border-transparent bg-[rgba(0,0,0,0.03)]",
                  isLocked && "opacity-50 cursor-default"
                )}
              >
                {isActive && (
                  <div className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-[hsl(150_40%_45%)] flex items-center justify-center">
                    <Check className="w-2 h-2 text-white" />
                  </div>
                )}
                {isLocked && (
                  <div className="absolute top-1 right-1">
                    <Lock className="w-2.5 h-2.5 text-[hsl(var(--muted-foreground))]" />
                  </div>
                )}
                <div
                  className="w-10 h-10 rounded-lg border border-black/10"
                  style={{
                    background: `linear-gradient(180deg, ${t.sky[0]} 0%, ${t.sky[2]} 40%, ${t.grassLight[0]} 65%, ${t.grassDark[0]} 100%)`
                  }}
                />
                <span className="text-[10px] font-semibold text-[hsl(var(--foreground))] whitespace-nowrap">
                  {t.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
};
