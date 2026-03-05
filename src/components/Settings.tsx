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
import { Loader2, Clock, Database, Heart, UserCircle, SlidersHorizontal, Settings as SettingsIcon } from "lucide-react";
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
      <div className="h-full flex items-center justify-center settings-page">
        <div className="settings-card flex items-center gap-3">
          <Loader2 className="w-5 h-5 animate-spin text-[#4CA771]" />
          <span className="text-sm font-medium text-[#8BA68F]">Loading settings...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col settings-page">
      {/* Header */}
      <div className="settings-header">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(76,167,113,0.15)' }}>
            <SettingsIcon className="w-[18px] h-[18px] text-[#4CA771]" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-[#E8F0EB] tracking-tight">Settings</h1>
            <p className="text-[11px] text-[#6B8A6F]">Customize Your Experience</p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
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
                className={cn("settings-tab", isActive ? "settings-tab--active" : "settings-tab--inactive")}
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
        <div className="px-4 pt-1 pb-6 space-y-3">
          {activeTab === "account" && (
            <div className="space-y-3">
              <SettingsProfile />
              <SettingsAccount />
            </div>
          )}
          {activeTab === "general" && (
            <div className="space-y-3">
              <SettingsAppearance settings={settings} onUpdate={updateSettings} />
              <SettingsSound settings={settings} onUpdate={updateSettings} />
              <SettingsGame settings={settings} onUpdate={updateSettings} />
            </div>
          )}
          {activeTab === "timer" && (
            <div className="space-y-3">
              <SettingsTimer settings={settings} onUpdate={updateSettings} />
              <SettingsFocusMode />
            </div>
          )}
          {activeTab === "data" && (
            <div className="space-y-3">
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
          {activeTab === "about" && <SettingsAbout />}
        </div>
      </ScrollArea>
    </div>
  );
};
