import { useState } from "react";
import { settingsLogger } from "@/lib/logger";
import { AppSettings } from "@/hooks/useSettings";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Download, Upload, RotateCcw, Shield, AlertTriangle, HardDrive, Loader2 } from "lucide-react";
import { toast } from 'sonner';

interface SettingsDataProps {
  settings: AppSettings;
  onUpdate: (updates: Partial<AppSettings>) => void;
  onReset: () => void;
  onExport: () => void;
  onImport: (file: File) => Promise<void>;
}

export const SettingsData = ({ settings, onUpdate, onReset, onExport, onImport }: SettingsDataProps) => {
  const [importFile, setImportFile] = useState<File | null>(null);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);

  const handleImport = async () => {
    if (!importFile) return;
    try { await onImport(importFile); setImportFile(null); }
    catch (error) { settingsLogger.error('Import failed:', error); }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/json') { setImportFile(file); }
    else { toast.error("Invalid File", { description: "Please select a valid JSON settings file." }); }
  };

  return (
    <div className="space-y-3">
      {/* Privacy */}
      <div className="settings-card">
        <div className="settings-section-title">
          <div className="settings-section-icon"><Shield /></div>
          <span>Privacy</span>
        </div>

        <div className="space-y-3">
          <div className="settings-row">
            <div>
              <Label className="text-xs font-semibold text-[#E8F0EB]">Usage Analytics</Label>
              <p className="text-[11px] text-[#8BA68F]">Anonymous usage data to improve the app</p>
            </div>
            <Switch checked={settings.dataCollection} onCheckedChange={(checked) => onUpdate({ dataCollection: checked })} />
          </div>

          <div className="settings-row">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-3.5 h-3.5 text-[#C5A033]" />
              <div>
                <Label className="text-xs font-semibold text-[#E8F0EB]">Crash Reports</Label>
                <p className="text-[11px] text-[#8BA68F]">Send error logs</p>
              </div>
            </div>
            <Switch checked={settings.crashReporting} onCheckedChange={(checked) => onUpdate({ crashReporting: checked })} />
          </div>
        </div>
      </div>

      {/* Backup */}
      <div className="settings-card">
        <div className="settings-section-title">
          <div className="settings-section-icon"><HardDrive /></div>
          <span>Backup</span>
        </div>

        <div className="space-y-2">
          <button onClick={onExport} className="settings-btn-secondary">
            <Download className="w-4 h-4" />
            <span className="text-sm font-semibold">Export Settings</span>
          </button>

          <div className="relative">
            <Input
              type="file"
              accept=".json"
              onChange={handleFileChange}
              className="cursor-pointer h-11 text-xs bg-[rgba(26,46,35,0.6)] border-[rgba(76,167,113,0.15)] text-[#E8F0EB] file:mr-2 file:px-2 file:py-1 file:rounded file:border-0 file:bg-[rgba(76,167,113,0.15)] file:text-[#4CA771] file:text-xs file:font-medium"
            />
          </div>

          {importFile && (
            <button onClick={handleImport} className="settings-btn-gold text-sm">
              <Upload className="w-4 h-4" /><span>Import</span>
            </button>
          )}
        </div>
      </div>

      {/* Reset */}
      <div className="settings-card" style={{ borderColor: 'rgba(196,100,100,0.2)' }}>
        <div className="settings-section-title">
          <div className="w-7 h-7 rounded-[10px] flex items-center justify-center" style={{ background: 'rgba(196,100,100,0.12)' }}>
            <RotateCcw className="w-3.5 h-3.5 text-[#E57373]" />
          </div>
          <span className="text-[13px] font-bold text-[#E57373]">Reset</span>
        </div>

        <button className="settings-btn-danger" onClick={() => setResetDialogOpen(true)}>
          <RotateCcw className="w-4 h-4" /><span>Reset All Settings</span>
        </button>
      </div>

      {/* Reset Confirmation */}
      {resetDialogOpen && (
        <div className="settings-dialog-overlay">
          <div className="settings-dialog-scrim" onClick={() => setResetDialogOpen(false)} aria-hidden />
          <div className="settings-dialog-card space-y-4">
            <div className="space-y-2 text-center">
              <h2 className="text-base font-bold text-[#E8F0EB]">Reset Settings?</h2>
              <p className="text-xs text-[#8BA68F]">This will restore all default settings. Consider exporting first.</p>
            </div>
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
              <button className="settings-btn-secondary text-xs py-2" onClick={() => setResetDialogOpen(false)}>Cancel</button>
              <button className="settings-btn-danger text-xs py-2" onClick={() => { onReset(); setResetDialogOpen(false); }}>Reset</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
