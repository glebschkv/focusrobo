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
    <div className="space-y-4">
      {/* Theme Selection */}
      <div className="bg-white rounded-2xl border border-stone-200 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Sun className="w-4 h-4 text-amber-400" />
          <span className="text-sm font-semibold text-stone-900">Color Scheme</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {themeOptions.map((option) => {
            const Icon = option.icon;
            const isSelected = settings.theme === option.value;
            return (
              <button
                key={option.value}
                onClick={() => onUpdate({ theme: option.value as 'light' | 'dark' | 'system' })}
                className={cn(
                  "relative p-3 rounded-xl flex flex-col items-center gap-2 transition-all active:scale-95 border",
                  isSelected
                    ? "bg-sky-50 border-sky-300"
                    : "bg-stone-50 border-stone-200"
                )}
              >
                {isSelected && (
                  <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-sky-500 flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 text-white" />
                  </div>
                )}
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center border",
                  isSelected ? "bg-sky-100 border-sky-200 text-sky-600" : "bg-white border-stone-200 text-stone-400"
                )}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="text-center">
                  <div className="text-xs font-semibold text-stone-900">{option.label}</div>
                  <div className="text-[11px] text-stone-400">{option.description}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
