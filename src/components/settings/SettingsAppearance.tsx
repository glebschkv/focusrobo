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
                <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-[#4CA771] flex items-center justify-center">
                  <Check className="w-2.5 h-2.5 text-white" />
                </div>
              )}
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center border",
                isSelected
                  ? "bg-[rgba(76,167,113,0.15)] border-[rgba(76,167,113,0.3)] text-[#4CA771]"
                  : "bg-[rgba(26,46,35,0.5)] border-[rgba(76,167,113,0.1)] text-[#8BA68F]"
              )}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="text-center">
                <div className="text-xs font-semibold text-[#E8F0EB]">{option.label}</div>
                <div className="text-[11px] text-[#6B8A6F]">{option.description}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
