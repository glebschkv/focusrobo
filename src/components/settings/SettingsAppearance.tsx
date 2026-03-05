import { AppSettings } from "@/hooks/useSettings";
import { Sun, Moon, Monitor, Check } from "lucide-react";
import { cn } from "@/lib/utils";

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
  return (
    <div className="settings-card">
      <div className="settings-section-title">
        <div className="settings-section-icon"><Sun /></div>
        <span>Color Scheme</span>
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
                "w-10 h-10 rounded-xl flex items-center justify-center border",
                isSelected
                  ? "bg-[hsl(var(--primary)/0.12)] border-[rgba(76,167,113,0.3)] text-[hsl(var(--primary))]"
                  : "bg-[hsl(var(--muted)/0.5)] border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))]"
              )}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="text-center">
                <div className="text-xs font-semibold text-[hsl(var(--foreground))]">{option.label}</div>
                <div className="text-[11px] text-[hsl(var(--muted-foreground))]">{option.description}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
