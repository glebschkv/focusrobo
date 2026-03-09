import { useState } from 'react';
import { AppSettings } from "@/hooks/useSettings";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Volume2, VolumeX, Music, Play, Leaf, Sparkles, MousePointerClick } from "lucide-react";
import { cn } from "@/lib/utils";
import { setClickSoundEnabled } from "@/hooks/useClickSound";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { useSoundStore, useIslandAmbientEnabled } from "@/stores/soundStore";

interface SettingsSoundProps {
  settings: AppSettings;
  onUpdate: (updates: Partial<AppSettings>) => void;
}

const soundThemes = [
  { value: "default", label: "Classic", icon: Music },
  { value: "nature", label: "Nature", icon: Leaf },
  { value: "minimal", label: "Minimal", icon: Sparkles },
];

export const SettingsSound = ({ settings, onUpdate }: SettingsSoundProps) => {
  const { play } = useSoundEffects();
  const [clickSoundOn, setClickSoundOn] = useState(() => {
    try { return localStorage.getItem('nomo_clickSoundEnabled') !== 'false'; }
    catch { return true; }
  });

  const testSound = () => play('notification');

  return (
    <div className="space-y-3">
      {/* Main Sound Card */}
      <div className="settings-card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={cn("settings-icon-box", settings.soundEnabled ? "settings-icon-box--active" : "settings-icon-box--inactive")}>
              {settings.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </div>
            <div>
              <Label className="text-sm font-bold text-[hsl(var(--foreground))]">Sound Effects</Label>
              <p className="text-[11px] text-[hsl(var(--muted-foreground))]">Timer alerts and game sounds</p>
            </div>
          </div>
          <Switch
            checked={settings.soundEnabled}
            onCheckedChange={(checked) => onUpdate({ soundEnabled: checked })}
          />
        </div>

        {settings.soundEnabled && (
          <>
            <div className="settings-divider" />

            {/* Volume Control */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <Label className="text-xs font-semibold text-[hsl(var(--muted-foreground))]">Volume</Label>
                <div className="flex items-center gap-2">
                  <span className="settings-slider-value">{settings.soundVolume}%</span>
                  <button onClick={testSound} className="p-1.5 rounded-lg bg-[hsl(var(--primary))] text-white transition-all active:scale-95">
                    <Play className="w-3 h-3" />
                  </button>
                </div>
              </div>
              <Slider min={0} max={100} step={5} value={[settings.soundVolume]}
                onValueChange={([value]) => onUpdate({ soundVolume: value })} className="w-full" />
            </div>

            {/* Sound Theme */}
            <div>
              <Label className="text-xs font-semibold text-[hsl(var(--muted-foreground))] mb-2 block">Sound Theme</Label>
              <div className="flex gap-2">
                {soundThemes.map((theme) => {
                  const Icon = theme.icon;
                  const isSelected = settings.soundTheme === theme.value;
                  return (
                    <button
                      key={theme.value}
                      onClick={() => onUpdate({ soundTheme: theme.value as 'default' | 'nature' | 'minimal' })}
                      className={cn("settings-sound-pill", isSelected ? "settings-sound-pill--selected" : "settings-sound-pill--unselected")}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-[11px] font-bold">{theme.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Button Click Sounds */}
      <div className="settings-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn("settings-icon-box", clickSoundOn ? "settings-icon-box--active" : "settings-icon-box--inactive")}>
              <MousePointerClick className="w-4 h-4" />
            </div>
            <div>
              <Label className="text-sm font-bold text-[hsl(var(--foreground))]">Button Sounds</Label>
              <p className="text-[11px] text-[hsl(var(--muted-foreground))]">Subtle tap feedback</p>
            </div>
          </div>
          <Switch
            checked={clickSoundOn}
            onCheckedChange={(checked) => { setClickSoundOn(checked); setClickSoundEnabled(checked); }}
          />
        </div>
      </div>
      {/* Island Ambient Sound */}
      <IslandAmbientToggle />
    </div>
  );
};

const IslandAmbientToggle = () => {
  const islandAmbientEnabled = useIslandAmbientEnabled();
  const setEnabled = useSoundStore((s) => s.setIslandAmbientEnabled);

  return (
    <div className="settings-card">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={cn("settings-icon-box", islandAmbientEnabled ? "settings-icon-box--active" : "settings-icon-box--inactive")}>
            <Leaf className="w-4 h-4" />
          </div>
          <div>
            <Label className="text-sm font-bold text-[hsl(var(--foreground))]">Island Ambiance</Label>
            <p className="text-[11px] text-[hsl(var(--muted-foreground))]">Soft nature sounds on home screen</p>
          </div>
        </div>
        <Switch
          checked={islandAmbientEnabled}
          onCheckedChange={setEnabled}
        />
      </div>
    </div>
  );
};
