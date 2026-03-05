import { useState } from "react";
import { useAnalytics } from "@/hooks/useAnalytics";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Target, Calendar, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const SettingsAnalytics = () => {
  const { settings, updateSettings, resetAnalytics, formatDuration } = useAnalytics();
  const [resetDialogOpen, setResetDialogOpen] = useState(false);

  const handleReset = () => {
    resetAnalytics();
    toast.success("Analytics data has been reset");
    setResetDialogOpen(false);
  };

  return (
    <div className="space-y-3">
      {/* Goals */}
      <div className="settings-card">
        <div className="settings-section-title">
          <div className="settings-section-icon"><Target /></div>
          <span>Goals</span>
        </div>

        <div className="space-y-5">
          {/* Daily Focus Goal */}
          <div>
            <div className="settings-slider-label">
              <div className="flex items-center gap-2">
                <div className="settings-icon-box settings-icon-box--active w-7 h-7 rounded-md">
                  <Target className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-semibold text-[hsl(var(--foreground))]">Daily Goal</span>
              </div>
              <span className="settings-slider-value">{formatDuration(settings.dailyGoalMinutes * 60)}</span>
            </div>
            <Slider min={30} max={480} step={15} value={[settings.dailyGoalMinutes]}
              onValueChange={([value]) => updateSettings({ dailyGoalMinutes: value })} className="w-full" />
            <div className="settings-slider-range"><span>30m</span><span>8h</span></div>
          </div>

          {/* Weekly Focus Goal */}
          <div>
            <div className="settings-slider-label">
              <div className="flex items-center gap-2">
                <div className="settings-icon-box settings-icon-box--inactive w-7 h-7 rounded-md">
                  <Calendar className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-semibold text-[hsl(var(--foreground))]">Weekly Goal</span>
              </div>
              <span className="text-sm font-bold text-[hsl(var(--muted-foreground))]">{formatDuration(settings.weeklyGoalMinutes * 60)}</span>
            </div>
            <Slider min={60} max={2400} step={60} value={[settings.weeklyGoalMinutes]}
              onValueChange={([value]) => updateSettings({ weeklyGoalMinutes: value })} className="w-full" />
            <div className="settings-slider-range"><span>1h</span><span>40h</span></div>
          </div>
        </div>
      </div>

      {/* Reset Analytics */}
      <div className="settings-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'rgba(196,100,100,0.12)', border: '1px solid rgba(196,100,100,0.2)' }}>
              <Trash2 className="w-4 h-4 text-[hsl(var(--destructive))]" />
            </div>
            <div>
              <Label className="text-sm font-bold text-[hsl(var(--foreground))]">Reset Analytics</Label>
              <p className="text-[11px] text-[hsl(var(--muted-foreground))]">Clear all tracked data</p>
            </div>
          </div>
          <button
            className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all active:scale-95"
            style={{ background: 'hsl(var(--destructive) / 0.08)', border: '1px solid hsl(var(--destructive) / 0.2)', color: 'hsl(var(--destructive))' }}
            onClick={() => setResetDialogOpen(true)}
          >
            Reset
          </button>
        </div>
      </div>

      {/* Reset Confirmation */}
      {resetDialogOpen && (
        <div className="settings-dialog-overlay">
          <div className="settings-dialog-scrim" onClick={() => setResetDialogOpen(false)} aria-hidden />
          <div className="settings-dialog-card space-y-4">
            <div className="space-y-2 text-center">
              <h2 className="text-base font-bold text-[hsl(var(--foreground))]">Reset Analytics?</h2>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">Are you sure you want to reset all analytics data? This cannot be undone.</p>
            </div>
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
              <button className="settings-btn-secondary text-xs py-2" onClick={() => setResetDialogOpen(false)}>Cancel</button>
              <button className="settings-btn-danger text-xs py-2" onClick={handleReset}>Reset Data</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
