import { AppSettings } from "@/hooks/useSettings";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Clock, Coffee, Zap, Bell, Timer, Repeat } from "lucide-react";
import { cn } from "@/lib/utils";

interface SettingsTimerProps {
  settings: AppSettings;
  onUpdate: (updates: Partial<AppSettings>) => void;
}

export const SettingsTimer = ({ settings, onUpdate }: SettingsTimerProps) => {
  return (
    <div className="space-y-3">
      {/* Focus & Break Times */}
      <div className="settings-card">
        <div className="settings-section-title">
          <div className="settings-section-icon"><Timer /></div>
          <span>Session Durations</span>
        </div>

        <div className="space-y-5">
          {/* Focus Time */}
          <div>
            <div className="settings-slider-label">
              <div className="flex items-center gap-2">
                <div className="settings-icon-box settings-icon-box--active w-7 h-7 rounded-md">
                  <Clock className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-semibold text-[hsl(var(--foreground))]">Focus</span>
              </div>
              <span className="settings-slider-value">{settings.defaultFocusTime}m</span>
            </div>
            <Slider min={15} max={90} step={5} value={[settings.defaultFocusTime]}
              onValueChange={([value]) => onUpdate({ defaultFocusTime: value })} className="w-full" />
          </div>

          {/* Short Break */}
          <div>
            <div className="settings-slider-label">
              <div className="flex items-center gap-2">
                <div className="settings-icon-box settings-icon-box--inactive w-7 h-7 rounded-md">
                  <Coffee className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-semibold text-[hsl(var(--foreground))]">Short Break</span>
              </div>
              <span className="settings-slider-value text-[hsl(var(--muted-foreground))]">{settings.shortBreakTime}m</span>
            </div>
            <Slider min={3} max={15} step={1} value={[settings.shortBreakTime]}
              onValueChange={([value]) => onUpdate({ shortBreakTime: value })} className="w-full" />
          </div>

          {/* Long Break */}
          <div>
            <div className="settings-slider-label">
              <div className="flex items-center gap-2">
                <div className="settings-icon-box settings-icon-box--inactive w-7 h-7 rounded-md">
                  <Zap className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-semibold text-[hsl(var(--foreground))]">Long Break</span>
              </div>
              <span className="settings-slider-value text-[hsl(var(--muted-foreground))]">{settings.longBreakTime}m</span>
            </div>
            <Slider min={10} max={30} step={5} value={[settings.longBreakTime]}
              onValueChange={([value]) => onUpdate({ longBreakTime: value })} className="w-full" />
          </div>

          {/* Long Break Interval */}
          <div>
            <div className="settings-slider-label">
              <div className="flex items-center gap-2">
                <div className="settings-icon-box settings-icon-box--inactive w-7 h-7 rounded-md">
                  <Repeat className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-semibold text-[hsl(var(--foreground))]">Sessions Before Long Break</span>
              </div>
              <span className="settings-slider-value text-[hsl(var(--muted-foreground))]">{settings.longBreakInterval}</span>
            </div>
            <Slider min={2} max={8} step={1} value={[settings.longBreakInterval]}
              onValueChange={([value]) => onUpdate({ longBreakInterval: value })} className="w-full" />
            <div className="settings-slider-range"><span>2</span><span>8</span></div>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="settings-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn("settings-icon-box", settings.enableNotifications ? "settings-icon-box--active" : "settings-icon-box--inactive")}>
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <Label className="text-sm font-bold text-[hsl(var(--foreground))]">Notifications</Label>
              <p className="text-[11px] text-[hsl(var(--muted-foreground))]">Alert when timer ends</p>
            </div>
          </div>
          <Switch
            checked={settings.enableNotifications}
            onCheckedChange={(checked) => onUpdate({ enableNotifications: checked })}
          />
        </div>
      </div>
    </div>
  );
};
