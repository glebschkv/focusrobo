import { useState, useRef, useEffect } from "react";
import { useSettings } from "@/hooks/useSettings";
import { SettingsAppearance } from "@/components/settings/SettingsAppearance";
import { SettingsTimer } from "@/components/settings/SettingsTimer";
import { SettingsSound } from "@/components/settings/SettingsSound";
import { SettingsGame } from "@/components/settings/SettingsGame";
import { SettingsData } from "@/components/settings/SettingsData";
import { SettingsAbout } from "@/components/settings/SettingsAbout";
import { SettingsAccount } from "@/components/settings/SettingsAccount";
import { SettingsProfile } from "@/components/settings/SettingsProfile";
import { SettingsAnalytics } from "@/components/settings/SettingsAnalytics";
import { SettingsFocusMode } from "@/components/settings/SettingsFocusMode";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Clock, Database, Heart, UserCircle, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { id: "account", label: "Account", icon: UserCircle },
  { id: "general", label: "General", icon: SlidersHorizontal },
  { id: "timer", label: "Timer & Focus", icon: Clock },
  { id: "data", label: "Data & Privacy", icon: Database },
  { id: "about", label: "About", icon: Heart },
];

export const Settings = () => {
  const { settings, isLoading, updateSettings, resetSettings, exportSettings, importSettings } = useSettings();
  const [activeTab, setActiveTab] = useState("account");
  const tabsRef = useRef<HTMLDivElement>(null);
  const activeTabRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (activeTabRef.current && tabsRef.current) {
      const container = tabsRef.current;
      const tab = activeTabRef.current;
      const containerRect = container.getBoundingClientRect();
      const tabRect = tab.getBoundingClientRect();
      const scrollLeft = tab.offsetLeft - (containerRect.width / 2) + (tabRect.width / 2);
      container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
    }
  }, [activeTab]);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-[#FAFAF9]">
        <div
          className="rounded-2xl p-6 flex items-center gap-3 bg-white border border-stone-200/60"
          style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)' }}
        >
          <Loader2 className="w-5 h-5 animate-spin text-sky-500" />
          <span className="text-sm font-medium text-stone-600">Loading settings...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-[#FAFAF9]">
      {/* Header */}
      <div className="relative px-4 pt-4 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center overflow-hidden bg-white border border-stone-200/60"
            style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
          >
            <img src="/app-icon.png" alt="BotBlock" width={32} height={32} className="rounded-lg" draggable={false} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-stone-900 tracking-tight">
              Settings
            </h1>
            <p className="text-xs text-stone-400">
              Customize Your Experience
            </p>
          </div>
        </div>
      </div>

      {/* Scrollable Tab Navigation */}
      <div className="px-3 py-2">
        <div
          ref={tabsRef}
          className="flex gap-1.5 overflow-x-auto py-1 -mx-1 px-1"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                ref={isActive ? activeTabRef : null}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-2 rounded-lg whitespace-nowrap transition-all duration-200 active:scale-95 flex-shrink-0 text-xs font-semibold",
                  isActive
                    ? "bg-sky-500 text-white shadow-md"
                    : "bg-stone-100 text-stone-500 border border-stone-200/50 hover:bg-stone-150"
                )}
                style={isActive ? {
                  boxShadow: '0 2px 8px rgba(14,165,233,0.3), inset 0 1px 0 rgba(255,255,255,0.2)',
                } : undefined}
              >
                <Icon className={cn("w-3.5 h-3.5", isActive ? "opacity-100" : "opacity-60")} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1 min-h-0">
        <div className="px-4 pt-1 pb-6 space-y-4">
          {activeTab === "account" && (
            <div className="space-y-4">
              <SettingsProfile />
              <SettingsAccount />
            </div>
          )}

          {activeTab === "general" && (
            <div className="space-y-4">
              <SettingsAppearance
                settings={settings}
                onUpdate={updateSettings}
              />
              <SettingsSound
                settings={settings}
                onUpdate={updateSettings}
              />
              <SettingsGame
                settings={settings}
                onUpdate={updateSettings}
              />
            </div>
          )}

          {activeTab === "timer" && (
            <div className="space-y-4">
              <SettingsTimer
                settings={settings}
                onUpdate={updateSettings}
              />
              <SettingsFocusMode />
            </div>
          )}

          {activeTab === "data" && (
            <div className="space-y-4">
              <SettingsAnalytics />
              <SettingsData
                settings={settings}
                onUpdate={updateSettings}
                onReset={resetSettings}
                onExport={exportSettings}
                onImport={importSettings}
              />
            </div>
          )}

          {activeTab === "about" && (
            <SettingsAbout />
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
