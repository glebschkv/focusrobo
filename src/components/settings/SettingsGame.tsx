import { AppSettings } from "@/hooks/useSettings";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Gamepad2, Smartphone } from "lucide-react";
import { cn } from "@/lib/utils";

interface SettingsGameProps {
  settings: AppSettings;
  onUpdate: (updates: Partial<AppSettings>) => void;
}

export const SettingsGame = ({ settings, onUpdate }: SettingsGameProps) => {
  return (
    <div className="settings-card">
      <div className="settings-section-title">
        <div className="settings-section-icon"><Gamepad2 /></div>
        <span>Gameplay</span>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={cn("settings-icon-box", settings.hapticFeedback ? "settings-icon-box--active" : "settings-icon-box--inactive")}>
            <Smartphone className="w-4 h-4" />
          </div>
          <div>
            <Label className="text-sm font-bold text-[hsl(var(--foreground))]">Haptic Feedback</Label>
            <p className="text-[11px] text-[hsl(var(--muted-foreground))]">Vibration on interactions</p>
          </div>
        </div>
        <Switch
          checked={settings.hapticFeedback}
          onCheckedChange={(checked) => onUpdate({ hapticFeedback: checked })}
        />
      </div>
    </div>
  );
};
