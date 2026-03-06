import { useState, useCallback, useRef } from "react";
import { cn } from "@/lib/utils";
import { PixelIcon } from "@/components/ui/PixelIcon";
import { useClickSound } from "@/hooks/useClickSound";
import { useHaptics } from "@/hooks/useHaptics";

// All tabs use unified Atelier white theme

interface TabBarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isCompact?: boolean;
  onCompactChange?: (isCompact: boolean) => void;
}

// Tab configuration with notification support
const tabs = [
  { id: "home", icon: "home", label: "Home" },
  { id: "collection", icon: "paw", label: "Pets" },
  { id: "timer", icon: "hourglass", label: "Focus", isCenter: true },
  { id: "shop", icon: "shopping-bag", label: "Shop" },
  { id: "settings", icon: "gear", label: "Settings" },
];

// Tabs already in order: Home, Pets, Focus (center), Shop, Settings
const orderedTabs = tabs;

export const IOSTabBar = ({ activeTab, onTabChange, isCompact = false, onCompactChange }: TabBarProps) => {
  const [pressedTab, setPressedTab] = useState<string | null>(null);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const isLongPress = useRef(false);
  const { playClick } = useClickSound();
  const { haptic: triggerHaptic } = useHaptics();

  const toggleCompact = useCallback(() => {
    triggerHaptic('medium');
    onCompactChange?.(!isCompact);
  }, [isCompact, onCompactChange, triggerHaptic]);

  const handleCenterButtonPressStart = useCallback(() => {
    isLongPress.current = false;
    longPressTimer.current = setTimeout(() => {
      isLongPress.current = true;
      toggleCompact();
    }, 500); // 500ms long press
  }, [toggleCompact]);

  const handleCenterButtonPressEnd = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  const handleTabPress = (tabId: string) => {
    setPressedTab(tabId);
    triggerHaptic('light');
  };

  const handleTabRelease = () => {
    setPressedTab(null);
  };

  const handleTabChange = (tabId: string) => {
    if (tabId !== activeTab) {
      triggerHaptic('medium');
      playClick();
      onTabChange(tabId);
    }
    setPressedTab(null);
  };

  const handleCenterClick = () => {
    // If long press was triggered, don't also trigger a click
    if (isLongPress.current) {
      isLongPress.current = false;
      return;
    }
    // If compact, expand instead of navigating
    if (isCompact) {
      toggleCompact();
      return;
    }
    handleTabChange("timer");
  };

  return (
    <div className={cn("dock-container", isCompact && "compact")}>
      <nav className={cn("dock-bar", isCompact && "compact")} role="tablist" aria-label="Main navigation">
        {orderedTabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const isPressed = pressedTab === tab.id;
          const isCenter = tab.isCenter;

          // Center button (Focus/Timer) - special styling
          if (isCenter) {
            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={isActive}
                aria-label={isCompact ? "Expand taskbar" : tab.label}
                onTouchStart={() => {
                  handleTabPress(tab.id);
                  handleCenterButtonPressStart();
                }}
                onTouchEnd={() => {
                  handleTabRelease();
                  handleCenterButtonPressEnd();
                }}
                onMouseDown={() => {
                  handleTabPress(tab.id);
                  handleCenterButtonPressStart();
                }}
                onMouseUp={() => {
                  handleTabRelease();
                  handleCenterButtonPressEnd();
                }}
                onMouseLeave={() => {
                  handleTabRelease();
                  handleCenterButtonPressEnd();
                }}
                onClick={handleCenterClick}
                className={cn(
                  "dock-center-btn touch-manipulation",
                  isActive && "active",
                  isPressed && "scale-95",
                  isCompact && "compact"
                )}
              >
                <PixelIcon name={tab.icon} size={22} className="dock-item-icon" />
                {/* Expand indicator when compact */}
                {isCompact && (
                  <span className="absolute -top-1 left-1/2 -translate-x-1/2 text-emerald-500 animate-bounce text-xs">▲</span>
                )}
              </button>
            );
          }

          // Regular tab items - hidden when compact
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              aria-label={tab.label}
              onTouchStart={() => handleTabPress(tab.id)}
              onTouchEnd={handleTabRelease}
              onMouseDown={() => handleTabPress(tab.id)}
              onMouseUp={handleTabRelease}
              onMouseLeave={handleTabRelease}
              onClick={() => handleTabChange(tab.id)}
              className={cn(
                "dock-item touch-manipulation",
                isActive && "active",
                isPressed && "scale-90",
                isCompact && "dock-item-hidden"
              )}
            >
              <PixelIcon name={tab.icon} size={22} className="dock-item-icon" />
              <span className="dock-item-label">{tab.label}</span>

              {/* Active indicator dot */}
              <span className="dock-active-dot" />
            </button>
          );
        })}
      </nav>
    </div>
  );
};
